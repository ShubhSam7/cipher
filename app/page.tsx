import Link from "next/link";
import {
  ShieldCheck, VenetianMask, Zap, Heart, MessageCircle,
  UserRound, Smile, BookOpen, Users, type LucideIcon,
} from "lucide-react";
import ShinyText from "@/components/ShinyText";
import Logo from "@/components/Logo";
import HomeNavbar from "@/components/HomeNavbar";
import LandingRays from "@/components/landing/LandingRays";
import HeroActions from "@/components/landing/HeroActions";

const features: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ShieldCheck,
    title: "Verified Campus Only",
    body: "Access is restricted to verified college students, ensuring relevance, safety, and authentic campus culture.",
  },
  {
    icon: VenetianMask,
    title: "Pseudonymous by design",
    body: "Post confessions, opinions, or thoughts without revealing your identity — a pseudonymous username, never your real name or roll number.",
  },
  {
    icon: Zap,
    title: "Live Campus Pulse",
    body: "See what your campus is thinking in real-time — trending topics, viral posts, and raw conversations.",
  },
];

// Illustrative posts for the preview section; not real data.
const samplePosts: {
  icon: LucideIcon; tint: string; meta: string; body: React.ReactNode; likes: number; comments: number; wide?: boolean;
}[] = [
  {
    icon: UserRound, tint: "bg-cyan-500/10 text-cyan-400", meta: "2 min ago • Confessions", likes: 234, comments: 89,
    body: "I've been attending online lectures from my bed for the past week and the professor still thinks I'm the most attentive student 😅",
  },
  {
    icon: Smile, tint: "bg-orange-500/10 text-orange-400", meta: "15 min ago • Campus Memes", likes: 567, comments: 143,
    body: (
      <>
        When the professor says &quot;this will be easy&quot; before midterms 🚩🚩🚩
        <span className="mt-2 block text-sm text-white/50">Narrator: It was not easy.</span>
      </>
    ),
  },
  {
    icon: BookOpen, tint: "bg-purple-500/10 text-purple-400", meta: "1 hour ago • CS Department", likes: 156, comments: 67,
    body: "Anyone else struggling with the DSA assignment? The deadline is tomorrow and I'm still stuck on question 2 😭",
  },
  {
    icon: Zap, tint: "bg-pink-500/10 text-pink-400", meta: "3 hours ago • Trending", likes: 892, comments: 201,
    body: "The canteen finally added the momos everyone was asking for! 🎉 Best decision they've made all semester",
  },
  {
    icon: Users, tint: "bg-green-500/10 text-green-400", meta: "5 hours ago • Campus Life", likes: 445, comments: 98, wide: true,
    body: "Shoutout to the seniors who organized the tech fest this year. The workshops were actually useful and the competitions were 🔥. Already looking forward to next year!",
  },
];

const footerLinks = [
  { href: "/feed", label: "Feed" },
  { href: "/about", label: "About" },
  { href: "/signin", label: "Sign in" },
  { href: "/signup", label: "Sign up" },
];

const glassCard = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg transition-all duration-300";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans">
      <HomeNavbar />
      <LandingRays />

      <main className="relative z-10">
        <section className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 pb-20 pt-28 sm:px-20">
          <h1 className="max-w-2xl text-center text-3xl font-bold sm:text-4xl">
            <ShinyText text="Welcome to the Social Media only made for College Gossips!" speed={3} />
          </h1>
          <HeroActions />
        </section>

        <section className="px-6 py-16 sm:px-20" aria-labelledby="features-heading">
          <div className="mx-auto max-w-[1100px] space-y-16">
            <div className="space-y-4 text-center">
              <h2 id="features-heading" className="text-4xl font-bold text-white/90 sm:text-5xl">
                A Campus Space Built on Anonymity &amp; Trust
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-white/70 sm:text-xl">
                Cipher is a closed social platform designed exclusively for college campuses — where ideas,
                confessions, and conversations flow freely without identity pressure.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className={`group p-8 ${glassCard} hover:border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-500/10 motion-safe:hover:-translate-y-1`}
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10 transition-colors group-hover:bg-cyan-500/20">
                    <Icon className="h-7 w-7 text-cyan-400" aria-hidden />
                  </div>
                  <h3 className="mb-4 text-xl font-semibold text-white">{title}</h3>
                  <p className="text-white/70">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-6 py-16 sm:px-20" aria-labelledby="preview-heading">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/4 to-transparent blur-3xl" />
          <div className="relative mx-auto max-w-[1200px] space-y-12">
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 motion-safe:animate-pulse" aria-hidden />
                <span className="text-sm font-semibold tracking-wider text-cyan-400">PREVIEW</span>
              </div>
              <h2 id="preview-heading" className="text-4xl font-bold text-white sm:text-5xl">Campus Feed</h2>
              <p className="mx-auto max-w-3xl text-lg text-white/70 sm:text-xl">
                A taste of what&apos;s happening on campus
              </p>
            </div>

            <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
              {samplePosts.map(({ icon: Icon, tint, meta, body, likes, comments, wide }) => (
                <li key={meta} className={`space-y-4 p-6 ${glassCard} ${wide ? "lg:col-span-2" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${tint}`}>
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-medium text-white/85">Anonymous</p>
                      <p className="text-sm text-white/50">{meta}</p>
                    </div>
                  </div>
                  <p className="text-base leading-relaxed text-white/75">{body}</p>
                  <div className="flex items-center gap-6 pt-2 text-sm font-medium text-white/50">
                    <span className="flex items-center gap-2">
                      <Heart className="h-5 w-5" aria-hidden /> {likes}
                      <span className="sr-only">likes</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" aria-hidden /> {comments}
                      <span className="sr-only">comments</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-4 text-center">
              <Link
                href="/feed"
                className="inline-block rounded-full border border-cyan-400/20 bg-cyan-500/10 px-8 py-3 font-medium text-cyan-400 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                See the real feed →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mt-24 px-6 pb-12 sm:px-20">
        <div className="mx-auto max-w-[1200px] rounded-3xl border border-white/6 bg-[rgba(10,10,12,0.8)] p-8 backdrop-blur-2xl sm:p-12">
          <div className="mb-8 grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="space-y-3">
              <Logo />
              <p className="text-white/70">Unfiltered campus conversations.</p>
            </div>
            <nav aria-label="Footer">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">Navigate</h2>
              <ul className="space-y-2">
                {footerLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-white/70 transition-colors hover:text-cyan-400">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <p className="border-t border-white/6 pt-8 text-center text-sm text-white/50">
            © {new Date().getFullYear()} Cipher. Built for campuses.
          </p>
        </div>
      </footer>
    </div>
  );
}
