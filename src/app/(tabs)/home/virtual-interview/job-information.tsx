import React, { useState, useCallback, useEffect } from "react";
import CustomButton from "@/components/Button/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import VirtualInterviewStepContent from "@/components/StepContent/VirtualInterviewStepContent";
import Stepper from "@/components/Stepper/Stepper";
import Toast from "react-native-toast-message";

const JobInformation = () => {
  const [formData, setFormData] = useState<JobInfo>({
    selectedIndustry: null,
    selectedJobRole: null,
    selectedInterviewType: null,
    selectedExperienceLevel: null,
    companyName: null,
    jobDescription: null,
  });

  const router = useRouter();
  const { interviewId } = useLocalSearchParams();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [jobInformationId, setJobInformationId] = useState<string | null>(null);

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
      await handleSkip();
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

  // Creates job information
  const handleSubmit = async () => {
    console.log("Form data:", formData);
    router.push("/(tabs)/home/virtual-interview/file-upload");
  };

  // When file upload is skipped
  const handleSkip = async () => {
    console.log("Form data:", formData);
    router.push("/(tabs)/home/virtual-interview");
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
                    <VirtualInterviewStepContent
                      activeStep={activeStep}
                      formData={formData}
                      updateFormData={updateFormData}
                      handleNextStep={handleNextStep}
                      handleSubmit={handleSubmit}
                      handleSubmitRoute={`/virtual-interview/file-upload?jobId=`}
                      handleSkip={handleSkip}
                      jobInformationId={jobInformationId}
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