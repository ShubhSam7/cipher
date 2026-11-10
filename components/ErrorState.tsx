"use client";
import { Button } from "./ui/Button";
import { Doodle } from "./decor/Doodles";
export function ErrorState({ title = "Something went wrong.", body, retry, compact = false }: { title?: string; body?: string; retry?: () => void; compact?: boolean }) { return <div role="alert" data-tone="sun" className={compact ? "feedback-panel flex-col" : "empty-state"}><Doodle name="Chai"/><h2 className="section-title">{title}</h2>{body && <p>{body}</p>}{retry && <Button onClick={retry} variant="outline">Try again</Button>}</div>; }
