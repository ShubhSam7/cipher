import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Doodle } from "@/components/decor/Doodles";
import { StickerTile } from "@/components/StickerTile";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { AmbientBackground } from "@/components/decor/AmbientBackground";
import Link from "next/link";
import { ArrowUpRight, Heart, MessageCircle, ShieldCheck, Users, VenetianMask } from "lucide-react";
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
    <div className="landing"><AmbientBackground intensity="public" />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-4">Skip to content</a>
      <HomeNavbar />
      <main id="main">
        <section className="landing-hero" aria-labelledby="hero-heading">
          <div>
            <p className="landing-eyebrow chip">The IIIT Nagpur campus network</p>
            <h1 id="hero-heading" className="landing-title">Your campus.<br /><span className="hero-highlight text-brand">Your conversations.<Doodle name="Underline" className="doodle--keep hero-underline"/></span></h1>
            <p className="landing-copy">For the thoughts between classes. The questions after hours. And the people who get it. A campus space to read, share, and be yourself.</p>
            <HeroActions />
            <p className="metadata mt-6">Campus email to join. Public pseudonym to participate.</p>
          </div>
          <Reveal delay={.15}><div className="landing-preview" aria-label="Illustrative feed preview">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b pb-4">
              <span className="section-title">Around campus</span>
              <span className="status-badge">Illustrative preview</span>
            </div>
            {preview.map(post => <article className="preview-post" key={post.handle}>
              <header className="mb-3 flex items-center gap-3"><UserAvatar handle={post.handle} /><div className="min-w-0"><p className="text-sm font-semibold">u/{post.handle}</p><p className="chip mt-1" data-tone="peach">{post.context}</p></div></header>
              <p className="content-body">{post.body}</p>
              <div className="metadata mt-3 flex items-center gap-2"><Heart className="h-4 w-4" aria-hidden /><MessageCircle className="h-4 w-4" aria-hidden /><span>A conversation starts here</span></div>
            </article>)}
            <div className="preview-poll mt-4" data-tone="lavender"><span className="chip mb-2">Campus poll · Preview</span><p className="font-semibold mb-3">Your ideal study break?</p><div className="flex flex-wrap gap-2"><span className="chip">Chai & a walk</span><span className="chip">One more song</span></div></div>
          </div><Doodle name="Sparkle" className="preview-sparkle"/></Reveal>
        </section>
        <section className="landing-section" aria-labelledby="ways-heading"><p className="section-label mb-3">Find your corner</p><h2 id="ways-heading" className="page-title">Four ways in.</h2><RevealGroup className="ways-grid">{([
          {tone:"lime",title:"The feed",doodle:"Bubble",body:"Little observations. Big conversations. Catch up with campus.",href:"/feed"},
          {tone:"sky",title:"Questions",doodle:"Bulb",body:"Ask what’s on your mind. Share what you know.",href:"/questions"},
          {tone:"peach",title:"Communities",doodle:"Chai",body:"Find people who are into the things you’re into.",href:"/community"},
          {tone:"lavender",title:"Polls",doodle:"Burst",body:"Add your voice to the campus conversation.",href:"/polls"},
        ] as const).map(item => <RevealItem key={item.title}><StickerTile tone={item.tone} title={item.title} doodle={item.tone === "lavender" ? undefined : item.doodle}><p>{item.body}</p><Link className="text-action mt-4" href={item.href}>Explore <ArrowUpRight size={16}/></Link></StickerTile></RevealItem>)}</RevealGroup></section>
        <section className="landing-section landing-trust"><div><p className="section-label mb-3">More than the class group chat</p><h2 className="page-title">A little room to be yourself.</h2><p className="landing-copy">Familiar campus. Fresh perspectives. A public handle that feels like you.</p></div><StickerTile tone="sun">{features.map(({icon: Icon,title,body}) => <div className="trust-row" key={title}><Icon className="h-5 w-5 shrink-0" aria-hidden/><div><h3 className="font-semibold mb-2">{title}</h3><p className="text-sm">{body}</p></div></div>)}</StickerTile></section>
        <section className="landing-section"><div className="landing-cta pattern-dots" data-tone="lime"><h2 className="page-title mb-3">See you around campus.</h2><p className="text-muted-foreground mb-6">Bring a question, a thought, or just your curiosity.</p><HeroActions /></div></section>
      </main>
      <footer className="public-footer"><div><Logo /><p className="mt-2">© {new Date().getFullYear()} Cipher · Built for campus.</p></div><Link href="/about" className="text-action">Get to know Cipher <ArrowUpRight className="h-4 w-4" aria-hidden /></Link><ThemeToggle /></footer>
    </div>
  );
}
