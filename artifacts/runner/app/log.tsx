import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/hooks/useColors";
import { useWorkouts } from "@/contexts/WorkoutContext";
import { Workout } from "@/types/workout";

type DayChoice = { label: string; offset: number };

const DAY_CHOICES: DayChoice[] = [
  { label: "Today", offset: 0 },
  { label: "Yesterday", offset: 1 },
  { label: "2 days ago", offset: 2 },
];

const FEELINGS: Array<{
  key: NonNullable<Workout["feeling"]>;
  label: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
}> = [
  { key: "great", label: "Great", color: "#7BB07A", icon: "smile" },
  { key: "good", label: "Good", color: "#FFB547", icon: "meh" },
  { key: "tough", label: "Tough", color: "#E5847A", icon: "frown" },
];

export default function LogScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addWorkout } = useWorkouts();
  const isWeb = Platform.OS === "web";

  const [distance, setDistance] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [dayOffset, setDayOffset] = useState(0);
  const [feeling, setFeeling] = useState<Workout["feeling"]>("good");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const distanceKm = useMemo(() => {
    const cleaned = distance.replace(",", ".");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [distance]);

  const durationSec = useMemo(() => {
    const m = parseInt(minutes, 10);
    const s = parseInt(seconds, 10);
    const mins = Number.isFinite(m) && m >= 0 ? m : 0;
    const secs = Number.isFinite(s) && s >= 0 ? s : 0;
    return mins * 60 + secs;
  }, [minutes, seconds]);

  const paceLabel = useMemo(() => {
    if (distanceKm <= 0 || durationSec <= 0) return null;
    const paceSec = durationSec / distanceKm;
    const m = Math.floor(paceSec / 60);
    const s = Math.floor(paceSec % 60);
    return `${m}:${String(s).padStart(2, "0")} /km`;
  }, [distanceKm, durationSec]);

  const canSubmit = distanceKm > 0 && durationSec > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const date = new Date();
    date.setDate(date.getDate() - dayOffset);

    await addWorkout({
      date: date.toISOString(),
      distanceKm,
      durationSec,
      feeling,
      notes: notes.trim() ? notes.trim() : undefined,
    });

    router.back();
  };

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    router.back();
  };

  const headerTopPadding = isWeb ? 67 : insets.top + 8;

  const Container = isWeb ? ScrollView : KeyboardAwareScrollView;
  const containerProps = isWeb
    ? { keyboardShouldPersistTaps: "handled" as const }
    : {
        bottomOffset: 80,
        keyboardShouldPersistTaps: "handled" as const,
      };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: headerTopPadding,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={handleClose}
            hitSlop={12}
            style={({ pressed }) => [
              styles.closeButton,
              {
                backgroundColor: colors.muted,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            New run
          </Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      <Container
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          gap: 22,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
        {...containerProps}
      >
        <Section
          label="When"
          colors={colors}
        >
          <View style={styles.chipsRow}>
            {DAY_CHOICES.map((c) => {
              const active = c.offset === dayOffset;
              return (
                <Pressable
                  key={c.label}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                    setDayOffset(c.offset);
                  }}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: active ? colors.foreground : colors.card,
                      borderColor: active ? colors.foreground : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active
                          ? colors.background
                          : colors.foreground,
                      },
                    ]}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section label="Distance" colors={colors}>
          <View
            style={[
              styles.inputCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground + "99"}
              style={[styles.bigInput, { color: colors.foreground }]}
              maxLength={6}
              returnKeyType="done"
            />
            <Text style={[styles.unit, { color: colors.mutedForeground }]}>
              kilometers
            </Text>
          </View>
        </Section>

        <Section label="Time" colors={colors}>
          <View style={styles.timeRow}>
            <View
              style={[
                styles.timeCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TextInput
                value={minutes}
                onChangeText={(t) =>
                  setMinutes(t.replace(/[^0-9]/g, "").slice(0, 3))
                }
                keyboardType="number-pad"
                placeholder="00"
                placeholderTextColor={colors.mutedForeground + "99"}
                style={[styles.timeInput, { color: colors.foreground }]}
                maxLength={3}
                returnKeyType="done"
              />
              <Text
                style={[styles.timeLabel, { color: colors.mutedForeground }]}
              >
                min
              </Text>
            </View>
            <Text style={[styles.timeSeparator, { color: colors.foreground }]}>
              :
            </Text>
            <View
              style={[
                styles.timeCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TextInput
                value={seconds}
                onChangeText={(t) => {
                  const cleaned = t.replace(/[^0-9]/g, "").slice(0, 2);
                  setSeconds(cleaned);
                }}
                keyboardType="number-pad"
                placeholder="00"
                placeholderTextColor={colors.mutedForeground + "99"}
                style={[styles.timeInput, { color: colors.foreground }]}
                maxLength={2}
                returnKeyType="done"
              />
              <Text
                style={[styles.timeLabel, { color: colors.mutedForeground }]}
              >
                sec
              </Text>
            </View>
          </View>
        </Section>

        {paceLabel ? (
          <View
            style={[
              styles.paceCard,
              {
                backgroundColor: colors.primary + "12",
                borderColor: colors.primary + "33",
              },
            ]}
          >
            <Feather name="zap" size={16} color={colors.primary} />
            <Text style={[styles.paceText, { color: colors.primary }]}>
              Pace · {paceLabel}
            </Text>
          </View>
        ) : null}

        <Section label="How did it feel?" colors={colors}>
          <View style={styles.chipsRow}>
            {FEELINGS.map((f) => {
              const active = feeling === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                    setFeeling(f.key);
                  }}
                  style={({ pressed }) => [
                    styles.feelingChip,
                    {
                      backgroundColor: active ? f.color + "1F" : colors.card,
                      borderColor: active ? f.color : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Feather
                    name={f.icon}
                    size={18}
                    color={active ? f.color : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active ? f.color : colors.foreground,
                      },
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section label="Notes" colors={colors} optional>
          <View
            style={[
              styles.notesCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Route, weather, anything to remember…"
              placeholderTextColor={colors.mutedForeground + "99"}
              multiline
              style={[styles.notesInput, { color: colors.foreground }]}
              maxLength={240}
            />
          </View>
        </Section>
      </Container>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 12,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <PrimaryButton
          label="Save run"
          icon="check"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={submitting}
        />
      </View>
    </View>
  );
}

function Section({
  label,
  optional,
  colors,
  children,
}: {
  label: string;
  optional?: boolean;
  colors: ReturnType<typeof useColors>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          {label}
        </Text>
        {optional ? (
          <Text
            style={[
              styles.sectionOptional,
              { color: colors.mutedForeground },
            ]}
          >
            Optional
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  sectionOptional: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  chipsRow: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
  },
  chipText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  inputCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 22,
    alignItems: "center",
    gap: 6,
  },
  bigInput: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    letterSpacing: -2,
    textAlign: "center",
    minWidth: 160,
    padding: 0,
  },
  unit: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timeCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
  },
  timeInput: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
    textAlign: "center",
    minWidth: 80,
    padding: 0,
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  timeSeparator: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
  },
  paceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  paceText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  feelingChip: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  notesCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 90,
  },
  notesInput: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    minHeight: 60,
    padding: 0,
    textAlignVertical: "top",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
