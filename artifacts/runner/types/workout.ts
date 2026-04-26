export type Workout = {
  id: string;
  date: string;
  distanceKm: number;
  durationSec: number;
  notes?: string;
  feeling?: "great" | "good" | "tough";
};

export type MonthlyStats = {
  monthLabel: string;
  monthKey: string;
  runs: number;
  distanceKm: number;
  durationSec: number;
};
