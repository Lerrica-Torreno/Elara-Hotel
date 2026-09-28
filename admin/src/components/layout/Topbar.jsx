import {
  LogOut,
  Menu,
  UserRound
} from "lucide-react";

import { useAuth } from "../../Context/AuthContext";

export default function Topbar({
  page,
  onOpenMenu
}) {
  const {
    user,
    logout
  } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-forest-900/10 bg-mist/95 px-4 backdrop-blur md:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={
            onOpenMenu
          }
          className="rounded-xl border border-forest-900/10 bg-white p-2.5 lg:hidden"
        >
          <Menu
            size={19}
          />
        </button>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-forest-900/40">
            ELARA Hotel
          </p>

          <p className="mt-0.5 text-sm font-semibold text-forest-950">
            {page}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-3 rounded-xl border border-forest-900/10 bg-white px-3 py-2 sm:flex">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-mist text-forest-900">
            <UserRound
              size={16}
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-forest-950">
              {user?.firstName
                ? `${user.firstName} ${user.lastName ?? ""}`
                : user?.email}
            </p>

            <p className="text-[10px] text-forest-900/40">
              Administrator
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            logout
          }
          title="Sign out"
          className="grid h-10 w-10 place-items-center rounded-xl border border-forest-900/10 bg-white text-forest-900/60 transition hover:bg-forest-900 hover:text-white"
        >
          <LogOut
            size={17}
          />
        </button>
      </div>
    </header>
  );
}