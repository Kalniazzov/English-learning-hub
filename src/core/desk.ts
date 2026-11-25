/** The study desk: an open hardcover book, page ribbons, a few props and Hoot the owl. */
import * as THREE from 'three';
import { ball, box, cone, cylinder, group, mesh, roundedRect, slab } from '../scenes/toon';

export const PAGE = {
  /** Width (x) and depth (z) of one page. */
  w: 9,
  d: 12,
  /** Height of the flat part of the page surface. */
  top: 0.72,
  board: 0.2,
};

/** Where the pop-up model stands on the right page, and how much room it has. */
export const MODEL_AREA = { x: 4.75, z: -2.3, w: 8.4, d: 6.8 };

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d')!);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function woodTexture() {
  const t = canvasTexture(1024, 1024, (g) => {
    g.fillStyle = '#c98b56';
    g.fillRect(0, 0, 1024, 1024);
    let seed = 3;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    // Planks with soft grain.
    for (let p = 0; p < 4; p++) {
      const y0 = p * 256;
      g.fillStyle = `hsl(${26 + rnd() * 6}, ${48 + rnd() * 8}%, ${50 + rnd() * 6}%)`;
      g.fillRect(0, y0, 1024, 256);
      for (let i = 0; i < 70; i++) {
        const y = y0 + rnd() * 256;
        g.strokeStyle = `rgba(${rnd() > 0.5 ? '120,70,35' : '255,220,170'},${0.05 + rnd() * 0.09})`;
        g.lineWidth = 1 + rnd() * 3;
        g.beginPath();
        for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x / (90 + rnd() * 40) + i) * 5);
        g.stroke();
      }
      g.fillStyle = 'rgba(90,50,25,0.35)';
      g.fillRect(0, y0, 1024, 3);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

function edgeTexture() {
  const t = canvasTexture(64, 256, (g) => {
    g.fillStyle = '#f6eedb';
    g.fillRect(0, 0, 64, 256);
    for (let y = 0; y < 256; y += 3) {
      g.fillStyle = `rgba(150,120,80,${0.12 + (y % 9 === 0 ? 0.1 : 0)})`;
      g.fillRect(0, y, 64, 1);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 1);
  return t;
}

const pageCurve = (d: number) => 1 - 0.55 * Math.exp(-d * 1.6);

/** A stack of pages whose top dips gently towards the spine. `side` is 1 (right) or -1 (left). */
function pageStack(side: 1 | -1) {
  const thick = PAGE.top - PAGE.board;
  const geo = new THREE.BoxGeometry(PAGE.w, thick, PAGE.d, 36, 1, 1);
  geo.translate(side * (PAGE.w / 2 + 0.015), PAGE.board + thick / 2, 0);
  const pos = geo.attributes.position;
  const colors: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const d = Math.abs(pos.getX(i)) - 0.015;
    if (pos.getY(i) > PAGE.board + 0.01) pos.setY(i, PAGE.board + thick * pageCurve(d));
    const shade = 0.86 + 0.14 * Math.min(1, d / 2.2);
    colors.push(shade, shade, shade * 0.98);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const paper = new THREE.MeshStandardMaterial({ color: '#fffaf0', roughness: 0.9, vertexColors: true });
  const edge = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, map: edgeTexture() });
  const m = new THREE.Mesh(geo, [edge, edge, paper, edge, edge, edge]);
  m.castShadow = m.receiveShadow = true;
  return m;
}

function coverTexture() {
  return canvasTexture(1024, 1366, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, 1366);
    grad.addColorStop(0, '#3f6fe8');
    grad.addColorStop(1, '#2546b8');
    g.fillStyle = grad;
    g.fillRect(0, 0, 1024, 1366);
    // Soft stars.
    let seed = 9;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.35})`;
      g.beginPath();
      g.arc(rnd() * 1024, rnd() * 1366, 2 + rnd() * 5, 0, Math.PI * 2);
      g.fill();
    }
    g.textAlign = 'center';
    g.fillStyle = '#ffd34a';
    g.font = '700 54px "Fredoka Variable", system-ui, sans-serif';
    g.fillText('UNIT 1', 512, 250);
    g.fillStyle = '#ffffff';
    g.font = '700 150px "Fredoka Variable", system-ui, sans-serif';
    g.fillText('English', 512, 430);
    g.font = '700 118px "Fredoka Variable", system-ui, sans-serif';
    g.fillText('Learning Hub', 512, 570);
    g.fillStyle = '#ffd34a';
    g.beginPath();
    g.roundRect(262, 640, 500, 92, 46);
    g.fill();
    g.fillStyle = '#2546b8';
    g.font = '700 50px "Fredoka Variable", system-ui, sans-serif';
    g.fillText('Legend or Truth', 512, 703);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.font = '500 42px "Fredoka Variable", system-ui, sans-serif';
    g.fillText('Seven themes with 3D models', 512, 1250);
  });
}

function ribbonTexture(n: number, color: string) {
  return canvasTexture(64, 128, (g) => {
    g.fillStyle = color;
    g.fillRect(0, 0, 64, 128);
    g.fillStyle = '#ffffff';
    g.font = '700 44px "Fredoka Variable", system-ui, sans-serif';
    g.textAlign = 'center';
    g.fillText(String(n), 32, 104);
  });
}

/** Hoot, the owl who guides the reader. Faces +z. */
export class Owl {
  readonly group = new THREE.Group();
  private body = new THREE.Group();
  private head = new THREE.Group();
  private lids: THREE.Mesh[] = [];
  private hop = 0;
  private nextBlink = 2;
  private from = new THREE.Vector3();
  private to = new THREE.Vector3();
  private move = 1;

  constructor() {
    const blue = '#3f7fe0';
    const belly = mesh(new THREE.SphereGeometry(0.5, 32, 20), '#fff0d2', 0, 0.62, 0.28);
    belly.scale.set(0.9, 1, 0.55);
    const torso = mesh(new THREE.SphereGeometry(0.72, 40, 28), blue, 0, 0.8, 0);
    torso.scale.set(1, 1.08, 0.92);
    const wing = (side: number) => {
      const w = mesh(new THREE.SphereGeometry(0.34, 24, 16), '#2f63c0', side * 0.66, 0.78, -0.02);
      w.scale.set(0.42, 1, 0.8);
      w.rotation.z = side * 0.25;
      return w;
    };
    const foot = (side: number) => {
      const f = mesh(new THREE.SphereGeometry(0.16, 20, 12), '#ff9b3d', side * 0.24, 0.06, 0.25);
      f.scale.set(1, 0.45, 1.3);
      return f;
    };
    this.body.add(torso, belly, wing(1), wing(-1), foot(1), foot(-1));

    const eye = (side: number) => {
      const lid = mesh(new THREE.SphereGeometry(0.255, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), blue, 0, 0, 0);
      lid.rotation.x = -Math.PI / 2 - 0.2;
      lid.scale.setScalar(1.04);
      lid.visible = false;
      this.lids.push(lid);
      return group(side * 0.27, 0.08, 0.36,
        ball(0.25, '#ffffff'),
        ball(0.13, '#2b2118', 0, 0, 0.16),
        ball(0.05, '#ffffff', 0.05, 0.06, 0.27),
        lid,
      );
    };
    const tuft = (side: number) => {
      const t = cone(0.14, 0.32, blue, side * 0.38, 0.4, -0.05);
      t.rotation.z = -side * 0.45;
      return t;
    };
    const beak = cone(0.09, 0.22, '#ff9b3d', 0, -0.13, 0.5);
    beak.rotation.x = Math.PI / 2 + 0.5;
    const cap = group(0, 0.52, -0.04,
      cylinder(0.24, 0.27, 0.16, '#24263a'),
      box(0.95, 0.06, 0.95, '#24263a', 0, 0.15, 0),
      cylinder(0.035, 0.035, 0.38, '#ffd34a', 0.36, -0.2, 0.36),
      ball(0.06, '#ffd34a', 0.36, -0.22, 0.36),
    );
    cap.rotation.set(-0.12, 0.25, 0.08);
    const skull = mesh(new THREE.SphereGeometry(0.58, 40, 28), blue);
    skull.scale.set(1.05, 0.88, 0.95);
    this.head.add(skull, eye(1), eye(-1), beak, tuft(1), tuft(-1), cap);
    this.head.position.y = 1.55;
    this.body.add(this.head);
    this.group.add(this.body);
    this.group.traverse((o) => { if (o instanceof THREE.Mesh) o.castShadow = true; });
    this.group.scale.setScalar(1.25);
  }

  /** Moves the owl, hopping if `animate` is true. */
  goTo(target: THREE.Vector3, animate: boolean) {
    if (!animate) {
      this.group.position.copy(target);
      this.move = 1;
      return;
    }
    this.from.copy(this.group.position);
    this.to.copy(target);
    this.move = 0;
  }

  jump() {
    if (this.hop <= 0) this.hop = 1;
  }

  update(dt: number, time: number, look: THREE.Vector3 | null, still: boolean) {
    if (this.move < 1) {
      this.move = Math.min(1, this.move + dt / 1.1);
      const k = this.move * this.move * (3 - 2 * this.move);
      this.group.position.lerpVectors(this.from, this.to, k);
      this.group.position.y += Math.sin(this.move * Math.PI) * 2.2;
    }
    let lift = 0;
    if (this.hop > 0) {
      this.hop = Math.max(0, this.hop - dt * 2.4);
      lift = Math.sin((1 - this.hop) * Math.PI) * 0.7;
    }
    this.body.position.y = lift;
    const breathe = still ? 0 : Math.sin(time * 2.2) * 0.025;
    this.body.scale.set(1 - breathe * 0.5, 1 + breathe, 1 - breathe * 0.5);

    // Look towards the pointer, within a comfortable neck turn.
    let yaw = still ? 0 : Math.sin(time * 0.5) * 0.25;
    let pitch = 0.05;
    if (look) {
      const local = this.group.worldToLocal(look.clone());
      yaw = THREE.MathUtils.clamp(Math.atan2(local.x, local.z), -0.9, 0.9);
      pitch = THREE.MathUtils.clamp(-Math.atan2(local.y - 1.5, Math.hypot(local.x, local.z)) * 0.6, -0.3, 0.45);
    }
    this.head.rotation.y += (yaw - this.head.rotation.y) * Math.min(1, dt * 6);
    this.head.rotation.x += (pitch - this.head.rotation.x) * Math.min(1, dt * 6);

    this.nextBlink -= dt;
    const blinking = !still && this.nextBlink < 0.12;
    this.lids.forEach((l) => (l.visible = blinking));
    if (this.nextBlink < 0) this.nextBlink = 2.5 + Math.random() * 3;
  }
}

export interface Ribbon {
  mesh: THREE.Mesh;
  slug: string;
}

export class Desk {
  readonly group = new THREE.Group();
  /** The left half of the book, hinged at the spine; it folds over to close the book. */
  readonly leftHalf = new THREE.Group();
  readonly owl = new Owl();
  readonly ribbons: Ribbon[] = [];
  private leaf: THREE.Mesh;
  private lamp: THREE.Group;
  readonly lampLight = new THREE.PointLight('#ffc77d', 0, 40, 1.6);

  constructor(tabs: { slug: string; card: string }[]) {
    const desk = new THREE.Mesh(new THREE.PlaneGeometry(140, 100), new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.62 }));
    desk.rotation.x = -Math.PI / 2;
    desk.receiveShadow = true;
    const felt = slab(roundedRect(31, 20, 1.2), 0.05, '#8ec7b6', 0, false, { roughness: 1 });
    felt.castShadow = false;
    this.group.add(desk, felt);

    // The book.
    const blue = '#3260d8';
    const board = (side: 1 | -1) => box(PAGE.w + 0.35, PAGE.board, PAGE.d + 0.45, blue, side * (PAGE.w / 2 + 0.14), 0, 0);
    const spine = cylinder(0.2, 0.2, PAGE.d + 0.45, '#2546b8', 0, 0.12, -(PAGE.d + 0.45) / 2);
    spine.rotation.x = Math.PI / 2;
    this.group.add(board(1), pageStack(1), spine);

    // Ribbon bookmarks, one per theme, peeking out of the top of the right page.
    tabs.forEach((tab, i) => {
      const geo = new THREE.PlaneGeometry(0.62, 1.5);
      geo.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: ribbonTexture(i + 1, tab.card), roughness: 0.7, side: THREE.DoubleSide }));
      m.position.set(1.1 + i * 1.12, PAGE.board + 0.012, -PAGE.d / 2 - 0.55);
      m.receiveShadow = true;
      m.castShadow = true;
      this.group.add(m);
      this.ribbons.push({ mesh: m, slug: tab.slug });
    });

    this.leftHalf.position.set(0, PAGE.top, 0);
    const left = group(0, -PAGE.top, 0, board(-1), pageStack(-1));
    const cover = new THREE.Mesh(new THREE.PlaneGeometry(PAGE.w + 0.3, PAGE.d + 0.4), new THREE.MeshStandardMaterial({ map: coverTexture(), roughness: 0.55 }));
    cover.rotation.set(Math.PI / 2, 0, Math.PI);
    cover.position.set(-(PAGE.w / 2 + 0.14), -0.004, 0);
    left.add(cover);
    this.leftHalf.add(left);
    this.group.add(this.leftHalf);
    document.fonts?.ready.then(() => {
      const fresh = coverTexture();
      (cover.material as THREE.MeshStandardMaterial).map?.dispose();
      (cover.material as THREE.MeshStandardMaterial).map = fresh;
      this.ribbons.forEach((r, i) => {
        const m = r.mesh.material as THREE.MeshStandardMaterial;
        m.map?.dispose();
        m.map = ribbonTexture(i + 1, tabs[i].card);
      });
    });

    // The turning leaf, used only while a page turns.
    const leafGeo = new THREE.PlaneGeometry(PAGE.w, PAGE.d - 0.1, 30, 1);
    this.leaf = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ color: '#fffaf0', roughness: 0.9, side: THREE.DoubleSide }));
    this.leaf.castShadow = true;
    this.leaf.visible = false;
    this.group.add(this.leaf);

    // Props.
    const pencil = group(-12.6, 0.22, 4.2,
      cylinder(0.2, 0.2, 4.2, '#ffc93c', 0, 0, 0, 6),
      cone(0.2, 0.55, '#f4d7a8', 0, 4.2, 0, 6),
      cone(0.07, 0.2, '#3a3a48', 0, 4.53, 0, 6),
      cylinder(0.21, 0.21, 0.35, '#c9c9d6', 0, -0.33, 0),
      cylinder(0.2, 0.2, 0.32, '#ff8aa0', 0, -0.62, 0),
    );
    pencil.rotation.set(0, 0.55, Math.PI / 2);
    const apple = group(-13.2, 0, -2.4,
      ball(0.95, '#e8433f', 0, 0.9, 0),
      cylinder(0.05, 0.06, 0.45, '#6b4426', 0, 1.7, 0),
    );
    const leafy = mesh(new THREE.SphereGeometry(0.28, 20, 12), '#5cb85c', 0.25, 1.95, 0);
    leafy.scale.set(1, 0.3, 0.55);
    leafy.rotation.z = -0.4;
    apple.add(leafy);
    apple.children[0].scale.set(1, 0.9, 1);
    const books = group(13.5, 0, -4,
      box(4.2, 0.6, 3, '#ff8f5a', 0, 0, 0), box(3.9, 0.55, 2.8, '#5ac8a0', 0.15, 0.6, 0.05), box(3.6, 0.5, 2.6, '#ffd34a', -0.1, 1.15, 0),
    );
    books.rotation.y = -0.25;
    this.lamp = group(-13.5, 0, -9,
      cylinder(1.3, 1.5, 0.35, '#2f3a56'),
      cylinder(0.12, 0.12, 6, '#2f3a56', 0, 0.3, 0),
      cone(1.6, 1.4, '#ffd34a', 0, 5.6, 0),
    );
    this.lampLight.position.set(-10, 7.5, -5);
    this.group.add(pencil, apple, books, this.lamp, this.lampLight, this.owl.group);
  }

  /** 0 = closed, 1 = open. */
  setOpen(k: number) {
    this.leftHalf.rotation.z = -Math.PI * (1 - k);
  }

  /** Shows the turning leaf at progress k (0..1); direction 1 turns forward. */
  setLeaf(k: number | null, direction: 1 | -1) {
    this.leaf.visible = k !== null;
    if (k === null) return;
    const theta0 = direction > 0 ? k * Math.PI : (1 - k) * Math.PI;
    const n = 30;
    const seg = PAGE.w / n;
    const xs: number[] = [0];
    const ys: number[] = [0];
    for (let i = 0; i < n; i++) {
      const t = theta0 + direction * 0.55 * Math.sin(theta0) * (i / n);
      xs.push(xs[i] + Math.cos(t) * seg);
      ys.push(ys[i] + Math.sin(t) * seg);
    }
    const pos = this.leaf.geometry.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const ix = v % (n + 1);
      const row = Math.floor(v / (n + 1));
      pos.setXYZ(v, xs[ix], PAGE.top + 0.02 + ys[ix], row === 0 ? -(PAGE.d - 0.1) / 2 : (PAGE.d - 0.1) / 2);
    }
    pos.needsUpdate = true;
    this.leaf.geometry.computeVertexNormals();
  }

  setNight(night: boolean) {
    this.lampLight.intensity = night ? 260 : 0;
  }
}
