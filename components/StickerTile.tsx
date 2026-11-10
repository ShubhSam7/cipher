import type { Tone } from "@/lib/avatar";
import { Doodle, type DoodleName } from "./decor/Doodles";
export function StickerTile({ tone = "lime", title, children, doodle, compact = false, className = "" }: { tone?: Tone; title?: string; children: React.ReactNode; doodle?: DoodleName; compact?: boolean; className?: string }) { return <section data-tone={tone} className={`sticker ${compact ? "sticker--compact" : ""} ${className}`}>{doodle && <Doodle name={doodle} className="mb-4"/>}{title && <h2 className="section-title mb-2">{title}</h2>}{children}</section>; }
