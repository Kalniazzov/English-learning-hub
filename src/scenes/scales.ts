import * as THREE from 'three';
import type { SceneBuilder } from '../core/stage';
import type { Label } from '../core/stage';
import { lines, readout, segmented, slider } from '../shared/controls';
import { h } from '../shared/dom';
import { ball, base, box, cylinder, group, house, mountain, person, pine, roof, slab, strip } from './toon';

type Mode = 'one' | 'many';

const levels: { name: string; view: [[number, number, number], [number, number, number]]; ask: string }[] = [
  { name: 'Bakery', view: [[2.2, 3.4, 7.6], [0, 0.9, 0]], ask: 'Micro question: How does this bakery choose its bread price?' },
  { name: 'Street', view: [[2.5, 6, 10], [0, 0.4, 0]], ask: 'Micro question: Which shop will a consumer choose?' },
  { name: 'City', view: [[3, 13, 17], [0, 0, 0]], ask: 'Think: are you studying one firm, one market, or the whole economy?' },
  { name: 'Country', view: [[0, 27, 25], [0, 0, 0.6]], ask: 'Macro question: What is happening to the general price level and unemployment?' },
];

const goods = [
  { name: 'Bread', price: 200, at: [0, 2.35, 0], from: 0 },
  { name: 'Milk', price: 500, at: [-2.9, 1.8, 0.2], from: 1 },
  { name: 'Bus ticket', price: 100, at: [3.1, 1.4, 2], from: 1 },
  { name: 'Rice', price: 700, at: [-6.4, 1.6, -3.4], from: 2 },
  { name: 'Shoes', price: 12000, at: [6.2, 1.6, -3], from: 2 },
  { name: 'Haircut', price: 3000, at: [-9.5, 2, 4.2], from: 3 },
  { name: 'Notebook', price: 300, at: [9.8, 2, 3.4], from: 3 },
] as const;

