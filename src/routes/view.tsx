import { createFileRoute } from '@tanstack/react-router';
import { OutlineViewer } from '@/components/outline-viewer';

export const Route = createFileRoute('/view')({
  component: OutlineViewScreen,
});

function OutlineViewScreen() {
  return <OutlineViewer />;
}
