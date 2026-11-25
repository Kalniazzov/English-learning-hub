import type { QuizPart } from '../content/quiz';

/** Chosen option (original worksheet index) keyed by question number. */
export type Answers = Record<number, number>;

export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function scoreParts(parts: QuizPart[], answers: Answers) {
  const byPart = parts.map((p) => ({
    theme: p.theme,
    title: p.title,
    score: p.questions.filter((q) => answers[q.n] === q.answer).length,
    max: p.questions.length,
  }));
  return {
    byPart,
    total: byPart.reduce((sum, p) => sum + p.score, 0),
    max: byPart.reduce((sum, p) => sum + p.max, 0),
  };
}

/** Bands from the worksheet's marking guide (out of 30). */
export function markingBand(total: number): string {
  if (total >= 25) return 'Strong understanding.';
  if (total >= 18) return 'Review the topics you missed.';
  return 'Reread the lessons and practise again.';
}
