import Link from "next/link";
import { ArrowUpRight, MessageCircle, ShieldCheck, Users, VenetianMask } from "lucide-react";
import Logo from "@/components/Logo";
import HomeNavbar from "@/components/HomeNavbar";
import HeroActions from "@/components/landing/HeroActions";
import { UserAvatar } from "@/components/ui/avatar";

const preview = [
  { handle: "midnight_mango", context: "Campus life", body: "The best part of an 8 am lecture is the chai with everyone after. That’s the post." },
  { handle: "quiet_orbit", context: "Study circle", body: "Anyone up for a library study session? Working through graphs and could use a fresh perspective." },
  { handle: "paper_plane", context: "Campus life", body: "A small shoutout to whoever returned my notebook to the library desk. You saved my week." },
];
const features = [
  { icon: ShieldCheck, title: "One campus, shared context", body: "Join with your IIIT Nagpur email. Talk to people who know the places, classes, and little things you mean." },
  { icon: VenetianMask, title: "A pseudonym that’s yours", body: "Choose a public handle. Your email isn’t displayed on your profile or alongside your conversations." },
  { icon: Users, title: "Find your corner", body: "Discover communities, ask a question, or take part in a campus poll. Start with what interests you." },
];

export default function Home() {
  return (
    <div className="landing">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-4">Skip to content</a>
      <HomeNavbar />
      <main id="main">
        <section className="landing-hero" aria-labelledby="hero-heading">
          <div>
            <p className="landing-eyebrow"><span className="eyebrow-rule" aria-hidden /> The IIIT Nagpur campus network</p>
            <h1 id="hero-heading" className="landing-title">Your campus.<br /><span className="text-primary">Your conversations.</span></h1>
            <p className="landing-copy">For the thoughts between classes. The questions after hours. And the people who get it. A campus space to read, share, and be yourself.</p>
            <HeroActions />
            <p className="metadata mt-6">Campus email to join. Public pseudonym to participate.</p>
          </div>
          <div className="landing-preview" aria-label="Illustrative feed preview">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b pb-4">
              <span className="section-title">Around campus</span>
              <span className="status-badge">Illustrative preview</span>
            </div>
            {preview.map(post => <article className="preview-post" key={post.handle}>
              <header className="mb-3 flex items-center gap-3"><UserAvatar handle={post.handle} /><div className="min-w-0"><p className="text-sm font-semibold">u/{post.handle}</p><p className="metadata">{post.context}</p></div></header>
              <p className="content-body">{post.body}</p>
              <div className="metadata mt-3 flex items-center gap-2"><MessageCircle className="h-4 w-4" aria-hidden /><span>A conversation starts here</span></div>
            </article>)}
          </div>
        </section>
        <section className="landing-section" aria-labelledby="features-heading">
          <p className="section-label mb-3">More than the class group chat</p>
          <h2 id="features-heading" className="page-title">Make room for a different conversation.</h2>
          <div className="landing-features">{features.map(({icon: Icon, title, body}, index) => <article key={title}>
            <div className="mb-4 flex items-center justify-between"><Icon className="h-6 w-6 text-muted-foreground" aria-hidden /><span className="metadata">0{index + 1}</span></div>
            <h3 className="section-title mb-3">{title}</h3><p className="text-muted-foreground">{body}</p>
          </article>)}</div>
        </section>
      </main>
      <footer className="public-footer"><div><Logo /><p className="mt-2">© {new Date().getFullYear()} Cipher · Built for campus.</p></div><Link href="/about" className="text-action">Get to know Cipher <ArrowUpRight className="h-4 w-4" aria-hidden /></Link></footer>
    </div>
  );
}
