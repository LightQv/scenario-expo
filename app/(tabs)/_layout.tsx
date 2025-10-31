import React from "react";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { useUserContext } from "@/contexts";

export default function TabLayout() {
  const { authState } = useUserContext();

  return (
    <NativeTabs
      tintColor="#eab208"
      minimizeBehavior="onScrollDown"
      initialRouteName="discover"
    >
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
        </NativeTabs.Trigger>
      )}
      <NativeTabs.Trigger name="search" role="search">
        <Icon sf="magnifyingglass" />
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
