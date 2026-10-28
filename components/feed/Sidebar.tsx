import NavList from "@/components/nav/NavList";

export default function Sidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col justify-between border-r p-4 md:flex">
      <nav aria-label="Main">
        <NavList />
      </nav>
      <p className="px-4 text-xs text-muted-foreground">© {new Date().getFullYear()} Cipher · IIIT Nagpur</p>
    </aside>
  );
}
