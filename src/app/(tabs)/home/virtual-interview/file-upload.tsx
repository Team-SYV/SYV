import FileUpload from "@/components/Pages/fileUpload";
import { useLocalSearchParams } from "expo-router";

const FileUploadScreen = () => {
  const { interviewId, jobData } = useLocalSearchParams();
  return (
    <FileUpload
      interviewId={interviewId}
      jobData={jobData}
      path={"virtual-interview"}
    />
  );
};

export default FileUploadScreen;
