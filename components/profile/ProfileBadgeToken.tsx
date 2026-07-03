import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TOKENS } from "@/constants/theme";
import type { BadgeTier } from "@/services/badges";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type ProfileBadgeTokenProps = {
  badgeId: string;
  icon: IoniconName;
  tier: BadgeTier | "locked";
  mastered: boolean;
};

type BadgeCategory =
  | "movie"
  | "tv"
  | "collection"
  | "download"
  | "watchlist"
  | "genre"
  | "watchtime"
  | "special";

const MATERIALS = {
  locked: {
    shell: ["#1F232A", "#626874", "#A5A9B2"],
    face: ["#3A3F48", "#777D88"],
    icon: "#E5E7EB",
    rim: "rgba(255,255,255,0.22)",
    glow: "rgba(255,255,255,0.14)",
    shadow: "#000000",
  },
  bronze: {
    shell: ["#5A2E1D", "#B8733E", "#FFD0A0"],
    face: ["#8B4D2A", "#E1A166"],
    icon: "#2B160F",
    rim: "rgba(255,232,205,0.62)",
    glow: "rgba(255,221,180,0.45)",
    shadow: "#6F351E",
  },
  silver: {
    shell: ["#5D6570", "#C8D0DA", "#FFFFFF"],
    face: ["#8E98A6", "#EDF1F5"],
    icon: "#26313D",
    rim: "rgba(255,255,255,0.76)",
    glow: "rgba(255,255,255,0.58)",
    shadow: "#64707D",
  },
  gold: {
    shell: ["#7A4A00", "#D99A1E", "#FFF1A8"],
    face: ["#B97900", "#FFD760"],
    icon: "#352000",
    rim: "rgba(255,245,188,0.72)",
    glow: "rgba(255,235,135,0.55)",
    shadow: "#8C5A00",
  },
  platinum: {
    shell: ["#33455A", "#B7DDE8", "#FFFDF8"],
    face: ["#80BFD2", "#FBFBF2"],
    icon: "#183142",
    rim: "rgba(255,255,255,0.84)",
    glow: "rgba(210,246,255,0.68)",
    shadow: "#496F80",
  },
} as const;

function getCategory(badgeId: string): BadgeCategory {
  const normalizedId = badgeId.toLowerCase();

  if (badgeId.startsWith("movieCount") || badgeId === "classicMovieI" || badgeId === "doubleFeatureI") return "movie";
  if (badgeId.startsWith("tvShowCount") || badgeId === "seasonHunterI") return "tv";
  if (badgeId.startsWith("movieCollection")) return "collection";
  if (badgeId.startsWith("downloadRequest")) return "download";
  if (badgeId.startsWith("watchlist")) return "watchlist";
  if (badgeId.startsWith("watchtime")) return "watchtime";
  if (
    normalizedId.includes("adventure") ||
    normalizedId.includes("horror") ||
    normalizedId.includes("comedy") ||
    normalizedId.includes("fantasy") ||
    normalizedId.includes("mystery") ||
    normalizedId.includes("romance") ||
    normalizedId.includes("drama") ||
    normalizedId.includes("animation") ||
    normalizedId.startsWith("genre")
  ) return "genre";
  return "special";
}

