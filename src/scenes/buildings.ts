import type { SceneBuilder } from '../core/stage';
import { compareSentence, degreesOf, superlativeSentence } from '../logic/adjectives';
import { lines, readout, segmented, slider } from '../shared/controls';
import { h, nextId } from '../shared/dom';
import { base, box, cloud, group, pine, roof, strip } from './toon';

const FLOOR = 0.2;
const BAY = 0.4;
const MAX_FLOORS = 30;
const MAX_BAYS = 8;

type Measure = 'tall' | 'wide' | 'big';

const specs = [
  { name: 'house', title: 'House', x: -3.7, floors: 2, bays: 5, wall: '#f6d9a8', trim: '#d9694f' },
  { name: 'apartment building', title: 'Apartments', x: 0, floors: 9, bays: 7, wall: '#f2b5a2', trim: '#a9503f' },
  { name: 'skyscraper', title: 'Skyscraper', x: 3.7, floors: 28, bays: 4, wall: '#a9cbe8', trim: '#3f6f9b' },
];

export const buildings: SceneBuilder = (ctx) => {
  const { root } = ctx;
  root.add(base(12.4, 5.6, '#bcd6a6'));
  root.add(strip([[-6.1, 1.75], [0, 1.75], [6.1, 1.75]], 0.9, '#98a0ab'));
  for (let x = -5.6; x < 6; x += 1.1) root.add(box(0.5, 0.012, 0.07, '#fffdf4', x, 0.05, 1.75));
  [[-5.55, -0.6], [-1.85, -1.1], [1.9, -1.2], [5.6, -0.5]].forEach(([x, z], i) => {
    const tree = pine(x, z, 0.75);
    root.add(tree);
    ctx.pop(tree, 4 + i);
  });
  const sky = [cloud(-4, 5.2, -2.4, 0.8), cloud(1.7, 4.2, -2.6, 0.55)];
  root.add(...sky);

  const models = specs.map((spec, i) => {
    const holder = group(spec.x, 0, -0.1);
    // One floor is a card box with windows; it is stretched to the chosen width.
    const floors = Array.from({ length: MAX_FLOORS }, (_, f) => {
      const floor = group(0, f * FLOOR, 0);
      const wall = box(1, FLOOR - 0.012, 1.25, spec.wall);
      const windows = Array.from({ length: MAX_BAYS }, () => box(0.2, 0.11, 0.04, f % 3 === 1 ? '#ffe08a' : '#4d718c', 0, 0.045, 0.635));
      floor.add(wall, ...windows);
      holder.add(floor);
      return { floor, wall, windows };
    });
    const top = i === 0 ? roof(1, 0.6, 1.45, spec.trim) : box(1, 0.14, 1.35, spec.trim);
    const door = box(0.28, 0.17, 0.05, '#6b4a35', 0, 0, 0.66);
    holder.add(top, door);
    root.add(holder);
    ctx.pop(holder, i * 2);
    const anchor = group(spec.x, 0, -0.1);
    root.add(anchor);
    const state = { floors: spec.floors, bays: spec.bays, shownFloors: spec.floors };
    return { spec, floors, top, anchor, state, label: ctx.label(anchor, spec.title, { lift: 0.15 }) };
  });

  const layout = (m: (typeof models)[number]) => {
    const width = m.state.bays * BAY;
    const count = Math.round(m.state.shownFloors);
    m.floors.forEach(({ floor, wall, windows }, f) => {
      floor.visible = f < count;
      wall.scale.x = width;
      windows.forEach((w, b) => {
        w.visible = b < m.state.bays;
        w.position.x = (b - (m.state.bays - 1) / 2) * BAY;
      });
    });
    m.top.scale.x = width + 0.2;
    m.top.position.y = count * FLOOR;
    m.anchor.position.y = count * FLOOR + (m.spec.name === 'house' ? 0.75 : 0.15);
  };

  let measure: Measure = 'tall';
  const value = (m: (typeof models)[number]) =>
    measure === 'tall' ? m.state.floors : measure === 'wide' ? m.state.bays : m.state.floors * m.state.bays;
  const sentences = readout('sentences');
  const update = () => {
    const items = models.map((m) => ({ name: m.spec.name, value: value(m) }));
    lines(sentences,
      compareSentence(items[1], items[0], measure),
      compareSentence(items[2], items[1], measure),
      superlativeSentence(items, measure),
    );
    models.forEach((m) => m.label.setText(measure === 'tall' ? `${m.spec.title}: ${m.state.floors} floors` : measure === 'wide' ? `${m.spec.title}: ${m.state.bays} windows wide` : `${m.spec.title}: ${m.state.floors * m.state.bays} windows`));
  };

  ctx.onFrame((dt, time) => {
    for (const m of models) {
      const gap = m.state.floors - m.state.shownFloors;
      m.state.shownFloors = ctx.reducedMotion || Math.abs(gap) < 0.05 ? m.state.floors : m.state.shownFloors + gap * (1 - Math.exp(-dt * 9));
      layout(m);
    }
    if (!ctx.reducedMotion) sky.forEach((c, i) => (c.position.x += Math.sin(time * 0.25 + i * 3) * dt * 0.15));
  });

  // Word lab: say the forms first, then check.
  const inputId = nextId('adjective');
  const input = h('input', { id: inputId, type: 'text', value: 'happy', maxlength: 20, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
  const forms = readout('forms');
  const show = () => {
    const word = input.value.trim().toLowerCase();
    if (!/^[a-z]+$/.test(word)) return lines(forms, 'Type one English adjective, using letters only.');
    const d = degreesOf(word);
    lines(forms, `${word} → ${d.comparative} → ${d.superlative}`, d.rule);
  };
  input.addEventListener('input', () => forms.replaceChildren());

  ctx.panel.append(
    h('div', { class: 'control-row' },
      h('span', null, 'Compare'),
      segmented('Compare by', [['tall', 'Tall'], ['wide', 'Wide'], ['big', 'Big']], measure, (m) => { measure = m; update(); }),
    ),
    sentences,
    h('div', { class: 'slider-grid three' },
      ...models.flatMap((m) => [
        h('fieldset', null, h('legend', null, m.spec.title),
          slider({ label: 'Floors', min: 1, max: MAX_FLOORS, value: m.state.floors, onInput: (v) => { m.state.floors = v; update(); } }),
          slider({ label: 'Width', min: 2, max: MAX_BAYS, value: m.state.bays, onInput: (v) => { m.state.bays = v; update(); } }),
        ),
      ]),
    ),
    h('form', { class: 'word-lab', onsubmit: (e: Event) => { e.preventDefault(); show(); } },
      h('label', { for: inputId }, 'Word lab: say both forms, then check'),
      h('div', { class: 'control-row' }, input, h('button', { type: 'submit', class: 'btn' }, 'Show forms')),
      forms,
      h('p', { class: 'hint' }, 'The lab follows the basic rules. Check unusual words in a dictionary.'),
    ),
  );
  models.forEach(layout);
  update();
  ctx.view([0, 5.8, 17.8], [0, 2.85, 0], true);
};
