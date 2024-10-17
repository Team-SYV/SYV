
import ResetPasswordForm from "@/components/Form/ResetPasswordForm";
import React from "react";
import { SafeAreaView } from "react-native";

const ResetPassword = () => {
  return (
    <SafeAreaView className="bg-white min-h-full p-6">
      <ResetPasswordForm />
    </SafeAreaView>
  );
};

export default ResetPassword;
