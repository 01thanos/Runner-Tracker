import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyRuns } from "@/components/EmptyRuns";
import { RunCard } from "@/components/RunCard";
import { StatTile } from "@/components/StatTile";
import { useColors } from "@/hooks/useColors";
import { formatDistance, monthLabelFromKey } from "@/lib/format";
import { useWorkouts } from "@/contexts/WorkoutContext";

export default function RunsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const { workouts, loading, deleteWorkout, currentMonth, streakDays } =
    useWorkouts();

  const handleAdd = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/log");
  };

  const headerTopPadding = isWeb ? 67 : insets.top + 8;
  const listBottomPadding = (isWeb ? 100 : insets.bottom + 80) + 24;

  if (loading) {
    return (
      <View
        style={[styles.loading, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: headerTopPadding,
          paddingBottom: listBottomPadding,
          paddingHorizontal: 20,
          gap: 12,
        }}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.greeting,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {monthLabelFromKey(currentMonth.monthKey)}
                </Text>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  Runs
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatTile
                label="This month"
                value={formatDistance(currentMonth.distanceKm)}
                unit="km"
                accent
              />
              <StatTile
                label="Runs"
                value={String(currentMonth.runs)}
              />
              <StatTile
                label="Streak"
                value={String(streakDays)}
                unit={streakDays === 1 ? "day" : "days"}
              />
            </View>

            {workouts.length > 0 ? (
              <View style={styles.recentRow}>
                <Text
                  style={[styles.recentTitle, { color: colors.foreground }]}
                >
                  Recent
                </Text>
                <Text
                  style={[
                    styles.recentCount,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {workouts.length} total
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={<EmptyRuns onPress={handleAdd} />}
        renderItem={({ item }) => (
          <RunCard workout={item} onDelete={deleteWorkout} />
        )}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            opacity: pressed ? 0.85 : 1,
            bottom: (isWeb ? 100 : insets.bottom + 80) + 8,
            shadowColor: colors.primary,
          },
        ]}
      >
        <Feather name="plus" size={26} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerWrap: {
    gap: 18,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  greeting: {
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
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  recentTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  recentCount: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
