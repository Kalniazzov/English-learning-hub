import { themes, checkInfo } from '../content';
import type { Theme } from '../content/types';
import { quizParts, type Question } from '../content/quiz';
import { markingBand, scoreParts, shuffled } from '../logic/quiz';
import { exercise, flap } from '../shared/exercises';
import { h, nextId } from '../shared/dom';
import { listenButton } from '../shared/speech';
import { wordClip } from '../content/audio';
import { forest } from '../scenes/forest';
import { village } from '../scenes/village';
import { market } from '../scenes/market';
import { tradeMap } from '../scenes/map';
import { buildings } from '../scenes/buildings';
import { scales } from '../scenes/scales';
import { summit } from '../scenes/summit';
import type { SceneBuilder } from './stage';
import { coverArt } from './cover-art';
import { isStamped, resetProgress, save, solvedCount, store } from './state';

export interface Model {
  /** The box the model is drawn in on a normal page; absent on the desk. */
  host?: HTMLElement;
  panel: HTMLElement;
  builder: SceneBuilder;
  footprint: [number, number];
  description: string;
}

export interface Rendered {
  left: Node[];
  right: Node[];
  model?: Model;
}

export interface Page {
  slug: string;
  title: string;
  card: string;
  /** What Hoot the owl says when tapped on this page. */
  tip: string;
  /** `desk` is true when the page is shown inside the 3D book. */
  render: (desk: boolean) => Rendered;
}

const scenes: [SceneBuilder, [number, number]][] = [
  [forest, [12.6, 9]], [village, [13, 9.2]], [market, [12.6, 7.2]], [tradeMap, [13.6, 9.2]], [buildings, [12.9, 6]], [scales, [29, 20]],
];
const summitFootprint: [number, number] = [13, 5.4];
const allCards = [...themes.map((t) => ({ number: t.number, slug: t.slug, title: t.title, card: t.card })), checkInfo];

/** The section each theme was left on, so returning to a theme keeps your place. */
const openSection: Record<string, number> = {};

export function progressText(slug: string): { text: string; stamped: boolean } {
  const theme = themes.find((t) => t.slug === slug);
  if (theme) {
    return { text: `${solvedCount(theme)} of ${theme.practice.length} tasks solved`, stamped: isStamped(theme) };
  }
  const { submitted, best, answers } = store.quiz;
  if (best !== null) return { text: `Best score: ${best} of 30`, stamped: true };
  return { text: submitted ? 'Checked' : `${Object.keys(answers).length} of 30 answered`, stamped: false };
}

function stamp(slug: string) {
  const el = h('span', { class: 'stamp', 'data-stamp': slug }, 'Done');
  el.hidden = !progressText(slug).stamped;
  return el;
}

function teacherNotes(notes: string[]) {
  return h('aside', { class: 'teacher', lang: 'kk' }, h('h3', null, 'Мұғалімге'), h('ul', null, notes.map((n) => h('li', null, n))));
}

function modelPage(theme: { title: string; slug: string }, builder: SceneBuilder, footprint: [number, number], description: string, desk: boolean): { right: Node[]; model?: Model } {
  if (desk) {
    const panel = h('div', { class: 'panel' });
    return {
      right: [h('h3', { class: 'sr-only' }, `3D model: ${theme.title}`), h('p', { class: 'stage-help' }, 'Drag the desk to look around. Tap things in the model.'), panel],
      model: { panel, builder, footprint, description },
    };
  }
  if (store.settings.reading) {
    return {
      right: [h('figure', { class: 'model-photo' },
        h('img', { src: `snapshots/${theme.slug}.webp`, alt: description, width: 1200, height: 800, loading: 'lazy' }),
        h('figcaption', { class: 'hint' }, 'Reading mode is on. To turn and change the 3D model, switch it off with the book button at the bottom of the screen.'),
      )],
    };
  }
  const host = h('div', { class: 'stage' });
  const panel = h('div', { class: 'panel' });
  return {
    right: [
      h('h3', { class: 'sr-only' }, `3D model: ${theme.title}`),
      host,
      h('p', { class: 'stage-help' }, 'Drag to turn the model. Scroll or pinch to zoom.'),
      panel,
    ],
    model: { host, panel, builder, footprint, description },
  };
}

