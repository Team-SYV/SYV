import{ useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const StartPage = () => {
  useEffect(() => {
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await SplashScreen.hideAsync();
    };

    prepare();
  }, []);

  return null;
};

export default StartPage;
