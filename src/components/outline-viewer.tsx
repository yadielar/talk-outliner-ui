import { useEffect } from 'react';
import { useSelector } from '@xstate/store/react';
import { Link } from '@tanstack/react-router';
import { useHotkeys } from 'react-hotkeys-hook';
import { PointView } from '@/components/point-view';
import { store } from '@/store';

export function OutlineViewer() {
  const outlineDoc = useSelector(store, (state) => state.context.outlineDoc);
  const focusedPointId = useSelector(
    store,
    (state) => state.context.focusedPointId,
  );

  useHotkeys(['right', 'down', 'space'], () =>
    store.send({ type: 'focusNextPoint' }),
  );

  useHotkeys(['left', 'up', 'shift+space'], () =>
    store.send({ type: 'focusPrevPoint' }),
  );

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
