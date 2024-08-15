import { memo } from 'react';
import { useSelector } from '@xstate/store/react';
import { cva } from 'class-variance-authority';
import { store } from '@/store';
import { PointParsed } from '@/types';
import { Voice, VoiceScope } from '@/enums';
import { ContentRenderer } from '@/components/content-renderer';
import { cn } from '@/lib/utils';

const voiceBase = cva<{ voice: Record<Voice, string> }>('', {
  variants: {
    voice: {
      none: '',
      info: 'bg-info text-info-foreground',
      question: 'bg-question text-question-foreground',
      reference: 'bg-reference text-reference-foreground',
      example: 'bg-example text-example-foreground',
      story: 'bg-story text-story-foreground',
      lesson: 'bg-lesson text-lesson-foreground',
      action: 'bg-action text-action-foreground',
    },
  },
});

const container = cva<{ voice: Record<Voice, string> }>('relative', {
  variants: {
    voice: {
      none: '',
      info: '[--voice-bg-active:hsl(var(--info-active))]',
      question: '[--voice-bg-active:hsl(var(--question-active))]',
      reference: '[--voice-bg-active:hsl(var(--reference-active))]',
      example: '[--voice-bg-active:hsl(var(--example-active))]',
      story: '[--voice-bg-active:hsl(var(--story-active))]',
      lesson: '[--voice-bg-active:hsl(var(--lesson-active))]',
      action: '[--voice-bg-active:hsl(var(--action-active))]',
    },
  },
});

const line = cva<{
  voice: Record<Voice, string>;
  active: Record<'true' | 'false', string>;
}>('p-3 mb-2 cursor-pointer hover:bg-[--voice-bg-active,hsl(var(--neutral))]', {
  variants: {
    voice: {
      none: '',
      info: 'hover:bg-info-active',
      question: 'hover:bg-question-active',
      reference: 'hover:bg-reference-active',
      example: 'hover:bg-example-active',
      story: 'hover:bg-story-active',
      lesson: 'hover:bg-lesson-active',
      action: 'hover:bg-action-active',
    },
    active: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      voice: Voice.None,
      active: true,
      className:
        'bg-[--voice-bg-active,hsl(var(--neutral))] hover:bg-[--voice-bg-active,hsl(var(--neutral))]',
    },
    {
      voice: Voice.Info,
      active: true,
      className: 'bg-info-active hover:bg-info-active',
    },
    {
      voice: Voice.Question,
      active: true,
      className: 'bg-question-active hover:bg-question-active',
    },
    {
      voice: Voice.Reference,
      active: true,
      className: 'bg-reference-active hover:bg-reference-active',
    },
    {
      voice: Voice.Example,
      active: true,
      className: 'bg-example-active hover:bg-example-active',
    },
    {
      voice: Voice.Story,
      active: true,
      className: 'bg-story-active hover:bg-story-active',
    },
    {
      voice: Voice.Lesson,
      active: true,
      className: 'bg-lesson-active hover:bg-lesson-active',
    },
    {
      voice: Voice.Action,
      active: true,
      className: 'bg-action-active hover:bg-action-active',
    },
  ],
});
interface PointViewProps {
  point: PointParsed;
}

export const PointView = memo(function PointView({ point }: PointViewProps) {
  const expanded = useSelector(
    store,
    (state) => state.context.focusedPointId === point.id,
  );
  const { voice = Voice.None, voiceScope = VoiceScope.Subtree } = point;
  const containerVoice = voiceScope === VoiceScope.Subtree ? voice : Voice.None;
  const lineVoice = voiceScope === VoiceScope.Node ? voice : Voice.None;

  // @TODO Add support for script mode
  const mode = 'outline' as 'outline' | 'script';

  function togglePoint() {
    store.send({ type: 'togglePointFocus', point });
  }

  return (
    <div
      data-name="container"
      className={cn(
        voiceBase({ voice: containerVoice }),
        container({ voice: containerVoice }),
      )}
    >
      <div
        data-name="line"
        id={point.id}
        className={cn(
          voiceBase({ voice: lineVoice }),
          line({ voice: lineVoice, active: expanded }),
          mode === 'script' ? 'pl-3' : 'pl-8',
        )}
        onClick={() => togglePoint()}
      >
        <div
          data-name="idea"
          className={cn(
            expanded &&
              'underline underline-offset-4 decoration-foreground/50 decoration-1 decoration-dashed',
            (expanded || mode === 'script') && 'opacity-75',
          )}
        >
          <div className="flex justify-between items-end">
            {point.idea.length > 0 ? (
              <ContentRenderer className="flex-1" value={point.idea} />
            ) : (
              <div className="flex-1 text-sm italic text-muted-foreground/50 p-2">
                Empty point
              </div>
            )}
            {!expanded &&
              typeof point.script === 'string' &&
              !point.scriptRemoved && (
                <i className="flex-none text-muted-foreground ml-3">···</i>
              )}
          </div>
        </div>
        {typeof point.script === 'string' &&
          !point.scriptRemoved &&
          (mode === 'script' || expanded) && (
            <div data-name="script" className="mt-3">
              <ContentRenderer value={point.script} />
            </div>
          )}
      </div>
      {point.points && point.points.length > 0 && (
        <div
          data-name="points"
          className={cn(mode === 'script' ? 'pl-0' : 'pl-8')}
        >
          {point.points.map((subpoint) => (
            <PointView key={subpoint.id} point={subpoint} />
          ))}
        </div>
      )}
    </div>
  );
});
