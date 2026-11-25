import { h, nextId } from './dom';

export function slider(opts: { label: string; min: number; max: number; step?: number; value: number; format?: (v: number) => string; onInput: (v: number) => void }) {
  const id = nextId('slider');
  const format = opts.format ?? String;
  const out = h('output', { for: id }, format(opts.value));
  const input = h('input', {
    id, type: 'range', min: opts.min, max: opts.max, step: opts.step ?? 1, value: opts.value,
    oninput: () => {
      const v = Number(input.value);
      out.textContent = format(v);
      opts.onInput(v);
    },
  });
  input.value = String(opts.value);
  return h('div', { class: 'slider' }, h('label', { for: id }, opts.label), input, out);
}

export function toggle(label: string, checked: boolean, onChange: (on: boolean) => void) {
  const input = h('input', { type: 'checkbox', onchange: () => onChange(input.checked) });
  input.checked = checked;
  return h('label', { class: 'switch' }, input, h('span', { class: 'switch-track', 'aria-hidden': 'true' }), label);
}

export function segmented<T extends string>(name: string, options: [T, string][], value: T, onChange: (v: T) => void) {
  const group = h('div', { class: 'segmented', role: 'group', 'aria-label': name });
  const buttons = options.map(([key, label]) =>
    h('button', {
      type: 'button',
      'aria-pressed': String(key === value),
      onclick: () => {
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(options[i][0] === key)));
        onChange(key);
      },
    }, label),
  );
  group.append(...buttons);
  return group;
}

export function readout(className = '') {
  return h('div', { class: `readout ${className}`, 'aria-live': 'polite' });
}

export function lines(target: HTMLElement, ...text: string[]) {
  target.replaceChildren(...text.map((t) => h('p', null, t)));
}
