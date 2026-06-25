import { useEffect, useState } from "react";
import { PlatformColor, StyleSheet, Text, TextInput, View } from "react-native";
import { FONTS, TOKENS } from "@/constants/theme";

type SettingsEditableRowProps = {
  label: string;
  value?: string | number | null;
  placeholder?: string;
  secret?: boolean;
  keyboardType?: "default" | "number-pad" | "numeric" | "url";
  showDivider?: boolean;
  onSave: (value: string) => Promise<void>;
};

export default function SettingsEditableRow({
  label,
  value,
  placeholder,
  secret = false,
  keyboardType = "default",
  showDivider = false,
  onSave,
}: SettingsEditableRowProps) {
  const [draft, setDraft] = useState(value == null ? "" : String(value));
  const [focusedValue, setFocusedValue] = useState(draft);
  const [state, setState] = useState<"idle" | "saving" | "failed">("idle");

  useEffect(() => {
    if (!secret) {
      setDraft(value == null ? "" : String(value));
    }
  }, [secret, value]);

  const handleBlur = async () => {
    if (draft === focusedValue || (!draft && secret)) {
      return;
    }
    setState("saving");
    try {
      await onSave(draft);
      setState("idle");
      if (secret) {
        setDraft("");
      }
    } catch {
      setState("failed");
      setDraft(focusedValue);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.content}>
        <View style={styles.contentRow}>
          <Text style={[styles.label, { color: PlatformColor("label") }]}>{label}</Text>
          <View style={styles.trailing}>
            <TextInput
              style={[styles.input, { color: PlatformColor("secondaryLabel") }]}
              value={draft}
              placeholder={placeholder}
              placeholderTextColor={PlatformColor("tertiaryLabel")}
              secureTextEntry={secret}
              keyboardType={keyboardType}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedValue(draft)}
              onBlur={handleBlur}
              onChangeText={setDraft}
            />
            {state !== "idle" ? (
              <Text style={[styles.state, { color: PlatformColor("tertiaryLabel") }]}> 
                {state === "saving" ? "Saving" : "Failed"}
              </Text>
            ) : null}
          </View>
        </View>
        {showDivider ? <View style={[styles.divider, { backgroundColor: PlatformColor("separator") }]} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 50, paddingLeft: 16 },
  content: { flex: 1, minHeight: 50, justifyContent: "center" },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingRight: 14,
    paddingVertical: 11,
  },
  label: { flex: 1, fontFamily: FONTS.regular, fontSize: TOKENS.font.xxl },
  trailing: { flex: 1.15, alignItems: "flex-end", gap: 2 },
  input: {
    width: "100%",
    textAlign: "right",
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
    padding: 0,
  },
  state: { fontFamily: FONTS.regular, fontSize: TOKENS.font.xs },
  divider: { height: StyleSheet.hairlineWidth },
});
