import { useId } from "react";
export function SquigglePattern() { const id = useId(); return <svg width="100%" height="100%" aria-hidden="true"><defs><pattern id={id} width="80" height="60" patternUnits="userSpaceOnUse"><path d="M10 35Q20 5 30 30T55 25" fill="none" stroke="currentColor" strokeWidth="2"/></pattern></defs><rect width="100%" height="100%" fill={`url(#${id})`}/></svg>; }
