import React, { useEffect, useState } from "react";
import CustomButton from "../Button/CustomButton";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import Spinner from "react-native-loading-spinner-overlay";
import Dropdown from "../Dropdown/Dropdown";
import { experienceLevel, industry, jobRole } from "@/constants/jobInfo";
import InterviewTypeCard from "../Card/InterviewTypeCard";
import CompanyFormField from "../FormField/CompanyFormField";
import JobDescriptionTextArea from "../TextArea/JobDescriptionTextArea";
import { StepContentProps } from "@/types/stepContent";

const StepContent: React.FC<StepContentProps> = ({
  activeStep,
  formData,
  updateFormData,
  handleNextStep,
  handleSubmit,
  handleSubmitRoute,
  handleSkip,
  jobInformationId,
}) => {
  const router = useRouter();
  const [shouldProceed, setShouldProceed] = useState(false);
  const [proceedClicked, setProceedClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Proceed button
  const onProceed = async () => {
    try {
      setLoading(true);
      setProceedClicked(true);
      await handleSubmit();
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  // Skip button
  const onSkip = async () => {
    try {
      setLoading(true);
      await handleSkip();
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldProceed) {
      handleNextStep();
      setShouldProceed(false);
    }
  }, [shouldProceed]);

  useEffect(() => {
    if (proceedClicked && jobInformationId) {
      router.push(`${handleSubmitRoute + jobInformationId}`);
    }
  }, [proceedClicked, jobInformationId, router]);

  switch (activeStep) {
    case 0:
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
    case 1:
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
    case 2:
      return (
        <View className="flex-row items-center justify-center">
          <InterviewTypeCard
            imageSource={require("@/assets/images/behavioral.png")}
            title="Behavioral"
            description="Involves soft skills, interpersonal interactions, problem-solving approaches, and past experiences."
            isSelected={formData.selectedInterviewType === "Behavioral"}
            onPress={() => {
              updateFormData("selectedInterviewType", "Behavioral");
              setShouldProceed(true);
            }}
          />
          <InterviewTypeCard
            imageSource={require("@/assets/images/technical.png")}
            title="Technical"
            description="Involves coding challenges, technical problem-solving scenarios, and discussions about specific technologies, tools, or methodologies."
            isSelected={formData.selectedInterviewType === "Technical"}
            onPress={() => {
              updateFormData("selectedInterviewType", "Technical");
              setShouldProceed(true);
            }}
          />
        </View>
      );
    case 3:
      return (
        <Dropdown
          placeholder="Experience Level"
          data={experienceLevel}
          defaultOption={{
            key: formData.selectedExperienceLevel,
            value: formData.selectedExperienceLevel || "",
          }}
          onSelect={(value) => {
            updateFormData("selectedExperienceLevel", value, () => {
              setShouldProceed(true);
            });
          }}
        />
      );
    case 4:
      return (
        <CompanyFormField
          title="Company Name"
          placeholder="Company Name"
          value={formData.companyName}
          onChangeText={(text) => updateFormData("companyName", text)}
          otherStyles="ml-12 mb-1"
        />
      );
    case 5:
      return (
        <JobDescriptionTextArea
          value={formData.jobDescription}
          onChangeText={(text) => updateFormData("jobDescription", text)}
          placeholder="Fill in your job description"
          textInputStyles="ml-12"
        />
      );
    case 6:
      return (
        <View>
          <Spinner visible={loading} color="#00AACE" />
          <Text className="ml-11 mr-6 text-base">
            Do you wish to customize your interview based on your resume by
            uploading a file? If not, please skip.
          </Text>
          <View className="flex-row items-center justify-center px-6 mt-4 ml-7">
            <CustomButton
              title="Skip"
              onPress={onSkip}
              containerStyles="bg-gray-100 border border-gray-200 h-12 rounded-xl mb-4 mx-2 w-1/2"
              textStyles="text-gray-600 text-[14px] font-semibold text-base"
              disabled={loading}
            />
            <CustomButton
              title="Proceed"
              onPress={onProceed}
              containerStyles="bg-[#00AACE] h-12 rounded-xl mb-4 w-1/2 mx-2"
              textStyles="text-white text-[14px] font-semibold text-base"
              disabled={loading}
            />
          </View>
        </View>
      );
    default:
      return null;
  }
};

export default StepContent;
