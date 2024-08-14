import { memo, useState } from 'react';
import {
  ChevronsDownUp,
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
import { useSelector } from '@xstate/store/react';
import { Content, PointParsed } from '@/types';
import { PointMovement, Voice, VoiceScope } from '@/enums';
import { cn } from '@/lib/utils';
import { findPoint } from '@/lib/document-utils';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { ContentRenderer } from '@/components/content-renderer';
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
      none: 'bg-neutral group-[.collapsed]:hover:bg-neutral-active',
      info: 'bg-info group-[.collapsed]:hover:bg-info-active',
      question: 'bg-question group-[.collapsed]:hover:bg-question-active',
      reference: 'bg-reference group-[.collapsed]:hover:bg-reference-active',
      example: 'bg-example group-[.collapsed]:hover:bg-example-active',
      story: 'bg-story group-[.collapsed]:hover:bg-story-active',
      lesson: 'bg-lesson group-[.collapsed]:hover:bg-lesson-active',
      action: 'bg-action group-[.collapsed]:hover:bg-action-active',
    },
  },
});

interface PointEditorProps {
  point: PointParsed;
}

export const PointEditor = memo(function PointEditor({
  point,
}: PointEditorProps) {
  const expanded = useSelector(store, (state) => {
    const { outlineDoc, focusedPointId } = state.context;
    if (!focusedPointId) return false;
    const focusedPoint = findPoint(
      outlineDoc.body.points,
      (point) => point.id === focusedPointId,
    );
    if (!focusedPoint) return false;
    return focusedPoint.position[0] === point.position[0];
  });
  const [alertDelete, setAlertDelete] = useState(false);
  const isFirstLevel = point.position.length === 1;
  const { voice = Voice.None, voiceScope = VoiceScope.Subtree } = point;

  function focusPoint(point: PointParsed) {
    if (expanded) return;
    store.send({ type: 'focusPoint', point });
  }

  function unfocusPoint() {
    store.send({ type: 'unfocusPoint' });
  }

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

  function confirmRemove(point: PointParsed) {
    if (
      (typeof point.script === 'string' && point.script.length > 0) ||
      (point.points && point.points.length > 0)
    ) {
      setAlertDelete(true);
      return;
    }
    remove(point);
  }

  function remove(point: PointParsed) {
    store.send({ type: 'removePoint', point });
  }

  function addScript(point: PointParsed) {
    store.send({
      type: 'updatePoint',
      point: {
        ...point,
        script:
          typeof point.script === 'string' && point.scriptRemoved
            ? point.script
            : '',
        scriptRemoved: false,
      },
    });
  }

  function removeScript(point: PointParsed) {
    store.send({
      type: 'updatePoint',
      point: { ...point, scriptRemoved: true },
    });
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
    <div
      data-name="root"
      id={point.id}
      className={cn(
        'mt-4',
        !isFirstLevel && 'pl-4',
        !expanded && 'collapsed group',
      )}
    >
      {expanded && (
        <div
          data-name="toolbar"
          className="flex justify-between items-center mb-1"
        >
          <ScrollArea className="flex-1" type="scroll">
            <div className="flex items-center w-max space-x-2 pr-2">
              {isFirstLevel && (
                <Button
                  variant="ghost"
                  size="iconmini"
                  onClick={unfocusPoint}
                  disabled={!expanded}
                >
                  <ChevronsDownUp className="h-4 w-4" />
                </Button>
              )}
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
                  if (
                    typeof point.script === 'string' &&
                    !point.scriptRemoved
                  ) {
                    removeScript(point);
                  } else {
                    addScript(point);
                  }
                }}
              >
                {typeof point.script === 'string' && !point.scriptRemoved ? (
                  <FileX2 className="h-4 w-4" />
                ) : (
                  <File className="h-4 w-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="iconmini">
                    <MicVocal
                      className={cn('h-4 w-4', voiceColor({ voice }))}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52">
                  <DropdownMenuLabel>Voice</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={voice}
                    onValueChange={(value) =>
                      changeVoice(point, value as Voice)
                    }
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
            <Button
              variant="ghost"
              size="iconmini"
              onClick={() => confirmRemove(point)}
            >
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
      )}

      <div
        data-name="container"
        className={cn(
          voiceScope === VoiceScope.Subtree && ['p-2', voiceBg({ voice })],
          !expanded && 'cursor-pointer',
        )}
        onClick={() => focusPoint(point)}
      >
        <div
          data-name="line"
          className={cn(
            voiceScope === VoiceScope.Node && ['p-2', voiceBg({ voice })],
          )}
        >
          <div data-name="idea">
            {expanded ? (
              <ContentEditor
                key={point.id}
                initialValue={point.idea}
                onChange={(value) => changeIdea(point, value)}
                placeholder="Write your idea here..."
              />
            ) : point.idea.length > 0 ? (
              <ContentRenderer value={point.idea} />
            ) : (
              <div className="text-sm italic text-muted-foreground/50 p-2">
                Empty point
              </div>
            )}
          </div>

          {typeof point.script === 'string' &&
            !point.scriptRemoved &&
            expanded && (
              <div
                data-name="script"
                className="mt-2 pl-2 border-dotted border-foreground/20 border-l-2"
              >
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
      <AlertDialog open={alertDelete} onOpenChange={setAlertDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting this point will also delete all of it&apos;s children.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove(point)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
