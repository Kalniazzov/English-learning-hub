export interface Degrees {
  comparative: string;
  superlative: string;
  rule: string;
}

const irregular: Record<string, [string, string]> = {
  good: ['better', 'the best'],
  bad: ['worse', 'the worst'],
  far: ['farther', 'the farthest'],
  little: ['less', 'the least'],
  much: ['more', 'the most'],
  many: ['more', 'the most'],
};

/** Two-syllable adjectives that usually take -er / -est. */
const shortTwoSyllable = new Set(['quiet', 'simple', 'clever', 'narrow']);

function syllables(word: string): number {
  const trimmed = word.replace(/(?<=[^aeiou])e$/, '').replace(/(?<=[^aeiouy][^aeiouy])$/, '');
  return Math.max(1, (trimmed.match(/[aeiouy]+/g) ?? []).length);
}

export function degreesOf(input: string): Degrees {
  const word = input.trim().toLowerCase();
  const long: Degrees = {
    comparative: `more ${word}`,
    superlative: `the most ${word}`,
    rule: 'Long adjective: use more and the most.',
  };

  if (irregular[word]) {
    const [comparative, superlative] = irregular[word];
    return { comparative, superlative, rule: 'Irregular: learn these forms by heart.' };
  }

  const count = syllables(word);
  const endsInY = /[^aeiou]y$/.test(word);

  if (endsInY && count <= 2) {
    const stem = word.slice(0, -1) + 'i';
    return { comparative: `${stem}er`, superlative: `the ${stem}est`, rule: 'Consonant + y: change y to i, then add -er / -est.' };
  }

  if (count > 1 && !shortTwoSyllable.has(word)) return long;

  if (word.endsWith('e')) {
    return { comparative: `${word}r`, superlative: `the ${word}st`, rule: 'Ends in -e: add only -r / -st.' };
  }

  // One vowel followed by one consonant (not w, x, y) at the end: big, hot, thin.
  if (count === 1 && /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(word)) {
    const stem = word + word.at(-1);
    return { comparative: `${stem}er`, superlative: `the ${stem}est`, rule: 'One vowel + one consonant: double the last letter.' };
  }

  return { comparative: `${word}er`, superlative: `the ${word}est`, rule: 'Short adjective: add -er / -est.' };
}

export interface Measured {
  name: string;
  value: number;
}

/** "The A is taller than the B." or "The A is as tall as the B." */
export function compareSentence(a: Measured, b: Measured, adjective: string): string {
  if (a.value === b.value) return `The ${a.name} is as ${adjective} as the ${b.name}.`;
  const [more, less] = a.value > b.value ? [a, b] : [b, a];
  return `The ${more.name} is ${degreesOf(adjective).comparative} than the ${less.name}.`;
}

export function superlativeSentence(items: Measured[], adjective: string, noun = 'building'): string {
  const max = Math.max(...items.map((i) => i.value));
  const winners = items.filter((i) => i.value === max);
  if (winners.length > 1) {
    return `There is no single ${degreesOf(adjective).superlative.replace(/^the /, '')} ${noun}: it is a tie.`;
  }
  return `The ${winners[0].name} is ${degreesOf(adjective).superlative} ${noun} in the picture.`;
}
