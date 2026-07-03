import { ColorValue, PlatformColor, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BADGE_COLORS, FONTS, TOKENS } from "@/constants/theme";
import type { ProfileBadge } from "@/services/badges";

type ProfileBadgeRowProps = {
  badge: ProfileBadge;
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
  secondaryTextColor?: ColorValue;
  progressTrackColor?: ColorValue;
};

export default function ProfileBadgeRow({
  badge,
  backgroundColor = PlatformColor("systemBackground"),
  textColor = PlatformColor("label"),
  secondaryTextColor = PlatformColor("secondaryLabel"),
  progressTrackColor = PlatformColor("systemGray5"),
}: ProfileBadgeRowProps) {
  const clampedCurrent = Math.min(badge.current, badge.target);
  const progress = badge.target > 0 ? clampedCurrent / badge.target : 0;
  const palette = badge.unlocked ? BADGE_COLORS[badge.tier] : BADGE_COLORS.locked;

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <View style={styles.content}>
        <LinearGradient
          colors={palette.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.medallion, !badge.unlocked && styles.lockedMedallion]}
        >
          <Ionicons name={badge.icon} size={24} color="#fff" />
        </LinearGradient>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {badge.title}
          </Text>
          <Text
            style={[styles.description, { color: secondaryTextColor }]}
            numberOfLines={1}
          >
            {badge.description}
          </Text>
          <View style={styles.progressRow}>
            <View style={[styles.progressTrack, { backgroundColor: progressTrackColor }]}> 
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: palette.progress,
                    width: `${progress * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: secondaryTextColor }]}> 
              {clampedCurrent} / {badge.target}
            </Text>
          </View>
        </View>

        <View style={styles.trailingIcon}>
          {badge.unlocked ? (
            <Ionicons name="checkmark-circle" size={22} color={palette.progress} />
          ) : (
            <Ionicons name="lock-closed" size={18} color={secondaryTextColor} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: TOKENS.margin.horizontal,
    paddingRight: 12,
  },
  medallion: {
    width: 60,
    height: 60,
    borderRadius: TOKENS.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.45)",
  },
  lockedMedallion: {
    opacity: 0.55,
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
    gap: 2,
  },
  title: {
    fontSize: TOKENS.font.xxl,
    fontFamily: FONTS.bold,
    lineHeight: 20,
  },
  description: {
    fontSize: TOKENS.font.md,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: TOKENS.radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: TOKENS.radius.full,
  },
  progressText: {
    width: 48,
    textAlign: "right",
    fontSize: TOKENS.font.sm,
    fontFamily: FONTS.medium,
    lineHeight: 16,
  },
  trailingIcon: {
    width: 22,
    alignItems: "flex-end",
    marginLeft: 8,
  },
});
