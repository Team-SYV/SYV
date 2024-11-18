import { Text, View, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import CustomButton from "@/components/Button/CustomButton";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import ProgressBar from "react-native-progress/Bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { createQuestions, generateQuestions, getInterview, getJobInformation } from "@/api";
import { cleanQuestion } from "@/utils/cleanQuestion";

const FileUpload = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const { interviewId } = useLocalSearchParams();

  // Select a file
  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
      });

      if (result.canceled) {
        if (!selectedFile) {
          Alert.alert("File Selection", "You did not select any file.");
        }
      } else if (result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setFileName(result.assets[0].name);

        let progress = 0;
        const interval = setInterval(() => {
          progress += 0.1;
          setUploadProgress(progress);
          if (progress >= 1) {
            clearInterval(interval);
            setUploadProgress(1);
          }
        }, 100);
      } else {
        Alert.alert("Error", "There was an issue picking the file.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Remove a file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileName("");
    setUploadProgress(0);
  };

  // Handles starting the interview by uploading the resume and generating questions
  const handleStartInterview = async () => {
    if (!selectedFile) {
      Alert.alert(
        "No file uploaded",
        "Please upload your resume before starting the interview."
      );
      return;
    }
    setLoading(true);

    try {
      // Fetch the job information
      const interview = await getInterview(interviewId);
      const jobInformationId = interview.job_information_id
      const jobInfo = await getJobInformation(jobInformationId);

      const {
        industry,
        job_role,
        interview_type,
        experience_level,
        company_name,
        job_description,
      } = jobInfo;

      const fileUri = selectedFile.uri;
      const formData = new FormData();

      formData.append("file", {
        uri: fileUri,
        name: selectedFile.name,
        type: "application/pdf",
      } as unknown as Blob);

      // Append job info to formData for question generation
      formData.append("industry", industry);
      formData.append("job_role", job_role);
      formData.append("interview_type", interview_type);
      formData.append("experience_level", experience_level);
      formData.append("company_name", company_name);
      formData.append("job_description", job_description);
      formData.append("type", "RECORD");

      // Generate questions
      const questions = await generateQuestions(formData);

      for (const question of questions) {
        if (typeof question === "string") {
          const cleanedQuestion = cleanQuestion(question);

          const questionData = {
            interview_id: interviewId,
            question: cleanedQuestion,
          }
          await createQuestions(questionData);
        } else {
          console.error("Invalid question format:", question);
        }
      }
      router.push(`/(tabs)/home/record-yourself?interviewId=${interviewId}`);
    } catch (error) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Spinner visible={loading} color="#00AACE" />

      <View className="flex-1 mt-24 px-4">
        <Text className="text-[16px] text-gray-800 font-medium mb-4">
          Upload Your Resume
        </Text>

        <TouchableOpacity
          onPress={handleFilePick}
          className={`bg-gray-100 w-full rounded-lg items-center justify-center h-[250px] p-4 border-2 border-dashed ${
            fileName ? "border-green-500" : "border-gray-300"
          }`}
        >
          <SimpleLineIcons
            name="cloud-upload"
            size={42}
            color={fileName ? "green" : "gray"}
            className="mb-4"
          />
          <Text className="text-[16px] text-center font-medium mb-2">
            {fileName ? "Change File" : "Tap to Upload File"}
          </Text>
          <Text className="text-base text-center">*Supported format: .pdf</Text>
        </TouchableOpacity>

        {fileName ? (
          <View className="mt-4 flex-row justify-between items-center px-2">
            <Text className="text-base text-center">{fileName}</Text>
            <TouchableOpacity onPress={handleRemoveFile}>
              <Ionicons name="trash-outline" size={22} color="red" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text className="text-base text-center mt-2">No file selected</Text>
        )}

        <View className="mt-2">
          <ProgressBar
            progress={uploadProgress}
            width={null}
            color={uploadProgress === 1 ? "green" : "gray"}
            borderColor="transparent"
          />
          {uploadProgress > 0 && uploadProgress < 1 && (
            <Text className="text-center mt-2 text-base">
              {Math.round(uploadProgress * 100)}% Uploading...
            </Text>
          )}
        </View>

        <View className="flex-row items-center mt-6">
          <Text className="text-lg font-medium">Reminder:</Text>
          <Image
            source={require("@/assets/icons/notif.png")}
            className="h-6 w-7 ml-2"
            resizeMode="contain"
          />
        </View>
        <Text className="mt-2 text-base font-light">
          You will be interviewed based on the resume you've uploaded.
        </Text>
      </View>

      <View className="px-4 mb-5">
        <CustomButton
          title="Start Interview"
          onPress={handleStartInterview}
          containerStyles="bg-[#00AACE] h-[55px] w-full rounded-2xl"
          textStyles="text-white text-[16px] font-semibold"
          disabled={loading}
        />
      </View>
    </View>
  );
};

export default FileUpload;
