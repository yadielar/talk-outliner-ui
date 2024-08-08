import { useEffect, useState } from 'react';
import { PointParsed } from '@/types';
import { documentStorage } from '@/lib/document-storage';
import {
  createOutlineDoc,
  parseOutlineDoc,
  updatePoint,
  movePointUp,
  movePointDown,
  indentPointRight,
  indentPointLeft,
  addNewPointAfter,
  removePoint,
} from '@/lib/document-utils';
import { PointEditor } from './point-editor';

export function OutlineEditor() {
  const [outlineDoc, setOutlineDoc] = useState(() => {
    const doc = documentStorage.load() ?? createOutlineDoc();
    return parseOutlineDoc(doc);
  });

  useEffect(() => {
    documentStorage.save(outlineDoc);
  }, [outlineDoc]);

  function handlePointChange(point: PointParsed) {
    setOutlineDoc((doc) => updatePoint(doc, point));
  }

  /**
   * Moves a point up or down in the outline.
   */
  function handleMovePoint(point: PointParsed, direction: 'up' | 'down') {
    if (direction === 'up') {
      if (!point.movement.includes('move_up')) {
        return;
      }
      setOutlineDoc((doc) => movePointUp(doc, point));
    }
    if (direction === 'down') {
      if (!point.movement.includes('move_down')) {
        return;
      }
      setOutlineDoc((doc) => movePointDown(doc, point));
    }
  }

  /**
   * Indents a point to the left or right in the outline.
   */
  function handleIndentPoint(point: PointParsed, direction: 'left' | 'right') {
    if (direction === 'left') {
      if (!point.movement.includes('indent_left')) {
        return;
      }
      setOutlineDoc((doc) => indentPointLeft(doc, point));
    }
    if (direction === 'right') {
      if (!point.movement.includes('indent_right')) {
        return;
      }
      setOutlineDoc((doc) => indentPointRight(doc, point));
    }
  }

  /**
   * Adds a new point after the given point in the outline.
   */
  function handleAddNewPointAfter(point: PointParsed) {
    setOutlineDoc((doc) => addNewPointAfter(doc, point));
  }

  /**
   * Removes a point from the outline.
   */
  function handleRemovePoint(point: PointParsed) {
    setOutlineDoc((doc) => removePoint(doc, point));
  }

  return (
    <div className="md:container lg:max-w-5xl px-4 pb-4 md:px-5">
      {outlineDoc.body.points.map((point) => (
        <PointEditor
          key={point.id}
          point={point}
          onChange={handlePointChange}
          onMove={handleMovePoint}
          onIndent={handleIndentPoint}
          onAddAfter={handleAddNewPointAfter}
          onRemove={handleRemovePoint}
        />
      ))}
    </div>
  );
}
