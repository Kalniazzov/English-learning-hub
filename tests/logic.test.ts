import { describe, expect, it } from 'vitest';
import { degreesOf, compareSentence, superlativeSentence } from '../src/logic/adjectives';
import { summarise, changeSentence } from '../src/logic/budget';
import { markingBand, scoreParts, shuffled } from '../src/logic/quiz';
import { quizParts } from '../src/content/quiz';
import { themes } from '../src/content';

describe('adjective forms', () => {
  it.each([
    ['tall', 'taller', 'the tallest'],
    ['big', 'bigger', 'the biggest'],
    ['hot', 'hotter', 'the hottest'],
    ['large', 'larger', 'the largest'],
    ['wide', 'wider', 'the widest'],
    ['nice', 'nicer', 'the nicest'],
    ['happy', 'happier', 'the happiest'],
    ['dry', 'drier', 'the driest'],
    ['old', 'older', 'the oldest'],
    ['new', 'newer', 'the newest'],
    ['long', 'longer', 'the longest'],
    ['small', 'smaller', 'the smallest'],
    ['cheap', 'cheaper', 'the cheapest'],
    ['beautiful', 'more beautiful', 'the most beautiful'],
    ['expensive', 'more expensive', 'the most expensive'],
    ['modern', 'more modern', 'the most modern'],
    ['comfortable', 'more comfortable', 'the most comfortable'],
    ['quiet', 'quieter', 'the quietest'],
    ['good', 'better', 'the best'],
    ['bad', 'worse', 'the worst'],
  ])('%s', (word, comparative, superlative) => {
    expect(degreesOf(word)).toMatchObject({ comparative, superlative });
  });

  it('compares in either order and handles ties', () => {
    const house = { name: 'house', value: 2 };
    const flats = { name: 'apartment building', value: 9 };
    expect(compareSentence(house, flats, 'tall')).toBe('The apartment building is taller than the house.');
    expect(compareSentence(house, { ...flats, value: 2 }, 'tall')).toBe('The house is as tall as the apartment building.');
    expect(superlativeSentence([house, flats], 'tall')).toBe('The apartment building is the tallest building in the picture.');
    expect(superlativeSentence([house, { ...flats, value: 2 }], 'tall')).toContain('tie');
  });
});

describe('budget', () => {
  it('separates savings from shortfall', () => {
    expect(summarise({ income: 100, expenses: { food: 60, fun: 10 } })).toEqual({ spent: 70, savings: 30, shortfall: 0, biggest: 'food' });
    expect(summarise({ income: 50, expenses: { food: 60 } })).toMatchObject({ savings: 0, shortfall: 10 });
  });
  it('describes change', () => {
    expect(changeSentence('Food', 2000, 2500)).toBe('Food increased from 2,000 tenge to 2,500 tenge.');
    expect(changeSentence('Food', 2000, 2000)).toContain('stayed the same');
  });
});

describe('progress check', () => {
  const all = quizParts.flatMap((p) => p.questions);
  it('has 30 numbered questions with four options each', () => {
    expect(all.map((q) => q.n)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(all.every((q) => q.options.length === 4)).toBe(true);
  });
  it('matches the teacher answer key', () => {
    expect(all.map((q) => 'ABCD'[q.answer]).join('')).toBe('BBACC' + 'ABBBA' + 'BCABB' + 'BABAB' + 'BCBCC' + 'BCBAC');
  });
  it('scores by topic', () => {
    const perfect = Object.fromEntries(all.map((q) => [q.n, q.answer]));
    expect(scoreParts(quizParts, perfect)).toMatchObject({ total: 30, max: 30 });
    expect(scoreParts(quizParts, {}).total).toBe(0);
  });
  it('uses the marking guide bands', () => {
    expect([17, 18, 24, 25].map(markingBand)).toEqual([
      'Reread the lessons and practise again.', 'Review the topics you missed.',
      'Review the topics you missed.', 'Strong understanding.',
    ]);
  });
  it('shuffles without losing options', () => {
    expect(shuffled([0, 1, 2, 3], () => 0.3).sort()).toEqual([0, 1, 2, 3]);
  });
});

describe('theme content', () => {
  it('has unique exercise ids and valid answers', () => {
    const exercises = themes.flatMap((t) => t.practice);
    expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length);
    for (const e of exercises) if (e.kind === 'choice') expect(e.options[e.answer]).toBeDefined();
  });
});

describe('word audio', () => {
  it('has one clip for every word', async () => {
    const { existsSync } = await import('node:fs');
    const { wordClip } = await import('../src/content/audio');
    for (const theme of themes) {
      theme.words.forEach((_, i) => {
        const clip = wordClip(theme.slug, i);
        expect(clip, `${theme.slug} word ${i + 1}`).toBeDefined();
        expect(existsSync(`public/${clip}`), clip).toBe(true);
      });
    }
  });
});
