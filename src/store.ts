import { createStore } from '@xstate/store';
import memize from 'memize';
import { OutlineDocParsed, PointParsed } from '@/types';
import {
  addNewPointAfter,
  createOutlineDoc,
  flattenPoints,
  indentPointLeft,
  indentPointRight,
  movePointDown,
  movePointUp,
  parseOutlineDoc,
  removePoint,
  updatePoint,
} from '@/lib/document-utils';
import { documentStorage } from '@/lib/document-storage';

type AppContext = {
  outlineDoc: OutlineDocParsed;
  focusedPointId: string | null;
  lastFocusedPointId: string | null;
};

const initialContext: AppContext = {
  outlineDoc: parseOutlineDoc(documentStorage.load() ?? createOutlineDoc()),
  focusedPointId: null,
  lastFocusedPointId: null,
};

export const store = createStore(initialContext, {
  updatePoint: (context, { point }: { point: PointParsed }) => {
    return {
      outlineDoc: updatePoint(context.outlineDoc, point),
    };
  },
  movePointUp: (context, { point }: { point: PointParsed }) => {
    return {
      outlineDoc: movePointUp(context.outlineDoc, point),
    };
  },
  movePointDown: (context, { point }: { point: PointParsed }) => {
    return {
      outlineDoc: movePointDown(context.outlineDoc, point),
    };
  },
  indentPointLeft: (context, { point }: { point: PointParsed }) => {
    return {
      outlineDoc: indentPointLeft(context.outlineDoc, point),
    };
  },
  indentPointRight: (context, { point }: { point: PointParsed }) => {
    return {
      outlineDoc: indentPointRight(context.outlineDoc, point),
    };
  },
  addNewPointAfter: (context, { point }: { point: PointParsed }) => {
    return {
      outlineDoc: addNewPointAfter(context.outlineDoc, point),
    };
  },
  removePoint: (context, { point }: { point: PointParsed }) => {
    return {
      outlineDoc: removePoint(context.outlineDoc, point),
    };
  },
  togglePointFocus: (context, { pointId }: { pointId: string }) => {
    return {
      focusedPointId: context.focusedPointId !== pointId ? pointId : null,
      lastFocusedPointId:
        context.focusedPointId !== null
          ? context.focusedPointId
          : context.lastFocusedPointId,
    };
  },
  focusNextPoint: (context) => {
    const allPoints = flattenPointsMemoed(context.outlineDoc.body.points);
    const lastPointId = getLastFocusedPointId(context, allPoints[0]!.id);
    const lastPointIndex = allPoints.findIndex(
      (point) => point.id === lastPointId,
    );

    const nextPointIndex =
      context.focusedPointId !== null ? lastPointIndex + 1 : lastPointIndex;
    const nextPoint = allPoints[nextPointIndex];

    if (nextPoint) {
      return {
        focusedPointId: nextPoint.id,
        lastFocusedPointId: nextPoint.id,
      };
    } else {
      return {
        focusedPointId: context.focusedPointId,
        lastFocusedPointId: context.lastFocusedPointId,
      };
    }
  },
  focusPrevPoint: (context) => {
    const allPoints = flattenPointsMemoed(context.outlineDoc.body.points);
    const lastPointId = getLastFocusedPointId(context, allPoints[0]!.id);
    const lastPointIndex = allPoints.findIndex(
      (point) => point.id === lastPointId,
    );

    const prevPointIndex =
      context.focusedPointId !== null ? lastPointIndex - 1 : lastPointIndex;
    const prevPoint = allPoints[prevPointIndex];

    if (prevPoint) {
      return {
        focusedPointId: prevPoint.id,
        lastFocusedPointId: prevPoint.id,
      };
    } else {
      return {
        focusedPointId: context.focusedPointId,
        lastFocusedPointId: context.lastFocusedPointId,
      };
    }
  },
});

// Helpers
// =============================================================================

const flattenPointsMemoed = memize(flattenPoints);

function getLastFocusedPointId(
  { focusedPointId, lastFocusedPointId }: AppContext,
  fallbackId: string,
) {
  return focusedPointId !== null
    ? focusedPointId
    : lastFocusedPointId !== null
      ? lastFocusedPointId
      : fallbackId;
}
