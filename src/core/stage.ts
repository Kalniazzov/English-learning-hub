import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { h } from '../shared/dom';
import { Desk, MODEL_AREA, PAGE } from './desk';

export interface Label {
  el: HTMLElement;
  setText: (text: string) => void;
  show: (visible: boolean) => void;
}

export type Mood = 'day' | 'dusk' | 'night';

export interface SceneContext {
  /** Add every object of the model to this group. */
  root: THREE.Group;
  /** Area for sliders, switches and readouts. */
  panel: HTMLElement;
  reducedMotion: boolean;
  /** True when the model stands on the page of the 3D book. */
  desk: boolean;
  /** Makes an object rise from the page like a pop-up. Its origin must be at its base. */
  pop: (object: THREE.Object3D, order?: number) => void;
  clickable: (object: THREE.Object3D, onClick: () => void) => void;
  label: (target: THREE.Object3D | THREE.Vector3, text: string, opts?: { lift?: number; kind?: string }) => Label;
  /** Shows a small note card over the model; null hides it. */
  card: (content: Node[] | null) => void;
  mood: (mood: Mood) => void;
  /** Moves the camera, in model coordinates. */
  view: (position: [number, number, number], target: [number, number, number], instant?: boolean) => void;
  onFrame: (fn: (dt: number, time: number) => void) => void;
}

export type SceneBuilder = (ctx: SceneContext) => void;

export interface ModelSpec {
  builder: SceneBuilder;
  /** Width and depth of the model's ground, used to fit it on the page. */
  footprint: [number, number];
  description: string;
  panel: HTMLElement;
}

export interface DeskPages {
  left: HTMLElement;
  panel: HTMLElement;
  full: HTMLElement;
}

interface Popping {
  object: THREE.Object3D;
  start: number;
  rotationX: number;
  scaleY: number;
}

interface Tween {
  t: number;
  duration: number;
  step: (k: number) => void;
  done: () => void;
}

const moods: Record<Mood, { sky: string; ground: string; hemi: number; sun: string; sunI: number; rim: string; rimI: number; env: number; clear: string }> = {
  day: { sky: '#dcefff', ground: '#f6dcb6', hemi: 0.9, sun: '#fff1da', sunI: 2.7, rim: '#a9d6ff', rimI: 1.1, env: 0.5, clear: '#d7ecf8' },
  dusk: { sky: '#cdb8ff', ground: '#f3b996', hemi: 0.85, sun: '#ffb07a', sunI: 2.1, rim: '#b9a0ff', rimI: 1.2, env: 0.4, clear: '#c9b4e6' },
  night: { sky: '#7c97dc', ground: '#2d3654', hemi: 0.42, sun: '#b9c9ff', sunI: 0.55, rim: '#7aa8ff', rimI: 0.9, env: 0.16, clear: '#1b2a44' },
};

/** The page HTML is laid out at 560 CSS pixels for 8.4 units of paper. */
const CSS_SCALE = 8.4 / 560;

function hasWebGL() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

export class Stage {
  readonly supported = hasWebGL();
  readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  mode: 'inline' | 'desk' | null = null;
  /** On narrow screens the camera shows one page at a time. */
  focus: 'left' | 'right' = 'left';
  desk?: Desk;
  /** Called when the reader taps the owl or a ribbon. */
  onOwl: () => void = () => {};
  onRibbon: (slug: string) => void = () => {};

