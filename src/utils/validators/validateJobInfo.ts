export const validateStep = (step: number, formData: any) => {
  switch (step) {
    case 0:
      return formData.selectedJobDescription !== null;
    case 2:
      return formData.selectedResume !== null;
    case 2:
      return formData.selectedIndustry !== null;
    case 3:
      return formData.selectedJobRole !== null;
    case 4:
      return formData.selectedCompany !== null;
    case 5:
      return formData.selectedInterviewType !== null;
    case 6:
      return formData.selectedExperienceLevel !== null;
    default:
      return true;
  }
};

export const getErrorMessage = (step: number) => {
  switch (step) {
    case 0:
      return "Please upload a job description.";
    case 1:
      return "Please upload a resume.";
    case 2:
      return "Please select an industry.";
    case 3:
      return "Please select a job role.";
    case 4:
      return "Please input a company name.";
    case 5:
      return "Please select an interview type.";
    case 6:
      return "Please select an experience level.";
    default:
      return "";
  }
};