function sections(theme: Theme) {
  const read = () => [
    ...theme.reading.flatMap((block) => [
      block.heading ? h('h3', null, block.heading) : null,
      ...block.text.map((p) => h('p', null, p)),
    ]).filter((n) => n !== null),
    listenButton(theme.reading.flatMap((b) => [b.heading ?? '', ...b.text]).join(' '), 'Listen to the text') ?? h('span'),
  ];

  const words = () => [
    h('p', { class: 'hint' }, 'Say each word, then lift the flap to check the Kazakh meaning.'),
    h('ul', { class: 'words' }, theme.words.map((w, i) =>
      h('li', null,
        h('div', { class: 'word-head' }, h('strong', null, w.en), listenButton(`${w.en}. ${w.example}`, 'Listen', w.en, wordClip(theme.slug, i))),
        h('p', null, w.example),
        flap('Meaning', h('span', { lang: 'kk' }, w.kk)),
      ),
    )),
  ];

  const language = () => [
    h('h3', null, theme.language.title),
    h('p', null, theme.language.intro),
    h('table', null, h('tbody', null, theme.language.rows.map(([a, b]) => h('tr', null, h('th', { scope: 'row' }, a), h('td', null, b))))),
    h('p', { class: 'tip' }, theme.language.tip),
  ];

  const predict = () => {
    const name = nextId('guess');
    const note = h('p', { class: 'feedback', 'aria-live': 'polite' });
    const proof = flap('Step 3. Lift to see the proof', h('p', null, theme.predict.proof));
    return [
      h('h3', null, 'Step 1. Predict'),
      h('p', null, theme.predict.question),
      h('div', { class: 'options' }, theme.predict.options.map((o) =>
        h('label', { class: 'option' },
          h('input', { type: 'radio', name, onchange: () => (note.textContent = `Your guess: ${o}. Now test it.`) }),
          h('span', null, o),
        ),
      )),
      note,
      h('h3', null, 'Step 2. Test'),
      h('p', null, theme.predict.test),
      h('button', { type: 'button', class: 'btn quiet to-model', onclick: () => document.dispatchEvent(new CustomEvent('book:show-model')) }, 'Go to the 3D model'),
      proof,
    ];
  };

  const practice = () => theme.practice.map(exercise);

  const speakUp = () => [
    h('h3', null, 'Your turn'),
    h('p', null, theme.speak.task),
    h('ul', { class: 'frames' }, theme.speak.frames.map((f) => h('li', null, f))),
    h('textarea', { rows: 5, 'aria-label': 'Draft your answer', placeholder: 'Write your notes here, then say your answer aloud.' }),
    flap('Lift to read a sample answer', h('p', null, theme.speak.sample), listenButton(theme.speak.sample) ?? h('span')),
  ];

  return [
    ['Read', read], ['Words', words], ['Language', language], ['Explore', predict], ['Practice', practice], ['Speak', speakUp],
  ] as [string, () => Node[]][];
}

function tabbed(theme: Theme) {
  const list = sections(theme);
  const base = nextId('section');
  const panels = list.map(([, build], i) => h('div', { class: 'section', role: 'tabpanel', id: `${base}-panel-${i}`, 'aria-labelledby': `${base}-tab-${i}`, tabindex: 0 }, ...build()));
  const tabs = list.map(([name], i) => h('button', { type: 'button', role: 'tab', id: `${base}-tab-${i}`, 'aria-controls': `${base}-panel-${i}`, onclick: () => select(i) }, name));
  const select = (i: number, focus = false) => {
    openSection[theme.slug] = i;
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
    });
    panels.forEach((p, j) => (p.hidden = i !== j));
    if (focus) tabs[i].focus();
  };
  const bar = h('div', {
    class: 'section-tabs', role: 'tablist', 'aria-label': 'Lesson parts',
    onkeydown: (e: KeyboardEvent) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      select(((openSection[theme.slug] ?? 0) + step + list.length) % list.length, true);
    },
  }, tabs);
  select(openSection[theme.slug] ?? 0);
  return [bar, ...panels];
}

function themePage(theme: Theme, index: number): Page {
  return {
    slug: theme.slug,
    title: theme.title,
    card: theme.card,
    tip: theme.predict.test,
    render: (desk) => ({
      left: [
        h('header', { class: 'theme-head' },
          h('p', { class: 'theme-number' }, `Theme ${theme.number}`),
          h('h2', null, theme.title),
          h('p', { class: 'subtitle' }, theme.subtitle),
          stamp(theme.slug),
        ),
        flap('What you will learn', h('ul', null, theme.goals.map((g) => h('li', null, g)))),
        teacherNotes(theme.teacher),
        ...tabbed(theme),
      ],
      ...modelPage(theme, scenes[index][0], scenes[index][1], theme.modelText, desk),
    }),
  };
}

