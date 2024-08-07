import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/view')({
  component: OutlineViewScreen,
});

function OutlineViewScreen() {
  return (
    <div>
      <h1 className="text-3xl text-center font-bold mt-8 mb-4">View Mode</h1>
      <p className="text-center">
        Time to practice? This mode is optimized to read your outline.
      </p>
      {/* <OutlineViewer /> */}
    </div>
  );
}
