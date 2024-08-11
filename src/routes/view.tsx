import { createFileRoute } from '@tanstack/react-router';
import { OutlineViewer } from '@/components/outline-viewer';

export const Route = createFileRoute('/view')({
  component: OutlineViewScreen,
});

function OutlineViewScreen() {
  return (
    <div>
      <h1 className="text-3xl text-center font-bold mt-8 mb-4">View Mode</h1>
      <p className="text-center mb-10">
        Time to practice? This mode is optimized to read your outline.
      </p>
      <OutlineViewer />
    </div>
  );
}
