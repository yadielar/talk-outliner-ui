import { useEffect } from 'react';
import { useSelector } from '@xstate/store/react';
import { documentStorage } from '@/lib/document-storage';
import { PointEditor } from '@/components/point-editor';
import { store } from '@/store';

export function OutlineEditor() {
  const outlineDoc = useSelector(store, (state) => state.context.outlineDoc);

  useEffect(() => {
    documentStorage.save(outlineDoc);
  }, [outlineDoc]);

  return (
    <div className="md:container lg:max-w-5xl px-4 pb-8 md:px-5">
      {outlineDoc.body.points.map((point) => (
        <PointEditor key={point.id} point={point} />
      ))}
    </div>
  );
}