  private renderer?: THREE.WebGLRenderer;
  private css?: CSS3DRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(36, 1, 0.1, 400);
  private controls?: OrbitControls;
  private hemi = new THREE.HemisphereLight();
  private sun = new THREE.DirectionalLight();
  private rim = new THREE.DirectionalLight();
  private holder = new THREE.Group();
  private root = new THREE.Group();
  private host?: HTMLElement;
  private labelLayer = h('div', { class: 'label-layer' });
  private noteCard = h('div', { class: 'note-card', 'aria-live': 'polite' });
  private labels: { target: THREE.Object3D | THREE.Vector3; el: HTMLElement; lift: number; visible: boolean }[] = [];
  private pops: Popping[] = [];
  private frames: ((dt: number, time: number) => void)[] = [];
  private modelPicks = new Map<THREE.Object3D, () => void>();
  private deskPicks = new Map<THREE.Object3D, () => void>();
  private tweens: Tween[] = [];
  private eyes: THREE.Object3D[] = [];
  private bobbers: THREE.Object3D[] = [];
  private flight?: { from: THREE.Vector3; to: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; t: number };
  private observer = new ResizeObserver(() => this.resize());
  private time = 0;
  private modelTime = 0;
  private last = 0;
  private popDelay = 0;
  private labelsHidden = false;
  private hasModel = false;
  private open = 1;
  private moodNow: Mood = 'day';
  private pointer: THREE.Vector2 | null = null;
  private pointerTime = 0;
  private nextBlink = 1.5;
  private looping = false;

