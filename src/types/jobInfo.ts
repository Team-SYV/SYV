export interface FileObject {
  uri: string; 
  name: string; 
  type: string; 
}

export interface JobInfo {
  selectedJobDescription: FileObject | null;
  selectedResume: FileObject | null;
  selectedIndustry: string | null;
  selectedJobRole: string | null;
  selectedCompany: string | null;
  selectedInterviewType: string | null;
  selectedExperienceLevel: string | null;
}
