import type { Theme } from './types';

export const theme5: Theme = {
  number: 5,
  slug: 'adjectives',
  title: 'Degrees of Adjectives: Buildings',
  subtitle: 'Add floors and watch the grammar change: tall, taller, the tallest.',
  card: '#7B68B8',
  goals: [
    'Make comparative and superlative forms.',
    'Compare buildings with than and the.',
    'Use irregular forms such as good, better, the best.',
  ],
  reading: [
    {
      heading: 'Three buildings, one street',
      text: [
        'There is a house, an apartment building and a skyscraper on our street. The house is small and quiet. The apartment building is taller than the house. The skyscraper is the tallest building in the picture.',
        'My aunt lives in the apartment building. She thinks it is more comfortable than the skyscraper. I like the house. For me, it is the best place on the street, because it has a garden.',
      ],
    },
  ],
  words: [
    { en: 'building', kk: 'ғимарат', example: 'This building is new.' },
    { en: 'skyscraper', kk: 'зәулім үй', example: 'The skyscraper has many floors.' },
    { en: 'apartment building', kk: 'көпқабатты тұрғын үй', example: 'We live in an apartment building.' },
    { en: 'floor', kk: 'қабат', example: 'My room is on the third floor.' },
    { en: 'tall', kk: 'биік', example: 'The tower is tall.' },
    { en: 'wide', kk: 'жалпақ, кең', example: 'The museum is wide.' },
    { en: 'modern', kk: 'заманауи', example: 'It is a modern library.' },
    { en: 'comfortable', kk: 'жайлы', example: 'The house is comfortable.' },
  ],
  language: {
    title: 'Comparative and superlative',
    intro: 'The comparative compares two things. The superlative picks one thing from three or more.',
    rows: [
      ['Short adjective: + -er / the + -est', 'tall → taller → the tallest'],
      ['Ends in -e: + -r / -st', 'large → larger → the largest'],
      ['Vowel + consonant: double it', 'big → bigger → the biggest'],
      ['Consonant + y: y → i', 'happy → happier → the happiest'],
      ['Long adjective: more / the most', 'beautiful → more beautiful → the most beautiful'],
      ['Irregular', 'good → better → the best; bad → worse → the worst; far → farther → the farthest'],
      ['Equal', 'The house is as old as the library.'],
    ],
    tip: 'Use than after a comparative and the before a superlative. Never use two markers: not “more taller”.',
  },
  predict: {
    question: 'Give the house more floors than the skyscraper. Which building will be “the tallest”?',
    options: ['Still the skyscraper', 'The house', 'No building'],
    test: 'Move the floor sliders in the model and read the sentences under it.',
    proof: 'Superlatives follow the facts, not the name of the building. If the house has the most floors, the house is the tallest.',
  },
  practice: [
    {
      kind: 'gap', id: 't5-gap', prompt: 'Write the correct form of the adjective in brackets.',
      lines: [
        { before: 'A bus is', after: '(long) than a car.', answers: ['longer'] },
        { before: 'This is the', after: '(old) house in our village.', answers: ['oldest'] },
        { before: 'My new room is', after: '(big) than my old one.', answers: ['bigger'] },
        { before: 'Today is the', after: '(happy) day of the month.', answers: ['happiest'] },
        { before: 'The weather is', after: '(bad) than yesterday.', answers: ['worse'] },
      ],
      why: 'Check the spelling rules: big doubles g, happy changes y to i, and bad is irregular.',
    },
    {
      kind: 'choice', id: 't5-choice1', prompt: 'Which sentence is correct?',
      options: ['The museum is more older than the bank.', 'The museum is older than the bank.', 'The museum is older that the bank.'],
      answer: 1,
      why: 'Use one comparative marker (-er) and the word than.',
    },
    {
      kind: 'choice', id: 't5-choice2', prompt: 'Complete: “This is ___ library in the city.”',
      options: ['the most modern', 'more modern', 'the more modernest'],
      answer: 0,
      why: 'One of all the libraries in the city needs a superlative.',
    },
  ],
  speak: {
    task: 'Compare three buildings in your town. Use two comparatives and two superlatives.',
    frames: ['The … is … than the …', 'The … is more … than the …', 'The … is the … in my town.', 'I think the … is the best because …'],
    sample: 'In my town, the school is bigger than the library. The theatre is more beautiful than the bank. The TV tower is the tallest structure. I think the library is the best place because it is quiet.',
  },
  teacher: [
    'Ұзақтығы: 45 минут. Мақсат: салыстырмалы және күшейтпелі шырай.',
    'Алдымен болжам жасатыңыз, содан кейін слайдермен тексертіңіз (predict → test → prove).',
    '«Word lab» панелінде оқушы формасын алдымен өзі айтады, содан кейін тексереді.',
    'Жиі қате: «more taller», «the most biggest», than орнына that.',
  ],
  modelText: 'Three paper buildings: a house, an apartment building and a skyscraper. Sliders change their floors and width, and comparison sentences update.',
};
