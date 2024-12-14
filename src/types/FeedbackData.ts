export interface FeedbackDataRecord {
    answer_id: string;
    interview_id: string | string[];
    answer: string;
    question: string;
    pace_of_speech: number;
    eye_contact: number;
  }
  
  export interface FeedbackDataVirtual {
    interview_id: string | string [];
    answers: string[];
    questions: string[];
    wpm: number[];
    eye_contact: number[];
  }
  