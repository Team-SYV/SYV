export interface FeedbackData {
  answer_id: string;
  interview_id: string | string[];
  answer: string;
  question: string;
  wpm: number;
  eye_contact: number;
}