import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ThemeProvider } from '@/components/theme-provider';
import { ColorSchemeToggle } from '@/components/color-scheme-toggle';
import { PWABadge } from '@/components/pwa-badge';

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex p-3">
        <div className="flex-1 flex items-center gap-4">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>
          <Link to="/about" className="[&.active]:font-bold">
            About
          </Link>
        </div>
        <div className="flex-none">
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
