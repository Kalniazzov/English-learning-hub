export interface Budget {
  income: number;
  expenses: Record<string, number>;
}

export function summarise({ income, expenses }: Budget) {
  const spent = Object.values(expenses).reduce((sum, v) => sum + v, 0);
  const biggest = Object.entries(expenses).sort((a, b) => b[1] - a[1])[0];
  return {
    spent,
    savings: Math.max(0, income - spent),
    shortfall: Math.max(0, spent - income),
    biggest: biggest?.[0] ?? '',
  };
}

const money = (n: number) => `${n.toLocaleString('en-US')} tenge`;

/** A presentation sentence that describes how one amount changed. */
export function changeSentence(label: string, from: number, to: number): string {
  if (from === to) return `${label} stayed the same at ${money(to)}.`;
  const verb = to > from ? 'increased' : 'decreased';
  return `${label} ${verb} from ${money(from)} to ${money(to)}.`;
}
