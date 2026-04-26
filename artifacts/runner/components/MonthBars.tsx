import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { shortMonthLabel } from "@/lib/format";
import { MonthlyStats } from "@/types/workout";

type Props = {
  data: MonthlyStats[];
  currentMonthKey: string;
};

export function MonthBars({ data, currentMonthKey }: Props) {
  const colors = useColors();

  const max = Math.max(1, ...data.map((d) => d.distanceKm));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Distance by month
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Last 6 months
        </Text>
      </View>

      <View style={styles.barsRow}>
        {data.map((m) => {
          const ratio = m.distanceKm / max;
          const heightPct = Math.max(ratio * 100, m.distanceKm > 0 ? 6 : 2);
          const isCurrent = m.monthKey === currentMonthKey;
          return (
            <View key={m.monthKey} style={styles.barCol}>
              <View style={styles.barTrack}>
                <Text
                  style={[
                    styles.barValue,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {m.distanceKm > 0 ? m.distanceKm.toFixed(0) : ""}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${heightPct}%`,
                      backgroundColor: isCurrent
                        ? colors.primary
                        : colors.primary + "55",
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.barLabel,
                  {
                    color: isCurrent
                      ? colors.foreground
                      : colors.mutedForeground,
                    fontFamily: isCurrent
                      ? "Inter_600SemiBold"
                      : "Inter_500Medium",
                  },
                ]}
              >
                {shortMonthLabel(m.monthKey)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 160,
    gap: 8,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    height: "100%",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
  },
  barValue: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  bar: {
    width: "82%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
  },
});
