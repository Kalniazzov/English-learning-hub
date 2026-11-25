import * as THREE from 'three';
import type { SceneBuilder } from '../core/stage';
import { lines, readout, segmented } from '../shared/controls';
import { h } from '../shared/dom';
import { speak, canSpeak } from '../shared/speech';
import { ball, base, box, cloud, cone, cutout, cylinder, group, house, mountain, person, pine, strip } from './toon';

type View = [[number, number, number], [number, number, number]];

const steps: { word: string; text: string; view: View }[] = [
  { word: 'First', text: 'First, Aida and her friends met a guide beside the river. The guide told them a legend about a dragon.', view: [[-4.6, 4.2, 9], [-2.6, 0.7, 1.4]] },
  { word: 'Next', text: 'Next, they walked to the old stone bridge. “People say the dragon built it,” said the guide.', view: [[3.8, 5, 8.6], [0, 0.7, 0.4]] },
  { word: 'Then', text: 'Then Aida noticed a sign. It described the local builders who made the bridge.', view: [[2.8, 2.8, 7.2], [1.7, 0.9, 1.7]] },
  { word: 'Finally', text: 'Finally, they visited the square. Aida asked permission before she photographed the bread seller.', view: [[6.8, 4.2, 8], [3.9, 0.6, 1.3]] },
];

