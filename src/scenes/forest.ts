import * as THREE from 'three';
import type { SceneBuilder } from '../core/stage';
import { theme1 } from '../content/theme1';
import { readout, toggle } from '../shared/controls';
import { h } from '../shared/dom';
import { listenButton } from '../shared/speech';
import { ball, base, box, cutout, cylinder, group, mesh, pine, roundedBoxGeometry, slab, strip, roundedRect } from './toon';

const tips: Record<string, string> = {
  shelter: 'A tent is a shelter. It protects you from rain and wind.',
  whistle: 'A whistle attracts attention and saves your energy.',
  map: 'Use a map with a compass and follow a reliable route.',
  compass: 'A compass helps you find north.',
  trail: 'A clear trail can guide travellers.',
  shortcut: 'Do not take a shortcut that you do not know.',
  mushroom: 'Do not eat plants or mushrooms that you do not know.',
  legend: 'A glowing deer that leads people home is a legend. You cannot prove it.',
};

export const forest: SceneBuilder = (ctx) => {
  const { root } = ctx;
  root.add(base(12, 8.6, '#9fc48d'));
  root.add(strip([[-0.6, 4.1], [0.4, 2.2], [-0.5, 0.4], [1.2, -1.4], [0.6, -4.1]], 0.85, '#e8cf9e'));
  root.add(strip([[-5.9, 1.4], [-3.6, 0.2], [-3.9, -1.9], [-2.4, -4.2]], 0.6, '#8fc3e8', 0.03));

  const trees: [number, number, number][] = [
    [-5, -2.9, 1.5], [-3.6, -3.3, 1.2], [-1.7, -3, 1.6], [-0.4, -3.5, 1.1], [2.2, -3.2, 1.5], [3.7, -2.7, 1.8],
    [5, -3, 1.2], [5.2, -0.9, 1.4], [-5.2, -0.4, 1.1], [5.1, 1.6, 0.9], [-1.9, -1.8, 0.9],
  ];
  trees.forEach(([x, z, s], i) => {
    const tree = pine(x, z, s, ['#4f8f68', '#3f7d63', '#6aa573'][i % 3]);
    root.add(tree);
    ctx.pop(tree, i * 0.5);
  });

  const found = new Set<string>();
  const counter = readout('score');
  const total = Object.keys(tips).length;
  counter.textContent = `Words found: 0 of ${total}`;
  const chips = h('div', { class: 'chip-row', role: 'group', 'aria-label': 'Things in the camp' });
  let count = 0;

  const item = (key: string, wordKey: string, object: THREE.Object3D, lift: number, order: number) => {
    const word = theme1.words.find((w) => w.en === wordKey)!;
    root.add(object);
    ctx.pop(object, order);
    const label = ctx.label(object, '?', { lift });
    const chip = h('button', { type: 'button', class: 'chip', onclick: () => open() }, `Object ${count + 1}`);
    const open = () => {
      found.add(key);
      label.setText(word.en);
      label.el.classList.add('found');
      chip.textContent = word.en;
      chip.classList.add('found');
      counter.textContent = `Words found: ${found.size} of ${total}`;
      ctx.card([
        h('p', { class: 'note-word', lang: 'en' }, word.en),
        h('p', { class: 'note-kk', lang: 'kk' }, word.kk),
        h('p', null, tips[key]),
        ...[listenButton(`${word.en}. ${tips[key]}`, 'Listen', word.en)].filter((n) => n !== null),
      ]);
    };
    count++;
    chips.append(chip);
    ctx.clickable(object, open);
    return { chip, label };
  };

  const tent = group(2.9, 0, 0.1,
    cutout([[-1.15, 0], [1.15, 0], [0, 1.45]], 1.7, '#f0a04b'),
    cutout([[-0.4, 0], [0.4, 0], [0, 0.95]], 0.05, '#7a4a35', 0, 0, 0.87),
  );
  tent.rotation.y = -0.35;
  item('shelter', 'shelter', tent, 1.7, 3);

  const stumpMap = group(-1.7, 0, 1.2,
    cylinder(0.55, 0.65, 0.4, '#a9764f', 0, 0, 0, 9),
    box(0.95, 0.05, 0.7, '#fdf1cf', 0, 0.42, 0),
    box(0.65, 0.02, 0.05, '#d9694f', -0.05, 0.47, 0.05),
    box(0.05, 0.02, 0.45, '#5e9e74', 0.2, 0.47, 0),
  );
  item('map', 'map', stumpMap, 0.9, 4);

  const needle = group(0, 0.19, 0, box(0.07, 0.03, 0.34, '#d9453a', 0, 0, -0.17), box(0.07, 0.03, 0.34, '#fdfdfd', 0, 0, 0.17));
  const compass = group(-2.2, 0, 2.9,
    cylinder(0.48, 0.48, 0.12, '#d3a441'), cylinder(0.39, 0.39, 0.05, '#fffaf0', 0, 0.12, 0), needle);
  item('compass', 'compass', compass, 0.55, 5);

  const ring = mesh(new THREE.TorusGeometry(0.17, 0.05, 6, 16), '#3a4d5c', -0.42, 0.28, 0);
  const whistle = group(1.7, 0, 2.5,
    cylinder(0.27, 0.27, 0.34, '#e2574c', 0, 0.1, 0, 14), box(0.62, 0.2, 0.3, '#e2574c', 0.38, 0.24, 0), ring);
  item('whistle', 'whistle', whistle, 0.85, 6);

  const cap = mesh(new THREE.SphereGeometry(0.46, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), '#d9453a', 0, 0.42, 0);
  const mushroom = group(4.1, 0, 2.7,
    cylinder(0.14, 0.2, 0.48, '#fdf3df'), cap,
    ball(0.07, '#fff', -0.18, 0.78, 0.24), ball(0.06, '#fff', 0.22, 0.82, 0.12), ball(0.05, '#fff', 0.02, 0.88, -0.1));
  item('mushroom', 'mushroom', mushroom, 1.15, 7);

  const trailPost = group(-0.05, 0, -0.55,
    cylinder(0.06, 0.07, 0.9, '#8a6248', -0.65, 0, 0),
    box(0.7, 0.3, 0.08, '#fff3cf', -0.65, 0.65, 0), box(0.4, 0.06, 0.1, '#3f7d63', -0.65, 0.77, 0));
  item('trail', 'trail', trailPost, 1.15, 8);

  const shortcutSign = group(-4.5, 0, 2.5,
    cylinder(0.07, 0.08, 1, '#8a6248'),
    cutout([[-0.55, 0], [0.3, 0], [0.62, 0.22], [0.3, 0.44], [-0.55, 0.44]], 0.1, '#c98a5a', 0, 0.75, 0.05));
  shortcutSign.rotation.y = Math.PI + 0.5;
  item('shortcut', 'shortcut', shortcutSign, 1.5, 9);

  // The legend: a glowing deer that appears only at night.
  const glow = { emissive: '#8ff7df', emissiveIntensity: 0.75 };
  const part = (w: number, hgt: number, d: number, x: number, y: number, z = 0) => {
    return mesh(roundedBoxGeometry(w, hgt, d, Math.min(w, hgt, d) * 0.45), '#c9fff2', x, y - hgt / 2, z, glow);
  };
  const deer = group(0.9, 0, -2.1,
    part(0.9, 0.42, 0.34, 0, 0.78), part(0.18, 0.55, 0.2, 0.48, 1.12), part(0.4, 0.24, 0.24, 0.64, 1.42),
    part(0.05, 0.4, 0.05, 0.52, 1.72, 0.1), part(0.05, 0.4, 0.05, 0.52, 1.72, -0.1), part(0.25, 0.05, 0.05, 0.62, 1.8, 0.1), part(0.25, 0.05, 0.05, 0.62, 1.8, -0.1),
    ...[-0.33, 0.33].flatMap((x) => [-0.1, 0.1].map((z) => part(0.1, 0.58, 0.1, x, 0.29, z))),
  );
  const halo = new THREE.PointLight('#8ff7df', 7, 5);
  halo.position.set(0, 1.3, 0.6);
  deer.add(halo);
  const legend = item('legend', 'legend', deer, 2.15, 2);

  // Rain.
  const drops = 260;
  const positions = new Float32Array(drops * 6);
  const placeDrop = (i: number, y: number) => {
    const x = (Math.random() - 0.5) * 12;
    const z = (Math.random() - 0.5) * 8.6;
    positions.set([x, y, z, x - 0.04, y - 0.28, z], i * 6);
  };
  for (let i = 0; i < drops; i++) placeDrop(i, Math.random() * 6);
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: '#4f86b8', transparent: true, opacity: 0.75 }));
  rain.visible = false;
  rain.raycast = () => {};
  root.add(rain);
  const puddle = slab(roundedRect(1.5, 0.8, 0.38, 0.7, 3.3), 0.015, '#9fcdee', 0.04);
  puddle.visible = false;
  root.add(puddle);

  let night = document.documentElement.dataset.theme === 'night';
  let raining = false;
  const sky = () => {
    ctx.mood(night ? 'night' : raining ? 'dusk' : 'day');
    deer.visible = night;
    legend.label.show(night);
    legend.chip.disabled = !night;
    legend.chip.title = night ? '' : 'Appears at night';
  };
  sky();
  ctx.onFrame((dt, time) => {
    needle.rotation.y = Math.sin(time * 1.3) * 0.18;
    if (!rain.visible || ctx.reducedMotion) return;
    for (let i = 0; i < drops; i++) {
      positions[i * 6 + 1] -= dt * 8;
      positions[i * 6 + 4] -= dt * 8;
      if (positions[i * 6 + 4] < 0) placeDrop(i, 5.5 + Math.random());
    }
    rainGeo.attributes.position.needsUpdate = true;
  });

  ctx.panel.append(
    h('div', { class: 'control-row' },
      toggle('Rain', false, (on) => { raining = on; rain.visible = puddle.visible = on; sky(); }),
      toggle('Night', night, (on) => { night = on; sky(); }),
      counter,
    ),
    chips,
  );
  ctx.view([0, 8.2, 14.2], [0, 0.4, 0], true);
};
