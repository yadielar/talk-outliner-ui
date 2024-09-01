import { memo } from 'react';
import { useSelector } from '@xstate/store/react';
import { store } from '@/store';
import { PointParsed } from '@/types';
import { cn } from '@/lib/utils';
import { ContentRenderer } from '@/components/content-renderer';
import {
  PointBox,
  PointBoxLine,
  PointBoxChildren,
} from '@/components/point-box';

interface PointViewProps {
  point: PointParsed;
}

export const PointView = memo(function PointView({ point }: PointViewProps) {
  const expanded = useSelector(
    store,
    (state) => state.context.focusedPointId === point.id,
  );

  const fontSizeClass = useSelector(store, (state) =>
    state.context.fontSize === 'xl' ? 'font-size-xl' : 'font-size-base',
  );

  function togglePoint() {
    store.send({ type: 'togglePointFocus', point });
  }

  return (
    <PointBox point={point} active={expanded}>
      <PointBoxLine id={point.id} onClick={() => togglePoint()}>
        <div
          data-name="point-view-idea"
          className={cn(
            expanded &&
              'underline underline-offset-4 decoration-foreground/50 decoration-1 decoration-dashed opacity-75',
          )}
        >
          <div className="flex justify-between items-end">
            {point.idea.length > 0 ? (
              <ContentRenderer
                className={cn('flex-1', fontSizeClass)}
                value={point.idea}
              />
            ) : (
              <div className="flex-1 text-sm italic text-muted-foreground/50 p-2">
                Empty point
              </div>
            )}
            {!expanded &&
              typeof point.script === 'string' &&
              !point.scriptRemoved && (
                <i className="flex-none text-muted-foreground ml-2">···</i>
              )}
          </div>
        </div>
        {typeof point.script === 'string' &&
          !point.scriptRemoved &&
          expanded && (
            <div data-name="point-view-script" className="mt-2">
              <ContentRenderer className={fontSizeClass} value={point.script} />
            </div>
          )}
      </PointBoxLine>
      {point.points && point.points.length > 0 && (
        <PointBoxChildren>
          {point.points.map((subpoint) => (
            <PointView key={subpoint.id} point={subpoint} />
          ))}
        </PointBoxChildren>
      )}
    </PointBox>
  );
});
