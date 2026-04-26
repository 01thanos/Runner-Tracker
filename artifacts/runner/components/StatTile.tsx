import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  style?: ViewStyle;
};

export function StatTile({ label, value, unit, accent, style }: Props) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: accent ? colors.primary : colors.card,
          borderColor: accent ? "transparent" : colors.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: accent ? colors.primaryForeground : colors.mutedForeground },
        ]}
      >
        {label.toUpperCase()}
      </Text>
      <View style={styles.valueRow}>
        <Text
          style={[
            styles.value,
            { color: accent ? colors.primaryForeground : colors.foreground },
          ]}
        >
          {value}
        </Text>
        {unit ? (
          <Text
            style={[
              styles.unit,
              {
                color: accent
                  ? colors.primaryForeground
                  : colors.mutedForeground,
              },
            ]}
          >
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    flex: 1,
    gap: 10,
    minHeight: 96,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
