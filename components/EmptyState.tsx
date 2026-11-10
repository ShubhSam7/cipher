import type { Tone } from "@/lib/avatar";
import { Doodle, type DoodleName } from "./decor/Doodles";
export function EmptyState({ tone = "lime", doodle = "Bubble", title, body, action }: { tone?: Tone; doodle?: DoodleName; title: string; body?: string; action?: React.ReactNode }) { return <div className="empty-state" data-tone={tone}><Doodle name={doodle}/><h2 className="section-title">{title}</h2>{body && <p>{body}</p>}{action}</div>; }
