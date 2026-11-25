import type { Exercise } from '../content/types';
import { markSolved, store } from '../core/state';
import { shuffled } from '../logic/quiz';
import { h, nextId } from './dom';

const normalise = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().replace(/\.$/, '');

interface Body {
  el: HTMLElement;
  /** Marks each part and returns the number of wrong or empty parts. */
  check: () => number;
}

function choiceBody(ex: Extract<Exercise, { kind: 'choice' }>): Body {
  const name = nextId(ex.id);
  const rows = shuffled(ex.options.map((_, i) => i)).map((i) => {
    const input = h('input', { type: 'radio', name, value: i });
    const row = h('label', { class: 'option' }, input, h('span', null, ex.options[i]));
    input.addEventListener('change', () => rows.forEach((r) => r.row.removeAttribute('data-result')));
    return { row, input, i };
  });
  return {
    el: h('div', { class: 'options' }, rows.map((r) => r.row)),
    check: () => {
      const picked = rows.find((r) => r.input.checked);
      picked?.row.setAttribute('data-result', picked.i === ex.answer ? 'right' : 'wrong');
      return picked?.i === ex.answer ? 0 : 1;
    },
  };
}

function sortBody(ex: Extract<Exercise, { kind: 'sort' }>): Body {
  const rows = shuffled(ex.items).map((item) => {
    let picked: number | null = null;
    const buttons = ex.buckets.map((label, bucket) =>
      h('button', {
        type: 'button', class: 'chip', 'aria-pressed': 'false',
        onclick: () => {
          picked = bucket;
          buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === bucket)));
          row.removeAttribute('data-result');
        },
      }, label),
    );
    const row = h('div', { class: 'sort-row' }, h('span', null, item.text), h('span', { class: 'sort-buttons' }, buttons));
    return {
      row,
      check: () => {
        const ok = picked === item.bucket;
        row.setAttribute('data-result', ok ? 'right' : 'wrong');
        return ok;
      },
    };
  });
  return {
    el: h('div', { class: 'sort' }, rows.map((r) => r.row)),
    check: () => rows.filter((r) => !r.check()).length,
  };
}

function orderBody(ex: Extract<Exercise, { kind: 'order' }>): Body {
  let order = shuffled(ex.steps);
  if (order.every((s, i) => s === ex.steps[i])) order = [...order.slice(1), order[0]];
  const list = h('ol', { class: 'order' });
  const draw = (focus?: string) => {
    list.replaceChildren(...order.map((step, i) => {
      const move = (delta: number, direction: string) => {
        [order[i], order[i + delta]] = [order[i + delta], order[i]];
        draw(`${step}|${direction}`);
      };
      return h('li', null,
        h('span', null, step),
        h('span', { class: 'order-buttons' },
          h('button', { type: 'button', class: 'chip', disabled: i === 0, 'data-key': `${step}|up`, 'aria-label': `Move up: ${step}`, onclick: () => move(-1, 'up') }, '↑'),
          h('button', { type: 'button', class: 'chip', disabled: i === order.length - 1, 'data-key': `${step}|down`, 'aria-label': `Move down: ${step}`, onclick: () => move(1, 'down') }, '↓'),
        ),
      );
    }));
    if (focus) {
      const buttons = [...list.querySelectorAll<HTMLButtonElement>('button')];
      const same = buttons.find((b) => b.dataset.key === focus && !b.disabled);
      (same ?? buttons.find((b) => b.dataset.key?.startsWith(focus.split('|')[0]) && !b.disabled))?.focus();
    }
  };
  draw();
  return {
    el: list,
    check: () => {
      let wrong = 0;
      [...list.children].forEach((li, i) => {
        const ok = order[i] === ex.steps[i];
        if (!ok) wrong++;
        li.setAttribute('data-result', ok ? 'right' : 'wrong');
      });
      return wrong;
    },
  };
}

function gapBody(ex: Extract<Exercise, { kind: 'gap' }>): Body {
  const rows = ex.lines.map((line) => {
    const input = h('input', { type: 'text', class: 'gap', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': `${line.before} … ${line.after}` });
    input.addEventListener('input', () => input.removeAttribute('data-result'));
    const space = /^[.,!?]/.test(line.after) ? '' : ' ';
    return { line, input, el: h('p', { class: 'gap-line' }, `${line.before} `, input, `${space}${line.after}`) };
  });
  return {
    el: h('div', null, rows.map((r) => r.el)),
    check: () => {
      let wrong = 0;
      for (const r of rows) {
        const ok = r.line.answers.some((a) => normalise(a) === normalise(r.input.value));
        if (!ok) wrong++;
        r.input.setAttribute('data-result', ok ? 'right' : 'wrong');
      }
      return wrong;
    },
  };
}

function build(ex: Exercise): Body {
  switch (ex.kind) {
    case 'choice': return choiceBody(ex);
    case 'sort': return sortBody(ex);
    case 'order': return orderBody(ex);
    case 'gap': return gapBody(ex);
  }
}

export function exercise(ex: Exercise) {
  const host = h('div');
  const feedback = h('p', { class: 'feedback', 'aria-live': 'polite' });
  const done = h('span', { class: 'done-mark' }, 'Solved');
  done.hidden = !store.solved.includes(ex.id);
  let body = build(ex);
  host.append(body.el);

  const check = () => {
    const wrong = body.check();
    if (wrong === 0) {
      feedback.dataset.tone = 'right';
      feedback.textContent = `Correct. ${ex.why}`;
      done.hidden = false;
      markSolved(ex.id);
    } else {
      feedback.dataset.tone = 'wrong';
      feedback.textContent = wrong === 1 ? 'Not yet: check the marked or empty answer.' : `Not yet: ${wrong} answers need another look.`;
    }
  };
  const retry = () => {
    body = build(ex);
    host.replaceChildren(body.el);
    feedback.textContent = '';
  };

  return h('section', { class: 'exercise' },
    h('h4', null, ex.prompt, ' ', done),
    host,
    h('div', { class: 'actions' },
      h('button', { type: 'button', class: 'btn', onclick: check }, 'Check answers'),
      h('button', { type: 'button', class: 'btn quiet', onclick: retry }, 'Start again'),
    ),
    feedback,
  );
}

/** A paper flap that hides an answer until the reader lifts it. */
export function flap(label: string, ...content: (Node | string)[]) {
  return h('details', { class: 'flap' }, h('summary', null, label), h('div', { class: 'flap-inner' }, ...content));
}
