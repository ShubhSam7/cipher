import SessionSync from "@/components/SessionSync";
import TopBar from "@/components/feed/TopBar";
import Sidebar from "@/components/feed/Sidebar";
import CreatePostModal from "@/components/feed/CreatePostModal";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SessionSync />
      <TopBar />
      <div className="app-frame">
        <Sidebar />
        <main id="main" tabIndex={-1} className="app-content focus:outline-none">
          {children}
        </main>
      </div>
      <CreatePostModal />
    </div>
  );
}
