import type { SceneBuilder } from '../core/stage';
import { changeSentence, summarise } from '../logic/budget';
import { lines, readout, slider } from '../shared/controls';
import { h } from '../shared/dom';
import { base, box, cylinder, group, roof } from './toon';

const COIN = 500;
const COIN_HEIGHT = 0.13;

const columns = [
  { key: 'food', name: 'Food', color: '#e2735a', start: 3000 },
  { key: 'transport', name: 'Transport', color: '#4f95c8', start: 2000 },
  { key: 'study', name: 'Study', color: '#8a76c4', start: 1500 },
  { key: 'fun', name: 'Fun', color: '#e5b23c', start: 1500 },
  { key: 'savings', name: 'Savings', color: '#4f9c70', start: 0 },
] as const;

const tenge = (n: number) => n.toLocaleString('en-US');

export const market: SceneBuilder = (ctx) => {
  const { root } = ctx;
  root.add(base(12, 6.6, '#f3e3c3'));

  const awning = group(0, 0, -2.6,
    cylinder(0.09, 0.09, 3.4, '#8a6248', -5, 0, 0), cylinder(0.09, 0.09, 3.4, '#8a6248', 5, 0, 0),
    ...Array.from({ length: 10 }, (_, i) => roof(1.04, 0.55, 0.3, i % 2 ? '#fffaf0' : '#d9694f', 3.2)),
  );
  awning.children.slice(2).forEach((c, i) => (c.position.x = -4.68 + i * 1.04));
  root.add(awning);
  ctx.pop(awning, 0);

  let income = 10000;
  const amounts: Record<string, number> = { food: 3000, transport: 2000, study: 1500, fun: 1500 };
  const first = { ...amounts };

  const stacks = columns.map((c, i) => {
    const x = (i - 2) * 2.15;
    const stack = group(x, 0.2, 0.2);
    const coins = Array.from({ length: 40 }, (_, n) => {
      const coin = cylinder(0.65, 0.65, COIN_HEIGHT - 0.025, n % 2 ? c.color : '#fff6e0', 0, n * COIN_HEIGHT, 0, 22);
      coin.visible = false;
      stack.add(coin);
      return coin;
    });
    const plate = box(1.6, 0.2, 1.6, c.color, x, 0, 0.2);
    root.add(plate, stack);
    ctx.pop(plate, 2 + i);
    const anchor = group(x, 0, 0.2);
    root.add(anchor);
    return { ...c, coins, anchor, shown: 0, label: ctx.label(anchor, c.name, { lift: 0.25 }) };
  });

  const result = readout('big');
  const talk = readout('story');
  let changed: string | null = null;
  const values = () => {
    const s = summarise({ income, expenses: amounts });
    return { s, all: { ...amounts, savings: s.savings } as Record<string, number> };
  };
  const update = () => {
    const { s, all } = values();
    stacks.forEach((col) => col.label.setText(`${col.name}\n${tenge(all[col.key])}`));
    result.dataset.tone = s.shortfall ? 'wrong' : 'right';
    result.textContent = s.shortfall
      ? `Shortfall: ${tenge(s.shortfall)} tenge. Expenses are higher than income.`
      : `Savings: ${tenge(income)} − ${tenge(s.spent)} = ${tenge(s.savings)} tenge`;
    const name = columns.find((c) => c.key === changed)?.name;
    lines(talk,
      changed && name ? `Say: “${changeSentence(`Spending on ${name.toLowerCase()}`, first[changed], amounts[changed])}”` : `Say: “As you can see in this chart, my biggest expense is ${s.biggest}.”`,
    );
  };

  ctx.onFrame((dt) => {
    const { all } = values();
    for (const col of stacks) {
      const goal = all[col.key] / COIN;
      col.shown = ctx.reducedMotion || Math.abs(goal - col.shown) < 0.05 ? goal : col.shown + (goal - col.shown) * (1 - Math.exp(-dt * 8));
      col.coins.forEach((coin, n) => (coin.visible = n < Math.round(col.shown)));
      col.anchor.position.y = 0.2 + Math.round(col.shown) * COIN_HEIGHT;
    }
  });

  ctx.panel.append(
    result,
    h('div', { class: 'slider-grid' },
      slider({ label: 'Weekly income', min: 6000, max: 20000, step: COIN, value: income, format: tenge, onInput: (v) => { income = v; update(); } }),
      ...columns.slice(0, 4).map((c) =>
        slider({ label: c.name, min: 0, max: 6000, step: COIN, value: amounts[c.key], format: tenge, onInput: (v) => { amounts[c.key] = v; changed = c.key; update(); } }),
      ),
    ),
    talk,
    h('p', { class: 'hint' }, 'One disc is 500 tenge. The amounts are practice examples.'),
  );
  update();
  ctx.view([0, 6.6, 15.4], [0, 1.6, 0], true);
};
