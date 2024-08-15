import React, { Suspense } from 'react';
import {
  createRootRoute,
  Outlet,
  useMatchRoute,
  useNavigate,
} from '@tanstack/react-router';
import { useSelector } from '@xstate/store/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { documentStorage } from '@/lib/document-storage';
import { parseOutlineDoc } from '@/lib/document-utils';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { ColorSchemeToggle } from '@/components/color-scheme-toggle';
import { NavTabs, NavTabsLink } from '@/components/nav-tabs';
import { RegisterServiceWorker } from '@/components/register-service-worker';
import { Toaster } from '@/components/ui/sonner';
import { config } from '@/config';
import { store } from '@/store';

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  const hasActiveFile = useSelector(store, (state) =>
    Boolean(state.context.fileHandle),
  );

  useHotkeys(
    'mod+o',
    (e) => {
      e.preventDefault();
      handleOpen();
    },
    { enableOnFormTags: true, enableOnContentEditable: true },
  );

  useHotkeys(
    'mod+s',
    (e) => {
      e.preventDefault();
      handleSave();
    },
    { enableOnFormTags: true, enableOnContentEditable: true },
  );

  useHotkeys(
    'mod+e',
    (e) => {
      e.preventDefault();
      const matchView = matchRoute({ to: '/view' });
      const matchEdit = matchRoute({ to: '/edit' });

      if (matchView) {
        navigate({ to: '/edit' });
        return;
      }
      if (matchEdit) {
        navigate({ to: '/view' });
        return;
      }
    },
    { enableOnFormTags: true, enableOnContentEditable: true },
  );

  async function handleOpen() {
    const result = await documentStorage.loadFromFile();

    if (result.outlineDoc) {
      store.send({
        type: 'loadOutlineDocFromFile',
        outlineDoc: parseOutlineDoc(result.outlineDoc),
        fileHandle: result.fileHandle,
      });
    } else {
      if (result.error === 'invalid-json') {
        toast.error('Invalid JSON file.');
        return;
      }
      if (result.error === 'error') {
        toast.error('Error loading file.');
        return;
      }
    }
  }

  async function handleSave() {
    const state = store.getSnapshot();

    const result = await documentStorage.saveToFile(
      state.context.outlineDoc,
      state.context.fileHandle,
    );

    if (result.success) {
      const { fileHandle } = result;

      toast.success(
        fileHandle?.name ? `Saved to "${fileHandle.name}"` : 'Saved to file',
      );

      store.send({
        type: 'savedOutlineDocToFile',
        fileHandle: fileHandle ?? undefined,
      });
    } else {
      if (result.error === 'error') {
        toast.error('Error saving file.');
      }
    }
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <div className="h-full flex flex-col overflow-y-auto">
          <div className="flex-1">
            <div className="flex-none flex space-x-2 p-3">
              <div className="flex-none md:min-w-40 flex justify-start items-center space-x-2">
                <Button variant="outline" size="xs" onClick={handleOpen}>
                  Open
                </Button>
                <Button variant="outline" size="xs" onClick={handleSave}>
                  {!hasActiveFile ? 'Save to...' : 'Save'}
                </Button>
              </div>
              <div className="flex-1 flex justify-end md:justify-center items-center">
                <NavTabs className="grid grid-cols-2">
                  <NavTabsLink to="/edit">Edit</NavTabsLink>
                  <NavTabsLink to="/view">View</NavTabsLink>
                </NavTabs>
              </div>
              <div className="flex-none md:min-w-40 flex justify-end items-center">
                <ColorSchemeToggle />
              </div>
            </div>
            <Outlet />
          </div>
          <div className="flex-none pt-12 px-6 pb-6 text-xs text-muted-foreground text-left">
            v{config.version}
          </div>
        </div>
      </TooltipProvider>
      <RegisterServiceWorker />
      <Toaster />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </ThemeProvider>
  );
}

// Devtools
const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );
