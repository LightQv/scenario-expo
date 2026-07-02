import { StyleSheet, View, PlatformColor } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Button,
  HStack,
  Host,
  Image as SwiftImage,
  List,
  Section,
  Spacer,
  Text as SwiftText,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  contentShape,
  foregroundStyle,
  frame,
  listStyle,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { useUserContext, useThemeContext } from "@/contexts";
import { TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";
import GoBackButton from "@/components/ui/GoBackButton";
import NativeSettingsRow from "@/components/settings/NativeSettingsRow";
import SettingsSectionHeader from "@/components/settings/SettingsSectionHeader";
import {
  settingsBoldFont,
  settingsRegularFont,
} from "@/components/settings/nativeSettingsModifiers";
import {
  canUseDownloads,
  type DownloadSettingsOverview,
  getDownloadSettingsOverview,
  isRadarrReady,
  isSonarrReady,
} from "@/services/downloadSettings";

const destructiveColor = PlatformColor("systemRed") as unknown as string;

export default function AccountScreen() {
  const { logout, user } = useUserContext();
  const { colors } = useThemeContext();
  const [downloadOverview, setDownloadOverview] =
    useState<DownloadSettingsOverview | null>(null);
  const radarrReady = isRadarrReady(downloadOverview);
  const sonarrReady = isSonarrReady(downloadOverview);
  const downloadsReady = canUseDownloads(downloadOverview);

  const handleLogout = async () => {
    await logout();
    router.back();
  };

  const handleProfilePress = () => {
    router.back();
    router.push("/profile");
  };

  const handleViewsPress = (type: "movie" | "tv") => {
    router.back();
    router.push(`/profile/${type}`);
  };

  const handleOwnedMediaPress = (type: "movie" | "tv") => {
    router.back();
    router.push(`/profile/owned/${type}`);
  };

  const handleDownloadsPress = () => {
    router.back();
    router.push("/profile/downloads");
  };

  const handleSettingsPress = () => {
    router.back();
    router.push("/settings");
  };

  useFocusEffect(
    useCallback(() => {
      getDownloadSettingsOverview()
        .then(setDownloadOverview)
        .catch(() => setDownloadOverview(null));
    }, []),
  );

  return (
    <View style={styles.container}>
      <GoBackButton variant="close" />
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}>
          <Section footer={<ProfileFooter />}>
            <AccountProfileCard
              username={user?.username ?? ""}
              tintColor={colors.main}
              onPress={handleProfilePress}
            />
          </Section>

          <Section
            header={
              <SettingsSectionHeader
                title={i18n.t("screen.account.views.title")}
              />
            }
          >
            <NativeSettingsRow
              label={i18n.t("screen.account.views.movies")}
              onPress={() => handleViewsPress("movie")}
            />
            <NativeSettingsRow
              label={i18n.t("screen.account.views.tv")}
              onPress={() => handleViewsPress("tv")}
            />
          </Section>

          {downloadsReady ? (
            <Section
              header={
                <SettingsSectionHeader
                  title={i18n.t("screen.account.owned.title")}
                />
              }
            >
              {radarrReady ? (
                <NativeSettingsRow
                  label={i18n.t("screen.account.owned.movies")}
                  onPress={() => handleOwnedMediaPress("movie")}
                />
              ) : null}
              {sonarrReady ? (
                <NativeSettingsRow
                  label={i18n.t("screen.account.owned.tv")}
                  onPress={() => handleOwnedMediaPress("tv")}
                />
              ) : null}
            </Section>
          ) : null}

          {downloadsReady ? (
            <Section
              header={
                <SettingsSectionHeader
                  title={i18n.t("screen.account.downloads.title")}
                />
              }
            >
              <NativeSettingsRow
                label={i18n.t("screen.account.downloads.requests")}
                onPress={handleDownloadsPress}
              />
            </Section>
          ) : null}

          <Section>
            <NativeSettingsRow
              label={i18n.t("screen.account.settings.title")}
              onPress={handleSettingsPress}
            />
          </Section>

          <Section>
            <NativeSettingsRow
              label={i18n.t("form.auth.submit.logout")}
              labelColor={destructiveColor}
              showChevron={false}
              onPress={handleLogout}
            />
          </Section>
        </List>
      </Host>
    </View>
  );
}

function AccountProfileCard({
  username,
  tintColor,
  onPress,
}: {
  username: string;
  tintColor: string;
  onPress: () => void;
}) {
  const initial = username.charAt(0).toUpperCase();

  return (
    <Button
      onPress={onPress}
      modifiers={[buttonStyle("automatic"), padding({ all: 2 })]}
    >
      <HStack
        alignment="center"
        spacing={14}
        modifiers={[frame({ maxWidth: 999 }), contentShape(shapes.rectangle())]}
      >
        <ZStack
          modifiers={[
            frame({ width: 51, height: 51 }),
            background(tintColor, shapes.circle()),
          ]}
        >
          <SwiftText
            modifiers={[settingsBoldFont(26), foregroundStyle("white")]}
          >
            {initial}
          </SwiftText>
        </ZStack>

        <VStack alignment="leading" spacing={2}>
          <SwiftText
            modifiers={[
              settingsBoldFont(18),
              foregroundStyle(PlatformColor("label")),
            ]}
          >
            {username}
          </SwiftText>
          <SwiftText
            modifiers={[
              settingsRegularFont(TOKENS.font.lg),
              foregroundStyle(PlatformColor("secondaryLabel")),
            ]}
          >
            {i18n.t("screen.account.viewProfile")}
          </SwiftText>
        </VStack>

        <Spacer />
        <SwiftImage
          systemName="chevron.right"
          size={14}
          color={PlatformColor("tertiaryLabel")}
        />
      </HStack>
    </Button>
  );
}

function ProfileFooter() {
  return (
    <SwiftText
      modifiers={[
        settingsRegularFont(TOKENS.font.md),
        foregroundStyle({ type: "hierarchical", style: "secondary" }),
        padding({ bottom: 8 }),
      ]}
    >
      {i18n.t("screen.account.profileDescription")}
    </SwiftText>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  host: {
    flex: 1,
    marginTop: -12,
  },
});
