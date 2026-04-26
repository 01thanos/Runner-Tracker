import AsyncStorage from "@react-native-async-storage/async-storage";

import { Workout } from "@/types/workout";

const KEY = "runner.workouts.v1";

export async function loadWorkouts(): Promise<Workout[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Workout[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export async function saveWorkouts(workouts: Workout[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(workouts));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
