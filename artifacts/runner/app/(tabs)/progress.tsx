import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MonthBars } from "@/components/MonthBars";
import { StatTile } from "@/components/StatTile";
import { useColors } from "@/hooks/useColors";
import { useWorkouts } from "@/contexts/WorkoutContext";
import {
  formatDistance,
  formatDurationLong,
  formatPace,
  monthLabelFromKey,
} from "@/lib/format";

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const { monthlyStats, currentMonth, totals, workouts } = useWorkouts();

  const previousMonth =
    monthlyStats.length >= 2 ? monthlyStats[monthlyStats.length - 2] : null;

  const distanceDelta = previousMonth
    ? currentMonth.distanceKm - previousMonth.distanceKm
    : 0;

  const longestRun = workouts.reduce(
    (max, w) => (w.distanceKm > max ? w.distanceKm : max),
    0,
  );

  const fastestPaceSecPerKm = workouts.reduce<number | null>((best, w) => {
    if (w.distanceKm <= 0 || w.durationSec <= 0) return best;
    const pace = w.durationSec / w.distanceKm;
    if (best === null || pace < best) return pace;
    return best;
  }, null);

  const fastestPaceLabel =
    fastestPaceSecPerKm === null
      ? "—"
      : formatPace(1, fastestPaceSecPerKm);

  const headerTopPadding = isWeb ? 67 : insets.top + 8;
  const bottomPadding = (isWeb ? 100 : insets.bottom + 80) + 24;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: headerTopPadding,
        paddingBottom: bottomPadding,
        paddingHorizontal: 20,
        gap: 18,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
          Your journey
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Progress
        </Text>
      </View>

      <View
        style={[
          styles.heroCard,
          { backgroundColor: colors.foreground },
        ]}
      >
        <Text style={[styles.heroLabel, { color: colors.background + "AA" }]}>
          {monthLabelFromKey(currentMonth.monthKey).toUpperCase()}
        </Text>
        <View style={styles.heroValueRow}>
          <Text style={[styles.heroValue, { color: colors.background }]}>
            {formatDistance(currentMonth.distanceKm)}
          </Text>
          <Text
            style={[styles.heroUnit, { color: colors.background + "AA" }]}
          >
            km
          </Text>
        </View>
        <View style={styles.heroFooter}>
          <View style={styles.heroFooterItem}>
            <Text
              style={[
                styles.heroFooterLabel,
                { color: colors.background + "99" },
              ]}
            >
              Runs
            </Text>
            <Text
              style={[styles.heroFooterValue, { color: colors.background }]}
            >
              {currentMonth.runs}
            </Text>
          </View>
          <View
            style={[
              styles.heroDivider,
              { backgroundColor: colors.background + "33" },
            ]}
          />
          <View style={styles.heroFooterItem}>
            <Text
              style={[
                styles.heroFooterLabel,
                { color: colors.background + "99" },
              ]}
            >
              Time
            </Text>
            <Text
              style={[styles.heroFooterValue, { color: colors.background }]}
            >
              {formatDurationLong(currentMonth.durationSec)}
            </Text>
          </View>
          <View
            style={[
              styles.heroDivider,
              { backgroundColor: colors.background + "33" },
            ]}
          />
          <View style={styles.heroFooterItem}>
            <Text
              style={[
                styles.heroFooterLabel,
                { color: colors.background + "99" },
              ]}
            >
              vs last
            </Text>
            <View style={styles.deltaRow}>
              <Feather
                name={distanceDelta >= 0 ? "trending-up" : "trending-down"}
                size={14}
                color={
                  distanceDelta >= 0 ? colors.accent : colors.destructive
                }
              />
              <Text
                style={[
                  styles.heroFooterValue,
                  {
                    color:
                      distanceDelta >= 0
                        ? colors.accent
                        : colors.destructive,
                  },
                ]}
              >
                {distanceDelta >= 0 ? "+" : ""}
                {formatDistance(Math.abs(distanceDelta))}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <MonthBars data={monthlyStats} currentMonthKey={currentMonth.monthKey} />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          All-time
        </Text>
      </View>

      <View style={styles.gridRow}>
        <StatTile
          label="Distance"
          value={formatDistance(totals.distanceKm)}
          unit="km"
        />
        <StatTile label="Runs" value={String(totals.runs)} />
      </View>

      <View style={styles.gridRow}>
        <StatTile
          label="Total time"
          value={formatDurationLong(totals.durationSec)}
        />
        <StatTile
          label="Longest run"
          value={formatDistance(longestRun)}
          unit="km"
        />
      </View>

      <View style={styles.gridRow}>
        <StatTile
          label="Best pace"
          value={fastestPaceLabel}
          unit="/km"
        />
        <StatTile
          label="Avg pace"
          value={
            totals.distanceKm > 0
              ? formatPace(totals.distanceKm, totals.durationSec)
              : "—"
          }
          unit="/km"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  title: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  heroCard: {
    borderRadius: 26,
    padding: 24,
    gap: 14,
  },
  heroLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  heroValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  heroValue: {
    fontSize: 64,
    fontFamily: "Inter_700Bold",
    letterSpacing: -2,
  },
  heroUnit: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
  },
  heroFooterItem: {
    flex: 1,
    gap: 4,
  },
  heroFooterLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  heroFooterValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  heroDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 6,
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  gridRow: {
    flexDirection: "row",
    gap: 10,
  },
});
