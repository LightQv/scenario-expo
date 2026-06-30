import { requireNativeModule } from "expo-modules-core";

type ScenarioNavigationAppearanceModule = {
  setTransparent: () => void;
  disableScrollEdgeEffectsForView: (reactTag: number) => void;
  restore: () => void;
};

export default requireNativeModule<ScenarioNavigationAppearanceModule>(
  "ScenarioNavigationAppearance",
);
