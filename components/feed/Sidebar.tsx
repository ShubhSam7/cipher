import NavList from "@/components/nav/NavList";

export default function Sidebar() {
  return (
    <aside className="sidebar-rail sticky hidden shrink-0 flex-col justify-between md:flex">
      <nav aria-label="Main">
        <p className="section-label sidebar-label">YOUR CAMPUS</p>
        <NavList />
      </nav>
      <div className="sidebar-note"><strong>A space to be yourself.</strong><p>Pseudonymous by design.<br />Exclusively IIIT Nagpur.</p><p>© {new Date().getFullYear()} CIPHER</p></div>
    </aside>
  );
}
