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
import { Content, PointParsed } from '@/types';
import { PointMovement, Voice, VoiceScope } from '@/enums';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ContentEditor } from '@/components/content-editor';
import { store } from '@/store';

const voiceColor = cva<{ voice: Record<Voice, string> }>('', {
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

const voiceBg = cva<{ voice: Record<Voice, string> }>('', {
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
  const { voice = Voice.None, voiceScope = VoiceScope.Subtree } = point;

  function move(point: PointParsed, direction: 'up' | 'down') {
    if (direction === 'up') {
      if (!point.movement.includes(PointMovement.MoveUp)) {
        return;
      }
      store.send({ type: 'movePointUp', point });
    }
    if (direction === 'down') {
      if (!point.movement.includes(PointMovement.MoveDown)) {
        return;
      }
      store.send({ type: 'movePointDown', point });
    }
  }

  function indent(point: PointParsed, direction: 'left' | 'right') {
    if (direction === 'left') {
      if (!point.movement.includes(PointMovement.IndentLeft)) {
        return;
      }
      store.send({ type: 'indentPointLeft', point });
    }
    if (direction === 'right') {
      if (!point.movement.includes(PointMovement.IndentRight)) {
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
      <div className="flex justify-between items-center mb-1">
        <ScrollArea className="flex-1" type="scroll">
          <div className="flex items-center w-max space-x-2 pr-2">
            <Button
              variant="ghost"
              size="iconmini"
              onClick={() => move(point, 'up')}
              disabled={!point.movement.includes(PointMovement.MoveUp)}
            >
              <MoveUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="iconmini"
              onClick={() => move(point, 'down')}
              disabled={!point.movement.includes(PointMovement.MoveDown)}
            >
              <MoveDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="iconmini"
              onClick={() => indent(point, 'left')}
              disabled={!point.movement.includes(PointMovement.IndentLeft)}
            >
              <IndentDecrease className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="iconmini"
              onClick={() => indent(point, 'right')}
              disabled={!point.movement.includes(PointMovement.IndentRight)}
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
                    value={Voice.None}
                    className={voiceColor({ voice: Voice.None })}
                  >
                    None
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value={Voice.Info}
                    className={voiceColor({ voice: Voice.Info })}
                  >
                    Info
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value={Voice.Question}
                    className={voiceColor({ voice: Voice.Question })}
                  >
                    Question
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value={Voice.Reference}
                    className={voiceColor({ voice: Voice.Reference })}
                  >
                    Reference
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value={Voice.Example}
                    className={voiceColor({ voice: Voice.Example })}
                  >
                    Example
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value={Voice.Story}
                    className={voiceColor({ voice: Voice.Story })}
                  >
                    Story
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value={Voice.Lesson}
                    className={voiceColor({ voice: Voice.Lesson })}
                  >
                    Lesson
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value={Voice.Action}
                    className={voiceColor({ voice: Voice.Action })}
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
                  <DropdownMenuRadioItem value={VoiceScope.Subtree}>
                    Apply to child points
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={VoiceScope.Node}>
                    Apply only to this point
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <Separator orientation="vertical" className="h-6 bg-foreground/10" />

        <div className="flex-none flex items-center space-x-2 pl-2">
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
        className={cn(
          voiceScope === VoiceScope.Subtree && ['p-2', voiceBg({ voice })],
        )}
      >
        <div
          className={cn(
            voiceScope === VoiceScope.Node && ['p-2', voiceBg({ voice })],
          )}
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
