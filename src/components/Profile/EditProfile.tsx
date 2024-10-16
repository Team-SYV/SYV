import { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import React from "react";
import * as ImagePicker from "expo-image-picker";
import CustomFormField from "@/components/FormField/CustomFormField";
import CustomButton from "@/components/Button/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Spinner from "react-native-loading-spinner-overlay";
import Toast from "react-native-toast-message";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const EditProfileComponent = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [imageUri, setImageUri] = useState(user?.imageUrl || "");
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

  // Toast message
  const showToast = (type: "success" | "error", msg: string) => {
    Toast.show({
      type,
      text1: msg,
      position: "bottom",
      bottomOffset: 80,
    });
  };

  // Function to filter name input
  const filterName = (text: string) => {
    return text.replace(/[^A-Za-z\s'-]/g, "").slice(0, 50);
  };

  // Function to validate name
  const isValidName = (name: string) => {
    const regex = /[A-Za-z]/;
    return regex.test(name);
  };

  // Handles the process of saving user profile updates.
  const handleSaveUser = async () => {
    if (!isValidName(firstName)) {
      showToast("error", "First name must contain at least one letter");
      return;
    }

    if (!isValidName(lastName)) {
      showToast("error", "Last name must contain at least one letter");
      return;
    }

    setLoading(true);
    try {
      await user?.update({
        firstName,
        lastName,
      });

      if (newImageUri) {
        const base64 = `data:image/png;base64,${newImageUri}`;
        await user?.setProfileImage({
          file: base64,
        });
      }
      showToast("success", "Your changes are saved");
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      showToast("error", "Failed to update profile.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Opens the image picker to select a new image
  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75,
      base64: true,
    });

    if (!result.canceled) {
      setNewImageUri(result.assets[0].base64 || "");
      setImageUri(result.assets[0].uri || "");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Spinner visible={loading} color="#00AACE" />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex pt-10 bg-white min-h-full">
          <View className="flex items-center justify-center">
            <Image
              source={{ uri: imageUri || "https://via.placeholder.com/150" }}
              className="h-32 w-32 rounded-full border-2 border-[#008FAE]"
              style={{ resizeMode: "cover" }}
            />

            <TouchableOpacity
              onPress={handleImagePicker}
              disabled={loading}
              className="mt-2"
              style={{ alignItems: "center", justifyContent: "center" }}
            >
              <View className="border border-[#008FAE] py-2 px-2 rounded-lg flex-row items-center">
                <MaterialCommunityIcons
                  name="pencil"
                  size={14}
                  color="#008FAE"
                />
                <Text className="ml-1 font-medium text-gray-600 text-sm">
                  Change Avatar
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text className="mt-10 mx-5 mb-1 text-sm font-semibold text-gray-800">
            First Name
          </Text>
          <CustomFormField
            title="firstName"
            placeholder="First Name"
            value={firstName}
            onChangeText={(text) => setFirstName(filterName(text))}
            otherStyles="mx-4"
          />
          <Text className="mt-6 mx-5 mb-1 text-sm font-semibold text-gray-800">
            Last Name
          </Text>
          <CustomFormField
            title="lastName"
            placeholder="Last Name"
            value={lastName}
            onChangeText={(text) => setLastName(filterName(text))}
            otherStyles="mx-4"
          />

          <View className="absolute bottom-1 left-0 right-0 flex-row flex items-center justify-center px-4">
            <CustomButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              containerStyles={`border border-[#00AACE] h-[44px] rounded-xl mb-4 mx-1 w-1/2`}
              textStyles="text-[#00AACE] text-[14px] font-semibold"
              disabled={loading}
            />

            <CustomButton
              title="SAVE"
              onPress={handleSaveUser}
              containerStyles={`bg-[#00AACE] h-[44px] rounded-xl mb-4 w-1/2 mx-1`}
              textStyles="text-white text-[14px] font-semibold"
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
};

export default EditProfileComponent;
