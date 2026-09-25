import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ activePage, onNavigate, onNewReservation, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mist">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <Topbar
          page={activePage}
          onOpenMenu={() => setSidebarOpen(true)}
          onNewReservation={onNewReservation}
        />
        <main id="main-content" className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
