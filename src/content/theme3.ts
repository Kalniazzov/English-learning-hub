import type { Theme } from './types';

export const theme3: Theme = {
  number: 3,
  slug: 'economics',
  title: 'Economics: General Information',
  subtitle: 'Needs, wants and budgets, and how to present your numbers.',
  card: '#C99A2E',
  goals: [
    'Say what economics studies.',
    'Make a simple budget.',
    'Give a short presentation with a chart.',
  ],
  reading: [
    {
      heading: 'What is economics?',
      text: [
        'Economics studies how people use limited resources to meet their needs and wants. Money, time, land and water are all limited, so people have to make choices.',
        'A need is something you must have to live: drinking water, food, shelter and clothes. A want is something you would like to have, such as a video game, a luxury bag or an expensive watch.',
      ],
    },
    {
      heading: 'A budget',
      text: [
        'A budget is a money plan. It shows income (the money you receive), expenses (the money you spend) and possible savings (the money that is left). If expenses are higher than income, you have a shortfall and need to change your plan.',
      ],
    },
    {
      heading: 'Making a presentation',
      text: [
        'A good presentation has a clear start, a main part and a short ending. To make simple data clear, use a chart. Keep your slides short, and use only numbers that you have checked. When you explain a chart, words like increase and decrease help you. Increase means go up. Decrease means go down.',
      ],
    },
  ],
  words: [
    { en: 'economics', kk: 'экономика (ғылым)', example: 'Economics studies choices.' },
    { en: 'resources', kk: 'ресурстар', example: 'Our resources are limited.' },
    { en: 'need', kk: 'қажеттілік', example: 'Water is a basic need.' },
    { en: 'want', kk: 'қалау', example: 'A new game is a want.' },
    { en: 'budget', kk: 'бюджет', example: 'I made a weekly budget.' },
    { en: 'income', kk: 'кіріс', example: 'My income is my pocket money.' },
    { en: 'expense', kk: 'шығыс', example: 'Transport is a weekly expense.' },
    { en: 'savings', kk: 'жинақ', example: 'I put my savings in a jar.' },
    { en: 'increase', kk: 'өсу, көбею', example: 'Food costs increased.' },
    { en: 'decrease', kk: 'кему, азаю', example: 'Fun spending decreased.' },
    { en: 'chart', kk: 'диаграмма', example: 'Look at this chart.' },
  ],
  language: {
    title: 'Presentation phrases',
    intro: 'These phrases guide your audience through your talk.',
    rows: [
      ['Start', 'Good morning. Today I’m going to talk about my budget.'],
      ['Show data', 'As you can see in this chart, …'],
      ['Going up', 'Spending on food increased from 2,000 to 2,500 tenge.'],
      ['Going down', 'Spending on games decreased by 500 tenge.'],
      ['No change', 'Transport stayed the same.'],
      ['End', 'To sum up, … Thank you. Are there any questions?'],
    ],
    tip: '“From … to …” gives the old and new numbers. “By …” gives only the difference.',
  },
  predict: {
    question: 'Your weekly income stays the same. What happens to your savings if one expense grows?',
    options: ['Savings increase', 'Savings decrease', 'Savings never change'],
    test: 'Move one spending slider up in the model and watch the savings column.',
    proof: 'Savings = income − expenses. When expenses grow and income stays the same, savings get smaller.',
  },
  practice: [
    {
      kind: 'sort', id: 't3-sort', prompt: 'Is it a need or a want?',
      buckets: ['Need', 'Want'],
      items: [
        { text: 'Healthy food', bucket: 0 },
        { text: 'Concert tickets', bucket: 1 },
        { text: 'A warm winter coat', bucket: 0 },
        { text: 'A third pair of headphones', bucket: 1 },
        { text: 'A safe place to sleep', bucket: 0 },
        { text: 'A gold phone case', bucket: 1 },
      ],
      why: 'You need some things to live safely. The others are nice to have.',
    },
    {
      kind: 'gap', id: 't3-gap', prompt: 'Calculate and complete. Write numbers.',
      lines: [
        { before: 'Income 8,000, expenses 6,500. Savings:', after: 'tenge.', answers: ['1500', '1,500', '1 500'] },
        { before: 'Lunch went from 1,000 to 1,300. It increased by', after: 'tenge.', answers: ['300'] },
      ],
      why: 'Savings are income minus expenses. “By” shows the difference.',
    },
    {
      kind: 'order', id: 't3-order', prompt: 'Put the presentation in order.',
      steps: [
        'Good morning. Today I’m going to talk about saving money.',
        'As you can see in this chart, food is my biggest expense.',
        'To sum up, a budget helps me save.',
        'Thank you. Are there any questions?',
      ],
      why: 'Start, main part, summary, questions.',
    },
  ],
  speak: {
    task: 'Make a one-minute presentation of the budget you built in the 3D model.',
    frames: ['Today I’m going to talk about …', 'My weekly income is …', 'As you can see, my biggest expense is …', 'To sum up, …'],
    sample: 'Good morning. Today I’m going to talk about my weekly budget. My income is 10,000 tenge. As you can see in this chart, my biggest expense is food. I want to decrease spending on fun, so my savings can increase. Thank you. Are there any questions?',
  },
  teacher: [
    'Ұзақтығы: 60 минут. Мақсат: needs / wants, budget сөздері және қысқа презентация.',
    'Әр жұп слайдерлермен өз бюджетін жасап, 3D диаграмма бойынша 1 минут сөйлейді.',
    'Саралау: әлсіз топқа 4 тірек сөйлем, күшті топқа increase / decrease by, from…to.',
    'Модельдегі сомалар оқу мысалы ғана, нақты баға емес.',
  ],
  modelText: 'A paper bar chart on a market table. Columns of paper discs show food, transport, study, fun and savings. Sliders change the amounts.',
};
