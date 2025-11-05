import React from "react";
import {
  NativeTabs,
  Icon,
  Label,
  Badge,
} from "expo-router/unstable-native-tabs";
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
      <NativeTabs.Trigger name="top">
        <Icon sf="star.fill" />
        <Label>{i18n.t("navigation.tabs.top")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover">
        <Icon sf="film" />
        <Label>{i18n.t("navigation.tabs.discover")}</Label>
      </NativeTabs.Trigger>
      {authState.authenticated && (
        <NativeTabs.Trigger name="watchlist">
          <Icon sf="list.bullet" />
          <Label>{i18n.t("navigation.tabs.watchlist")}</Label>
          {bookmarkCount > 0 && <Badge>{bookmarkCount.toString()}</Badge>}
        </NativeTabs.Trigger>
      )}
      <NativeTabs.Trigger name="search" role="search">
        <Icon sf="magnifyingglass" />
        <Label>{i18n.t("navigation.tabs.search")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
