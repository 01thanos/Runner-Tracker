import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { generateId, loadWorkouts, saveWorkouts } from "@/lib/storage";
import { monthKey } from "@/lib/format";
import { MonthlyStats, Workout } from "@/types/workout";

type WorkoutContextValue = {
  workouts: Workout[];
  loading: boolean;
  addWorkout: (input: Omit<Workout, "id">) => Promise<Workout>;
  deleteWorkout: (id: string) => Promise<void>;
  monthlyStats: MonthlyStats[];
  currentMonth: MonthlyStats;
  totals: { runs: number; distanceKm: number; durationSec: number };
  streakDays: number;
};

const WorkoutContext = createContext<WorkoutContextValue | undefined>(
  undefined,
);

function emptyMonth(date: Date): MonthlyStats {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
  return {
    monthKey: key,
    monthLabel: date.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    }),
    runs: 0,
    distanceKm: 0,
    durationSec: 0,
  };
}

function computeStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;
  const dayKeys = new Set<string>();
  for (const w of workouts) {
    const d = new Date(w.date);
    dayKeys.add(
      `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
    );
  }

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const todayKey = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
  if (!dayKeys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const k = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (dayKeys.has(k)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadWorkouts().then((data) => {
      if (!mounted) return;
      const sorted = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setWorkouts(sorted);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: Workout[]) => {
    setWorkouts(next);
    await saveWorkouts(next);
  }, []);

  const addWorkout = useCallback(
    async (input: Omit<Workout, "id">) => {
      const w: Workout = { ...input, id: generateId() };
      const next = [w, ...workouts].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      await persist(next);
      return w;
    },
    [persist, workouts],
  );

  const deleteWorkout = useCallback(
    async (id: string) => {
      const next = workouts.filter((w) => w.id !== id);
      await persist(next);
    },
    [persist, workouts],
  );

  const monthlyStats = useMemo<MonthlyStats[]>(() => {
    const map = new Map<string, MonthlyStats>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = emptyMonth(d);
      map.set(m.monthKey, m);
    }
    for (const w of workouts) {
      const key = monthKey(w.date);
      const existing = map.get(key);
      if (existing) {
        existing.runs += 1;
        existing.distanceKm += w.distanceKm;
        existing.durationSec += w.durationSec;
      }
    }
    return Array.from(map.values());
  }, [workouts]);

  const currentMonth = useMemo<MonthlyStats>(() => {
    const last = monthlyStats[monthlyStats.length - 1];
    return last ?? emptyMonth(new Date());
  }, [monthlyStats]);

  const totals = useMemo(() => {
    return workouts.reduce(
      (acc, w) => {
        acc.runs += 1;
        acc.distanceKm += w.distanceKm;
        acc.durationSec += w.durationSec;
        return acc;
      },
      { runs: 0, distanceKm: 0, durationSec: 0 },
    );
  }, [workouts]);

  const streakDays = useMemo(() => computeStreak(workouts), [workouts]);

  const value: WorkoutContextValue = {
    workouts,
    loading,
    addWorkout,
    deleteWorkout,
    monthlyStats,
    currentMonth,
    totals,
    streakDays,
  };

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
}

export function useWorkouts() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) {
    throw new Error("useWorkouts must be used within WorkoutProvider");
  }
  return ctx;
}