export const village: SceneBuilder = (ctx) => {
  const { root } = ctx;
  root.add(base(12.4, 8.6, '#b5d19a'));
  root.add(strip([[-6, -0.7], [-3, -0.1], [0, -0.55], [3, -0.2], [6, -0.8]], 1.35, '#85bde6'));
  root.add(strip([[0, -3], [0, 0.8], [0.6, 2.1], [3.8, 2.2], [5.6, 3]], 0.55, '#eed9ae', 0.015));

  const peaks = [
    mountain(-3.6, -3.7, 5, 3.4, '#6f9bb5'), mountain(3.4, -3.9, 5.4, 3.9, '#5f8aa8'),
    mountain(0.2, -3.2, 4.2, 2.3, '#8fb6c4'), mountain(-5, -2.9, 2.6, 1.6, '#9cc4b4'), mountain(5, -2.8, 2.6, 1.5, '#9cc4b4'),
  ];
  const clouds = [cloud(-3.5, 4.2, -3.2, 0.9), cloud(2.2, 4.7, -3, 0.7)];
  root.add(...peaks, ...clouds);
  peaks.forEach((p, i) => ctx.pop(p, i));

  const houses = [house(-4.6, -2, '#f6dcb4', '#d9694f', 0.85), house(-2.7, -1.8, '#fbe9d0', '#7b68b8', 0.75), house(4.7, 0.9, '#f3d3c4', '#3f86b5', 0.95), house(3.2, -1.7, '#fff0c9', '#c99a2e', 0.8)];
  houses.forEach((o, i) => { root.add(o); ctx.pop(o, 5 + i); });
  [[-5.4, 2.6], [-5, 1.1], [5.5, -1.9], [-1.4, -2.2], [1.9, -2.1], [-3.6, 3.4]].forEach(([x, z], i) => {
    const tree = pine(x, z, 0.75);
    root.add(tree);
    ctx.pop(tree, 6 + i * 0.4);
  });

  // Arched stone bridge across the river.
  const bridge = group(0, 0, -0.35);
  for (let i = 0; i <= 12; i++) {
    const t = i / 12 - 0.5;
    const y = 0.5 * (1 - 4 * t * t);
    const stone = box(1.15, 0.16, 0.2, i % 2 ? '#c9c2b3' : '#d8d1c2', 0, y, t * 2.2);
    stone.rotation.x = Math.atan(1.8 * t);
    bridge.add(stone);
    for (const side of [-0.55, 0.55]) bridge.add(box(0.1, 0.22, 0.16, '#a9a294', side, y + 0.14, t * 2.2));
  }
  root.add(bridge);
  ctx.pop(bridge, 8);

  const sign = group(1.45, 0, 1.35,
    cylinder(0.05, 0.06, 0.65, '#8a6248', -0.4, 0, 0), cylinder(0.05, 0.06, 0.65, '#8a6248', 0.4, 0, 0),
    box(1.15, 0.7, 0.09, '#fff6dc', 0, 0.55, 0),
    ...[1.07, 0.92, 0.77].map((y, i) => box(0.85 - i * 0.12, 0.05, 0.11, '#4d5b52', -i * 0.06, y, 0)),
  );
  root.add(sign);
  ctx.pop(sign, 10);

  const guide = person(-2.8, 1.15, '#c99a2e', 1.25);
  guide.add(cone(0.24, 0.18, '#6b4a35', 0, 0.86, 0));
  const aida = person(-1.75, 1.55, '#d9694f', 1.05);
  const friends = [person(-1.35, 2.15, '#3f86b5'), person(-2.15, 2.3, '#5e9e74')];
  const seller = person(4.55, 2.25, '#7b68b8', 1.1);
  const stall = group(4.75, 0, 1.75,
    box(1.2, 0.42, 0.45, '#a9764f'), ...[-0.35, 0, 0.35].map((x) => ball(0.15, '#d99a4e', x, 0.55, 0)));
  const people = [guide, aida, ...friends, seller, stall];
  people.forEach((o, i) => { root.add(o); ctx.pop(o, 11 + i * 0.5); });
  // The group walks with the story.
  const walkers = [aida, ...friends];
  const homes = [
    [[-1.75, 1.55], [-1.35, 2.15], [-2.15, 2.3]],
    [[-0.1, 1.05], [-0.6, 1.8], [0.4, 1.9]],
    [[1, 2.15], [0.35, 2.45], [1.9, 2.55]],
    [[3.5, 2.35], [2.8, 2.75], [3, 1.9]],
  ];
  const guideHomes = [[-2.8, 1.15], [-0.9, 1.15], [2.5, 1.6], [2.2, 2.3]];

  const dragon = group(0, 0, 0);
  const segments: THREE.Object3D[] = [];
  for (let i = 0; i < 11; i++) {
    const r = 0.34 - i * 0.023;
    const seg = group(0, 0, 0, ball(r, i % 2 ? '#e2574c' : '#f08a4b'));
    if (i % 2 === 0) seg.add(cone(r * 0.4, r * 0.9, '#ffd35c', 0, r * 0.65, 0, 4));
    dragon.add(seg);
    segments.push(seg);
  }
  const wing = (side: number) => {
    const w = cutout([[0, 0], [0.55, 0.85], [1.35, 0.95], [1, 0.55], [1.2, 0.25], [0.6, 0.3], [0.45, -0.05]], 0.04, '#ffd35c');
    w.rotation.y = side * Math.PI / 2;
    const pivot = group(0, 0.1, 0, w);
    segments[2].add(pivot);
    return pivot;
  };
  const wings = [wing(1), wing(-1)];
  segments[0].add(ball(0.07, '#fff', 0.2, 0.15, 0.22), ball(0.07, '#fff', 0.2, 0.15, -0.22), cone(0.08, 0.35, '#fff3cf', -0.08, 0.28, 0.14, 5), cone(0.08, 0.35, '#fff3cf', -0.08, 0.28, -0.14, 5));
  root.add(dragon);

  const dragonLabel = ctx.label(segments[0], 'Legend: a dragon protects the valley', { lift: 0.9, kind: 'legend' });
  const signLabel = ctx.label(sign, 'Evidence: built by local builders', { lift: 1.5, kind: 'evidence' });
  ctx.label(aida, 'Aida', { lift: 1.15 });

  const story = readout('story');
  let step = 0;
  let mode: 'legend' | 'truth' = 'legend';
  const applyMode = () => {
    dragon.visible = mode === 'legend';
    dragonLabel.show(mode === 'legend');
    signLabel.show(mode === 'truth');
    ctx.mood(mode === 'legend' ? 'dusk' : document.documentElement.dataset.theme === 'night' ? 'night' : 'day');
  };
  const go = (i: number, instant = false) => {
    step = i;
    lines(story, steps[i].text);
    if (!instant) ctx.view(...steps[i].view);
  };

  ctx.clickable(sign, () => ctx.card([h('p', { class: 'note-word' }, 'The sign'), h('p', null, '“This stone bridge was made by local builders.” You can read it and check it, so it is evidence.')]));
  ctx.clickable(dragon, () => ctx.card([h('p', { class: 'note-word' }, 'The dragon'), h('p', null, '“Long ago, a dragon protected this valley.” People tell this story, but nobody can prove it. It is a legend.')]));
  ctx.clickable(seller, () => ctx.card([h('p', { class: 'note-word' }, 'The bread seller'), h('p', null, '“May I take your photo, please?” A respectful tourist asks first.')]));

  let t = 0;
  ctx.onFrame((dt) => {
    if (!ctx.reducedMotion) t += dt;
    segments.forEach((seg, i) => {
      const a = t * 0.55 - i * 0.14 + 1.2;
      seg.position.set(Math.cos(a) * 3.6, 3 + Math.sin(a * 3) * 0.25, Math.sin(a) * 1.8 - 0.6);
      seg.rotation.y = -a - Math.PI / 2;
    });
    wings.forEach((w, i) => (w.rotation.x = (i ? -1 : 1) * (0.25 + Math.sin(t * 5) * 0.35)));
    clouds.forEach((c, i) => (c.position.x += Math.sin(t * 0.3 + i * 2) * dt * 0.12));
    const k = ctx.reducedMotion ? 1 : 1 - Math.exp(-dt * 3);
    [...walkers, guide].forEach((p, i) => {
      const [x, z] = i < 3 ? homes[step][i] : guideHomes[step];
      p.position.x += (x - p.position.x) * k;
      p.position.z += (z - p.position.z) * k;
    });
  });

  ctx.panel.append(
    h('div', { class: 'control-row' },
      segmented('Point of view', [['legend', 'Legend'], ['truth', 'Truth']], mode, (m) => { mode = m; applyMode(); }),
      h('button', { type: 'button', class: 'btn quiet', onclick: () => ctx.view([0, 8, 15], [0, 1, 0]) }, 'Whole valley'),
    ),
    h('div', { class: 'control-row' },
      segmented('Story step', steps.map((s, i) => [String(i), s.word]), '0', (v) => go(Number(v))),
      canSpeak ? h('button', { type: 'button', class: 'listen', onclick: () => speak(steps[step].text) }, 'Listen') : null,
    ),
    story,
  );
  go(0, true);
  applyMode();
  ctx.view([0, 8, 15], [0, 1, 0], true);
};
