
import { Menu, Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { findNavItemByPath } from '../navigation/nav-config';

function Header({ user, onMobileMenuToggle }) {
  const location = useLocation();
  const currentItem = findNavItemByPath(location.pathname);

  const title =
    currentItem?.label ??
    (location.pathname === '/unauthorized'
      ? 'Access denied'
      : 'Application');

  const subtitle =
    currentItem?.id === 'dashboard'
      ? 'Agency overview & quick actions'
      : currentItem?.label
        ? `${currentItem.label} management`
        : 'Tech Learning Hub';

  const displayName = user?.displayName || user?.email || 'User';

  const roleName =
    (user?.roles ?? []).map((role) => role.name).join(', ') ||
    'No roles';

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="no-print flex h-16 min-h-16 w-full min-w-0 shrink-0 items-center border-b border-slate-200 bg-white">
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-5">
        {/* =====================================================
            MOBILE / TABLET MENU

            Visible below 1024px.
        ====================================================== */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
          title="Open navigation"
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        {/* =====================================================
            PAGE TITLE
        ====================================================== */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold leading-tight text-slate-900 sm:text-base">
            {title}
          </h1>

          <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-500 sm:text-[11px]">
            {subtitle}
          </p>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Search
              Only shown when there is enough room.
              At 1024–1279px it stays hidden to prevent
              the header from becoming cramped.
          */}
          <div className="relative hidden xl:block">
            <Search
              size={14}
              strokeWidth={2}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              placeholder="Search..."
              aria-label="Search"
              className="h-8 w-40 rounded-md border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}
          <button
            type="button"
            title="Notifications"
            aria-label="Notifications"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100"
          >
            <Bell size={16} strokeWidth={2} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#d4a017]" />
          </button>

          {/* =================================================
              USER

              Avatar stays visible from 640px upward.
              Full user information appears at 1280px.
          ================================================== */}
          <div className="hidden items-center gap-2 border-l border-slate-200 pl-2 sm:flex">
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d4a017] text-[11px] font-bold text-[#0a2552]">
              {avatarLetter}
            </div>

            {/* Full user information */}
            <div className="hidden min-w-0 max-w-32 leading-tight xl:block">
              <div className="truncate text-[11px] font-bold text-slate-900">
                {displayName}
              </div>

              <div className="truncate text-[9px] text-slate-500">
                {roleName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
