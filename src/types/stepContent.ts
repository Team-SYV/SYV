import { JobInfo } from "./jobInfo";

export interface StepContentProps {
  activeStep: number;
  formData: JobInfo;
  updateFormData: (key: string, value: string, callback?: () => void) => void;
  handleNextStep: () => void;
  handleSubmit: () => void;
  handleSubmitRoute: string;
  handleSkip: () => void;
  interviewId: string | null;
}
