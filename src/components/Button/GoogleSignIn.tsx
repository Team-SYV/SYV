import React from "react";
import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import GoogleButton from "./GoogleButton";

const GoogleSignIn = ({ isLoading, setIsLoading }) => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/(tabs)/home", { scheme: "savy" }),
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error", err);
    } finally {
      setIsLoading(false);
    }
  }, [startOAuthFlow, setIsLoading]);

  return (
    <GoogleButton
      title="Continue in with Google"
      onPress={onPress}
      containerStyles="mx-4 py-3"
      isLoading={isLoading}
    />
  );
};

export default GoogleSignIn;
