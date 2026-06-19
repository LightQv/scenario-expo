import { useEffect } from "react";
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
import {
  cancelAnimation,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
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
  driftX: number;
  driftY: number;
  driftOpacity: number;
  driftRotation: number;
  phase: number;
};

type AnimatedArtworkCopyProps = {
  image: NonNullable<ReturnType<typeof useImage>>;
  copy: ArtworkCopy;
  motionA: SharedValue<number>;
  motionB: SharedValue<number>;
  motionC: SharedValue<number>;
  reducedMotion: boolean;
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
  const reducedMotion = useReducedMotion();
  const motionA = useSharedValue(0);
  const motionB = useSharedValue(0);
  const motionC = useSharedValue(0);
  const image = useImage(imageUrl ?? null);

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(motionA);
      cancelAnimation(motionB);
      cancelAnimation(motionC);
      motionA.value = 0;
      motionB.value = 0;
      motionC.value = 0;
      return;
    }

    motionA.value = withRepeat(withTiming(1, { duration: 18000 }), -1, true);
    motionB.value = withRepeat(withTiming(1, { duration: 24000 }), -1, true);
    motionC.value = withRepeat(withTiming(1, { duration: 15000 }), -1, true);

    return () => {
      cancelAnimation(motionA);
      cancelAnimation(motionB);
      cancelAnimation(motionC);
    };
  }, [motionA, motionB, motionC, reducedMotion]);

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
      driftX: 10,
      driftY: 14,
      driftOpacity: 0.04,
      driftRotation: 0.025,
      phase: 0.2,
    },
    {
      x: -width * 0.22,
      y: -height * 0.06,
      size: width * 0.58,
      rotation: -0.18,
      opacity: 0.82,
      driftX: 16,
      driftY: 12,
      driftOpacity: 0.06,
      driftRotation: 0.045,
      phase: 1.7,
    },
    {
      x: width * 0.48,
      y: height * 0.02,
      size: width * 0.88,
      rotation: 0.15,
      opacity: 0.62,
      driftX: 14,
      driftY: 18,
      driftOpacity: 0.05,
      driftRotation: 0.035,
      phase: 3.1,
    },
    {
      x: -width * 0.08,
      y: height * 0.28,
      size: width * 1.24,
      rotation: -0.08,
      opacity: 0.58,
      driftX: 8,
      driftY: 16,
      driftOpacity: 0.04,
      driftRotation: 0.022,
      phase: 4.3,
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
            <AnimatedArtworkCopy
              key={`${copy.x}-${copy.y}-${index}`}
              image={image}
              copy={copy}
              motionA={motionA}
              motionB={motionB}
              motionC={motionC}
              reducedMotion={reducedMotion}
            />
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

function AnimatedArtworkCopy({
  image,
  copy,
  motionA,
  motionB,
  motionC,
  reducedMotion,
}: AnimatedArtworkCopyProps) {
  const transform = useDerivedValue(() => {
    if (reducedMotion) {
      return [{ rotate: copy.rotation }];
    }

    const waveA = Math.sin((motionA.value + copy.phase) * Math.PI * 2);
    const waveB = Math.cos((motionB.value + copy.phase * 0.58) * Math.PI * 2);
    const waveC = Math.sin((motionC.value + copy.phase * 0.31) * Math.PI * 2);

    return [
      { translateX: waveA * copy.driftX },
      { translateY: waveB * copy.driftY },
      { rotate: copy.rotation + waveC * copy.driftRotation },
    ];
  });

  const opacity = useDerivedValue(() => {
    if (reducedMotion) {
      return copy.opacity;
    }

    const wave = Math.sin((motionB.value + copy.phase) * Math.PI * 2);
    return copy.opacity + wave * copy.driftOpacity;
  });

  return (
    <Group
      opacity={opacity}
      origin={vec(copy.x + copy.size / 2, copy.y + copy.size / 2)}
      transform={transform}
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
