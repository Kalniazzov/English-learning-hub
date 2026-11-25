import type { Theme } from './types';

export const theme4: Theme = {
  number: 4,
  slug: 'history-geography',
  title: 'Defining Economics: History and Geography',
  subtitle: 'From camel caravans to cargo ships: how land and sea shaped trade.',
  card: '#3F86B5',
  goals: [
    'Describe how trade changed over time.',
    'Explain how geography affects trade routes.',
    'Compare the past and the present.',
  ],
  reading: [
    {
      heading: 'From exchange to money',
      text: [
        'Long ago, people often exchanged goods directly: for example, grain for wool. But what if the other person did not want your grain? Money made buying and selling easier, because almost everyone accepted it.',
      ],
    },
    {
      heading: 'Routes across land',
      text: [
        'In the past, caravans carried goods across deserts. Camels could walk far with heavy loads and little water. The Silk Road was not one road but a network of routes between East Asia and the Mediterranean. Some of them crossed the land of today’s Kazakhstan, where cities such as Otrar and Taraz were busy places for traders.',
      ],
    },
    {
      heading: 'Geography matters',
      text: [
        'Rivers, mountain passes and ports mattered to traders because they shaped the possible routes. A river gave water. A mountain pass gave a way through high mountains. A port was a safe place for ships.',
        'Today, cargo ships connect ports by sea, and trains, lorries and planes also move goods. A caravan and a cargo ship look very different, but both connect producers with buyers.',
      ],
    },
  ],
  words: [
    { en: 'caravan', kk: 'керуен', example: 'A caravan crossed the desert.' },
    { en: 'goods', kk: 'тауарлар', example: 'The ship carries goods.' },
    { en: 'trade', kk: 'сауда', example: 'Trade connected distant cities.' },
    { en: 'trader', kk: 'саудагер', example: 'The trader sold silk.' },
    { en: 'route', kk: 'бағыт, жол', example: 'This route has water.' },
    { en: 'mountain pass', kk: 'асу', example: 'The caravan used the mountain pass.' },
    { en: 'port', kk: 'порт, кемежай', example: 'The ship arrived at the port.' },
    { en: 'cargo ship', kk: 'жүк кемесі', example: 'A cargo ship connects ports.' },
    { en: 'producer', kk: 'өндіруші', example: 'A farmer is a producer.' },
    { en: 'buyer', kk: 'сатып алушы', example: 'The buyer paid with coins.' },
  ],
  language: {
    title: 'Past and present',
    intro: 'Use the past simple or used to for the past, and the present simple for today.',
    rows: [
      ['In the past, … + past simple', 'In the past, caravans carried goods.'],
      ['used to + verb', 'Traders used to travel for months.'],
      ['Today, … + present simple', 'Today, cargo ships connect ports.'],
      ['both … and …', 'Both caravans and ships move goods.'],
      ['because …', 'Rivers mattered because they gave water.'],
    ],
    tip: '“Used to” describes something that was true before but is different now.',
  },
  predict: {
    question: 'Snow closes the mountain pass. What will the caravan do?',
    options: ['Walk through the mountain', 'Take a different, longer route', 'Turn into a ship'],
    test: 'Choose Caravan in the model and close the mountain pass.',
    proof: 'The caravan goes around the mountains, so the route becomes longer. Geography shapes which routes are possible.',
  },
  practice: [
    {
      kind: 'sort', id: 't4-sort', prompt: 'Past or present?',
      buckets: ['Mostly in the past', 'Today'],
      items: [
        { text: 'Camel caravans carry silk for many months', bucket: 0 },
        { text: 'Giant ships carry thousands of containers', bucket: 1 },
        { text: 'People pay with a phone', bucket: 1 },
        { text: 'A trader swaps salt for cloth on the Silk Road', bucket: 0 },
      ],
      why: 'Transport and payment changed, but people still trade.',
    },
    {
      kind: 'gap', id: 't4-gap', prompt: 'Complete with: port, producer, buyer.',
      lines: [
        { before: 'A person who grows apples is a', after: '.', answers: ['producer'] },
        { before: 'A person who pays for the apples is a', after: '.', answers: ['buyer'] },
        { before: 'Ships stop and unload at a', after: '.', answers: ['port'] },
      ],
      why: 'Producers make or grow goods, buyers pay for them, and ports serve ships.',
    },
    {
      kind: 'choice', id: 't4-choice', prompt: 'Why is direct exchange sometimes difficult?',
      options: ['Both people must want what the other one has.', 'Goods cannot be moved.', 'Only ships can exchange goods.'],
      answer: 0,
      why: 'Money solves this problem because sellers can use it to buy other things later.',
    },
  ],
  speak: {
    task: 'Compare how goods travelled in the past with how they travel today.',
    frames: ['In the past, …', 'Traders used to …', 'Today, …', 'Both … and …'],
    sample: 'In the past, caravans carried goods across deserts. Traders used to travel for months. Today, cargo ships, trains and planes carry goods much faster. Both caravans and ships connect producers with buyers.',
  },
  teacher: [
    'Ұзақтығы: 45–60 минут. Пәнаралық байланыс: тарих және география.',
    '3D картада асуды жауып, «Why did the route change?» деп сұраңыз (because …).',
    'Отырар мен Тараз мысалын жергілікті тарихпен байланыстырыңыз.',
    'Картадағы жер бедері шартты, ол нақты географиялық карта емес.',
  ],
  modelText: 'A paper relief map with a desert, mountains with a pass, a river, two ports and the sea. A caravan or a cargo ship moves along its route.',
};
