import { Text, View, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import ProgressBar from "react-native-progress/Bar";

type ResumeUploadProps = {
  onFileSelect: (file: { name: string } | null) => void;
};

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onFileSelect,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

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
        onFileSelect(result.assets[0]);

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
    onFileSelect(null);
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
            *Supported formats: .jpg .jpeg .png .pdf 
          </Text>
        </TouchableOpacity>

        {fileName ? (
          <View className="mt-2 flex-row justify-between items-center px-2">
            <Text className="text-[12px] text-center">{fileName}</Text>
            <TouchableOpacity onPress={handleRemoveFile}>
              <Ionicons name="trash-outline" size={18} color="red" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text className="text-[12px] text-center mt-2">No file selected</Text>
        )}

        <View className="mt-2">
          <ProgressBar
            progress={uploadProgress}
            width={null}
            color={uploadProgress === 1 ? "green" : "gray"}
            borderColor="transparent"
          />
          {uploadProgress > 0 && uploadProgress < 1 && (
            <Text className="text-center mt-2 text-[12px]">
              {Math.round(uploadProgress * 100)}% Uploading...
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default ResumeUpload;