  private init() {
    if (this.renderer) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.domElement.setAttribute('role', 'img');
    this.renderer = renderer;

    const pmrem = new THREE.PMREMGenerator(renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0003;
    this.sun.shadow.normalBias = 0.03;
    this.rim.position.set(-6, 7, -10);
    this.holder.add(this.root);
    this.scene.add(this.hemi, this.sun, this.sun.target, this.rim, this.holder);

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.addEventListener('start', () => (this.flight = undefined));
    // Let a vertical swipe scroll the page on phones; sideways swipes rotate the model.
    renderer.domElement.style.touchAction = 'pan-y';
    this.bindPointer(renderer.domElement);
  }

  private bindPointer(canvas: HTMLCanvasElement) {
    const ray = new THREE.Raycaster();
    let down: { x: number; y: number } | null = null;
    const ndc = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      return new THREE.Vector2(((e.clientX - box.left) / box.width) * 2 - 1, -((e.clientY - box.top) / box.height) * 2 + 1);
    };
    const find = (e: PointerEvent): (() => void) | undefined => {
      ray.setFromCamera(ndc(e), this.camera);
      const maps = [this.modelPicks, this.deskPicks];
      const targets = maps.flatMap((m) => [...m.keys()]);
      for (const hit of ray.intersectObjects(targets, true)) {
        for (let o: THREE.Object3D | null = hit.object; o; o = o.parent) {
          if (!o.visible) break;
          const handler = this.modelPicks.get(o) ?? this.deskPicks.get(o);
          if (handler) return handler;
        }
      }
      return undefined;
    };
    canvas.addEventListener('pointerdown', (e) => (down = { x: e.clientX, y: e.clientY }));
    canvas.addEventListener('pointerup', (e) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) find(e)?.();
      down = null;
    });
    canvas.addEventListener('pointermove', (e) => {
      this.pointer = ndc(e);
      this.pointerTime = this.time;
      if (e.pointerType === 'mouse' && !down) canvas.style.cursor = find(e) ? 'pointer' : 'grab';
    });
    canvas.addEventListener('pointerleave', () => (this.pointer = null));
  }

  private attach(host: HTMLElement, mode: 'inline' | 'desk') {
    this.init();
    const renderer = this.renderer!;
    if (this.host !== host) {
      this.observer.disconnect();
      this.host = host;
      host.prepend(renderer.domElement);
      host.append(this.labelLayer);
      if (this.css) host.append(this.css.domElement);
      host.append(this.noteCard);
      this.observer.observe(host);
    }
    if (this.mode !== mode) {
      this.mode = mode;
      this.applyMode();
    }
    this.resize();
    if (!this.looping) {
      this.looping = true;
      this.last = performance.now();
      renderer.setAnimationLoop((now) => this.tick(now));
    }
  }

  private applyMode() {
    const desk = this.mode === 'desk';
    const cam = this.sun.shadow.camera;
    const span = desk ? 19 : 12;
    cam.left = cam.bottom = -span;
    cam.right = cam.top = span;
    cam.far = 80;
    cam.updateProjectionMatrix();
    this.sun.position.set(desk ? -9 : 6, desk ? 22 : 12, desk ? 10 : 7);
    this.controls!.minPolarAngle = desk ? 0.3 : 0.25;
    this.controls!.maxPolarAngle = desk ? 1.15 : 1.42;
    this.controls!.minDistance = desk ? 2.5 : 6;
    this.controls!.maxDistance = desk ? 45 : 48;
    this.controls!.minAzimuthAngle = desk ? -0.6 : -Infinity;
    this.controls!.maxAzimuthAngle = desk ? 0.6 : Infinity;
    if (this.desk) this.desk.group.visible = desk;
    // On the desk, one-finger drags turn the view; on a normal page they scroll it.
    this.renderer!.domElement.style.touchAction = desk ? 'none' : 'pan-y';
    if (this.css) this.css.domElement.hidden = !desk;
    this.noteCard.hidden = true;
    this.mood(this.moodNow);
  }

  /** Shows the model inside a box on a normal page (phones, narrow screens). */
  attachInline(host: HTMLElement) {
    this.attach(host, 'inline');
  }

  /** Shows the whole book lying on a desk, filling `host`. */
  attachDesk(host: HTMLElement, pages: DeskPages, tabs: { slug: string; card: string }[]) {
    this.init();
    if (!this.desk) {
      this.desk = new Desk(tabs);
      this.scene.add(this.desk.group);
      this.deskPicks.set(this.desk.owl.group, () => this.onOwl());
      for (const r of this.desk.ribbons) this.deskPicks.set(r.mesh, () => this.onRibbon(r.slug));

      this.css = new CSS3DRenderer();
      this.css.domElement.classList.add('css-layer');
      // Focusing a field inside a tilted page must not scroll the whole layer.
      const lock = (el: HTMLElement) => el.addEventListener('scroll', () => { el.scrollTop = 0; el.scrollLeft = 0; });
      lock(this.css.domElement);
      lock(this.css.domElement.firstElementChild as HTMLElement);
      const place = (el: HTMLElement, parent: THREE.Object3D, x: number, y: number, z: number) => {
        const o = new CSS3DObject(el);
        o.rotation.x = -Math.PI / 2;
        o.position.set(x, y, z);
        o.scale.setScalar(CSS_SCALE);
        parent.add(o);
      };
      place(pages.left, this.desk.leftHalf, -4.75, 0.015, 0);
      place(pages.panel, this.desk.group, 4.75, PAGE.top + 0.015, 3.5);
      place(pages.full, this.desk.group, 4.75, PAGE.top + 0.015, 0);
    }
    this.attach(host, 'desk');
    this.desk.group.visible = true;
  }

  detach() {
    this.unmountModel();
    this.renderer?.setAnimationLoop(null);
    this.looping = false;
    this.observer.disconnect();
    this.renderer?.domElement.remove();
    this.labelLayer.remove();
    this.noteCard.remove();
    this.css?.domElement.remove();
    this.host = undefined;
    this.mode = null;
  }

  private mood(mood: Mood) {
    this.moodNow = mood;
    const m = moods[mood];
    if (this.host) this.host.dataset.mood = mood;
    this.hemi.color.set(m.sky);
    this.hemi.groundColor.set(m.ground);
    this.hemi.intensity = m.hemi;
    this.sun.color.set(m.sun);
    this.sun.intensity = m.sunI;
    this.rim.color.set(m.rim);
    this.rim.intensity = m.rimI;
    this.scene.environmentIntensity = m.env;
    if (this.renderer) this.renderer.setClearColor(m.clear, this.mode === 'desk' ? 1 : 0);
    this.desk?.setNight(mood === 'night');
  }

  /** Switches plain daylight and night; a special sky set by a model stays. */
  setNight(night: boolean) {
    if (this.moodNow !== 'dusk' || !this.hasModel) this.mood(night ? 'night' : 'day');
  }

  /** Builds a model, replacing the one shown before. */
  mountModel(spec: ModelSpec, delay = 0) {
    this.unmountModel();
    if (!this.mode) return;
    const desk = this.mode === 'desk';
    this.renderer!.domElement.setAttribute('aria-label', spec.description);
    this.noteCard.hidden = true;
    this.popDelay = delay;
    this.modelTime = 0;
    this.labelsHidden = false;
    this.root.scale.set(1, 1, 1);
    const night = document.documentElement.dataset.theme === 'night';

    const ctx: SceneContext = {
      root: this.root,
      panel: spec.panel,
      reducedMotion: this.reducedMotion,
      desk,
      pop: (object, order = 0) => {
        if (this.reducedMotion) return;
        const pop = { object, start: this.popDelay + order * 0.07, rotationX: object.rotation.x, scaleY: object.scale.y };
        this.pops.push(pop);
        object.rotation.x = pop.rotationX - Math.PI / 2;
        object.scale.y = pop.scaleY * 0.02;
      },
      clickable: (object, onClick) => void this.modelPicks.set(object, onClick),
      label: (target, text, o = {}) => {
        const el = h('span', { class: `model-label ${o.kind ?? ''}` }, text);
        this.labelLayer.append(el);
        const entry = { target, el, lift: o.lift ?? 0, visible: true };
        this.labels.push(entry);
        return { el, setText: (t) => (el.textContent = t), show: (v) => (entry.visible = v) };
      },
      card: (content) => this.card(content),
      mood: (m) => this.mood(m),
      view: (position, target, instant) => {
        if (desk && instant) return;
        this.root.updateWorldMatrix(true, false);
        const to = new THREE.Vector3(...position);
        const toT = new THREE.Vector3(...target);
        if (desk) {
          this.root.localToWorld(to);
          this.root.localToWorld(toT);
        }
        this.fly(to, toT, instant);
      },
      onFrame: (fn) => void this.frames.push(fn),
    };

    this.mood(night ? 'night' : 'day');
    if (!desk) ctx.view([0, 8, 15], [0, 1, 0], true);
    spec.builder(ctx);
    this.hasModel = true;

    this.root.traverse((o) => {
      if (o.userData.eye) this.eyes.push(o);
      if (o.userData.bob) this.bobbers.push(o);
    });

    if (desk) {
      const [fw, fd] = spec.footprint;
      const s = Math.min(MODEL_AREA.w / fw, MODEL_AREA.d / fd);
      this.holder.scale.setScalar(s);
      this.holder.position.set(MODEL_AREA.x, 0, MODEL_AREA.z);
      this.holder.updateMatrixWorld(true);
      const bottom = new THREE.Box3().setFromObject(this.root).min.y;
      this.holder.position.y = PAGE.top - bottom + 0.005;
    } else {
      this.holder.scale.setScalar(1);
      this.holder.position.set(0, 0, 0);
    }
  }

  /** Squashes the model flat, like a pop-up closing, then removes it. */
  async foldModel() {
    if (!this.hasModel) return;
    this.labelsHidden = true;
    this.noteCard.hidden = true;
    await this.tween(0.24, (k) => this.root.scale.set(1, Math.max(0.01, 1 - k), 1));
    this.unmountModel();
  }

  unmountModel() {
    this.root.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Line || o instanceof THREE.Points) {
        o.geometry.dispose();
        for (const m of [o.material].flat()) {
          (m as THREE.MeshStandardMaterial).map?.dispose();
          m.dispose();
        }
      }
    });
    this.root.clear();
    this.root.scale.set(1, 1, 1);
    this.labels = [];
    this.pops = [];
    this.frames = [];
    this.eyes = [];
    this.bobbers = [];
    this.modelPicks.clear();
    this.labelLayer.replaceChildren();
    this.noteCard.hidden = true;
    if (this.hasModel) {
      this.hasModel = false;
      this.mood(document.documentElement.dataset.theme === 'night' ? 'night' : 'day');
    }
  }

  card(content: Node[] | null) {
    this.noteCard.hidden = !content;
    if (content) {
      const close = h('button', { type: 'button', class: 'note-close', 'aria-label': 'Close card', onclick: () => (this.noteCard.hidden = true) }, '×');
      this.noteCard.replaceChildren(close, ...content);
    }
  }

  /** Runs `step` from 0 to 1 over `duration` seconds. */
  tween(duration: number, step: (k: number) => void): Promise<void> {
    if (this.reducedMotion || !this.mode) {
      step(1);
      return Promise.resolve();
    }
    return new Promise((done) => this.tweens.push({ t: 0, duration, step, done }));
  }

  private fly(to: THREE.Vector3, toT: THREE.Vector3, instant?: boolean) {
    if (instant || this.reducedMotion) {
      this.camera.position.copy(to);
      this.controls!.target.copy(toT);
      this.flight = undefined;
      this.controls!.update();
    } else {
      this.flight = { from: this.camera.position.clone(), to, fromT: this.controls!.target.clone(), toT, t: 0 };
    }
  }

  /** Makes a part of the desk (not of the model) respond to a tap. */
  clickableDesk(object: THREE.Object3D, onClick: () => void) {
    this.deskPicks.set(object, onClick);
  }

  /** Opens or closes the book (0 closed, 1 open). */
  setOpen(k: number) {
    this.open = k;
    this.desk?.setOpen(k);
  }

  /** Frames the whole book, open or closed. */
  bookView(instant = false, open = this.open > 0.5) {
    if (this.mode !== 'desk' || !this.host) return;
    const narrow = this.camera.aspect < 1;
    const pitch = THREE.MathUtils.degToRad(narrow && open ? 74 : 58);
    const vHalf = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * this.camera.aspect);
    const width = narrow ? (open ? 9.6 : 11.5) : open ? 24.5 : 17;
    const depth = narrow ? 12.9 : 14.2;
    const distance = Math.max(width / 2 / Math.tan(hHalf), (depth * Math.sin(pitch)) / 2 / Math.tan(vHalf)) * (open ? 1.06 : 1.4);
    const target = narrow && open
      ? new THREE.Vector3(this.focus === 'left' ? -4.75 : 4.75, 0.6, 0.55)
      : new THREE.Vector3(open ? 0 : 4.75, 0.6, open ? 0.95 : 2.2);
    const position = target.clone().add(new THREE.Vector3(0, Math.sin(pitch), Math.cos(pitch)).multiplyScalar(distance));
    this.controls!.maxDistance = distance * 1.35;
    this.fly(position, target, instant);
  }

  /** True while a model is still popping up. */
  get settling() {
    return this.pops.length > 0;
  }

  /** A picture of the model on its sky, as a WebP data URL. */
  capture(): string | null {
    if (!this.renderer) return null;
    this.renderer.render(this.scene, this.camera);
    const src = this.renderer.domElement;
    const out = document.createElement('canvas');
    out.width = src.width;
    out.height = src.height;
    const g = out.getContext('2d')!;
    const skies: Record<Mood, [string, string]> = { day: ['#cfe8f5', '#f1f7ec'], dusk: ['#7f78b4', '#f2c3ac'], night: ['#10213c', '#31506a'] };
    const sky = g.createLinearGradient(0, 0, 0, out.height);
    sky.addColorStop(0, skies[this.moodNow][0]);
    sky.addColorStop(1, skies[this.moodNow][1]);
    g.fillStyle = sky;
    g.fillRect(0, 0, out.width, out.height);
    g.drawImage(src, 0, 0);
    return out.toDataURL('image/webp', 0.86);
  }

  private tick(now: number) {
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.time += dt;
    this.modelTime += dt;

    this.tweens = this.tweens.filter((tw) => {
      tw.t = Math.min(1, tw.t + dt / tw.duration);
      tw.step(tw.t);
      if (tw.t === 1) tw.done();
      return tw.t < 1;
    });

    this.pops = this.pops.filter((p) => {
      const k = Math.min(1, Math.max(0, (this.modelTime - p.start) / 0.65));
      // Ease out with a small overshoot, like a card springing upright.
      const e = k === 0 ? 0 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
      p.object.rotation.x = p.rotationX - (Math.PI / 2) * (1 - e);
      p.object.scale.y = p.scaleY * Math.max(0.02, e);
      return k < 1;
    });

    if (this.flight) {
      const f = this.flight;
      f.t = Math.min(1, f.t + dt / 1.0);
      const k = f.t * f.t * (3 - 2 * f.t);
      this.camera.position.lerpVectors(f.from, f.to, k);
      this.controls!.target.lerpVectors(f.fromT, f.toT, k);
      if (f.t === 1) this.flight = undefined;
    }

    // Characters blink and sway a little, as if alive.
    this.nextBlink -= dt;
    const blinking = !this.reducedMotion && this.nextBlink < 0.11;
    if (this.nextBlink < 0) this.nextBlink = 2 + Math.random() * 3;
    for (const eye of this.eyes) eye.scale.y = blinking ? 0.12 : 1;
    if (!this.reducedMotion) {
      for (const b of this.bobbers) {
        const { head, phase } = b.userData.bob as { head: THREE.Object3D; phase: number };
        head.rotation.z = Math.sin(this.time * 1.6 + phase) * 0.08;
      }
    }

    if (this.mode === 'desk' && this.desk) {
      let look: THREE.Vector3 | null = null;
      if (this.pointer && this.time - this.pointerTime < 6) {
        const ray = new THREE.Raycaster();
        ray.setFromCamera(this.pointer, this.camera);
        look = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.5), new THREE.Vector3());
      }
      this.desk.owl.update(dt, this.time, look, this.reducedMotion);
    }

    this.frames.forEach((fn) => fn(dt, this.modelTime));
    this.controls!.update();
    this.renderer!.render(this.scene, this.camera);
    if (this.mode === 'desk') this.css?.render(this.scene, this.camera);
    this.placeLabels();
  }

  private placeLabels() {
    const host = this.host;
    if (!host) return;
    const { clientWidth: w, clientHeight: hgt } = host;
    const v = new THREE.Vector3();
    const hide = this.labelsHidden || this.pops.length > 0;
    for (const l of this.labels) {
      if (l.target instanceof THREE.Vector3) v.copy(this.root.localToWorld(l.target.clone()));
      else l.target.getWorldPosition(v);
      v.y += l.lift * (this.mode === 'desk' ? this.holder.scale.y : 1);
      v.project(this.camera);
      // Labels of a model that is off screen (another page on a phone) stay hidden.
      const shown = l.visible && v.z < 1 && !hide && Math.abs(v.x) < 1.08 && Math.abs(v.y) < 1.08;
      l.el.style.display = shown ? '' : 'none';
      if (!shown) continue;
      const half = l.el.offsetWidth / 2;
      const x = Math.min(w - half - 4, Math.max(half + 4, ((v.x + 1) / 2) * w));
      l.el.style.transform = `translate(${x}px, ${((1 - v.y) / 2) * hgt}px) translate(-50%, -100%)`;
    }
  }

  private resize() {
    const host = this.host;
    if (!host || !this.renderer || !host.clientWidth || !host.clientHeight) return;
    this.renderer.setSize(host.clientWidth, host.clientHeight, false);
    this.css?.setSize(host.clientWidth, host.clientHeight);
    this.camera.aspect = host.clientWidth / host.clientHeight;
    // Zoom out on narrow boxes so the whole model stays in view.
    this.camera.zoom = this.mode === 'inline' ? Math.min(1.12, this.camera.aspect / 1.3) : 1;
    this.camera.updateProjectionMatrix();
    if (this.mode === 'desk' && !this.flight) this.bookView(true);
  }
}
