import React, { useState } from "react";
import { View, Text, ScrollView, Image, Alert } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { Stack, useRouter } from "expo-router";
import { useAuth, useSignIn } from "@clerk/clerk-expo";
import CustomFormField from "@/components/FormField/CustomFormField";
import CustomButton from "@/components/Button/CustomButton";
import BottomHalfModal from "@/components/Modal/BottomHalfModal";
import OTPTextInput from "react-native-otp-textinput";
import Toast from "react-native-toast-message";
import {
  validateConfirmPassword,
  validatePassword,
} from "@/utils/validators/validateRegister";
import BackToLogin from "../Button/BackToLogin";

const ResetPasswordForm = () => {
  const { isLoaded, signIn } = useSignIn();
  const { signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    general: "",
  });

  // Handles input change and sets validation errors based on field type
  const handleInputChange = (text: string, field: keyof typeof errors) => {
    switch (field) {
      case "password":
        setPassword(text);
        setErrors((prev) => ({
          ...prev,
          password: text
            ? validatePassword(text, submitted)
            : "Password is required",
        }));
        break;
      case "confirmPassword":
        setConfirmPassword(text);
        setErrors((prev) => ({
          ...prev,
          confirmPassword: text
            ? validateConfirmPassword(password, text, submitted)
            : "Confirm password is required",
        }));
        break;
    }
  };

  // Checks if the form is valid
  const isFormValid = () => {
    const passwordError = validatePassword(password, submitted);
    const confirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword,
      submitted
    );

    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError,
      general: "",
    });

    return !passwordError && !confirmPasswordError;
  };

  // Handles password reset request
  const onRequestReset = async () => {
    if (!emailAddress) {
      setErrors((prev) => ({
        ...prev,
        general: "Email is required to reset the password",
      }));
      return;
    }
    setLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setSuccessfulCreation(true);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        general: err.errors[0]?.message || "An unknown error occurred",
      }));
      setTimeout(() => setErrors((prev) => ({ ...prev, general: "" })), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handles the actual password reset process
  const onReset = async () => {
    setSubmitted(true);
    if (!isLoaded) return;

    if (!isFormValid()) return;

    setLoading(true);

    try {
      // Attempt to reset the password
      await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      // Show success toast
      Toast.show({
        text1: "Success!",
        text2: "Password has been reset successfully",
        type: "success",
        position: "top",
        visibilityTime: 4000,
        autoHide: true,
      });

      await signOut();

      // Redirect to login page
      router.push("/login");
    } catch (err: any) {
      const errorMessage =
        err.errors[0]?.message || "An unknown error occurred";
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));

      Alert.alert("Verification Failed", "Invalid code. Please try again.");
      setTimeout(() => setErrors((prev) => ({ ...prev, general: "" })), 3000);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    if (isFormValid()) {
      setIsModalVisible(true);
    }
  };

  return (
    <View>
      <ScrollView>
        <Stack.Screen options={{ headerShown: false }} />
        <Spinner visible={loading} color="#00AACE" />

        {!successfulCreation ? (
          <View className="mt-32">
            <View className="w-56 h-56 self-center">
              <Image
                source={require("@/assets/images/password.png")}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>

            <Text className="text-[24px] text-center font-semibold mt-5">
              Forgot Password?
            </Text>

            <Text className="text-center mt-2">
              Enter your email account to reset password
            </Text>

            <CustomFormField
              title="Email"
              placeholder="Enter your email"
              value={emailAddress}
              onChangeText={(text) => setEmailAddress(text)}
              otherStyles="mb- mt-12"
              keyboardType="email-address"
            />

            {errors.general && (
              <Text className="text-red-500 text-center mt-2 text-sm">
                {errors.general}
              </Text>
            )}

            <CustomButton
              title="Reset Password"
              onPress={onRequestReset}
              containerStyles="bg-[#00AACE] h-[50px] w-full rounded-2xl mt-6 mb-1"
              textStyles="text-white text-[16px] font-semibold"
              isLoading={loading}
            />

            <BackToLogin />
          </View>
        ) : (
          <View className="mt-24">
            <View className="w-60 h-60 self-center">
              <Image
                source={require("@/assets/images/password.png")}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>

            <Text className="text-[24px] text-center font-semibold mt-5">
              Set New Password
            </Text>

            <Text className="text-center mt-2 mb-4">
              Please enter your new password
            </Text>

            <CustomFormField
              title="Password"
              placeholder="New Password"
              value={password}
              onChangeText={(text) => handleInputChange(text, "password")}
              otherStyles="mb-1"
            />
            {errors.password && (
              <Text className="text-red-500 text-sm">{errors.password}</Text>
            )}

            <CustomFormField
              title="ConfirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) =>
                handleInputChange(text, "confirmPassword")
              }
              otherStyles="mb-1 mt-4"
            />
            {errors.confirmPassword && (
              <Text className="text-red-500 text-sm">
                {errors.confirmPassword}
              </Text>
            )}

            <CustomButton
              title="Request Code"
              onPress={openModal}
              containerStyles="bg-[#00AACE] h-[50px] w-full rounded-2xl mt-6 mb-1"
              textStyles="text-white text-[15px] font-semibold"
              isLoading={loading}
            />

            <BackToLogin />
          </View>
        )}
      </ScrollView>

      <BottomHalfModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
        <View className="mt-4">
          <View className="w-32 h-32 self-center">
            <Image
              source={require("@/assets/images/email.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <View className="items-center">
            <Text className="text-[24px] font-semibold"> Verify Email</Text>
            <Text className="mt-2 text-center text-lg">
              Please enter the 6-digit code that {"\n"}
              was sent to your email.
            </Text>
          </View>

          <View className="mt-3 items-center">
            <OTPTextInput
              tintColor={"#00AACE"}
              inputCount={6}
              handleTextChange={(code) => setCode(code)}
            />
          </View>

          <CustomButton
            title="Reset Password"
            onPress={onReset}
            containerStyles="bg-[#00AACE] h-16 mx-4 rounded-2xl mt-6 mb-1"
            textStyles="text-white text-[16px] font-semibold"
            isLoading={loading}
          />
        </View>
      </BottomHalfModal>
    </View>
  );
};

export default ResetPasswordForm;
