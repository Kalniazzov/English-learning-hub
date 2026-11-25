import type { Theme } from '../content/types';
import type { Answers } from '../logic/quiz';

export interface Settings {
  night: boolean;
  reading: boolean;
  teacher: boolean;
}

export interface QuizState {
  answers: Answers;
  /** Shuffled option order for each question, fixed for one attempt. */
  order: Record<number, number[]>;
  submitted: boolean;
  best: number | null;
}

interface Saved {
  solved: string[];
  settings: Settings;
  quiz: QuizState;
}

const KEY = 'english-hub-book:v1';

function defaults(): Saved {
  return {
    solved: [],
    settings: {
      night: window.matchMedia('(prefers-color-scheme: dark)').matches,
      reading: false,
      teacher: false,
    },
    quiz: { answers: {}, order: {}, submitted: false, best: null },
  };
}

function load(): Saved {
  const base = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const data = JSON.parse(raw) as Partial<Saved>;
    return {
      solved: data.solved ?? base.solved,
      settings: { ...base.settings, ...data.settings },
      quiz: { ...base.quiz, ...data.quiz },
    };
  } catch {
    // Storage can be blocked or hold damaged data; the book still works.
    return base;
  }
}

export const store = load();
const listeners = new Set<() => void>();

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Progress simply will not persist.
  }
  listeners.forEach((fn) => fn());
}

export const onChange = (fn: () => void) => void listeners.add(fn);

export function markSolved(id: string) {
  if (!store.solved.includes(id)) {
    store.solved.push(id);
    save();
  }
}

export const solvedCount = (theme: Theme) => theme.practice.filter((e) => store.solved.includes(e.id)).length;
export const isStamped = (theme: Theme) => solvedCount(theme) === theme.practice.length;

export function resetProgress() {
  store.solved = [];
  store.quiz = defaults().quiz;
  save();
}
