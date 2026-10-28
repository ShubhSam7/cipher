import SessionSync from "@/components/SessionSync";
import TopBar from "@/components/feed/TopBar";
import Sidebar from "@/components/feed/Sidebar";
import CreatePostModal from "@/components/feed/CreatePostModal";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SessionSync />
      <TopBar />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 focus:outline-none sm:px-6">
          {children}
        </main>
      </div>
      <CreatePostModal />
    </div>
  );
}
