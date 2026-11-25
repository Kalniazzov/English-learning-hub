import { theme1 } from './theme1';
import { theme2 } from './theme2';
import { theme3 } from './theme3';
import { theme4 } from './theme4';
import { theme5 } from './theme5';
import { theme6 } from './theme6';
import type { Theme } from './types';

export const themes: Theme[] = [theme1, theme2, theme3, theme4, theme5, theme6];

/** Theme 7 is the progress check, built from the worksheet in content/quiz.ts. */
export const checkInfo = {
  number: 7,
  slug: 'progress-check',
  title: 'Progress Check 1',
  subtitle: '30 questions on Themes 1–6, one point each.',
  card: '#183F47',
};
