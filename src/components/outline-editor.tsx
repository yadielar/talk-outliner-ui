import { useEffect } from 'react';
import { useSelector } from '@xstate/store/react';
import { documentStorage } from '@/lib/document-storage';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PointEditor } from '@/components/point-editor';
import { store } from '@/store';

export function OutlineEditor() {
  const outlineDoc = useSelector(store, (state) => state.context.outlineDoc);
  const focusedPointId = useSelector(
    store,
    (state) => state.context.focusedPointId,
  );

  useEffect(() => {
    documentStorage.saveToLocalStorage(outlineDoc);
  }, [outlineDoc]);

  useEffect(() => {
    if (!focusedPointId) return;

    const pointElement = document.getElementById(focusedPointId);
    if (pointElement) {
      setTimeout(() => {
        pointElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 0);
    }
  }, [focusedPointId]);

  return (
    <div className="md:container lg:max-w-5xl px-4 pb-8 md:px-5">
      <div className="space-y-4 my-4">
        <Input
          className="text-2xl font-bold"
          placeholder="Title"
          value={outlineDoc.head.title}
          onChange={(e) =>
            store.send({ type: 'changeOutlineTitle', title: e.target.value })
          }
        />
        <Textarea
          placeholder="Description. Write your objective, song number, etc."
          value={outlineDoc.head.description}
          onChange={(e) =>
            store.send({
              type: 'changeOutlineDescription',
              description: e.target.value,
            })
          }
        />
      </div>
      {outlineDoc.body.points.map((point) => (
        <PointEditor key={point.id} point={point} />
      ))}
    </div>
  );
}
