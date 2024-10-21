export const cleanQuestion = (question: string) => {
    return question.replace(/^\d+\.\s*/, "").replace(/\*/g, "").trim();
  };
  