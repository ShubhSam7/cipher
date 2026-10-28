import Logo from "@/components/Logo";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.18),transparent_70%)]"
      />
      <main className="relative w-full max-w-md">
        <Logo className="mx-auto mb-8 flex" />
        <div className="rounded-2xl border bg-card/80 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="mb-1 text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      </main>
    </div>
  );
}
