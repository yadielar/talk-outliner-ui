import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div>
      <h1 className="text-3xl text-center font-bold my-4">Talk Outliner</h1>
      <p className="text-center">Create dynamic outlines for your talks.</p>
    </div>
  );
}
