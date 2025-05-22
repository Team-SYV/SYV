import { Text, View, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import ProgressBar from "react-native-progress/Bar";

type JobDescriptionUploadProps = {
  onFileSelect: (file: any) => void;
  selectedFile: any;
  transcriptionProgress?: number;
};

const JobDescriptionUpload: React.FC<JobDescriptionUploadProps> = ({
  onFileSelect,
  selectedFile,
  transcriptionProgress = 0,
}) => {
  const [fileName, setFileName] = useState("");
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Update fileName when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      setFileName(selectedFile.name);
    } else {
      setFileName("");
      setAnimatedProgress(0);
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }
  }, [selectedFile]);

  // Simulate progress animation when a file is selected and transcription is not complete
  useEffect(() => {
    if (selectedFile && transcriptionProgress < 1) {
      // Start animation only if transcription is not complete
      let progress = 0;
      setAnimatedProgress(0);
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }

      // Simulate progress over 5 seconds
      animationRef.current = setInterval(() => {
        progress += 0.02;
        setAnimatedProgress(Math.min(progress, 0.95));
        if (progress >= 0.95) {
          clearInterval(animationRef.current!);
        }
      }, 100);
    }

    // When transcription completes, snap to 100%
    if (transcriptionProgress === 1) {
      setAnimatedProgress(1);
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [selectedFile, transcriptionProgress]);

  // Select a file
  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });

      if (result.canceled) {
        if (!selectedFile) {
          Alert.alert("File Selection", "You did not select any file.");
        }
      } else if (result.assets && result.assets.length > 0) {
        setFileName(result.assets[0].name);
        onFileSelect(result.assets[0]);
      } else {
        Alert.alert("Error", "There was an issue picking the file.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Remove a file
  const handleRemoveFile = () => {
    setFileName("");
    setAnimatedProgress(0);
    onFileSelect(null);
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-4 pl-11">
        <TouchableOpacity
          onPress={handleFilePick}
          className={`bg-gray-100 w-full rounded-lg items-center justify-center h-[180px] p-4 border-2 border-dashed ${
            fileName ? "border-green-500" : "border-gray-300"
          }`}
        >
          <SimpleLineIcons
            name="cloud-upload"
            size={28}
            color={fileName ? "green" : "gray"}
            className="mb-4"
          />
          <Text className="text-[14px] text-center font-medium mb-2">
            {fileName ? "Change File" : "Tap to Upload File"}
          </Text>
          <Text className="text-center text-[11px]">
            *Supported formats: .png, .jpg, .jpeg, .pdf
          </Text>
        </TouchableOpacity>

        {fileName ? (
          <View className="mt-4 flex-row justify-between items-center px-2">
            <Text className="text-[12px] text-center">{fileName}</Text>
            <TouchableOpacity onPress={handleRemoveFile}>
              <Ionicons name="trash-outline" size={18} color="red" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text className="text-[12px] text-center mt-2">No file selected</Text>
        )}

        {fileName && (
          <View className="mt-2">
            <ProgressBar
              progress={animatedProgress}
              width={null}
              color={animatedProgress === 1 ? "green" : "gray"}
              borderColor="transparent"
            />
            {animatedProgress > 0 && animatedProgress < 1 && (
              <Text className="text-center mt-2 text-[12px]">
                {Math.round(animatedProgress * 100)}% Transcribing...
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default JobDescriptionUpload;
