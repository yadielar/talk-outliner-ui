import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ThemeProvider } from '@/components/theme-provider';
import { ColorSchemeToggle } from '@/components/color-scheme-toggle';
import { NavTabs, NavTabsLink } from '@/components/nav-tabs';
import { PWABadge } from '@/components/pwa-badge';

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex p-3">
        <div className="flex-none min-w-12 flex justify-start items-center"></div>
        <div className="flex-1 flex justify-center items-center">
          <NavTabs className="w-[200px] grid grid-cols-2">
            <NavTabsLink to="/edit">Edit</NavTabsLink>
            <NavTabsLink to="/view">View</NavTabsLink>
          </NavTabs>
        </div>
        <div className="flex-none min-w-12 flex justify-end items-center">
          <ColorSchemeToggle />
        </div>
      </div>
      <hr />
      <Outlet />
      <PWABadge />
      <TanStackRouterDevtools />
    </ThemeProvider>
  ),
});
