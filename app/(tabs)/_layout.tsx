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

export default function TabLayout() {
  const { authState } = useUserContext();
  const { colors } = useThemeContext();
  const { bookmarkCount } = useBookmarkContext();

  return (
    <NativeTabs tintColor={colors.main} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="top">
        <Icon sf="star.fill" />
        <Label>Top</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover">
        <Icon sf="film" />
        <Label>Discover</Label>
      </NativeTabs.Trigger>
      {authState.authenticated && (
        <NativeTabs.Trigger name="watchlist">
          <Icon sf="list.bullet" />
          <Label>Watchlist</Label>
          {bookmarkCount > 0 && <Badge>{bookmarkCount.toString()}</Badge>}
        </NativeTabs.Trigger>
      )}
      <NativeTabs.Trigger name="search" role="search">
        <Icon sf="magnifyingglass" />
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
