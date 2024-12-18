export interface SpeechData {
  audio: string;
  visemes: { time: number; type: string; value: string }[];
  length: number;
}
