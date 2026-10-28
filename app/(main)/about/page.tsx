import type { Metadata } from "next";
import { Shield, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Cipher is a closed social platform for verified IIIT Nagpur students.",
};

const features = [
  {
    icon: Shield,
    title: "Verified Campus Only",
    body: "Access restricted to verified college students for authentic campus culture.",
  },
  {
    icon: Users,
    title: "Pseudonymous by design",
    body: "Post without revealing your identity — a pseudonymous username, never your real name or roll number.",
  },
  {
    icon: Zap,
    title: "Live Campus Pulse",
    body: "Real-time trending topics, viral posts, and raw conversations.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      <header className="py-6 text-center">
        <h1 className="mb-4 text-4xl font-bold sm:text-6xl">About Cipher</h1>
        <p className="text-xl text-muted-foreground">Unfiltered campus conversations.</p>
      </header>

      <section className="rounded-3xl border bg-card p-6 sm:p-10">
        <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Our Mission</h2>
        <div className="space-y-4 text-lg leading-relaxed text-foreground/85">
          <p>
            Cipher is a closed social platform designed exclusively for college campuses — where ideas,
            confessions, and conversations flow freely without identity pressure.
          </p>
          <p>
            We believe in creating a space where students can express themselves authentically, share their
            thoughts anonymously, and connect with their campus community in a meaningful way.
          </p>
        </div>
      </section>

      <section aria-label="Features" className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border bg-card p-6 sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <h3 className="mb-3 text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border bg-card p-6 sm:p-10">
        <h2 className="mb-6 text-2xl font-bold">Get in Touch</h2>
        <h3 className="mb-2 font-semibold">Contact</h3>
        <a href="mailto:support@cipher.campus" className="text-primary hover:underline">
          support@cipher.campus
        </a>
      </section>

      <p className="pb-4 text-center text-muted-foreground">© {new Date().getFullYear()} Cipher. Built for campuses.</p>
    </div>
  );
}
