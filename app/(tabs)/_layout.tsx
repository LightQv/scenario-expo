import React from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import {
  useThemeContext,
  useUserContext,
  useBookmarkContext,
} from "@/contexts";
import i18n from "@/services/i18n";

export default function TabLayout() {
  const { authState } = useUserContext();
  const { colors } = useThemeContext();
  const { bookmarkCount } = useBookmarkContext();

  return (
    <NativeTabs tintColor={colors.main} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="discover">
        <NativeTabs.Trigger.Icon sf="film" />
        <NativeTabs.Trigger.Label>
          {i18n.t("navigation.tabs.discover")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="top">
        <NativeTabs.Trigger.Icon sf="star.fill" />
        <NativeTabs.Trigger.Label>
          {i18n.t("navigation.tabs.top")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      {authState.authenticated && (
        <NativeTabs.Trigger name="watchlist">
          <NativeTabs.Trigger.Icon sf="list.bullet" />
          <NativeTabs.Trigger.Label>
            {i18n.t("navigation.tabs.watchlist")}
          </NativeTabs.Trigger.Label>
          {bookmarkCount > 0 && (
            <NativeTabs.Trigger.Badge>
              {bookmarkCount.toString()}
            </NativeTabs.Trigger.Badge>
          )}
        </NativeTabs.Trigger>
      )}
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" />
        <NativeTabs.Trigger.Label>
          {i18n.t("navigation.tabs.search")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
