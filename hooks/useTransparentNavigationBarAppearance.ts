import { useCallback, type RefObject } from "react";
import { findNodeHandle } from "react-native";
import { useFocusEffect } from "expo-router";
import ScenarioNavigationAppearance from "scenario-navigation-appearance";

type NativeViewRef = RefObject<unknown>;

export function useTransparentNavigationBarAppearance(scrollRef: NativeViewRef) {
  useFocusEffect(
    useCallback(() => {
      ScenarioNavigationAppearance.setTransparent();

      const patchScrollView = () => {
        const reactTag = findNodeHandle(scrollRef.current as never);
        if (typeof reactTag === "number") {
          ScenarioNavigationAppearance.disableScrollEdgeEffectsForView(reactTag);
        }
      };

      const animationFrame = requestAnimationFrame(patchScrollView);

      return () => {
        cancelAnimationFrame(animationFrame);
        ScenarioNavigationAppearance.restore();
      };
    }, [scrollRef]),
  );
}
