import { createFileRoute } from '@tanstack/react-router';
import { OutlineEditor } from '@/components/outline-editor';

export const Route = createFileRoute('/edit')({
  component: OutlineEditScreen,
});

function OutlineEditScreen() {
  return (
    <div>
      <h1 className="text-3xl text-center font-bold mt-8 mb-4">Edit Mode</h1>
      <p className="text-center">Write an outline for your talk.</p>
      <OutlineEditor />
    </div>
  );
}
