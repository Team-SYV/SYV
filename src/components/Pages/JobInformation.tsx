import React, { useState, useCallback, useEffect } from "react";
import CustomButton from "@/components/Button/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Spinner from "react-native-loading-spinner-overlay";
import {
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import { steps } from "@/constants/jobInfo";
import { JobInfo } from "@/types/jobInfo";
import {
  getErrorMessage,
  validateStep,
} from "@/utils/validators/validateJobInfo";
import Stepper from "@/components/Stepper/Stepper";
import Toast from "react-native-toast-message";
import StepContent from "@/components/StepContent/StepContent";
import { useAuth } from "@clerk/clerk-expo";
import { createInterview } from "@/api/interview";
import { createQuestions } from "@/api/question";
import {
  transcribeImage,
  transcribePDF,
  transcribeResume,
  validate,
} from "@/api/transcription";

type JobInformationProps = {
  interviewType: "VIRTUAL" | "RECORD";
  path: "virtual-interview" | "record-yourself";
};

const JobInformation: React.FC<JobInformationProps> = ({
  interviewType,
  path,
}) => {
  const [formData, setFormData] = useState<JobInfo>({
    selectedJobDescription: null,
    selectedResume: null,
    selectedIndustry: null,
    selectedJobRole: null,
    selectedCompany: null,
    selectedInterviewType: null,
    selectedExperienceLevel: null,
  });

  const router = useRouter();
  const { getToken } = useAuth();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [transcribed, setTranscribed] = useState(false);
  const [resumeTranscribed, setResumeTranscribed] = useState(false);

  useEffect(() => {
    const transcribeJobDescription = async () => {
      if (!formData.selectedJobDescription || transcribed) {
        // Don't run if already transcribed
        return;
      }

      const token = await getToken({ template: "supabase" });
      const fileExtension = formData.selectedJobDescription.name
        .split(".")
        .pop()
        ?.toLowerCase();

      if (fileExtension === "pdf") {
        const formDataObj = new FormData();
        formDataObj.append("file", {
          uri: formData.selectedJobDescription.uri,
          name: formData.selectedJobDescription.name,
          type: "application/pdf",
        } as unknown as Blob);

        const jobDescriptionResponse = await transcribePDF(formDataObj, token);

        setJobDescription(jobDescriptionResponse.job_details);
        const jobDetails = JSON.parse(jobDescriptionResponse.job_details);

        jobDetails.job_description = jobDetails.job_description
          .replace(/\\u2018|\\u2019/g, "'")
          .replace(/\s+/g, " ")
          .trim();

        setFormData((prevState) => ({
          ...prevState,
          selectedIndustry: jobDetails.industry,
          selectedJobRole: jobDetails.job_role,
          selectedCompany: jobDetails.selected_company,
          selectedExperienceLevel: jobDetails.selected_experience_level,
        }));

        setTranscribed(true);
      } else {
        const formDataObj = new FormData();
        formDataObj.append("file", {
          uri: formData.selectedJobDescription.uri,
          name: formData.selectedJobDescription.name,
          type: "image/jpeg",
        } as unknown as Blob);

        const jobDescriptionResponse = await transcribeImage(
          formDataObj,
          token
        );

        setJobDescription(jobDescriptionResponse.job_details);
        const jobDetails = JSON.parse(jobDescriptionResponse.job_details);

        jobDetails.job_description = jobDetails.job_description
          .replace(/\\u2018|\\u2019/g, "'")
          .replace(/\s+/g, " ")
          .trim();

        setFormData((prevState) => ({
          ...prevState,
          selectedIndustry: jobDetails.industry,
          selectedJobRole: jobDetails.job_role,
          selectedCompany: jobDetails.selected_company,
          selectedExperienceLevel: jobDetails.selected_experience_level,
        }));

        setTranscribed(true);
      }
    };
    transcribeJobDescription();

  }, [formData.selectedJobDescription, transcribed]);

  useEffect(() => {
    const scrapeResume = async () => {
      if (!formData.selectedResume || resumeTranscribed) {
        return;
      }

      const token = await getToken({ template: "supabase" });
      const formDataObj = new FormData();

      formDataObj.append("file", {
        uri: formData.selectedResume.uri,
        name: formData.selectedResume.name,
        type: "application/pdf",
      } as unknown as Blob);

      const resumeResponse = await transcribeResume(formDataObj, token);
      setResume(resumeResponse.resume);

      setFormData((prevState) => ({
        ...prevState,
        selectedResume: {
          uri: formData.selectedResume.uri,
          name: formData.selectedResume.name,
          type: "application/pdf",
        },
      }));

      setResumeTranscribed(true);
     
    };
    scrapeResume();
  }, [formData.selectedResume, resumeTranscribed]);

  // Handles the android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButtonPress
    );
    return () => backHandler.remove();
  }, [hasChanges]);

  // Updates the active step when a step is pressed
  const handleStepPress = useCallback((index: number) => {
    setActiveStep(index);
  }, []);

  // Move to next step and shows error message
  const handleNextStep = useCallback(async () => {
    if (activeStep === steps.length - 1) {
      await handleSubmit();
    }

    if (!validateStep(activeStep, formData)) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [activeStep]: getErrorMessage(activeStep),
      }));

      Toast.show({
        type: "error",
        text1: getErrorMessage(activeStep),
        position: "bottom",
        bottomOffset: 85,
      });

      return;
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [activeStep]: "",
    }));

    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  }, [activeStep, formData]);

  // Moves to previous step
  const handlePrevStep = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  }, [activeStep]);

  // Updates form data, marks changes
  const updateFormData = (
    key: string,
    value: string | null,
    callback?: () => void
  ) => {
    setFormData((prevState) => {
      let newState = {
        ...prevState,
        [key]: value,
      };

      if (key === "selectedIndustry") {
        newState = {
          ...newState,
          selectedJobRole: null,
        };
      }

      if (key === "selectedJobDescription") {
        setTranscribed(false);
        setJobDescription("");
      }
      if (key === "selectedResume") {
        setResumeTranscribed(false);
        setResume("");
      }

      if (callback) {
        callback();
      }

      return newState;
    });

    setHasChanges(true);

    if (errors[activeStep]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [activeStep]: "",
      }));
    }
  };

  // Show the confirmation modal when back is pressed and there is changes
  const handleBackButtonPress = () => {
    if (hasChanges) {
      setModalVisible(true);
      return true;
    } else {
      router.back();
      return true;
    }
  };

  const handleDiscardChanges = () => {
    setModalVisible(false);
    setHasChanges(false);
    router.back();
  };

  const handleInterview = async () => {
    try {
      setLoading(true);
      const token = await getToken({ template: "supabase" });

      const jobData = {
        job_description: formData.selectedJobDescription,
        resume: formData.selectedResume,
        industry: formData.selectedIndustry,
        job_role: formData.selectedJobRole,
        company_name: formData.selectedCompany,
        interview_type: formData.selectedInterviewType,
        experience_level: formData.selectedExperienceLevel,
      };

      const interviewData = {
        type: interviewType,
        job_role: formData.selectedJobRole,
        company_name: formData.selectedCompany,
      };

      const interviewResponse = await createInterview(interviewData, token);
      const interviewId = interviewResponse.interview_id;

      return { jobData, interviewId };
    } catch (error) {
      console.error("Error creating job description:", error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await getToken({ template: "supabase" });
      const valid = await validate(jobDescription, resume, token);
      if (!valid) {
        Toast.show({
          type: "error",
          text1: "Your resume is not fit for the job description.",
          position: "bottom",
          bottomOffset: 85,
        });
        return;
      } else {
        const response = await handleInterview();

        const questionFormData = new FormData();

        const resumeBlob = {
          uri: formData.selectedResume.uri,
          name: formData.selectedResume.name,
          type: "application/pdf",
        } as unknown as Blob;

        questionFormData.append("file", resumeBlob);
        questionFormData.append("job_description", jobDescription);
        questionFormData.append("industry", formData.selectedIndustry);
        questionFormData.append("job_role", formData.selectedJobRole);
        questionFormData.append("company_name", formData.selectedCompany);
        questionFormData.append(
          "experience_level",
          formData.selectedExperienceLevel
        );
        questionFormData.append(
          "interview_type",
          formData.selectedInterviewType
        );

        questionFormData.append("interview_id", response.interviewId);

        await createQuestions(questionFormData, token);

        router.push({
          pathname: `/(tabs)/home/${path}/reminder`,
          params: {
            interviewId: response.interviewId,
          },
        });
      }
    } catch (error) {
      console.error("Error skipping file upload", error.message);
    } finally {
      setHasChanges(false);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-2">
      <Spinner visible={loading} color="#00AACE" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Stack.Screen
          options={{
            headerLeft: () => (
              <TouchableOpacity onPress={handleBackButtonPress}>
                <Ionicons name="arrow-back" size={20} color="[#2a2a2a]" />
              </TouchableOpacity>
            ),
          }}
        />
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          {steps.map((step, index) => {
            if (index > activeStep) return null;
            return (
              <View key={index}>
                <Stepper
                  isActive={index === activeStep}
                  isCompleted={index < activeStep}
                  onStepPress={handleStepPress}
                  section={step}
                  index={index}
                />
                {index === activeStep && (
                  <>
                    <StepContent
                      activeStep={activeStep}
                      formData={formData}
                      updateFormData={updateFormData}
                      handleNextStep={handleNextStep}
                    />
                  </>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View className="absolute bottom-1 left-0 right-0 flex-row items-center justify-center px-6">
          <CustomButton
            title="Prev"
            onPress={handlePrevStep}
            containerStyles="border border-[#00AACE] h-14 rounded-xl mb-4 w-1/2 mx-2"
            textStyles="text-[#00AACE] text-[16px] font-semibold text-base"
            isLoading={loading}
          />
          <CustomButton
            title={activeStep === steps.length - 1 ? "Submit" : "Next"}
            onPress={handleNextStep}
            containerStyles="bg-[#00AACE] h-14 rounded-xl mb-4 w-1/2 mx-2"
            textStyles="text-white text-[16px] font-semibold text-base"
            isLoading={loading}
            disabled={loading}
          />
        </View>

        <ConfirmationModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={handleDiscardChanges}
          title="Discard Changes"
          message="Are you sure you want to discard your changes?"
          cancelText="Cancel"
          confirmText="Discard"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 120,
    marginTop: 8,
    padding: 15,
  },
});

export default JobInformation;
