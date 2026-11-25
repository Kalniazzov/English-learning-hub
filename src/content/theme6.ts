import type { Theme } from './types';

export const theme6: Theme = {
  number: 6,
  slug: 'micro-macro',
  title: 'Microeconomics and Macroeconomics',
  subtitle: 'Read the text, then zoom from one bakery out to a whole country and compare ideas.',
  card: '#2F8F8A',
  goals: [
    'Read about two fields of economics.',
    'Decide whether an example is micro or macro.',
    'Compare ideas with both, whereas and however.',
  ],
  reading: [
    {
      heading: 'Two scales',
      text: [
        'Economics is often divided into two fields: microeconomics and macroeconomics. Micro means small, and macro means large.',
        'Microeconomics mainly studies individual consumers and firms. What does a student buy for lunch? How does a bakery decide the price of its bread? These are microeconomic questions.',
        'Macroeconomics mainly studies the economy as a whole. It looks at a country’s total output, its unemployment rate and its general price level. When the prices of many goods rise across a country over time, this is called inflation. Inflation is a macroeconomic topic.',
      ],
    },
    {
      heading: 'Connected ideas',
      text: [
        'Both fields study choices and resources, but at different scales. They are also connected. If flour and energy become more expensive across the country, one bakery may change its price. In the same way, millions of small decisions together shape the whole economy.',
      ],
    },
  ],
  words: [
    { en: 'microeconomics', kk: 'микроэкономика', example: 'Microeconomics studies one firm.' },
    { en: 'macroeconomics', kk: 'макроэкономика', example: 'Macroeconomics studies the whole economy.' },
    { en: 'consumer', kk: 'тұтынушы', example: 'Every consumer makes choices.' },
    { en: 'firm', kk: 'фирма, кәсіпорын', example: 'A bakery is a small firm.' },
    { en: 'price', kk: 'баға', example: 'The price of bread rose.' },
    { en: 'output', kk: 'өнім көлемі', example: 'The country’s output increased.' },
    { en: 'unemployment', kk: 'жұмыссыздық', example: 'Unemployment fell this year.' },
    { en: 'inflation', kk: 'инфляция', example: 'Inflation means prices rise generally.' },
    { en: 'scale', kk: 'ауқым', example: 'They work at different scales.' },
  ],
  language: {
    title: 'Comparing ideas',
    intro: 'Use linking words to show how two ideas are similar or different.',
    rows: [
      ['Similar', 'Both fields study choices.'],
      ['Similar', 'Micro studies choices. Similarly, macro looks at their results.'],
      ['Different', 'Micro studies firms, whereas macro studies whole economies.'],
      ['Different', 'A bakery is small. However, a national economy is huge.'],
      ['Different', 'On the one hand, … On the other hand, …'],
      ['Difference + comparative', 'Macroeconomics works on a larger scale than microeconomics.'],
    ],
    tip: '“Whereas” joins two ideas in one sentence. “However” usually starts a new sentence and takes a comma.',
  },
  predict: {
    question: 'Only one bakery raises the price of bread. Is that inflation?',
    options: ['Yes, any higher price is inflation', 'No, inflation is a general rise in many prices', 'Yes, if the bread is tasty'],
    test: 'Switch between “One price” and “Many prices” and move the price slider.',
    proof: 'One bakery’s price is a microeconomic event. Inflation means a general rise in the prices of many goods and services across the economy.',
  },
  practice: [
    {
      kind: 'sort', id: 't6-sort', prompt: 'Micro or macro?',
      buckets: ['Micro', 'Macro'],
      items: [
        { text: 'A café chooses how many workers to hire', bucket: 0 },
        { text: 'The national unemployment rate falls', bucket: 1 },
        { text: 'A family decides whether to buy a car', bucket: 0 },
        { text: 'A country’s total output grows', bucket: 1 },
        { text: 'A phone company lowers one model’s price', bucket: 0 },
        { text: 'The central bank tries to control inflation', bucket: 1 },
      ],
      why: 'Ask: is it about one person or firm, or about the whole economy?',
    },
    {
      kind: 'gap', id: 't6-gap', prompt: 'Complete with: both, whereas, However.',
      lines: [
        { before: 'Micro looks at one market,', after: 'macro looks at the whole economy.', answers: ['whereas'] },
        { before: 'The two scales are different, but', after: 'fields study choices.', answers: ['both'] },
        { before: 'My shop sold more.', after: ', the national economy grew slowly.', answers: ['however'] },
      ],
      why: 'Both shows similarity. Whereas and however show contrast.',
    },
    {
      kind: 'choice', id: 't6-choice', prompt: 'What is the main idea of the last paragraph?',
      options: ['The two fields are connected.', 'Only macroeconomics matters.', 'Bakeries control the whole economy.'],
      answer: 0,
      why: 'National changes affect firms, and many small decisions shape the economy.',
    },
  ],
  speak: {
    task: 'Compare microeconomics and macroeconomics in four or five sentences.',
    frames: ['Both fields …', 'Microeconomics …, whereas macroeconomics …', 'For example, …', 'However, …'],
    sample: 'Both fields study choices and resources. Microeconomics looks at consumers and firms, whereas macroeconomics looks at the whole economy. For example, the price of bread in one bakery is a micro topic. However, inflation is a macro topic because many prices rise across the country.',
  },
  teacher: [
    'Ұзақтығы: 60 минут. Мақсат: мәтінді түсініп оқу және идеяларды салыстыру.',
    'Алдымен skimming: екі өрістің атауын табу. Содан кейін мысалдарды micro / macro деп бөлу.',
    'Камераны алыстатып, әр деңгейде бір сұрақ құрастыртыңыз.',
    'Модельдегі бағалар шартты оқу мысалы.',
  ],
  modelText: 'A paper bakery. Zooming out shows its street, then a city, then a whole country. Price tags show either one price or many prices rising.',
};
