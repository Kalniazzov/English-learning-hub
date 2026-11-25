import * as THREE from 'three';
import { h } from '../shared/dom';
import { pages, progressText, type Page, type Rendered } from './pages';
import { Stage } from './stage';
import { onChange, save, store } from './state';

const icon = (path: string) => {
  const span = h('span', { class: 'icon', 'aria-hidden': 'true' });
  span.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  return span;
};
const icons = {
  contents: '<path d="M5 6h14M5 12h14M5 18h9"/>',
  prev: '<path d="m15 5-7 7 7 7"/>',
  next: '<path d="m9 5 7 7-7 7"/>',
  night: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  reading: '<path d="M4 5h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v13h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4z"/><path d="M12 6v13"/>',
  teacher: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  view: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  model: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  lesson: '<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
};

const COVER = new THREE.Vector3(7.7, 1.44, 4.3);
const DESK_SPOT = new THREE.Vector3(11.1, 0.05, 1.2);

export function startBook(app: HTMLElement) {
  const stage = new Stage();
  if (!stage.supported) store.settings.reading = true;
  const wide = window.matchMedia('(min-width: 900px)');
  // The 3D book is used on every screen size; reading mode and old browsers get flat pages.
  const useDesk = () => stage.supported && !store.settings.reading;

  // Flat layout: two pages side by side, or stacked on phones.
  const leftScroll = h('div', { class: 'page-scroll' });
  const rightScroll = h('div', { class: 'page-scroll' });
  const flatLeft = h('section', { class: 'page page-left', 'aria-label': 'Lesson page' }, leftScroll);
  const flatRight = h('section', { class: 'page page-right', 'aria-label': 'Model page' }, rightScroll);
  const edgeTabs = h('nav', { class: 'edge-tabs', 'aria-label': 'Themes' },
    pages.slice(2).map((p, i) => h('a', { href: `#${p.slug}`, style: `--card:${p.card}`, 'data-tab': p.slug, title: p.title, 'aria-label': `Theme ${i + 1}: ${p.title}` }, i + 1)),
  );
  const flatBook = h('div', { class: 'book' }, flatLeft, flatRight, edgeTabs);

  // Desk layout: the pages live inside the 3D scene.
  const sheet = () => h('div', { class: 'sheet' });
  const deskLeft = h('section', { class: 'page3d page3d-left', 'aria-label': 'Lesson page' }, sheet());
  const deskPanel = h('section', { class: 'page3d page3d-panel', 'aria-label': 'Model controls' }, sheet());
  const deskFull = h('section', { class: 'page3d page3d-full', 'aria-label': 'Right page' }, sheet());
  const sheetOf = (el: HTMLElement) => el.firstElementChild as HTMLElement;
  const openCover = h('a', { class: 'btn cover-open desk-open', href: '#contents' }, 'Open the book');
  const deskHost = h('div', { class: 'desk3d' }, h('h1', { class: 'sr-only' }, 'English Learning Hub, Unit 1: Legend or Truth'), openCover);

  const settingButton = (label: string, path: string, key: 'night' | 'reading' | 'teacher', after: () => void) => {
    const button = h('button', {
      type: 'button', class: 'dock-btn', title: label, 'aria-label': label, 'aria-pressed': String(store.settings[key]),
      onclick: () => {
        store.settings[key] = !store.settings[key];
        button.setAttribute('aria-pressed', String(store.settings[key]));
        save();
        after();
      },
    }, icon(path));
    return button;
  };
  const applySettings = () => {
    document.documentElement.dataset.theme = store.settings.night ? 'night' : 'day';
    document.documentElement.dataset.teacher = String(store.settings.teacher);
  };
  const reading = settingButton('Reading mode', icons.reading, 'reading', () => layout());
  reading.disabled = !stage.supported;
  if (!stage.supported) reading.title = '3D is not available in this browser, so reading mode stays on.';

  const back = h('button', { type: 'button', class: 'dock-btn', 'aria-label': 'Previous page', title: 'Previous page', onclick: () => step(-1) }, icon(icons.prev));
  const next = h('button', { type: 'button', class: 'dock-btn', 'aria-label': 'Next page', title: 'Next page', onclick: () => step(1) }, icon(icons.next));
  const where = h('p', { class: 'dock-title', 'aria-live': 'polite' });
  const dots = h('div', { class: 'dock-dots' },
    pages.map((p, i) => h('a', { href: `#${p.slug}`, 'aria-label': `Page ${i + 1}: ${p.title}`, title: p.title, style: `--card:${p.card}` })),
  );
  // Phones show one page of the open book at a time.
  const pageButton = h('button', { type: 'button', class: 'dock-btn narrow-only', onclick: () => showPage(stage.focus === 'left' ? 'right' : 'left') });
  const showPage = (side: 'left' | 'right', animate = true) => {
    stage.focus = side;
    const label = side === 'left' ? 'Show the 3D model' : 'Show the lesson';
    pageButton.setAttribute('aria-label', label);
    pageButton.title = label;
    pageButton.replaceChildren(icon(side === 'left' ? icons.model : icons.lesson));
    if (stage.mode === 'desk') stage.bookView(!animate);
  };
  showPage('left', false);
  const viewButton = h('button', { type: 'button', class: 'dock-btn desk-only', 'aria-label': 'Show the whole book', title: 'Show the whole book', onclick: () => stage.bookView() }, icon(icons.view));
  const dock = h('nav', { class: 'dock', 'aria-label': 'Book controls' },
    h('a', { class: 'dock-btn', href: '#contents', 'aria-label': 'Contents', title: 'Contents' }, icon(icons.contents)),
    back, where, dots, next, pageButton,
    h('span', { class: 'dock-sep', 'aria-hidden': 'true' }),
    settingButton('Night', icons.night, 'night', () => { applySettings(); stage.setNight(store.settings.night); }),
    reading,
    settingButton('Teacher notes', icons.teacher, 'teacher', applySettings),
    viewButton,
  );
  const topbar = h('header', { class: 'topbar' }, h('a', { class: 'brand', href: '#contents' }, h('span', { class: 'brand-mark', 'aria-hidden': 'true' }), 'English Learning Hub'));
  const main = h('main', { class: 'desk' });
  app.replaceChildren(topbar, main, dock);
  applySettings();

  let index = -1;
  let busy = false;
  let desk = false;
  const indexFromHash = () => Math.max(0, pages.findIndex((p) => p.slug === location.hash.slice(1)));
  const wait = (s: number) => stage.tween(s, () => {});
  const smooth = (k: number) => k * k * (3 - 2 * k);

  function step(delta: number) {
    const target = pages[index + delta];
    if (target) location.hash = target.slug;
  }

  // ---------- Flat layout ----------
  function renderFlat() {
    stage.unmountModel();
    const page = pages[index];
    const content = page.render(false);
    leftScroll.replaceChildren(...content.left);
    rightScroll.replaceChildren(...content.right);
    leftScroll.scrollTop = rightScroll.scrollTop = 0;
    flatBook.dataset.page = page.slug === 'cover' ? 'cover' : page.slug === 'contents' ? 'contents' : 'theme';
    flatBook.style.setProperty('--card', page.card);
    const model = content.model;
    if (model?.host) {
      try {
        stage.attachInline(model.host);
        stage.mountModel(model, 0.2);
      } catch (error) {
        console.error(error);
        model.host.replaceChildren(h('p', { class: 'stage-error' }, 'The 3D model could not start. Turn on Reading mode, or reload the page.'));
      }
    }
  }

  // ---------- Desk layout ----------
  function fillDesk(page: Page): Rendered | null {
    if (page.slug === 'cover') {
      sheetOf(deskLeft).replaceChildren();
      deskPanel.hidden = deskFull.hidden = true;
      openCover.hidden = false;
      return null;
    }
    openCover.hidden = true;
    const content = page.render(true);
    sheetOf(deskLeft).replaceChildren(...content.left);
    const right = content.model ? deskPanel : deskFull;
    deskPanel.hidden = right !== deskPanel;
    deskFull.hidden = right !== deskFull;
    sheetOf(right).replaceChildren(...content.right);
    [deskLeft, deskPanel, deskFull].forEach((el) => (sheetOf(el).scrollTop = 0));
    return content;
  }

  const fade = (visible: boolean) => [deskLeft, deskPanel, deskFull].forEach((el) => el.classList.toggle('faded', !visible));

  function mountDesk(content: Rendered | null, delay: number) {
    if (content?.model) stage.mountModel(content.model, delay);
  }

  async function turnDesk(from: number, to: number) {
    const page = pages[to];
    const d = stage.desk!;
    const toCover = page.slug === 'cover';
    const fromCover = from >= 0 && pages[from].slug === 'cover';

    if (from < 0) {
      stage.focus = 'left';
      stage.setOpen(toCover ? 0 : 1);
      d.owl.goTo(toCover ? COVER : DESK_SPOT, false);
      stage.bookView(true);
      fade(true);
      mountDesk(fillDesk(page), 0.35);
      return;
    }
    if (toCover) {
      fade(false);
      await stage.foldModel();
      d.owl.goTo(COVER, true);
      stage.bookView(false, false);
      await stage.tween(1.1, (k) => stage.setOpen(1 - smooth(k)));
      fillDesk(page);
      fade(true);
      return;
    }
    if (fromCover) {
      showPage('left', false);
      const content = fillDesk(page);
      fade(false);
      d.owl.goTo(DESK_SPOT, true);
      stage.bookView(false, true);
      await stage.tween(1.2, (k) => stage.setOpen(smooth(k)));
      fade(true);
      mountDesk(content, 0);
      return;
    }
    const direction = to > from ? 1 : -1;
    if (stage.focus === 'right') showPage('left');
    fade(false);
    await Promise.all([stage.foldModel(), wait(0.2)]);
    if (!stage.reducedMotion) {
      await stage.tween(0.85, (k) => d.setLeaf(smooth(k), direction));
      d.setLeaf(null, direction);
    }
    const content = fillDesk(page);
    fade(true);
    mountDesk(content, 0);
  }

  // ---------- Shared ----------
  function updateChrome() {
    const page = pages[index];
    document.title = page.slug === 'cover' ? 'English Learning Hub: Unit 1' : `${page.title} | English Learning Hub`;
    where.textContent = page.slug === 'cover' ? 'Cover' : page.title;
    back.disabled = index === 0;
    next.disabled = index === pages.length - 1;
    [...dots.children].forEach((a, i) => (i === index ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    edgeTabs.querySelectorAll('a').forEach((a) => {
      if (a.dataset.tab === page.slug) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.body.classList.toggle('on-cover', page.slug === 'cover');
  }

  async function go() {
    const target = indexFromHash();
    if (busy || target === index) return;
    busy = true;
    const from = index;
    index = target;
    updateChrome();
    try {
      if (desk) await turnDesk(from, target);
      else {
        renderFlat();
        if (from >= 0 && !wide.matches) window.scrollTo({ top: 0 });
      }
    } catch (error) {
      console.error(error);
    } finally {
      busy = false;
    }
    if (indexFromHash() !== index) go();
  }

  // Tapping the closed cover opens the book.
  const tapCover = () => { if (pages[index]?.slug === 'cover') location.hash = 'contents'; };

  /** Builds the layout for the current screen and settings, then shows the current page. */
  function layout() {
    stage.detach();
    desk = useDesk();
    document.body.classList.toggle('desk-mode', desk);
    if (desk) {
      main.replaceChildren(deskHost);
      stage.attachDesk(deskHost, { left: deskLeft, panel: deskPanel, full: deskFull }, pages.slice(2).map((p) => ({ slug: p.slug, card: p.card })));
      stage.clickableDesk(stage.desk!.leftHalf, tapCover);
      stage.setNight(store.settings.night);
    } else {
      main.replaceChildren(flatBook);
    }
    index = -1;
    busy = false;
    go();
  }

  stage.onOwl = () => {
    stage.desk?.owl.jump();
    stage.card([h('p', { class: 'note-word' }, 'Hoot says'), h('p', null, pages[index]?.tip ?? '')]);
  };
  stage.onRibbon = (slug) => (location.hash = slug);

  onChange(() => {
    document.querySelectorAll<HTMLElement>('[data-stamp]').forEach((el) => (el.hidden = !progressText(el.dataset.stamp!).stamped));
    document.querySelectorAll<HTMLElement>('[data-progress]').forEach((el) => (el.textContent = progressText(el.dataset.progress!).text));
    edgeTabs.querySelectorAll('a').forEach((a) => a.classList.toggle('done', progressText(a.dataset.tab!).stamped));
  });
  edgeTabs.querySelectorAll('a').forEach((a) => a.classList.toggle('done', progressText(a.dataset.tab!).stamped));

  window.addEventListener('hashchange', () => go());
  const narrowClass = () => document.body.classList.toggle('desk-narrow', !wide.matches);
  narrowClass();
  wide.addEventListener('change', () => { narrowClass(); showPage('left', false); });
  document.addEventListener('book:show-model', () => {
    if (desk) showPage('right');
    else flatRight.scrollIntoView({ behavior: 'smooth' });
  });
  window.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, select, [role="tablist"], .segmented')) return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  layout();
}
