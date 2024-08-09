import {
  File,
  IndentDecrease,
  IndentIncrease,
  MoveUp,
  MoveDown,
  Plus,
  Trash,
  FileX2,
} from 'lucide-react';
import { PointParsed } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ContentEditor } from '@/components/content-editor';

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

  function handleAddScript() {
    onChange({ ...point, script: '' });
  }

  function handleRemoveScript() {
    onChange({ ...point, script: undefined });
  }

  return (
    <div className={cn('pt-4', !isFirstLevel && 'pl-4')}>
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(point, 'up')}
            disabled={!point.movement.includes('move_up')}
          >
            <MoveUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(point, 'down')}
            disabled={!point.movement.includes('move_down')}
          >
            <MoveDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onIndent(point, 'left')}
            disabled={!point.movement.includes('indent_left')}
          >
            <IndentDecrease className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onIndent(point, 'right')}
            disabled={!point.movement.includes('indent_right')}
          >
            <IndentIncrease className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
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
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onRemove(point)}>
            <Trash className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onAddAfter(point)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ContentEditor
        key={point.id}
        initialValue={point.idea}
        onChange={(value) => onChange({ ...point, idea: value })}
        placeholder="Write your idea here..."
      />

      {typeof point.script === 'string' && (
        <div className="mt-2">
          <ContentEditor
            key={point.id}
            initialValue={point.script}
            onChange={(value) => onChange({ ...point, script: value })}
            placeholder="Write your script here..."
          />
        </div>
      )}

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
  );
}
