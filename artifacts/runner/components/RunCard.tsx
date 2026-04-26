import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import {
  formatDateLabel,
  formatDistance,
  formatDurationLong,
  formatPace,
} from "@/lib/format";
import { Workout } from "@/types/workout";

type Props = {
  workout: Workout;
  onDelete: (id: string) => void;
};

const FEELING_META: Record<
  NonNullable<Workout["feeling"]>,
  { label: string; color: string }
> = {
  great: { label: "Great", color: "#7BB07A" },
  good: { label: "Good", color: "#FFB547" },
  tough: { label: "Tough", color: "#E5847A" },
};

export function RunCard({ workout, onDelete }: Props) {
  const colors = useColors();

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Delete run?", `${formatDateLabel(workout.date)}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(workout.id),
      },
    ]);
  };

  const feeling = workout.feeling ? FEELING_META[workout.feeling] : null;

  return (
    <Pressable
      onLongPress={handleLongPress}
      delayLongPress={350}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + "22" },
            ]}
          >
            <Feather name="activity" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.date, { color: colors.foreground }]}>
              {formatDateLabel(workout.date)}
            </Text>
            <Text style={[styles.subDate, { color: colors.mutedForeground }]}>
              {new Date(workout.date).toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
        {feeling ? (
          <View
            style={[
              styles.feelingPill,
              { backgroundColor: feeling.color + "22" },
            ]}
          >
            <View
              style={[styles.feelingDot, { backgroundColor: feeling.color }]}
            />
            <Text style={[styles.feelingText, { color: feeling.color }]}>
              {feeling.label}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <Stat
          value={formatDistance(workout.distanceKm)}
          unit="km"
          label="Distance"
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stat
          value={formatDurationLong(workout.durationSec)}
          label="Time"
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stat
          value={formatPace(workout.distanceKm, workout.durationSec)}
          unit="/km"
          label="Pace"
          colors={colors}
        />
      </View>

      {workout.notes ? (
        <Text style={[styles.notes, { color: colors.mutedForeground }]}>
          {workout.notes}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Stat({
  value,
  unit,
  label,
  colors,
}: {
  value: string;
  unit?: string;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, { color: colors.foreground }]}>
          {value}
        </Text>
        {unit ? (
          <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>
            {unit}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  date: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  subDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  feelingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  feelingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  feelingText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "flex-start",
    gap: 4,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  statUnit: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    width: 1,
    height: 28,
    marginHorizontal: 4,
  },
  notes: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    fontStyle: "italic",
  },
});
