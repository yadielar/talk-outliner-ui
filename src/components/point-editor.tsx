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
import { PointParsed, Voice, VoiceScope } from '@/types';
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
import { cva } from 'class-variance-authority';

interface PointEditorProps {
  point: PointParsed;
  onChange: (point: PointParsed) => void;
  onMove: (point: PointParsed, direction: 'up' | 'down') => void;
  onIndent: (point: PointParsed, direction: 'left' | 'right') => void;
  onAddAfter: (point: PointParsed) => void;
  onRemove: (point: PointParsed) => void;
}

export function PointEditor({
  point,
  onChange,
  onMove,
  onIndent,
  onAddAfter,
  onRemove,
}: PointEditorProps) {
  const isFirstLevel = point.position.length === 1;
  const { voice = 'none', voiceScope = 'subtree' } = point;

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

  function handleAddScript() {
    onChange({ ...point, script: '' });
  }

  function handleRemoveScript() {
    onChange({ ...point, script: undefined });
  }

  function handleVoiceChange(voice: Voice) {
    onChange({ ...point, voice });
  }

  function handleVoiceScopeChange(voiceScope: VoiceScope) {
    onChange({ ...point, voiceScope });
  }

  return (
    <div className={cn('pt-4', !isFirstLevel && 'pl-4')}>
      <div className="flex justify-between mb-1">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => onMove(point, 'up')}
            disabled={!point.movement.includes('move_up')}
          >
            <MoveUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => onMove(point, 'down')}
            disabled={!point.movement.includes('move_down')}
          >
            <MoveDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => onIndent(point, 'left')}
            disabled={!point.movement.includes('indent_left')}
          >
            <IndentDecrease className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => onIndent(point, 'right')}
            disabled={!point.movement.includes('indent_right')}
          >
            <IndentIncrease className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconmini"
            onClick={
              typeof point.script === 'string'
                ? handleRemoveScript
                : handleAddScript
            }
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
                onValueChange={(value) => handleVoiceChange(value as Voice)}
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
                  handleVoiceScopeChange(value as VoiceScope)
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
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => onRemove(point)}
          >
            <Trash className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconmini"
            onClick={() => onAddAfter(point)}
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
            onChange={(value) => onChange({ ...point, idea: value })}
            placeholder="Write your idea here..."
          />

          {typeof point.script === 'string' && (
            <div className="mt-2 pl-2 border-dotted border-foreground/20 border-l-2">
              <ContentEditor
                key={point.id}
                initialValue={point.script}
                onChange={(value) => onChange({ ...point, script: value })}
                placeholder="Write your script here..."
              />
            </div>
          )}
        </div>

        {point.points && point.points.length > 0 && (
          <div>
            {point.points.map((subpoint) => (
              <PointEditor
                key={subpoint.id}
                point={subpoint}
                onChange={onChange}
                onMove={onMove}
                onIndent={onIndent}
                onAddAfter={onAddAfter}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
