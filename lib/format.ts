const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });
const absolute = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });
const steps: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000], ["month", 2_592_000], ["week", 604_800],
  ["day", 86_400], ["hour", 3_600], ["minute", 60],
];

export function formatRelativeTime(iso: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  if (Math.abs(seconds) < 60) return "just now";
  const [unit, size] = steps.find(([, size]) => Math.abs(seconds) >= size)!;
  return relative.format(Math.trunc(seconds / size), unit);
}

export function formatAbsoluteTime(iso: string) {
  return absolute.format(new Date(iso));
}
