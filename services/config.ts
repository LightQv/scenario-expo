import { Extra } from "@/types/config";
import Constants from "expo-constants";
import { Platform } from "react-native";

function getExtra(): Extra {
  const extra = Constants.expoConfig?.extra as Extra | undefined;

  if (!extra) {
    throw new Error("Expo extra config is not defined");
  }

  return extra as Extra;
}

const extra = getExtra();

export const CONFIG = {
  tmdbToken: extra.tmdbToken,
  apiBaseUrl:
    extra.env === "PROD"
      ? extra.apiUrl
      : Platform.OS === "ios"
        ? extra.apiUrlIos
        : extra.apiUrlAndroid,
};
