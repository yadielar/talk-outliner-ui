import { createFileRoute } from '@tanstack/react-router';
import { OutlineEditor } from '@/components/outline-editor';

export const Route = createFileRoute('/edit')({
  component: OutlineEditScreen,
});

function OutlineEditScreen() {
  return <OutlineEditor />;
}
