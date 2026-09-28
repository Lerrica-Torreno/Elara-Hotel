import {
  useState
} from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({
  activePage,
  onNavigate,
  children
}) {
  const [
    mobileOpen,
    setMobileOpen
  ] = useState(false);

  const [
    collapsed,
    setCollapsed
  ] = useState(false);

  return (
    <div className="min-h-screen bg-mist">
      <Sidebar
        activePage={
          activePage
        }
        onNavigate={
          onNavigate
        }
        open={
          mobileOpen
        }
        onClose={() =>
          setMobileOpen(
            false
          )
        }
        collapsed={
          collapsed
        }
        onToggleCollapse={() =>
          setCollapsed(
            (
              current
            ) =>
              !current
          )
        }
      />

      <div
        className={`min-h-screen transition-[padding] duration-200 ${
          collapsed
            ? "lg:pl-24"
            : "lg:pl-72"
        }`}
      >
        <Topbar
          page={
            activePage
          }
          onOpenMenu={() =>
            setMobileOpen(
              true
            )
          }
        />

        <main className="mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}