import FileUpload from "@/components/Pages/FileUpload";
import { useLocalSearchParams } from "expo-router";

const FileUploadScreen = () => {
  const { interviewId, jobData } = useLocalSearchParams();
  return (
    <FileUpload
      interviewId={interviewId as string}
      jobData={jobData}
      path={"record-yourself"}
    />
  );
};

export default FileUploadScreen;
