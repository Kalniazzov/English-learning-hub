import type { Theme } from './types';

export const theme2: Theme = {
  number: 2,
  slug: 'tourist',
  title: 'Legend or Truth: Being a Tourist',
  subtitle: 'Life skills and the world around you: tell a travel story and be a respectful guest.',
  card: '#D9694F',
  goals: [
    'Tell a travel story in the past tense.',
    'Organise a story with first, next, then and finally.',
    'Separate a legend from evidence.',
  ],
  reading: [
    {
      heading: 'Aida’s trip',
      text: [
        'Last summer, Aida went to a mountain village with her friends. First, they met a local guide beside the river. The guide smiled and told them a legend: long ago, a dragon protected the valley from every danger.',
        'Next, the group walked to an old stone bridge. “People say the dragon built it in one night,” the guide said. Aida was not sure. Then she noticed a sign next to the bridge. It described the local builders who made it. The sign was evidence that real people had built a real bridge.',
        'Finally, the friends visited the village square. Aida wanted to photograph a woman who was selling bread, so she asked for permission first. The woman agreed with a smile.',
      ],
    },
    {
      heading: 'A respectful tourist',
      text: [
        'A good tourist asks permission before photographing local people, reads and follows signs, takes rubbish away, and stays on marked paths.',
      ],
    },
  ],
  words: [
    { en: 'tourist', kk: 'турист', example: 'Every tourist should respect local people.' },
    { en: 'guide', kk: 'жолбасшы, гид', example: 'Our guide knows many stories.' },
    { en: 'village', kk: 'ауыл', example: 'The village is in the mountains.' },
    { en: 'valley', kk: 'аңғар', example: 'A river runs through the valley.' },
    { en: 'bridge', kk: 'көпір', example: 'We crossed an old stone bridge.' },
    { en: 'evidence', kk: 'дәлел', example: 'The sign is evidence.' },
    { en: 'sign', kk: 'белгі, тақтайша', example: 'Read the sign before you enter.' },
    { en: 'permission', kk: 'рұқсат', example: 'Ask permission before you take a photo.' },
    { en: 'rubbish', kk: 'қоқыс', example: 'Take your rubbish home.' },
    { en: 'dragon', kk: 'айдаһар', example: 'The dragon is part of the legend.' },
  ],
  language: {
    title: 'Storytelling: past simple and sequence words',
    intro: 'Use the past simple for finished events. Sequence words show your listener the order.',
    rows: [
      ['First, …', 'First, we met our guide.'],
      ['Next, …', 'Next, we walked to the bridge.'],
      ['Then, …', 'Then, we read the sign.'],
      ['Finally, …', 'Finally, we visited the square.'],
      ['People say …', 'People say a dragon lives here. (legend)'],
      ['The sign shows …', 'The sign shows who built it. (evidence)'],
    ],
    tip: 'Irregular verbs: go → went, meet → met, tell → told, take → took, see → saw.',
  },
  predict: {
    question: 'Who built the bridge? What do you think will prove the answer?',
    options: ['The dragon’s glow will prove it', 'A sign near the bridge will prove it', 'A dream will prove it'],
    test: 'In the model, switch between Legend and Truth, then follow the story from First to Finally.',
    proof: 'In Legend mode you can enjoy the dragon, but it proves nothing. In Truth mode the sign describes the local builders. That is evidence.',
  },
  practice: [
    {
      kind: 'order', id: 't2-order', prompt: 'Put Aida’s day in order.',
      steps: [
        'The friends met a guide beside the river.',
        'They walked to the old stone bridge.',
        'Aida noticed a sign about the builders.',
        'They visited the village square.',
      ],
      why: 'First, next, then, finally.',
    },
    {
      kind: 'gap', id: 't2-gap', prompt: 'Write the past simple form of the verb in brackets.',
      lines: [
        { before: 'Last year we', after: '(go) to the mountains.', answers: ['went'] },
        { before: 'A local man', after: '(tell) us a story.', answers: ['told'] },
        { before: 'I', after: '(see) an eagle over the valley.', answers: ['saw'] },
        { before: 'We', after: '(visit) a small museum.', answers: ['visited'] },
      ],
      why: 'Go, tell and see are irregular. Visit is regular, so it takes -ed.',
    },
    {
      kind: 'sort', id: 't2-sort', prompt: 'Legend or evidence?',
      buckets: ['Legend', 'Evidence'],
      items: [
        { text: 'A giant made the lake with his footprint', bucket: 0 },
        { text: 'A dated stone with the builder’s name', bucket: 1 },
        { text: 'The mountain sleeps and wakes every hundred years', bucket: 0 },
        { text: 'An old photograph of workers building a school', bucket: 1 },
      ],
      why: 'Evidence is something you can see and check.',
    },
  ],
  speak: {
    task: 'Tell a short story about a place you visited. Use four sequence words.',
    frames: ['Last …, I went to …', 'First, … Next, …', 'Someone told me that …, but …', 'Finally, …'],
    sample: 'Last spring, I went to Turkistan with my family. First, we visited the mausoleum. Next, our guide told us an old story about it. Then we read an information board with real dates. Finally, we bought bread at the market and went home.',
  },
  teacher: [
    'Ұзақтығы: 45–60 минут. Мақсат: past simple және реттік сөздермен оқиға айту.',
    '3D модельдегі First → Finally қадамдарын жұппен кезектесіп айтқызыңыз.',
    '«Legend / Truth» ауыстырғышы: оқушы әр режимде бір сөйлем құрайды (People say… / The sign shows…).',
    'Бағалау: 4 реттік сөз, кемінде 4 өткен шақ етістігі.',
  ],
  modelText: 'A paper mountain village with a river, a stone bridge, an information sign, a guide, tourists and a dragon that appears only in Legend mode.',
};
