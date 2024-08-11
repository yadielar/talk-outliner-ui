import { memo } from 'react';
import {
  File,
  IndentDecrease,
  IndentIncrease,
  MicVocal,
  MoveUp,
  MoveDown,
  Plus,
  Trash,
  FileX2,
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { Content, PointParsed, Voice, VoiceScope } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ContentEditor } from '@/components/content-editor';
import { store } from '@/store';

const voiceColor = cva('', {
  variants: {
    voice: {
      none: '',
      info: 'text-info-foreground',
      question: 'text-question-foreground',
      reference: 'text-quote', // we're using quote color for more brightness
      example: 'text-example-foreground',
      story: 'text-story-foreground',
      lesson: 'text-lesson-foreground',
      action: 'text-action-foreground',
    },
  },
});

const voiceBg = cva('', {
  variants: {
    voice: {
      none: '',
      info: 'bg-info',
      question: 'bg-question',
      reference: 'bg-reference',
      example: 'bg-example',
      story: 'bg-story',
      lesson: 'bg-lesson',
      action: 'bg-action',
    },
  },
});

interface PointEditorProps {
  point: PointParsed;
}

export const PointEditor = memo(function PointEditor({
  point,
}: PointEditorProps) {
  const isFirstLevel = point.position.length === 1;
  const { voice = 'none', voiceScope = 'subtree' } = point;

  function move(point: PointParsed, direction: 'up' | 'down') {
    if (direction === 'up') {
      if (!point.movement.includes('move_up')) {
        return;
      }
      store.send({ type: 'movePointUp', point });
    }
    if (direction === 'down') {
      if (!point.movement.includes('move_down')) {
        return;
      }
      store.send({ type: 'movePointDown', point });
    }
  }

  function indent(point: PointParsed, direction: 'left' | 'right') {
    if (direction === 'left') {
      if (!point.movement.includes('indent_left')) {
        return;
      }
      store.send({ type: 'indentPointLeft', point });
    }
    if (direction === 'right') {
      if (!point.movement.includes('indent_right')) {
        return;
      }
      store.send({ type: 'indentPointRight', point });
    }
  }

  function addAfter(point: PointParsed) {
    store.send({ type: 'addNewPointAfter', point });
  }

  function remove(point: PointParsed) {
    store.send({ type: 'removePoint', point });
  }

  function addScript(point: PointParsed) {
    store.send({ type: 'updatePoint', point: { ...point, script: '' } });
  }

  function removeScript(point: PointParsed) {
    store.send({ type: 'updatePoint', point: { ...point, script: undefined } });
  }

  function changeIdea(point: PointParsed, idea: Content) {
    store.send({ type: 'updatePoint', point: { ...point, idea } });
  }

  function changeScript(point: PointParsed, script: Content) {
    store.send({ type: 'updatePoint', point: { ...point, script } });
  }

  function changeVoice(point: PointParsed, voice: Voice) {
    store.send({ type: 'updatePoint', point: { ...point, voice } });
  }

  function changeVoiceScope(point: PointParsed, voiceScope: VoiceScope) {
    store.send({ type: 'updatePoint', point: { ...point, voiceScope } });
  }

  return (
    <div className={cn('pt-4', !isFirstLevel && 'pl-4')}>
      <div className="flex justify-between mb-1">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => move(point, 'up')}
            disabled={!point.movement.includes('move_up')}
          >
            <MoveUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => move(point, 'down')}
            disabled={!point.movement.includes('move_down')}
          >
            <MoveDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => indent(point, 'left')}
            disabled={!point.movement.includes('indent_left')}
          >
            <IndentDecrease className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => indent(point, 'right')}
            disabled={!point.movement.includes('indent_right')}
          >
            <IndentIncrease className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => {
              if (typeof point.script === 'string') {
                removeScript(point);
              } else {
                addScript(point);
              }
            }}
          >
            {typeof point.script === 'string' ? (
              <FileX2 className="h-4 w-4" />
            ) : (
              <File className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="iconmini">
                <MicVocal className={cn('h-4 w-4', voiceColor({ voice }))} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52">
              <DropdownMenuLabel>Voice</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={voice}
                onValueChange={(value) => changeVoice(point, value as Voice)}
              >
                <DropdownMenuRadioItem
                  value="none"
                  className={voiceColor({ voice: 'none' })}
                >
                  None
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="info"
                  className={voiceColor({ voice: 'info' })}
                >
                  Info
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="question"
                  className={voiceColor({ voice: 'question' })}
                >
                  Question
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="reference"
                  className={voiceColor({ voice: 'reference' })}
                >
                  Reference
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="example"
                  className={voiceColor({ voice: 'example' })}
                >
                  Example
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="story"
                  className={voiceColor({ voice: 'story' })}
                >
                  Story
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="lesson"
                  className={voiceColor({ voice: 'lesson' })}
                >
                  Lesson
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="action"
                  className={voiceColor({ voice: 'action' })}
                >
                  Action
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={voiceScope}
                onValueChange={(value) =>
                  changeVoiceScope(point, value as VoiceScope)
                }
              >
                <DropdownMenuRadioItem value="subtree">
                  Apply to child points
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="node">
                  Apply only to this point
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="iconmini" onClick={() => remove(point)}>
            <Trash className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => addAfter(point)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className={cn(voiceScope === 'subtree' && ['p-2', voiceBg({ voice })])}
      >
        <div
          className={cn(voiceScope === 'node' && ['p-2', voiceBg({ voice })])}
        >
          <ContentEditor
            key={point.id}
            initialValue={point.idea}
            onChange={(value) => changeIdea(point, value)}
            placeholder="Write your idea here..."
          />

          {typeof point.script === 'string' && (
            <div className="mt-2 pl-2 border-dotted border-foreground/20 border-l-2">
              <ContentEditor
                key={point.id}
                initialValue={point.script}
                onChange={(value) => changeScript(point, value)}
                placeholder="Write your script here..."
              />
            </div>
          )}
        </div>

        {point.points && point.points.length > 0 && (
          <div>
            {point.points.map((subpoint) => (
              <PointEditor key={subpoint.id} point={subpoint} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
