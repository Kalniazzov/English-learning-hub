import { h } from './dom';

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

let player: HTMLAudioElement | null = null;
let voice: SpeechSynthesisVoice | null | undefined;

/** The clearest English voice the device has, preferring natural, high-quality ones. */
function bestVoice() {
  if (voice !== undefined || !canSpeak) return voice ?? null;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  if (!voices.length) return null;
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|neural|premium|enhanced/i.test(v.name) ? 8 : 0) +
    (/samantha|google us english|google uk english female|aria|jenny|ava|serena/i.test(v.name) ? 5 : 0) +
    (v.lang === 'en-US' || v.lang === 'en-GB' ? 2 : 0) +
    (v.localService ? 0 : 1);
  voice = voices.sort((a, b) => score(b) - score(a))[0];
  return voice;
}
if (canSpeak) window.speechSynthesis.addEventListener?.('voiceschanged', () => (voice = undefined));

function synthesise(text: string) {
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const v = bestVoice();
  if (v) utterance.voice = v;
  utterance.lang = v?.lang ?? 'en-US';
  utterance.rate = 0.88;
  utterance.pitch = 1.2;
  window.speechSynthesis.speak(utterance);
}

/** Plays a recorded clip when there is one, otherwise the device voice reads `text`. */
export function speak(text: string, audio?: string) {
  player?.pause();
  if (canSpeak) window.speechSynthesis.cancel();
  if (!audio) return synthesise(text);
  player = new Audio(audio);
  player.play().catch(() => synthesise(text));
}

export function listenButton(text: string, label = 'Listen', spokenName = text, audio?: string) {
  if (!canSpeak && !audio) return null;
  return h('button', { type: 'button', class: 'listen', 'aria-label': `${label}: ${spokenName}`, onclick: () => speak(text, audio) }, label);
}
