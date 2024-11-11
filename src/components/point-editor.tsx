import React, { forwardRef, memo, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronsDownUp,
  File,
  MicVocal,
  Plus,
  Trash,
  FileX2,
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { useSelector } from '@xstate/store/react';
import { Content, PointParsed } from '@/types';
import { PointMovement, Voice, VoiceScope } from '@/enums';
import { cn } from '@/lib/utils';
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
import { Toolbar, ToolbarButton } from '@/components/ui/toolbar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  PointBox,
  PointBoxLine,
  PointBoxChildren,
} from '@/components/point-box';
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

interface PointEditorProps {
  point: PointParsed;
}

export const PointEditor = memo(function PointEditor({
  point,
}: PointEditorProps) {
  const isFirstLevel = point.position.length === 1;

  const expanded = useSelector(store, (state) => {
    const { focusedPointId } = state.context;
    if (!focusedPointId) return false;
    return focusedPointId === point.id;
  });

  const isLastRemaining = useSelector(store, (state) => {
    const { outlineDoc } = state.context;
    return isFirstLevel && outlineDoc.body.points.length === 1;
  });

  const [alertDelete, setAlertDelete] = useState(false);
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
    <PointBox point={point} active={expanded}>
      <PointBoxLine
        id={point.id}
        className={cn('outline-ring', !expanded && 'cursor-pointer')}
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();
          if (!expanded) {
            focusPoint(point);
          }
        }}
      >
        {expanded && (
          <Toolbar
            data-name="point-editor-toolbar"
            className="flex justify-between items-center text-foreground -mx-1 mb-2"
          >
            <ScrollArea className="flex-1" type="scroll">
              <div className="flex items-center w-max space-x-2 p-1 pr-2">
                <ToolButton
                  tooltip="Collapse"
                  onClick={unfocusPoint}
                  disabled={!expanded}
                >
                  <ChevronsDownUp className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                  tooltip="Move up"
                  onClick={() => move(point, 'up')}
                  disabled={!point.movement.includes(PointMovement.MoveUp)}
                >
                  <ArrowUp className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                  tooltip="Move down"
                  onClick={() => move(point, 'down')}
                  disabled={!point.movement.includes(PointMovement.MoveDown)}
                >
                  <ArrowDown className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                  tooltip="Indent left"
                  onClick={() => indent(point, 'left')}
                  disabled={!point.movement.includes(PointMovement.IndentLeft)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                  tooltip="Indent right"
                  onClick={() => indent(point, 'right')}
                  disabled={!point.movement.includes(PointMovement.IndentRight)}
                >
                  <ArrowRight className="h-4 w-4" />
                </ToolButton>
                {typeof point.script === 'string' && !point.scriptRemoved ? (
                  <ToolButton
                    tooltip="Remove script"
                    onClick={() => removeScript(point)}
                  >
                    <FileX2 className="h-4 w-4" />
                  </ToolButton>
                ) : (
                  <ToolButton
                    tooltip="Add script"
                    onClick={() => addScript(point)}
                  >
                    <File className="h-4 w-4" />
                  </ToolButton>
                )}

                <DropdownMenu>
                  <ToolButton tooltip="Change voice" asChild>
                    <DropdownMenuTrigger>
                      <MicVocal
                        className={cn('h-4 w-4', voiceColor({ voice }))}
                      />
                    </DropdownMenuTrigger>
                  </ToolButton>
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

            <Separator
              orientation="vertical"
              className="h-6 bg-foreground/10"
            />

            <div className="flex-none flex items-center space-x-2 p-1 pb-2 pl-2">
              <ToolButton
                tooltip="Remove point"
                onClick={() => confirmRemove(point)}
                disabled={isLastRemaining}
              >
                <Trash className="h-4 w-4" />
              </ToolButton>
              <ToolButton
                tooltip="Add point after"
                onClick={() => addAfter(point)}
              >
                <Plus className="h-4 w-4" />
              </ToolButton>
            </div>
          </Toolbar>
        )}

        <div data-name="point-editor-idea">
          {expanded ? (
            <ContentEditor
              key={point.id}
              initialValue={point.idea}
              onChange={(value) => changeIdea(point, value)}
              placeholder="Write your idea here..."
            />
          ) : (
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
                  <i className="flex-none text-muted-foreground ml-2">···</i>
                )}
            </div>
          )}
        </div>

        {typeof point.script === 'string' &&
          !point.scriptRemoved &&
          expanded && (
            <div
              data-name="point-editor-script"
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
      </PointBoxLine>

      {point.points && point.points.length > 0 && (
        <PointBoxChildren>
          {point.points.map((subpoint) => (
            <PointEditor key={subpoint.id} point={subpoint} />
          ))}
        </PointBoxChildren>
      )}

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
    </PointBox>
  );
});

const ToolButton = forwardRef<
  React.ElementRef<typeof ToolbarButton>,
  React.ComponentPropsWithoutRef<typeof ToolbarButton> & {
    tooltip: string;
  }
>(({ tooltip, ...props }, ref) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ToolbarButton variant="ghost" size="iconmini" ref={ref} {...props} />
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
});
ToolButton.displayName = 'ToolButton';
