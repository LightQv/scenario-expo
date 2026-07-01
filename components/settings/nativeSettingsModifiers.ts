import { font } from "@expo/ui/swift-ui/modifiers";
import { FONTS, TOKENS } from "@/constants/theme";

export function settingsRegularFont(size = TOKENS.font.xxl) {
  return font({ family: FONTS.regular, size });
}

export function settingsBoldFont(size = TOKENS.font.xxl) {
  return font({ family: FONTS.bold, size });
}
