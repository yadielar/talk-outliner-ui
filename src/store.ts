import { createStore } from '@xstate/store';
import memize from 'memize';
import { OutlineDoc, OutlineDocParsed, PointParsed } from '@/types';
import { OutlineDocSchema } from '@/schemas';
import {
  addNewPointAfter,
  changeOutlineDescription,
  changeOutlineTitle,
  createOutlineDoc,
  createPoint,
  findPoint,
  flattenPoints,
  getParentPosition,
  getPrecedingSiblingPosition,
  getSucceedingSiblingPosition,
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
  fileHandle: FileSystemFileHandle | undefined;
  focusedPointId: string | null;
  lastFocusedPointId: string | null;
};

const initialContext: AppContext = getInitialContext();

export const store = createStore(initialContext, {
  loadOutlineDocFromFile: (
    context,
    {
      outlineDoc,
      fileHandle,
    }: {
      outlineDoc: OutlineDocParsed;
      fileHandle: FileSystemFileHandle | undefined;
    },
  ) => {
    return {
      outlineDoc,
      fileHandle,
    };
  },
  savedOutlineDocToFile: (
    context,
    { fileHandle }: { fileHandle: FileSystemFileHandle | undefined },
  ) => {
    return {
      fileHandle,
    };
  },
  changeOutlineTitle: (context, { title }: { title: string }) => {
    return {
      outlineDoc: changeOutlineTitle(context.outlineDoc, title),
    };
  },
  changeOutlineDescription: (
    context,
    { description }: { description: string },
  ) => {
    return {
      outlineDoc: changeOutlineDescription(context.outlineDoc, description),
    };
  },
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
    const newOutlineDoc = addNewPointAfter(context.outlineDoc, point);
    const newPointPosition = getSucceedingSiblingPosition(point);
    const newPoint = findPoint(newOutlineDoc.body.points, (point) => {
      return point.position.toString() === newPointPosition.toString();
    });
    return {
      outlineDoc: newOutlineDoc,
      focusedPointId: newPoint!.id,
      lastFocusedPointId: newPoint!.id,
    };
  },
  removePoint: (context, { point }: { point: PointParsed }) => {
    const newOutlineDoc = removePoint(context.outlineDoc, point);
    let newFocusedPoint = findPoint(newOutlineDoc.body.points, (p) => {
      return p.position.toString() === point.position.toString();
    });
    if (!newFocusedPoint) {
      newFocusedPoint = findPoint(newOutlineDoc.body.points, (p) => {
        return (
          p.position.toString() ===
          getPrecedingSiblingPosition(point).toString()
        );
      });
    }
    if (!newFocusedPoint) {
      newFocusedPoint = findPoint(newOutlineDoc.body.points, (p) => {
        return p.position.toString() === getParentPosition(point).toString();
      });
    }
    return {
      outlineDoc: newOutlineDoc,
      focusedPointId: newFocusedPoint?.id ?? null,
      lastFocusedPointId: newFocusedPoint?.id ?? null,
    };
  },
  focusPoint: (context, { point }: { point: PointParsed }) => {
    return {
      focusedPointId: point.id,
      lastFocusedPointId: point.id,
    };
  },
  unfocusPoint: () => {
    return {
      focusedPointId: null,
    };
  },
  togglePointFocus: (context, { point }: { point: PointParsed }) => {
    const focusedPointId =
      context.focusedPointId !== point.id ? point.id : null;
    return {
      focusedPointId,
      lastFocusedPointId: focusedPointId ?? getLastFocusedPointId(context),
    };
  },
  focusNextPoint: (context) => {
    const allPoints = flattenPointsMemoed(context.outlineDoc.body.points);
    const lastPointId = getLastFocusedPointId(context) ?? allPoints[0]!.id;
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
    const lastPointId = getLastFocusedPointId(context) ?? allPoints[0]!.id;
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

function getInitialContext(): AppContext {
  const storedDoc = documentStorage.loadFromLocalStorage();
  let unparsedDoc: OutlineDoc;

  if (storedDoc) {
    const result = OutlineDocSchema.safeParse(storedDoc);
    unparsedDoc = result.success ? result.data : createOutlineDoc();
  } else {
    unparsedDoc = createOutlineDoc();
  }

  if (unparsedDoc.body.points.length === 0) {
    unparsedDoc = {
      ...unparsedDoc,
      body: {
        ...unparsedDoc.body,
        points: [createPoint()],
      },
    };
  }

  const doc = parseOutlineDoc(unparsedDoc);

  return {
    outlineDoc: doc,
    fileHandle: undefined,
    focusedPointId: doc.body.points[0] ? doc.body.points[0].id : null,
    lastFocusedPointId: null,
  };
}

function getLastFocusedPointId(context: AppContext) {
  return context.focusedPointId ?? context.lastFocusedPointId;
}
