import React, { useState } from "react";
import { View, Text, Image, Alert } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { useSignUp } from "@clerk/clerk-expo";
import CustomButton from "../Button/CustomButton";
import OTPTextInput from "react-native-otp-textinput";
import CustomFormField from "../FormField/CustomFormField";
import Toast from "react-native-toast-message";
import BottomHalfModal from "../Modal/BottomHalfModal";
import {
  validateEmail,
  validatePassword,
} from "@/utils/validators/validateLogin";
import {
  validateFirstName,
  validateLastName,
  validateConfirmPassword,
} from "@/utils/validators/validateRegister";

const RegisterForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  // Handles input change and sets validation errors based on field type
  const handleInputChange = (text: string, field: keyof typeof errors) => {
    // Allow only letters, spaces, hyphens, or apostrophes, and only maximum of 50 characters
    const filteredName = text.replace(/[^A-Za-z\s'-]/g, "").slice(0, 50);

    switch (field) {
      case "firstName":
        setFirstName(filteredName);
        setErrors((prev) => ({
          ...prev,
          firstName: text
            ? validateFirstName(text, submitted)
            : "First name is required",
        }));
        break;
      case "lastName":
        setLastName(filteredName);
        setErrors((prev) => ({
          ...prev,
          lastName: text
            ? validateLastName(text, submitted)
            : "Last name is required",
        }));
        break;
      case "emailAddress":
        setEmailAddress(text);
        setErrors((prev) => ({
          ...prev,
          emailAddress: text
            ? validateEmail(text, submitted)
            : "Email is required",
        }));
        break;
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
    const firstNameError = validateFirstName(firstName, submitted);
    const lastNameError = validateLastName(lastName, submitted);
    const emailError = validateEmail(emailAddress, submitted);
    const passwordError = validatePassword(password, submitted);
    const confirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword,
      submitted
    );

    setErrors({
      firstName: firstNameError,
      lastName: lastNameError,
      emailAddress: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      general: "",
    });

    return (
      !firstNameError &&
      !lastNameError &&
      !emailError &&
      !passwordError &&
      !confirmPasswordError
    );
  };

  // Handles sign up
  const onSignUpPress = async () => {
    setSubmitted(true);

    if (!isLoaded || !isFormValid()) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      const errorMessage =
        err.errors?.[0]?.message || "An unknown error occurred";

      Toast.show({
        text1: "Error",
        text2: errorMessage,
        type: "error",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handles email verification for sign-up
  const onPressVerify = async () => {
    if (!isLoaded) return;

    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      setPendingVerification(false);
    } catch (err) {
      const errorMessage =
        err.errors?.[0]?.message || "An unknown error occurred";
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
      Alert.alert("Verification Failed", "Invalid code. Please try again.");
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, general: "" }));
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-2">
      <Spinner visible={loading} color="#00AACE" />

      <CustomFormField
        title="First Name"
        placeholder="First Name"
        value={firstName}
        onChangeText={(text) => handleInputChange(text, "firstName")}
        otherStyles="mt-6 mb-1 bg-white rounded-xl"
      />
      {errors.firstName && (
        <Text className="text-red-500 text-sm ml-1">{errors.firstName}</Text>
      )}

      <CustomFormField
        title="Last Name"
        placeholder="Last Name"
        value={lastName}
        onChangeText={(text) => handleInputChange(text, "lastName")}
        otherStyles="mt-4 mb-1 bg-white rounded-xl"
      />
      {errors.lastName && (
        <Text className="text-red-500 text-sm ml-1">{errors.lastName}</Text>
      )}

      <CustomFormField
        title="Email"
        placeholder="Email"
        value={emailAddress}
        onChangeText={(text) => handleInputChange(text, "emailAddress")}
        otherStyles="mt-4 mb-1 bg-white rounded-xl"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.emailAddress && (
        <Text className="text-red-500 text-sm ml-1">{errors.emailAddress}</Text>
      )}

      <CustomFormField
        title="Password"
        placeholder="Password"
        value={password}
        onChangeText={(text) => handleInputChange(text, "password")}
        otherStyles="mt-4 mb-1 bg-white rounded-xl"
      />
      {errors.password && (
        <Text className="text-red-500 text-sm ml-1">{errors.password}</Text>
      )}

      <CustomFormField
        title="ConfirmPassword"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => handleInputChange(text, "confirmPassword")}
        otherStyles="mt-4 mb-1 bg-white rounded-xl"
      />
      {errors.confirmPassword && (
        <Text className="text-red-500 text-sm ml-1">
          {errors.confirmPassword}
        </Text>
      )}

      <CustomButton
        title="Sign Up"
        onPress={onSignUpPress}
        containerStyles="bg-[#00AACE] h-[50px] w-full rounded-2xl mt-6 mb-1"
        textStyles="text-white text-[16px] font-semibold"
        isLoading={loading}
      />

      {/* Verification Modal */}
      {pendingVerification && (
        <BottomHalfModal
          isVisible={pendingVerification}
          onClose={() => {
            setPendingVerification(false);
          }}
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
              <Text className="text-2xl font-semibold">Email Verification</Text>
              <Text className="mt-2 text-center text-lg">
                Please enter the 6-digit code that {"\n"}
                was sent to your email.
              </Text>
            </View>
            <View className="mt-2 items-center">
              <OTPTextInput
                tintColor={"#00AACE"}
                inputCount={6}
                handleTextChange={(code) => setCode(code)}
              />
            </View>

            <CustomButton
              title="Verify Email"
              onPress={onPressVerify}
              containerStyles="bg-[#00AACE] h-[50px] mx-4 rounded-2xl mt-6 "
              textStyles="text-white text-[16px] font-semibold"
              isLoading={loading}
            />
          </View>
        </BottomHalfModal>
      )}
    </View>
  );
};

export default RegisterForm;
