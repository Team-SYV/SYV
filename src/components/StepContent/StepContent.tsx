import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Dropdown from "../Dropdown/Dropdown";
import { experienceLevel, industry, jobRole } from "@/constants/jobInfo";
import InterviewTypeCard from "../Card/InterviewTypeCard";
import CompanyFormField from "../FormField/CompanyFormField";
import { StepContentProps } from "@/types/stepContent";
import JobDescriptionUpload from "../FileUpload/JobDescriptionUpload";
import ResumeUpload from "../FileUpload/ResumeUpload";

const StepContent: React.FC<StepContentProps> = ({
  activeStep,
  formData,
  updateFormData,
  handleNextStep,
}) => {
  const [shouldProceed, setShouldProceed] = useState(false);

  useEffect(() => {
    if (shouldProceed) {
      handleNextStep();
      setShouldProceed(false);
    }
  }, [shouldProceed]);

  switch (activeStep) {
    case 0:
      return (
        <JobDescriptionUpload
          onFileSelect={(file) => {
            updateFormData("selectedJobDescription", file ? file.name : null);
          }}
        />
      );

    case 1:
      return (
        <ResumeUpload
          onFileSelect={(file) => {
            updateFormData("selectedResume", file ? file.name : null);
          }}
        />
      );

    case 2:
      return (
        <Dropdown
          placeholder="Industry"
          data={industry}
          defaultOption={{
            key: formData.selectedIndustry,
            value: formData.selectedIndustry || "",
          }}
          onSelect={(value) => {
            updateFormData("selectedIndustry", value, () => {
              setShouldProceed(true);
            });
          }}
        />
      );
    case 3:
      return (
        formData.selectedIndustry && (
          <Dropdown
            placeholder="Job Role"
            data={jobRole[formData.selectedIndustry] || []}
            defaultOption={{
              key: formData.selectedJobRole,
              value: formData.selectedJobRole || "",
            }}
            onSelect={(value) => {
              updateFormData("selectedJobRole", value, () => {
                setShouldProceed(true);
              });
            }}
          />
        )
      );
    case 4:
      return (
        <CompanyFormField
          title="Company Name"
          placeholder="Company Name"
          value={formData.selectedCompany}
          onChangeText={(text) => updateFormData("selectedCompany", text)}
          otherStyles="ml-12 mb-1"
        />
      );
    case 5:
      return (
        <View className="flex-row items-center justify-center">
          <InterviewTypeCard
            imageSource={require("@/assets/images/behavioral.png")}
            title="Behavioral"
            description="Focuses on soft skills, interpersonal, problem-solving, and how you've handled past situations in the workplace."
            isSelected={formData.selectedInterviewType === "Behavioral"}
            onPress={() => {
              updateFormData("selectedInterviewType", "Behavioral");
              setShouldProceed(true);
            }}
          />
          <InterviewTypeCard
            imageSource={require("@/assets/images/technical.png")}
            title="Technical"
            description="Assesses your expertise in role-specific skills, industry knowledge, and ability to apply relevant tools and methods."
            isSelected={formData.selectedInterviewType === "Technical"}
            onPress={() => {
              updateFormData("selectedInterviewType", "Technical");
              setShouldProceed(true);
            }}
          />
        </View>
      );
    case 6:
      return (
        <Dropdown
          placeholder="Experience Level"
          data={experienceLevel}
          defaultOption={{
            key: formData.selectedExperienceLevel,
            value: formData.selectedExperienceLevel || "",
          }}
          onSelect={(value) => {
            updateFormData("selectedExperienceLevel", value, () => {});
          }}
        />
      );
    default:
      return null;
  }
};

export default StepContent;
