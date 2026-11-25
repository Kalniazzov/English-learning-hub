/** Recorded word clips (public/audio/words/<theme>-<n>.mp3), by theme. Themes not listed use the device voice. */
export const wordClips: Record<string, number> = {
  survival: 10,
  tourist: 10,
  economics: 11,
  'history-geography': 10,
  adjectives: 8,
  'micro-macro': 9,
};

export const wordClip = (theme: string, index: number) =>
  index < (wordClips[theme] ?? 0) ? `audio/words/${theme}-${index + 1}.mp3` : undefined;
