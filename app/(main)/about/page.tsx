import type { Metadata } from "next";
import { ShieldCheck, VenetianMask, MessagesSquare } from "lucide-react";

export const metadata: Metadata = { title: "About", description: "A pseudonymous campus space for verified IIIT Nagpur students." };
const sections = [
  { icon: ShieldCheck, title: "A shared campus", body: "Cipher is for IIIT Nagpur students. Joining requires an institute email and an email verification code, so conversations stay rooted in campus life." },
  { icon: VenetianMask, title: "Your public pseudonym", body: "Your handle represents you in posts, replies, and communities. Your email is not shown on your public profile. Pseudonymity is not complete anonymity: your account remains linked to the email you use to join. Avoid sharing personal information in your handle, bio, or posts." },
  { icon: MessagesSquare, title: "Conversations with room for everyone", body: "Share a thought, ask for help, or find a community around your interests. Bring curiosity, respect other people, and remember there’s a fellow student behind every handle." },
];
export default function AboutPage() {
  return <div className="page-stack"><header><h1 className="page-title">About Cipher</h1><p className="page-description">Your campus. Your conversations.</p></header><p className="content-body">The everyday observations. The questions you’ve been sitting on. The conversations that keep going after class. Cipher gives them a space of their own.</p><div>{sections.map(({icon: Icon, title, body}) => <section key={title} className="content-row"><Icon className="mb-4 h-6 w-6 text-muted-foreground" aria-hidden /><h2 className="section-title mb-3">{title}</h2><p className="text-muted-foreground">{body}</p></section>)}</div><section><h2 className="section-title mb-3">Get in touch</h2><a href="mailto:support@cipher.campus" className="text-action underline underline-offset-4">support@cipher.campus</a></section><p className="metadata">© {new Date().getFullYear()} Cipher · Built for campus.</p></div>;
}