function checkPage(): Page {
  const render = (desk: boolean) => {
    const body = h('div');
    let current = 0;

    const orderOf = (q: Question) => (store.quiz.order[q.n] ??= shuffled(q.options.map((_, i) => i)));

    const questionBlock = (q: Question) => {
      const { answers, submitted } = store.quiz;
      return h('fieldset', { class: 'question' },
        h('legend', null, `${q.n}. ${q.text}`),
        orderOf(q).map((option, position) => {
          const input = h('input', {
            type: 'radio', name: `q${q.n}`, value: option, disabled: submitted,
            onchange: () => {
              store.quiz.answers[q.n] = option;
              save();
              updateCounts();
            },
          });
          input.checked = answers[q.n] === option;
          const result = !submitted ? undefined : option === q.answer ? 'right' : answers[q.n] === option ? 'wrong' : undefined;
          const mark = result === 'right' ? 'Correct answer' : result === 'wrong' ? 'Your answer' : '';
          return h('label', { class: 'option', 'data-result': result },
            input, h('span', null, `${'ABCD'[position]}. ${q.options[option]}`), mark ? h('em', null, mark) : null);
        }),
      );
    };

    let partButtons: HTMLButtonElement[] = [];
    const counter = h('p', { class: 'feedback', 'aria-live': 'polite' });
    const updateCounts = () => {
      partButtons.forEach((b, i) => {
        const done = quizParts[i].questions.filter((q) => store.quiz.answers[q.n] !== undefined).length;
        b.querySelector('small')!.textContent = `${done}/5`;
      });
      counter.textContent = '';
    };

    const results = () => {
      const score = scoreParts(quizParts, store.quiz.answers);
      return h('section', { class: 'results', tabindex: -1 },
        h('p', { class: 'score-big' }, `${score.total} of ${score.max}`),
        h('p', null, markingBand(score.total)),
        h('table', null, h('tbody', null, score.byPart.map((part) =>
          h('tr', null,
            h('th', { scope: 'row' }, part.title),
            h('td', null, `${part.score}/${part.max}`),
            h('td', null, part.score < part.max ? h('a', { href: `#${themes[part.theme - 1].slug}` }, `Review Theme ${part.theme}`) : 'Complete'),
          ),
        ))),
        h('button', {
          type: 'button', class: 'btn',
          onclick: () => {
            store.quiz = { answers: {}, order: {}, submitted: false, best: store.quiz.best };
            save();
            current = 0;
            draw(true);
          },
        }, 'Try again'),
      );
    };

    const submit = () => {
      const missing = quizParts.flatMap((p) => p.questions).filter((q) => store.quiz.answers[q.n] === undefined);
      if (missing.length) {
        counter.dataset.tone = 'wrong';
        const list = missing.length > 8 ? '' : `: ${missing.map((q) => q.n).join(', ')}`;
        counter.textContent = `Answer ${missing.length} more ${missing.length === 1 ? 'question' : 'questions'} first${list}.`;
        return;
      }
      const { total } = scoreParts(quizParts, store.quiz.answers);
      store.quiz.submitted = true;
      store.quiz.best = Math.max(total, store.quiz.best ?? 0);
      save();
      draw(true);
    };

    function draw(toTop = false) {
      const part = quizParts[current];
      partButtons = quizParts.map((p, i) => h('button', {
        type: 'button', class: 'part', 'aria-pressed': String(i === current), style: `--card:${themes[p.theme - 1].card}`,
        onclick: () => { current = i; draw(); partButtons[i].focus(); },
      }, `Part ${i + 1}`, h('small')));
      body.replaceChildren(...[
        store.quiz.submitted ? results() : null,
        h('div', { class: 'parts', role: 'group', 'aria-label': 'Test parts' }, partButtons),
        h('h3', null, part.title),
        ...part.questions.map(questionBlock),
        h('div', { class: 'actions' },
          h('button', { type: 'button', class: 'btn quiet', disabled: current === 0, onclick: () => { current--; draw(true); } }, 'Previous part'),
          current < quizParts.length - 1
            ? h('button', { type: 'button', class: 'btn', onclick: () => { current++; draw(true); } }, 'Next part')
            : null,
          store.quiz.submitted ? null : h('button', { type: 'button', class: current === quizParts.length - 1 ? 'btn' : 'btn quiet', onclick: submit }, 'Check my answers'),
        ),
        counter,
      ].filter((n) => n !== null));
      updateCounts();
      if (toTop) body.closest('.page-scroll, .sheet')?.scrollTo({ top: 0 });
    }
    draw();

    return {
      left: [
        h('header', { class: 'theme-head' },
          h('p', { class: 'theme-number' }, 'Theme 7'),
          h('h2', null, checkInfo.title),
          h('p', { class: 'subtitle' }, checkInfo.subtitle),
          stamp(checkInfo.slug),
        ),
        teacherNotes([
          'Бағалау: 30 сұрақ, әрқайсысы 1 балл. 25–30: жақсы меңгерген; 18–24: қате кеткен тақырыптарды қайталау; 0–17: сабақтарды қайта оқу.',
          'Жауап нұсқаларының реті әр талпыныста араласады, сондықтан қағаз кілтіндегі әріптермен сәйкес келмейді.',
          'Бұл өзін-өзі тексеруге арналған: жауаптар сайт кодында бар. Бағаланатын бақылауды қағазда өткізіңіз.',
        ]),
        body,
      ],
      ...modelPage(checkInfo, summit, summitFootprint, 'Six towers, one for each topic. Each tower has five blocks, one for each question.', desk),
    };
  };
  return { slug: checkInfo.slug, title: checkInfo.title, card: checkInfo.card, tip: 'Answer all 30 questions, then press Check my answers. Watch the towers grow!', render };
}

