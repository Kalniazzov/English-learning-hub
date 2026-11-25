import type { Theme } from './types';

export const theme1: Theme = {
  number: 1,
  slug: 'survival',
  title: 'Survival: Introduction',
  subtitle: 'Lost in the forest: what is true, and what is only a legend?',
  card: '#5E9E74',
  goals: [
    'Explain what “survival” means.',
    'Give safe advice with should and should not.',
    'Tell the difference between a fact and a legend.',
  ],
  reading: [
    {
      text: [
        'Survival means staying safe in a difficult situation. You may need this skill on a mountain walk, in bad weather, or when you lose your way in a forest.',
      ],
    },
    {
      heading: 'If you become lost',
      text: [
        'First, stop, breathe, and think. Do not run in a random direction. When people panic, they get tired quickly and often walk farther from help.',
        'Find shelter, because shelter protects you from rain and wind. Do not eat plants or mushrooms that you do not know. Use a whistle to attract attention: it is loud, and it saves much more energy than shouting.',
        'If you need to travel, use a map and compass and stay on a reliable route. A clear trail can guide travellers. An unfamiliar shortcut can be dangerous. Always check the weather.',
      ],
    },
    {
      heading: 'A forest legend',
      text: [
        'Some old people tell a story about a glowing magical deer. At night, they say, it appears between the trees and leads lost people home. This is a legend: a story that people pass on, but cannot prove. Enjoy the story, but trust your map.',
      ],
    },
  ],
  words: [
    { en: 'survival', kk: 'аман қалу', example: 'Survival means staying safe.' },
    { en: 'shelter', kk: 'баспана, пана', example: 'Shelter protects you from rain.' },
    { en: 'whistle', kk: 'ысқырық', example: 'Blow the whistle three times.' },
    { en: 'compass', kk: 'компас', example: 'The compass shows north.' },
    { en: 'map', kk: 'карта', example: 'Check the map before you walk.' },
    { en: 'trail', kk: 'соқпақ', example: 'Stay on the clear trail.' },
    { en: 'shortcut', kk: 'төте жол', example: 'An unknown shortcut is risky.' },
    { en: 'mushroom', kk: 'саңырауқұлақ', example: 'Never eat an unknown mushroom.' },
    { en: 'legend', kk: 'аңыз', example: 'The glowing deer is a legend.' },
    { en: 'lost', kk: 'адасқан', example: 'We are lost in the forest.' },
  ],
  language: {
    title: 'Giving safety advice',
    intro: 'Use should for good advice and should not (shouldn’t) for dangerous actions. The verb after them does not change.',
    rows: [
      ['You should + verb', 'You should stop and think.'],
      ['You shouldn’t + verb', 'You shouldn’t run in a random direction.'],
      ['What should you do if …?', 'What should you do if it starts to rain?'],
      ['Never + verb', 'Never eat unknown plants.'],
    ],
    tip: 'No “to” after should: say “You should wait”, not “You should to wait”.',
  },
  predict: {
    question: 'It is getting dark and it starts to rain. Which object in the camp will help you first?',
    options: ['The tent', 'The mushroom', 'The shortcut sign'],
    test: 'Turn on Rain in the model, then tap each object and read its card.',
    proof: 'The tent is a shelter. Shelter protects you from rain. The mushroom may be poisonous, and an unfamiliar shortcut can lead you farther from help.',
  },
  practice: [
    {
      kind: 'sort', id: 't1-sort', prompt: 'You are lost. Sort the actions.',
      buckets: ['Safe', 'Dangerous'],
      items: [
        { text: 'Stay calm and look around', bucket: 0 },
        { text: 'Walk fast without a plan', bucket: 1 },
        { text: 'Put on a warm, dry jacket', bucket: 0 },
        { text: 'Taste red berries you have never seen', bucket: 1 },
        { text: 'Make a loud signal', bucket: 0 },
        { text: 'Cross a deep river in the dark', bucket: 1 },
      ],
      why: 'Safe actions save energy and help other people find you.',
    },
    {
      kind: 'gap', id: 't1-gap', prompt: 'Complete the advice with should or shouldn’t.',
      lines: [
        { before: 'You', after: 'check the weather before a walk.', answers: ['should'] },
        { before: 'You', after: 'leave the trail at night.', answers: ["shouldn't", 'should not', 'shouldn’t'] },
        { before: 'You', after: 'carry drinking water.', answers: ['should'] },
      ],
      why: 'Should recommends an action. Shouldn’t warns against it.',
    },
    {
      kind: 'choice', id: 't1-choice', prompt: 'Which sentence is a fact you can check?',
      options: ['A magical fox can read maps.', 'A compass needle helps you find north.', 'The trees whisper the way home.'],
      answer: 1,
      why: 'Anyone can test a compass. The other two sentences belong in a story.',
    },
  ],
  speak: {
    task: 'Your friend is going hiking for the first time. Give three pieces of advice.',
    frames: ['Before you go, you should …', 'If you get lost, first …', 'You shouldn’t … because …'],
    sample: 'Before you go, you should check the weather. If you get lost, first stop, breathe, and think. You shouldn’t take an unfamiliar shortcut because you may walk farther from help.',
  },
  teacher: [
    'Ұзақтығы: 45 минут. Мақсат: should / shouldn’t арқылы қауіпсіздік кеңесін беру.',
    'Бастау: оқушылар 3D лагерьден 8 затты тауып, ағылшынша атайды.',
    'Талқылау: «Аңызға неге сенуге болмайды, бірақ оны неге айтамыз?»',
    'Ескерту: бұл тілдік сабақ, шынайы құтқару нұсқаулығын алмастырмайды.',
  ],
  modelText: 'A paper forest camp with a tent, a trail, a shortcut sign, a map, a compass, a whistle, a mushroom and, at night, a glowing magical deer.',
};
