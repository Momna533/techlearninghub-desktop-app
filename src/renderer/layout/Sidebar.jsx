
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Layers,
  ClipboardCheck,
  Wallet,
  Award,
  UserPlus,
  Users,
  FileText,
  FolderKanban,
  SquareCheckBig,
  UserCog,
  LifeBuoy,
  Receipt,
  CreditCard,
  ReceiptText,
  Banknote,
  BriefcaseBusiness,
  UserRoundCog,
  ShieldCheck,
  ChartColumn,
  Files,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react';

import { userHasPermission } from '../authorization/permissions';
import { NAV_SECTIONS } from '../navigation/nav-config';

const ICONS = {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Layers,
  ClipboardCheck,
  Wallet,
  Award,
  UserPlus,
  Users,
  FileText,
  FolderKanban,
  SquareCheckBig,
  UserCog,
  LifeBuoy,
  Receipt,
  CreditCard,
  ReceiptText,
  Banknote,
  BriefcaseBusiness,
  UserRoundCog,
  ShieldCheck,
  ChartColumn,
  Files,
  Settings,
};

function Sidebar({
  user,
  onLogout,
  mobileOpen,
  onMobileClose,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const visibleSections = NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        userHasPermission(user, item.permission)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const displayName = user?.displayName || user?.email || 'User';

  const roleName =
    (user?.roles ?? []).map((role) => role.name).join(', ') ||
    'No roles';

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* =========================================================
          MOBILE BACKDROP

          This sits behind the sidebar but above the dashboard.
          Clicking it closes the sidebar.
      ========================================================== */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* =========================================================
          SIDEBAR

          Mobile:
          fixed + overlay

          Desktop:
          static + part of layout
      ========================================================== */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50',
          'flex h-dvh flex-col',
          'bg-[#0a2552] text-white',
          'shadow-2xl',
          'transition-[width,transform] duration-200 ease-out',

          /*
           * MOBILE
           *
           * The sidebar is completely removed from normal
           * document layout and slides over the dashboard.
           */
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full',

          /*
           * DESKTOP
           *
           * Sidebar becomes part of the normal application
           * layout and is always visible.
           */
          'lg:static',
          'lg:h-screen',
          'lg:translate-x-0',
          'lg:shadow-none',
          'lg:shrink-0',

          /*
           * Width
           */
          collapsed
            ? 'w-[72px]'
            : 'w-[min(270px,calc(100vw-32px))] lg:w-[250px]',
        ].join(' ')}
      >
        {/* =======================================================
            SIDEBAR HEADER
        ======================================================== */}
        <div className="flex h-16 min-h-16 shrink-0 items-center gap-3 border-b border-white/10 px-3">
          {/* Logo */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0a2552] shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
            <span className="text-sm font-black text-white">
              TLH
            </span>
          </div>

          {/* Brand */}
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[12px] font-bold text-white">
                Tech Learning Hub
              </div>

              <div className="mt-0.5 truncate text-[9px] text-white/50">
                Agency Mgmt
              </div>
            </div>
          )}

          {/* Mobile close */}
          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white active:bg-white/15 lg:hidden"
            aria-label="Close navigation"
            title="Close navigation"
          >
            <X size={17} strokeWidth={2} />
          </button>
        </div>

        {/* =======================================================
            MAIN MENU
        ======================================================== */}
        {!collapsed && (
          <div className="shrink-0 border-b border-white/10 px-3 py-2">
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/45">
              Main Menu
            </p>
          </div>
        )}

        {/* =======================================================
            DESKTOP COLLAPSE
        ======================================================== */}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-[68px] z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 lg:flex"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={
            collapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          }
        >
          {collapsed ? (
            <ChevronRight size={12} />
          ) : (
            <ChevronLeft size={12} />
          )}
        </button>

        {/* =======================================================
            NAVIGATION

            ONLY THIS SECTION SCROLLS.
        ======================================================== */}
        <nav
          className={[
            'min-h-0 flex-1',
            'overflow-y-auto overflow-x-hidden',
            'px-2 py-2',
            'scrollbar-thin',
            'scrollbar-thumb-white/15',
            'scrollbar-track-transparent',
            'hover:scrollbar-thumb-white/25',
          ].join(' ')}
          aria-label="Main navigation"
        >
          {visibleSections.map((section) => (
            <div
              key={section.id}
              className="mb-4 last:mb-2"
            >
              {section.label && !collapsed && (
                <div className="px-2 pb-1.5 pt-2">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                    {section.label}
                  </p>
                </div>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon =
                    ICONS[item.icon] ||
                    LayoutDashboard;

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={onMobileClose}
                      title={
                        collapsed
                          ? item.label
                          : undefined
                      }
                      className={({ isActive }) =>
                        [
                          'group flex h-9 min-w-0 items-center gap-3 rounded-md',
                          'px-2.5',
                          'text-[11px] font-medium',
                          'outline-none',
                          'transition-all duration-150',

                          isActive
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-white/65 hover:bg-white/[0.07] hover:text-white',

                          collapsed
                            ? 'justify-center px-0'
                            : '',
                        ].join(' ')
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={16}
                            strokeWidth={
                              isActive
                                ? 2.2
                                : 1.8
                            }
                            className={[
                              'shrink-0',
                              isActive
                                ? 'text-[#d4a017]'
                                : 'text-white/55 group-hover:text-white/90',
                            ].join(' ')}
                          />

                          {!collapsed && (
                            <span className="min-w-0 truncate">
                              {item.label}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* =======================================================
            USER + LOGOUT

            Always stays at the bottom.
            Does NOT scroll with navigation.
        ======================================================== */}
        <div className="shrink-0 border-t border-white/10 bg-[#0a2552] p-2">
          {/* User */}
          <div
            className={[
              'mb-1 flex items-center gap-2 rounded-md px-2 py-2',
              collapsed
                ? 'justify-center'
                : '',
            ].join(' ')}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d4a017] text-[11px] font-bold text-[#0a2552]">
              {avatarLetter}
            </div>

            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[11px] font-bold text-white">
                  {displayName}
                </div>

                <div className="truncate text-[9px] text-white/50">
                  {roleName}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            title={collapsed ? 'Logout' : undefined}
            className={[
              'group flex h-9 w-full items-center gap-3 rounded-md',
              'px-2.5',
              'text-[11px] font-medium text-white/60',
              'transition hover:bg-white/[0.07] hover:text-white',
              'active:bg-white/10',
              collapsed
                ? 'justify-center px-0'
                : '',
            ].join(' ')}
          >
            <LogOut
              size={16}
              strokeWidth={1.8}
              className="shrink-0 text-white/50 group-hover:text-white/90"
            />

            {!collapsed && (
              <span>Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
