export interface Question {
  n: number;
  text: string;
  options: string[];
  /** Index of the correct option in the original worksheet order. */
  answer: number;
}

export interface QuizPart {
  /** Theme the part reviews (1–6). */
  theme: number;
  title: string;
  questions: Question[];
}

const q = (n: number, text: string, options: string[], key: 'A' | 'B' | 'C' | 'D'): Question => ({
  n, text, options, answer: 'ABCD'.indexOf(key),
});

// Questions and key taken from Progress_Check_1_Worksheet.pdf.
export const quizParts: QuizPart[] = [
  {
    theme: 1, title: 'Survival: Introduction', questions: [
      q(1, 'What should you do first if you become lost in a forest?', ['Run in a random direction', 'Stop, breathe, and think', 'Follow a mysterious light', 'Eat unknown plants'], 'B'),
      q(2, 'What does survival mean?', ['Collecting souvenirs', 'Staying safe in a difficult situation', 'Telling a legend', 'Walking without a map'], 'B'),
      q(3, 'Which item can attract attention while saving energy?', ['A whistle', 'A mushroom', 'A shortcut', 'A notebook'], 'A'),
      q(4, 'Which action is safest when you need to travel?', ['Choose an unfamiliar shortcut', 'Follow a magical animal', 'Use a map and compass on a reliable route', 'Ignore the weather'], 'C'),
      q(5, 'Which statement from the lesson describes a legend?', ['A clear trail can guide travellers', 'Shelter protects from rain', 'A glowing magical animal leads lost people home', 'A whistle can attract help'], 'C'),
    ],
  },
  {
    theme: 2, title: 'Being a Tourist: Storytelling', questions: [
      q(6, 'Where did Aida go with her friends?', ['A mountain village', 'A desert factory', 'A modern airport', 'A city hospital'], 'A'),
      q(7, 'What was the guide’s legend about?', ['A castle built by tourists', 'A dragon protecting the valley', 'A train crossing a bridge', 'A bakery beside a river'], 'B'),
      q(8, 'What evidence showed that the bridge was real?', ['A glowing dragon', 'A sign describing local builders', 'A dream', 'A magical map'], 'B'),
      q(9, 'Which sequence words help organise a travel story?', ['Big, bigger, biggest', 'First, next, finally', 'Micro, macro, market', 'North, south, east'], 'B'),
      q(10, 'What should a respectful tourist do before photographing local people?', ['Ask permission', 'Ignore signs', 'Leave rubbish', 'Step off marked paths'], 'A'),
    ],
  },
  {
    theme: 3, title: 'Economics: General Information', questions: [
      q(11, 'What does economics study?', ['Only famous buildings', 'How people use limited resources to meet needs and wants', 'Only old trade routes', 'Only grammar rules'], 'B'),
      q(12, 'Which is a basic need?', ['An expensive watch', 'A video game', 'Drinking water', 'A luxury bag'], 'C'),
      q(13, 'What information does a budget show?', ['Income, expenses and possible savings', 'Only the weather', 'Only building height', 'Only travel stories'], 'A'),
      q(14, 'What should a presenter use to make simple data clear?', ['An unrelated picture', 'A chart', 'A long paragraph on every slide', 'Unverified numbers'], 'B'),
      q(15, 'Which word describes a rise in a chart?', ['Decrease', 'Increase', 'Shelter', 'Caravan'], 'B'),
    ],
  },
  {
    theme: 4, title: 'Defining Economics: History & Geography', questions: [
      q(16, 'Which vehicle carried goods across deserts in the past?', ['A cargo plane', 'A caravan', 'A modern train', 'A subway'], 'B'),
      q(17, 'Why did rivers, mountain passes and ports matter to traders?', ['They shaped possible routes', 'They stopped all buying', 'They were grammar rules', 'They removed the need for transport'], 'A'),
      q(18, 'Which transport connects ports by sea today?', ['Camel caravan', 'Cargo ship', 'Bicycle only', 'Horse cart only'], 'B'),
      q(19, 'What made buying and selling easier after direct exchange?', ['Money', 'A mountain', 'A legend', 'A telescope'], 'A'),
      q(20, 'What do both a caravan and a cargo ship do?', ['Build skyscrapers', 'Connect producers with buyers', 'Change adjectives', 'Teach pronunciation'], 'B'),
    ],
  },
  {
    theme: 5, title: 'Degrees of Adjectives: Buildings', questions: [
      q(21, 'The apartment building is ___ than the house.', ['tall', 'taller', 'the tallest', 'more tall'], 'B'),
      q(22, 'The skyscraper is ___ building in the picture.', ['taller', 'tall', 'the tallest', 'more tallest'], 'C'),
      q(23, 'What is the comparative form of big?', ['biger', 'bigger', 'the biggest', 'more big'], 'B'),
      q(24, 'Which form correctly compares two beautiful buildings?', ['beautifuler than', 'most beautiful than', 'more beautiful than', 'the beautifulest'], 'C'),
      q(25, 'What is the superlative form of good?', ['gooder', 'better', 'the best', 'the goodest'], 'C'),
    ],
  },
  {
    theme: 6, title: 'Microeconomics & Macroeconomics', questions: [
      q(26, 'What does microeconomics mainly study?', ['Only the national unemployment rate', 'Individual consumers and firms', 'Only a whole country’s output', 'Only world maps'], 'B'),
      q(27, 'What does macroeconomics mainly study?', ['One shopper’s lunch choice', 'One bakery’s bread price', 'The economy as a whole', 'One shop shelf'], 'C'),
      q(28, 'A bakery decides the price of its bread. Which field is this?', ['Macroeconomics', 'Microeconomics', 'Geography', 'Architecture'], 'B'),
      q(29, 'Prices of many goods rise across a country. Which pattern is this?', ['Inflation, a macroeconomic topic', 'One customer’s preference', 'One bakery’s menu', 'A comparative adjective'], 'A'),
      q(30, 'Which statement correctly compares the two fields?', ['Both study only one bakery', 'Micro studies the whole country; macro studies one buyer', 'Both study choices, but at different scales', 'Neither concerns resources'], 'C'),
    ],
  },
];
