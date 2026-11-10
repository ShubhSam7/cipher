import { toneFor } from "@/lib/avatar";
export function CommunityMark({ slug, name, className = "" }: { slug: string; name: string; className?: string }) { return <span className={`community-mark ${className}`} data-tone={toneFor(slug)} aria-hidden="true">{Array.from(name)[0]?.toUpperCase()}</span>; }