export default function ProfileBadgeToken({ badgeId, icon, tier, mastered }: ProfileBadgeTokenProps) {
  const material = MATERIALS[tier];
  const category = getCategory(badgeId);
  const categoryStyles = tokenStyles[category];

  return (
    <View style={[styles.shadow, { shadowColor: material.shadow }, tier === "locked" && styles.locked]}>
      <LinearGradient
        colors={material.shell}
        locations={[0, 0.58, 1]}
        start={{ x: 0.12, y: 0.08 }}
        end={{ x: 0.88, y: 0.92 }}
        style={[styles.shell, categoryStyles.shell]}
      >
        <View style={[styles.rim, categoryStyles.rim, { borderColor: material.rim }]} />
        <LinearGradient
          colors={material.face}
          start={{ x: 0.18, y: 0.08 }}
          end={{ x: 0.82, y: 0.92 }}
          style={[styles.face, categoryStyles.face]}
        >
          <View style={[styles.highlight, { backgroundColor: material.glow }]} />
          <View style={[styles.lowlight, categoryStyles.lowlight]} />
          {category === "watchlist" && <View style={styles.cardStripe} />}
          {category === "tv" && <View style={styles.tvStand} />}
          {category === "collection" && <View style={styles.collectionBase} />}
          <Ionicons name={icon} size={category === "genre" ? 26 : 24} color={material.icon} />
        </LinearGradient>
        {mastered && (
          <View style={styles.masteryDot}>
            <Ionicons name="checkmark" size={9} color="#18202A" />
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    width: 64,
    height: 64,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  locked: {
    opacity: 0.58,
    shadowOpacity: 0.08,
  },
  shell: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  rim: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  face: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    top: 7,
    left: 9,
    width: 20,
    height: 9,
    borderRadius: TOKENS.radius.full,
    transform: [{ rotate: "-22deg" }],
  },
  lowlight: {
    position: "absolute",
    right: -7,
    bottom: -8,
    width: 32,
    height: 24,
    borderRadius: TOKENS.radius.full,
    backgroundColor: "rgba(0,0,0,0.11)",
  },
  cardStripe: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 17,
    height: 2,
    borderRadius: TOKENS.radius.full,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  tvStand: {
    position: "absolute",
    bottom: 5,
    width: 16,
    height: 3,
    borderRadius: TOKENS.radius.full,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  collectionBase: {
    position: "absolute",
    bottom: 8,
    width: 28,
    height: 4,
    borderRadius: TOKENS.radius.full,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  masteryDot: {
    position: "absolute",
    right: 4,
    bottom: 5,
    width: 18,
    height: 18,
    borderRadius: TOKENS.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.12)",
  },
});

const tokenStyles = {
  movie: StyleSheet.create({
    shell: { borderRadius: TOKENS.radius.full },
    rim: { borderRadius: TOKENS.radius.full },
    face: { borderRadius: TOKENS.radius.full },
    lowlight: {},
  }),
  tv: StyleSheet.create({
    shell: { borderRadius: 18 },
    rim: { borderRadius: 18 },
    face: { width: 50, height: 38, borderRadius: 12 },
    lowlight: { bottom: -10 },
  }),
  collection: StyleSheet.create({
    shell: { borderRadius: 16 },
    rim: { borderRadius: 16 },
    face: { width: 48, height: 42, borderRadius: 10 },
    lowlight: {},
  }),
  download: StyleSheet.create({
    shell: { borderRadius: 24 },
    rim: { borderRadius: 24 },
    face: { width: 50, height: 36, borderRadius: 18 },
    lowlight: { bottom: -12 },
  }),
  watchlist: StyleSheet.create({
    shell: { borderRadius: 15, transform: [{ rotate: "-4deg" }] },
    rim: { borderRadius: 15 },
    face: { width: 44, height: 48, borderRadius: 11 },
    lowlight: {},
  }),
  genre: StyleSheet.create({
    shell: { borderRadius: 20, transform: [{ rotate: "45deg" }] },
    rim: { borderRadius: 20 },
    face: { borderRadius: 16, transform: [{ rotate: "-45deg" }] },
    lowlight: {},
  }),
  watchtime: StyleSheet.create({
    shell: { borderRadius: TOKENS.radius.full },
    rim: { borderRadius: TOKENS.radius.full },
    face: { width: 46, height: 46, borderRadius: TOKENS.radius.full },
    lowlight: {},
  }),
  special: StyleSheet.create({
    shell: { borderRadius: 19 },
    rim: { borderRadius: 19 },
    face: { width: 48, height: 48, borderRadius: 17 },
    lowlight: {},
  }),
} as const;
