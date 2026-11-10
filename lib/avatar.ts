export type Tone = "lime" | "peach" | "lavender" | "sky" | "sun" | "rose" | "neutral";
const tones: Tone[] = ["lime", "peach", "lavender", "sky", "sun", "rose"];
const shapes = ["blob", "ring", "stripes", "dots", "wedge"] as const;
export function hashString(value: string) { let hash = 2166136261; for (let i = 0; i < value.length; i++) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
export function toneFor(key: string): Tone { return tones[hashString(key) % tones.length]; }
export function avatarIdentity(handle: string) { const key = handle.replace(/^u\//, ""); const hash = hashString(key); return { tone: toneFor(key), shape: shapes[(hash >>> 8) % shapes.length], rotation: (hash % 8) * 45, initial: Array.from(key)[0]?.toUpperCase() || "?" }; }