export const scales: SceneBuilder = (ctx) => {
  const { root } = ctx;
  root.add(base(7, 6, '#e7d9bd'));
  // The country is one big sheet of card under the city.
  root.add(slab([[-14, -3], [-10.5, -8.5], [-3, -7.5], [3, -10], [10, -7.2], [14.5, -2], [12, 3.5], [13, 7], [5.5, 8.5], [0, 7], [-7, 9], [-12.5, 5]], 0.25, '#b6cf9c', -0.75));

  // Our bakery.
  const bakery = group(0, 0, -0.3,
    box(2.2, 1.35, 1.5, '#f7dcae'), roof(2.5, 0.75, 1.65, '#b4553f', 1.35),
    box(0.45, 0.8, 0.06, '#8a6248', -0.55, 0, 0.77), box(0.95, 0.55, 0.06, '#8fc3e8', 0.42, 0.35, 0.77),
    ...[0.2, 0.45, 0.7].map((x) => ball(0.12, '#d99a4e', x, 0.47, 0.85)),
    ...Array.from({ length: 6 }, (_, i) => {
      const stripe = box(0.37, 0.07, 0.55, i % 2 ? '#fffaf0' : '#d9694f', -0.925 + i * 0.37, 1.03, 0.95);
      stripe.rotation.x = 0.3;
      return stripe;
    }),
  );
  const buyer = person(0.75, 1.2, '#3f86b5', 0.85);
  root.add(bakery, buyer);
  ctx.pop(bakery, 1);
  ctx.pop(buyer, 4);

  root.add(strip([[-6.5, 1.95], [0, 1.95], [6.5, 1.95]], 0.8, '#9aa2ad', 0.03));
  const street = [house(-2.9, -0.2, '#d9ecd0', '#4f8f68', 1.15), house(2.9, -0.2, '#d8e6f5', '#3f86b5', 1.15), house(-2.4, 3.2, '#efe0f4', '#7b68b8', 0.9)];
  street.forEach((s, i) => { root.add(s); ctx.pop(s, 3 + i); });
  const bus = group(3.1, 0.08, 2, box(1.15, 0.55, 0.5, '#e5b23c', 0, 0.14, 0), box(0.9, 0.2, 0.52, '#4d718c', 0, 0.4, 0),
    ...[-0.35, 0.35].map((x) => { const w = cylinder(0.15, 0.15, 0.56, '#38434d', x, 0, 0, 12); w.geometry.translate(0, -0.28, 0); w.rotation.x = Math.PI / 2; w.position.y = 0.15; return w; }));
  root.add(bus);

  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const walls = ['#f3d3c4', '#d8e6f5', '#fbe9c6', '#dcebd3', '#e9dff3'];
  const tops = ['#c4654f', '#3f6f9b', '#b88a28', '#4f8f68', '#6f5da8'];
  const town = (cx: number, cz: number, spread: number, count: number, y: number) => {
    for (let i = 0; i < count; i++) {
      const x = cx + (random() - 0.5) * spread;
      const z = cz + (random() - 0.5) * spread * 0.7;
      if (Math.abs(x) < 4 && z > -2.4 && z < 3.9) continue;
      const hgt = 0.35 + random() * (random() > 0.85 ? 1.7 : 0.65);
      const k = Math.floor(random() * walls.length);
      root.add(box(0.55, hgt, 0.55, walls[k], x, y, z), box(0.62, 0.1, 0.62, tops[k], x, y + hgt, z));
    }
  };
  town(0, 0, 11.5, 70, -0.5);
  town(-9.5, 3.8, 4, 18, -0.5);
  town(9.6, 3, 4.2, 18, -0.5);
  town(7.5, -5, 3.4, 12, -0.5);
  for (const [x, z, w, hgt] of [[-9, -4.8, 4, 2], [-5.8, -5.6, 3.4, 2.7], [3.2, -7, 4.4, 2.2]]) root.add(group(0, -0.5, 0, mountain(x, z, w, hgt, '#8495a8', 0.7)));
  for (let i = 0; i < 40; i++) {
    const x = (random() - 0.5) * 22;
    const z = (random() - 0.5) * 12;
    if (Math.abs(x) < 6 && Math.abs(z) < 4.2) continue;
    root.add(group(0, -0.5, 0, pine(x, z, 0.55)));
  }
  root.add(group(0, -0.52, 0, strip([[-12.5, 1.2], [-8, 6], [-2, 5], [4, 5.6], [11.5, 1]], 0.4, '#9aa2ad')));

  // On the desk the whole country already fits the page, so start from there.
  let level = ctx.desk ? 3 : 0;
  let mode: Mode = 'one';
  let rise = 0;
  const tags: { label: Label; item: (typeof goods)[number] }[] = goods.map((item) => ({
    item,
    label: ctx.label(new THREE.Vector3(...(item.at as unknown as [number, number, number])), item.name, { kind: 'price' }),
  }));

  const field = readout('big');
  const story = readout('story');
  const update = () => {
    for (const { label, item } of tags) {
      const changes = rise > 0 && (mode === 'many' || item.name === 'Bread');
      const price = changes ? Math.round((item.price * (1 + rise / 100)) / 10) * 10 : item.price;
      label.setText(`${item.name} ${price.toLocaleString('en-US')} ₸${changes ? ' ▲' : ''}`);
      label.el.classList.toggle('risen', changes);
      label.show(level >= item.from && (level < 3 || item.name === 'Bread' || item.from >= 2));
    }
    field.dataset.tone = mode === 'many' ? 'macro' : 'micro';
    field.textContent = rise === 0
      ? 'Prices have not changed.'
      : mode === 'one'
        ? 'Microeconomics: one bakery changed one price.'
        : 'Macroeconomics: many prices are rising across the country.';
    lines(story,
      rise > 0 && mode === 'many'
        ? 'A general and continuing rise like this is called inflation. Each picture shows only one moment.'
        : rise > 0 ? 'This alone is not inflation. Inflation is a general rise in many prices.' : 'Move the price slider to test your prediction.',
      levels[level].ask,
    );
  };

  const go = (i: number) => {
    level = i;
    ctx.view(...levels[i].view);
    update();
  };

  ctx.panel.append(
    h('div', { class: 'control-row' }, h('span', null, 'Zoom'), segmented('Zoom level', levels.map((l, i) => [String(i), l.name]), String(level), (v) => go(Number(v)))),
    h('div', { class: 'control-row' }, segmented('Which prices change', [['one', 'One price'], ['many', 'Many prices']], mode, (m) => { mode = m; update(); })),
    slider({ label: 'Price rise', min: 0, max: 50, step: 5, value: 0, format: (v) => `${v}%`, onInput: (v) => { rise = v; update(); } }),
    field,
    story,
    h('p', { class: 'hint' }, 'Prices are practice examples, not real market data.'),
  );
  update();
  ctx.view(...levels[0].view, true);
};