const cover: Page = {
  slug: 'cover',
  title: 'Cover',
  card: '#3260d8',
  tip: 'Hi, I am Hoot! Tap the cover to open the book.',
  render: () => {
    const art = h('div', { class: 'cover-art' });
    art.innerHTML = coverArt;
    return {
      left: [],
      right: [h('div', { class: 'cover' },
        h('h1', null, 'English Learning Hub'),
        h('p', null, 'Unit 1: Legend or Truth'),
        art,
        h('p', { class: 'cover-note' }, 'Seven themes with 3D pop-up models'),
        h('a', { class: 'btn cover-open', href: '#contents' }, 'Open the book'),
      )],
    };
  },
};

const contents: Page = {
  slug: 'contents',
  title: 'Contents',
  card: '#3260d8',
  tip: 'Tap a coloured ribbon to jump to a theme, or use the arrow keys to turn the page.',
  render: () => {
    let armed = false;
    const reset = h('button', {
      type: 'button', class: 'btn quiet',
      onclick: () => {
        if (!armed) {
          armed = true;
          reset.textContent = 'Click again to erase all progress';
          return;
        }
        armed = false;
        resetProgress();
        reset.textContent = 'Progress erased';
      },
      onblur: () => { armed = false; reset.textContent = 'Erase my progress'; },
    }, 'Erase my progress');

    return {
      left: [
        h('h2', null, 'Contents'),
        h('ol', { class: 'contents' }, allCards.map((c) =>
          h('li', { style: `--card:${c.card}` },
            h('a', { href: `#${c.slug}` },
              h('span', { class: 'contents-number', 'aria-hidden': 'true' }, c.number),
              h('span', null, h('strong', null, c.title), h('small', { 'data-progress': c.slug }, progressText(c.slug).text)),
              stamp(c.slug),
            ),
          ),
        )),
      ],
      right: [h('div', { class: 'intro' },
        h('h2', null, 'How to use this book'),
        h('p', null, 'Unit 1 asks one question again and again: is it a legend, or is it true? In every theme you find out for yourself.'),
        h('ol', { class: 'cycle' },
          h('li', null, h('strong', null, 'Predict. '), 'Open Explore and make a guess.'),
          h('li', null, h('strong', null, 'Test. '), 'Change the 3D model and watch what happens.'),
          h('li', null, h('strong', null, 'Prove. '), 'Lift the paper flap and compare the proof with your guess.'),
        ),
        h('p', null, 'Solve every Practice task in a theme to earn its stamp. Your progress stays in this browser.'),
        h('p', null, 'Turn pages with the arrows at the bottom of the screen, the coloured ribbons, or the left and right arrow keys. Tap Hoot the owl for a tip.'),
        reset,
      )],
    };
  },
};

export const pages: Page[] = [cover, contents, ...themes.map(themePage), checkPage()];

/** Every model with the file name of its picture, for the snapshot tool. */
export const modelList = [
  ...themes.map((t, i) => ({ slug: t.slug, builder: scenes[i][0], footprint: scenes[i][1], description: t.modelText })),
  { slug: checkInfo.slug, builder: summit, footprint: summitFootprint, description: 'Six towers, one for each topic.' },
];
