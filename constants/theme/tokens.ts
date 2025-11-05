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
  modal: {
    paddingTop: 90,
  },
  image: {
    height: 280,
  },
  icon: 24,
  header: {
    height: 45,
    icon: 24,
    gap: 22,
  },
  navigation: {
    icon: 26,
    button: 18,
  },
  card: {
    tmdb: { height: 120 },
    media: { height: 80 },
    sizes: {
      sm: {
        width: 180,
        height: 265,
        borderRadius: 12,
        contentMarginTop: 6,
        contentGap: 2,
        metaGap: 8,
        titleFontSize: 16, // TOKENS.font.xxl
        titleLineHeight: 18,
        metaFontSize: 11, // TOKENS.font.xs
      },
      md: {
        width: 270,
        height: 398,
        borderRadius: 18,
        contentMarginTop: 8,
        contentGap: 2,
        metaGap: 12,
        titleFontSize: 20, // TOKENS.font.title
        titleLineHeight: 27,
        metaFontSize: 16, // TOKENS.font.xxl
      },
      xl: {
        width: deviceWidth - 32, // Full width minus horizontal margins
        height: Math.round((deviceWidth - 32) * 1.47), // Aspect ratio 1.47
        borderRadius: 16,
        contentMarginTop: 14,
        contentGap: 6,
        metaGap: 10,
        titleFontSize: 20, // TOKENS.font.title
        titleLineHeight: 24,
        metaFontSize: 13, // TOKENS.font.md
      },
      grid: {
        width: (deviceWidth - 32 - 14) / 2, // Two columns with gap
        height: Math.round(((deviceWidth - 32 - 14) / 2) * 1.47),
        borderRadius: 12,
        contentMarginTop: 6,
        contentGap: 2,
        metaGap: 8,
        titleFontSize: 16, // TOKENS.font.xxl
        titleLineHeight: 18,
        metaFontSize: 11, // TOKENS.font.xs
      },
    },
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
    xl: 24,
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

export const BLURHASH = {
  hash: "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[",
  transition: 100,
};

export const BUTTON = {
  opacity: 0.6,
};
