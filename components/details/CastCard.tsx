import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PlatformColor,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { FONTS, TOKENS, BLURHASH } from "@/constants/theme";

type CastCardProps = {
  data: Cast;
};

export default function CastCard({ data }: CastCardProps) {
  const profileUrl = data.profile_path
    ? `https://image.tmdb.org/t/p/w342/${data.profile_path}`
    : null;

  return (
    <Link
      href={{
        pathname: "/details/[id]",
        params: { type: "person", id: data.id.toString() },
      }}
      asChild
      push
    >
      <TouchableOpacity style={styles.container} activeOpacity={0.7}>
        <View style={styles.imageContainer}>
          {profileUrl ? (
            <Image
              source={{ uri: profileUrl }}
              alt={data.name}
              style={styles.image}
              contentFit="cover"
              placeholder={BLURHASH.hash}
              transition={BLURHASH.transition}
            />
          ) : (
            <View
              style={[
                styles.image,
                styles.placeholderImage,
                { backgroundColor: PlatformColor("systemGray4") },
              ]}
            >
              <Text
                style={[
                  styles.placeholderText,
                  { color: PlatformColor("secondaryLabel") },
                ]}
              >
                {data.name?.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.actorName} numberOfLines={1}>
            {data.name}
          </Text>
          {data.character && (
            <Text style={styles.characterName} numberOfLines={1}>
              {data.character}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: PlatformColor("systemGray5"),
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontFamily: FONTS.bold,
    fontSize: 48,
  },
  content: {
    marginTop: 6,
    gap: 2,
  },
  actorName: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
    lineHeight: 18,
    color: PlatformColor("label"),
  },
  characterName: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xs,
    color: PlatformColor("secondaryLabel"),
  },
});
