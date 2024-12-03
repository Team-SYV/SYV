import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import Toast, { ErrorToast } from "react-native-toast-message";
import StartPage from ".";
import { BackHandler } from "react-native";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// Token cache object for handling token storage and retrieval securely
const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (error) {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Handles initial layout and routing based on authentication status
const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === "(tabs)";

    if (isSignedIn && !inTabsGroup) {
      router.replace("/home");
    } else if (!isSignedIn) {
      router.replace("/onboarding");
    }
  }, [isSignedIn]);

  // Exit the app when android back button is pressed in home page
  useEffect(() => {
    const handleBackPress = () => {
      if (
        (segments[0] === "(tabs)" &&
          (segments[1] === "home" ||
            segments[1] === "profile" ||
            segments[1] === "progress" ||
            segments[1] === "history") &&
          segments.length === 2)
      ) {
        BackHandler.exitApp();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      backHandler.remove();
    };
  }, [segments]);

  return <Slot />;
};

// Toast message customization
const toastConfig = {
  error: (props) => <ErrorToast {...props} text2NumberOfLines={2} />,
};

const RootLayoutNav = () => {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={CLERK_PUBLISHABLE_KEY}
    >
      <ClerkLoaded>
        <StartPage />
        <InitialLayout />
        <Toast config={toastConfig} />
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default RootLayoutNav;
