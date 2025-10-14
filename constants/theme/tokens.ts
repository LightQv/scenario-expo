import { Dimensions } from "react-native";

const deviceWidth = Math.round(Dimensions.get("window").width);

export const TOKENS = {
  device: {
    width: deviceWidth,
  },
  margin: {
    horizontal: 16,
    vertical: 10,
  },
  image: {
    height: 280,
  },
  header: {
    height: 45,
  },
  navigation: {
    icon: 26,
    button: 18,
  },
  card: {
    tmdb: { height: 120 },
    media: { height: 80 },
  },
  border: {
    xs: 0.5,
    md: 1,
    lg: 1.5,
    xl: 2,
  },
  radius: {
    xs: 0.5,
    sm: 6,
    md: 14,
    lg: 16,
    full: 999,
  },
  font: {
    xs: 11,
    sm: 12,
    md: 13,
    lg: 14,
    xl: 15,
    xxl: 16,
    xxxl: 18,
    title: 20,
    header: 32,
  },
};

export const FONTS = {
  abril: "AbrilFatface-Regular",
  dela: "DelaGothicOne-Regular",
  regular: "FiraSans-Regular",
  italic: "FiraSans-Italic",
  thin: "FiraSans-Thin",
  thinItalic: "FiraSans-ThinItalic",
  light: "FiraSans-Light",
  lightItalic: "FiraSans-LightItalic",
  medium: "FiraSans-Medium",
  mediumItalic: "FiraSans-MediumItalic",
  bold: "FiraSans-Bold",
  boldItalic: "FiraSans-BoldItalic",
};

export const BACKDROP = { opacity: 0.5 };

export const BLURHASH = {
  hash: "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[",
  transition: 100,
};

export const BUTTON = { opacity: 0.6 };
