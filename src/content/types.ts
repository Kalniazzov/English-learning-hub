export interface Word {
  en: string;
  kk: string;
  example: string;
}

export type Exercise =
  | { kind: 'choice'; id: string; prompt: string; options: string[]; answer: number; why: string }
  | { kind: 'sort'; id: string; prompt: string; buckets: [string, string]; items: { text: string; bucket: 0 | 1 }[]; why: string }
  | { kind: 'order'; id: string; prompt: string; steps: string[]; why: string }
  | { kind: 'gap'; id: string; prompt: string; lines: { before: string; after: string; answers: string[] }[]; why: string };

export interface Prediction {
  question: string;
  options: string[];
  /** How to test the guess in the 3D model. */
  test: string;
  proof: string;
}

export interface ReadingBlock {
  heading?: string;
  text: string[];
}

export interface Theme {
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  /** Cardstock colour of the theme's index tab. */
  card: string;
  goals: string[];
  reading: ReadingBlock[];
  words: Word[];
  language: { title: string; intro: string; rows: [string, string][]; tip: string };
  predict: Prediction;
  practice: Exercise[];
  speak: { task: string; frames: string[]; sample: string };
  /** Teacher notes, in Kazakh. */
  teacher: string[];
  /** Describes the 3D model for reading mode and screen readers. */
  modelText: string;
}
