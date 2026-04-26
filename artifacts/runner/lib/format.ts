export function formatDuration(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = Math.floor(totalSec % 60);

  if (hours > 0) {
    return `${hours}h ${String(mins).padStart(2, "0")}m`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function formatDurationLong(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins} min`;
}

export function formatDistance(km: number): string {
  if (km >= 10) return km.toFixed(1);
  return km.toFixed(2);
}

export function formatPace(distanceKm: number, durationSec: number): string {
  if (distanceKm <= 0 || durationSec <= 0) return "—";
  const paceSecPerKm = durationSec / distanceKm;
  const mins = Math.floor(paceSecPerKm / 60);
  const secs = Math.floor(paceSecPerKm % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabelFromKey(key: string): string {
  const [yearStr, monthStr] = key.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const d = new Date(year, month, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function shortMonthLabel(key: string): string {
  const [yearStr, monthStr] = key.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const d = new Date(year, month, 1);
  return d.toLocaleDateString(undefined, { month: "short" });
}
