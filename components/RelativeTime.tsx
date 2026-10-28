import { formatAbsoluteTime, formatRelativeTime } from "@/lib/format";

export default function RelativeTime({ date, className }: { date: string; className?: string }) {
  return (
    <time dateTime={date} title={formatAbsoluteTime(date)} className={className} suppressHydrationWarning>
      {formatRelativeTime(date)}
    </time>
  );
}
