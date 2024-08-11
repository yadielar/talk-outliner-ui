import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { documentStorage } from '@/lib/document-storage';
import { parseOutlineDoc } from '@/lib/document-utils';
import { PointView } from '@/components/point-view';

export function OutlineViewer() {
  const [outlineDoc] = useState(() => {
    const doc = documentStorage.load();
    return doc ? parseOutlineDoc(doc) : undefined;
  });

  if (!outlineDoc) {
    return (
      <div className="text-center mt-24">
        <p className="text-lg">No outline found.</p>
        <p className="text-lg">
          <Link className="text-quote hover:underline" to="/edit">
            Create a new outline to get started.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="md:container lg:max-w-5xl px-4 pb-8 md:px-5">
      {outlineDoc.body.points.map((point) => (
        <PointView key={point.id} point={point} />
      ))}
    </div>
  );
}
