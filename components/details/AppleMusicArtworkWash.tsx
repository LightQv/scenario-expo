import { StyleSheet, View } from "react-native";
import {
  Blur,
  Canvas,
  ColorMatrix,
  Group,
  Image as SkiaImage,
  LinearGradient,
  Paint,
  Rect,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { colorWithAlpha, type DetailPalette } from "@/services/detailPalette";

type AppleMusicArtworkWashProps = {
  imageUrl: string | undefined;
  palette: DetailPalette;
  scrollY: SharedValue<number>;
  width: number;
  height: number;
};

type ArtworkCopy = {
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
};

const SATURATION_MATRIX = [
  1.62, -0.16, -0.1, 0, 0,
  -0.1, 1.54, -0.1, 0, 0,
  -0.1, -0.14, 1.62, 0, 0,
  0, 0, 0, 1, 0,
];

export default function AppleMusicArtworkWash({
  imageUrl,
  palette,
  width,
  height,
}: AppleMusicArtworkWashProps) {
  const image = useImage(imageUrl ?? null);

  if (!imageUrl || !image) {
    return <View pointerEvents="none" style={styles.container} />;
  }

  const copies: ArtworkCopy[] = [
    {
      x: -width * 0.3,
      y: -height * 0.44,
      size: width * 1.6,
      rotation: 0.04,
      opacity: 0.65,
    },
    {
      x: -width * 0.22,
      y: -height * 0.06,
      size: width * 0.58,
      rotation: -0.18,
      opacity: 0.82,
    },
    {
      x: width * 0.48,
      y: height * 0.02,
      size: width * 0.88,
      rotation: 0.15,
      opacity: 0.62,
    },
    {
      x: -width * 0.08,
      y: height * 0.28,
      size: width * 1.24,
      rotation: -0.08,
      opacity: 0.58,
    },
  ];

  return (
    <View pointerEvents="none" style={styles.container}>
      <Canvas style={styles.canvas}>
        <Rect x={0} y={0} width={width} height={height} color={palette.background} />

        <Group
          layer={
            <Paint>
              <Blur blur={44} mode="clamp" />
              <ColorMatrix matrix={SATURATION_MATRIX} />
            </Paint>
          }
        >
          {copies.map((copy, index) => (
            <Group
              key={`${copy.x}-${copy.y}-${index}`}
              opacity={copy.opacity}
              origin={vec(copy.x + copy.size / 2, copy.y + copy.size / 2)}
              transform={[{ rotate: copy.rotation }]}
            >
              <SkiaImage
                image={image}
                x={copy.x}
                y={copy.y}
                width={copy.size}
                height={copy.size}
                fit="cover"
              />
            </Group>
          ))}
        </Group>

        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(width * 0.16, 0)}
            end={vec(width * 0.9, height)}
            colors={[
              colorWithAlpha(palette.tint, 0.5),
              colorWithAlpha(palette.surface, 0.34),
              colorWithAlpha(palette.background, 0.22),
            ]}
            positions={[0, 0.52, 1]}
          />
        </Rect>

        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(width / 2, 0)}
            end={vec(width / 2, height)}
            colors={[
              colorWithAlpha(palette.background, 0),
              colorWithAlpha(palette.background, 0),
              colorWithAlpha(palette.background, 0.36),
              colorWithAlpha(palette.background, 0.82),
              palette.background,
            ]}
            positions={[0, 0.46, 0.68, 0.9, 1]}
          />
        </Rect>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  canvas: {
    flex: 1,
  },
});
