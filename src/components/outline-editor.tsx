import { useEffect } from 'react';
import { useSelector } from '@xstate/store/react';
import { documentStorage } from '@/lib/document-storage';
import { Input } from '@/components/ui/input';
import { PointEditor } from '@/components/point-editor';
import { store } from '@/store';

export function OutlineEditor() {
  const outlineDoc = useSelector(store, (state) => state.context.outlineDoc);

  useEffect(() => {
    documentStorage.save(outlineDoc);
  }, [outlineDoc]);

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
        <Input
          placeholder="Objective"
          value={outlineDoc.head.objective}
          onChange={(e) =>
            store.send({
              type: 'changeOutlineObjective',
              objective: e.target.value,
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
