import { createContext, useContext, useMemo } from 'react';
import { cva } from 'class-variance-authority';
import { PointParsed } from '@/types';
import { Voice, VoiceScope } from '@/enums';
import { cn } from '@/lib/utils';

const baseColors = cva<{ voice: Record<Voice, string> }>('', {
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

const PointBoxContext = createContext<{
  point: PointParsed;
  active: boolean;
  noIndent?: boolean;
}>(undefined!);

const rootColors = cva<{ voice: Record<Voice, string> }>('', {
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

interface PointBoxProps {
  point: PointParsed;
  active: boolean;
  children: React.ReactNode;
  noIndent?: boolean;
  className?: string;
}

export function PointBox({
  point,
  active,
  children,
  noIndent = false,
  className,
}: PointBoxProps) {
  const contextValue = useMemo(
    () => ({ point, active, noIndent }),
    [point, active, noIndent],
  );

  const { voice, voiceScope } = getVoiceOrDefault(point);
  const containerVoice = voiceScope === VoiceScope.Subtree ? voice : Voice.None;

  return (
    <PointBoxContext.Provider value={contextValue}>
      <div
        data-name="point-root"
        className={cn(
          'relative',
          baseColors({ voice: containerVoice }),
          rootColors({ voice: containerVoice }),
          className,
        )}
      >
        {children}
      </div>
    </PointBoxContext.Provider>
  );
}

const lineColors = cva<{
  voice: Record<Voice, string>;
  active: Record<'true' | 'false', string>;
}>('hover:bg-[--voice-bg-active,hsl(var(--neutral))]', {
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

interface PointBoxLineProps {
  children: React.ReactNode;
  tabIndex?: number;
  className?: string;
  id?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export function PointBoxLine({
  children,
  tabIndex,
  className,
  id,
  onClick,
}: PointBoxLineProps) {
  const { point, active, noIndent } = useContext(PointBoxContext);
  const { voice, voiceScope } = getVoiceOrDefault(point);
  const lineVoice = voiceScope === VoiceScope.Node ? voice : Voice.None;

  return (
    <div
      data-name="point-line"
      tabIndex={tabIndex}
      id={id}
      className={cn(
        'p-2 mb-2',
        noIndent ? 'pl-2' : 'pl-4',
        baseColors({ voice: lineVoice }),
        lineColors({ voice: lineVoice, active }),
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface PointBoxChildrenProps {
  children: React.ReactNode;
  className?: string;
}

export function PointBoxChildren({
  children,
  className,
}: PointBoxChildrenProps) {
  const { noIndent } = useContext(PointBoxContext);

  return (
    <div
      data-name="point-children"
      className={cn(noIndent ? 'pl-0' : 'pl-4', className)}
    >
      {children}
    </div>
  );
}

// Helpers
// =============================================================================

function getVoiceOrDefault(point: PointParsed) {
  return {
    voice: point.voice ?? Voice.None,
    voiceScope: point.voiceScope ?? VoiceScope.Subtree,
  };
}
