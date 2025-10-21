import "dotenv/config";

export default {
  expo: {
    name: "Scenario",
    slug: "Scenario",
    scheme: "scenario",
    description:
      "Find any movie or TV Shows and make watchlists for the ones to remember.",
    version: "1.0.0",
    orientation: "portrait",
    platforms: ["ios"],
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "com.sunshine.scenarioexpo",
      supportsTablet: true,
    },
    extra: {
      apiUrl: process.env.EXPO_API_URL,
      apiUrlIos: process.env.EXPO_API_URL_IOS,
      apiUrlAndroid: process.env.EXPO_API_URL_ANDROID,
      tmdbKey: process.env.EXPO_TMDB_API_KEY,
      tmdbToken: process.env.EXPO_TMDB_API_TOKEN,
      env: process.env.EXPO_ENV ?? "DEV",
    },
    plugins: [
      "expo-router",
      "expo-localization",
      [
        "expo-web-browser",
        {
          experimentalLauncherActivity: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
