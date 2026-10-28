import Logo from "@/components/Logo";
import { MessageCircle, ShieldCheck } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="auth-shell">
      <aside className="auth-story">
        <Logo />
        <div className="auth-story-copy">
          <MessageCircle className="mb-6 h-8 w-8 text-primary" aria-hidden />
          <h2>A little more campus. A little more you.</h2>
          <p>Big questions, small observations, and the conversations between classes. There’s a place for all of it here.</p>
          <div className="mt-8 flex items-start gap-3 border-t pt-6 text-sm text-muted-foreground">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0" aria-hidden />
            <span>For verified IIIT Nagpur students.<br />Participate with a public pseudonym.</span>
          </div>
        </div>
        <p className="metadata">Your campus. Your conversations.</p>
      </aside>
      <main className="auth-main">
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{subtitle}</p>
        {children}
        <div className="auth-footer">{footer}</div>
      </main>
    </div>
  );
}
