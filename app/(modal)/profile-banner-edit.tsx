import {
  StyleSheet,
  View,
  PlatformColor,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useState, useLayoutEffect } from "react";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import i18n from "@/services/i18n";
import { useUserContext } from "@/contexts";
import { TOKENS, THEME_COLORS, BLURHASH } from "@/constants/theme";
import { router, useNavigation } from "expo-router";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import { CONFIG } from "@/services/config";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
// Banner preview with vertical aspect ratio for modal display
// Width spans full screen minus padding
const BANNER_WIDTH = width - TOKENS.margin.horizontal * 2;
// Height uses 3:4 vertical ratio (portrait-friendly)
const BANNER_HEIGHT = Math.round((BANNER_WIDTH * 4) / 3);

export default function ProfileBannerEditScreen() {
  const { user, refreshUser } = useUserContext();
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!user) {
    router.replace("/(modal)/login");
    return null;
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      notifyError(i18n.t("form.profile.update.banner.pick"));
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      const filename = selectedImage.split("/").pop() || "banner.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri: selectedImage,
        name: filename,
        type,
      } as any);

      const response = await fetch(
        `${CONFIG.apiBaseUrl}/api/v1/uploads/banner/${user.id}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Banner upload failed:", errorData);
        throw new Error(`Upload failed: ${response.status}`);
      }

      await response.json();

      // Small delay to ensure backend has fully processed
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh user data to get updated banner URL
      await refreshUser();

      notifySuccess(i18n.t("toast.success.banner"));
      router.back();
    } catch (error) {
      console.error("Error uploading banner:", error);
      notifyError(i18n.t("toast.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update header with submit button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!selectedImage || isSubmitting}
          style={styles.headerButton}
          activeOpacity={0.6}
        >
          <Ionicons
            name="checkmark"
            size={24}
            color={
              !selectedImage || isSubmitting
                ? PlatformColor("systemGray")
                : THEME_COLORS.main
            }
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedImage, isSubmitting]);

  // Get the banner to display (selected or current)
  // user.profileBanner is already a full URL from UserContext transformation
  const displayBannerUrl = selectedImage || user.profileBanner || null;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {/* Clickable Banner Preview */}
        <TouchableOpacity
          onPress={pickImage}
          disabled={isSubmitting}
          activeOpacity={0.8}
          style={styles.bannerTouchable}
        >
          <View style={styles.bannerContainer}>
            {displayBannerUrl ? (
              <Image
                source={{ uri: displayBannerUrl }}
                style={styles.bannerImage}
                contentFit="cover"
                placeholder={BLURHASH.hash}
                transition={BLURHASH.transition}
              />
            ) : (
              <View
                style={[
                  styles.bannerImage,
                  { backgroundColor: THEME_COLORS.main },
                ]}
              />
            )}
            {/* Edit Icon at Bottom Center */}
            <View style={styles.editIconContainer}>
              <View style={styles.editIconBackground}>
                <Ionicons name="pencil" size={20} color="#fff" />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: PlatformColor("systemBackground"),
  },
  scrollContent: {
    padding: TOKENS.margin.horizontal,
  },
  container: {
    gap: 20,
  },
  bannerTouchable: {
    width: "100%",
  },
  bannerContainer: {
    width: "100%",
    height: BANNER_HEIGHT,
    borderRadius: TOKENS.radius.md,
    overflow: "hidden",
    backgroundColor: PlatformColor("systemGray5"),
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: [{ translateX: -20 }],
  },
  editIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerButton: {
    paddingLeft: 6,
  },
});
