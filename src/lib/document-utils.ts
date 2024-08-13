import { OutlineDoc, OutlineDocParsed, Point, PointParsed } from '@/types';
import { PointMovement } from '@/enums';
import { createRandomString } from './string';

// Utils for creating a document or point
// =============================================================================

/**
 * Creates a new outline document.
 */
export function createOutlineDoc(): OutlineDoc {
  return {
    head: {
      title: '',
      description: '',
    },
    body: {
      points: [createPoint()],
    },
  };
}

/**
 * Creates a new point.
 */
export function createPoint(): Point {
  return {
    idea: '',
  };
}

// Utils for parsing a document or point and create a model with additional
// information that can be useful when editing or viewing.
// =============================================================================

/**
 * Parses an outline document and adds additional information to points, such as
 * an id, position, and movement information.
 */
export function parseOutlineDoc(outlineDoc: OutlineDoc): OutlineDocParsed {
  const outlineDocParsed: OutlineDocParsed = {
    ...outlineDoc,
    parsed: true,
    body: {
      ...outlineDoc.body,
      points: outlineDoc.body.points.map((point, index, array) => {
        const position = [index];
        return parsePoint(
          point,
          position,
          calculatePointMovement(position, array),
        );
      }),
    },
  };

  return outlineDocParsed;
}

/**
 * Adds additional information to a point, such as an id, position, and
 * movement information. Recursively does the same for all child points.
 */
export function parsePoint(
  point: Point,
  position: number[],
  movement: PointMovement[],
): PointParsed {
  const id = point.id ?? createRandomString();

  const pointParsed: PointParsed = {
    ...point,
    id,
    position,
    movement,
    points: undefined,
  };

  if (point.points) {
    pointParsed.points = point.points.map((subpoint, index, array) => {
      const subpointPosition = [...position, index];
      return parsePoint(
        subpoint,
        subpointPosition,
        calculatePointMovement(subpointPosition, array),
      );
    });
  }

  return pointParsed;
}

/**
 * Checks if an outline document has been parsed and narrows the type.
 */
export function isOutlineDocParsed(
  doc: OutlineDoc | OutlineDocParsed,
): doc is OutlineDocParsed {
  return (doc as OutlineDocParsed).parsed === true;
}

/**
 * Checks if a point has been parsed and narrows the type.
 */
export function isPointParsed(
  point: Point | PointParsed,
): point is PointParsed {
  return (point as PointParsed).id !== undefined;
}

/**
 * Calculates the possible movements for a point in the outline.
 */
function calculatePointMovement(
  position: number[],
  containingArray: Point[],
): PointMovement[] {
  const index = position[position.length - 1]!;
  const movement: PointMovement[] = [];

  if (index > 0) {
    movement.push(PointMovement.MoveUp);
  }
  if (index < containingArray.length - 1) {
    movement.push(PointMovement.MoveDown);
  }
  if (position.length > 1) {
    movement.push(PointMovement.IndentLeft);
  }
  if (position[position.length - 1]! > 0) {
    movement.push(PointMovement.IndentRight);
  }

  return movement;
}

// Utils for cleaning a document or point before saving it to storage.
// Removes information added after parsing.
// =============================================================================

/**
 * Cleans an outline document before saving it to storage. Removes additional
 * information added during parsing.
 */
export function cleanOutlineDoc(outlineDoc: OutlineDocParsed): OutlineDoc {
  const outlineDocClean: OutlineDoc = {
    ...outlineDoc,
    parsed: undefined,
    body: {
      ...outlineDoc.body,
      points: outlineDoc.body.points as Point[],
    },
  };

  outlineDocClean.body.points = outlineDoc.body.points.map((point) =>
    cleanPoint(point),
  );

  return outlineDocClean;
}

/**
 * Cleans a point before saving it to storage. Removes additional information
 * added during parsing.
 */
function cleanPoint(point: PointParsed): Point {
  const pointClean = {
    ...point,
    id: undefined,
    position: undefined,
    movement: undefined,
    scriptRemoved: undefined,
  } as Point;

  if (point.scriptRemoved) {
    pointClean.script = undefined;
  }

  if (point.points) {
    pointClean.points = point.points.map((subpoint) => cleanPoint(subpoint));
  }

  return pointClean;
}

// Utils for querying and updating parsed documents or points
// =============================================================================

/**
 * Gets the position of the parent of a point. If the parent is the root, returns
 * an empty array.
 */
export function getParentPosition(point: PointParsed) {
  return point.position.slice(0, -1);
}

/**
 * Gets the position of the grandparent of a point. If the grandparent is the
 * root, returns an empty array.
 */
export function getGrandparentPosition(point: PointParsed) {
  const parentPosition = getParentPosition(point);
  return parentPosition.slice(0, -1);
}

/**
 * Gets the position of the preceding sibling of a point. If there is no
 * preceding sibling, the returned position will have a -1 at the end.
 */
export function getPrecedingSiblingPosition(point: PointParsed) {
  const { position } = point;
  return [...position.slice(0, -1), position[position.length - 1]! - 1];
}

/**
 * Finds a point recursively in a tree of points. If the point is not found,
 * returns undefined.
 */
export function findPoint(
  points: PointParsed[],
  predicate: (point: PointParsed) => boolean,
): PointParsed | undefined {
  for (const point of points) {
    if (predicate(point)) {
      return point;
    }
    if (point.points) {
      const found = findPoint(point.points, predicate);
      if (found) {
        return found;
      }
    }
  }
}

/**
 * Gets the siblings that come after a point in the outline. If the point is the
 * last sibling, returns an empty array.
 */
export function getSiblingsAfter(
  outlineDoc: OutlineDocParsed,
  point: PointParsed,
) {
  const parentPosition = getParentPosition(point);
  let points: PointParsed[];

  if (parentPosition.length === 0) {
    points = outlineDoc.body.points;
  } else {
    const parent = findPoint(
      outlineDoc.body.points,
      (p) => p.position.toString() === parentPosition.toString(),
    )!;
    points = parent.points!;
  }

  const index = points.findIndex((p) => p.id === point.id);
  return points.slice(index + 1);
}

/**
 * Changes the title of the outline.
 */
export function changeOutlineTitle(
  outlineDoc: OutlineDocParsed,
  title: string,
): OutlineDocParsed {
  return {
    ...outlineDoc,
    head: {
      ...outlineDoc.head,
      title,
    },
  };
}

/**
 * Changes the description of the outline.
 */
export function changeOutlineDescription(
  outlineDoc: OutlineDocParsed,
  description: string,
): OutlineDocParsed {
  return {
    ...outlineDoc,
    head: {
      ...outlineDoc.head,
      description,
    },
  };
}

/**
 * Replaces a point in the outline with the one provided.
 *
 * @IMPORTANT Do not use this function to update a point's children, like their
 * position for example. The outline is not parsed again after calling this
 * function, so the position of the children will be incorrect.
 */
export function updatePoint(
  outlineDoc: OutlineDocParsed,
  point: PointParsed,
): OutlineDocParsed {
  const branch = point.position[0]!;
  return {
    ...outlineDoc,
    body: {
      ...outlineDoc.body,
      points: outlineDoc.body.points.map((p, index) => {
        // only traverse the branch where the point is located to avoid
        // recreating other branches and maintain object references
        if (index === branch) {
          if (p.id === point.id) {
            return point;
          }
          return {
            ...p,
            points: traversePointsAndUpdate(
              p.points!,
              point,
              (p) => p.id === point.id,
            ),
          };
        }
        return p;
      }),
    },
  };
}

/**
 * @NOTE
 * Do not bother trying to optimize other operations like we did with
 * `updatePoint` if the outline is parsed again regardless. Unless there's a
 * way to optimize `parseOutlineDoc` and maintain references of unchanged
 * objects, which is no easy task.
 */

/**
 *  Moves a point up in the outline.
 */
export function movePointUp(
  outlineDoc: OutlineDocParsed,
  point: PointParsed,
): OutlineDocParsed {
  // point cannot move up, return early
  if (!point.movement.includes(PointMovement.MoveUp)) {
    return outlineDoc;
  }

  return parseOutlineDoc({
    ...outlineDoc,
    body: {
      ...outlineDoc.body,
      points: traversePointsAndMove(outlineDoc.body.points, 'up', (p) => {
        return p.id === point.id;
      }),
    },
  });
}

/**
 *  Moves a point down in the outline.
 */
export function movePointDown(
  outlineDoc: OutlineDocParsed,
  point: PointParsed,
): OutlineDocParsed {
  // point cannot move down, return early
  if (!point.movement.includes(PointMovement.MoveDown)) {
    return outlineDoc;
  }

  return parseOutlineDoc({
    ...outlineDoc,
    body: {
      ...outlineDoc.body,
      points: traversePointsAndMove(outlineDoc.body.points, 'down', (p) => {
        return p.id === point.id;
      }),
    },
  });
}

/**
 * Indents a point to the right in the outline.
 */
export function indentPointRight(
  outlineDoc: OutlineDocParsed,
  point: PointParsed,
): OutlineDocParsed {
  // point has no preceding sibling, return early
  if (!point.movement.includes(PointMovement.IndentRight)) {
    return outlineDoc;
  }

  const precedingSiblingPosition = getPrecedingSiblingPosition(point);

  let newPoints = outlineDoc.body.points;

  // remove point from its current position
  newPoints = traversePointsAndRemove(newPoints, (p) => p.id === point.id);

  // append point as last child of preceding sibling
  newPoints = traversePointsAndAppendChild(newPoints, point, (p) => {
    return p.position.toString() === precedingSiblingPosition.toString();
  });

  return parseOutlineDoc({
    ...outlineDoc,
    body: {
      ...outlineDoc.body,
      points: newPoints,
    },
  });
}

/**
 * Indents a point to the left in the outline.
 */
export function indentPointLeft(
  outlineDoc: OutlineDocParsed,
  point: PointParsed,
): OutlineDocParsed {
  // point has no parent, return early
  if (!point.movement.includes(PointMovement.IndentLeft)) {
    return outlineDoc;
  }

  const siblingsAfter = getSiblingsAfter(outlineDoc, point);

  // if has siblings after it in outline, they are appended as children
  const newPoint = {
    ...point,
    points: point.points ? [...point.points, ...siblingsAfter] : siblingsAfter,
  };

  let newPoints = outlineDoc.body.points;

  // remove point and its siblings after from parent
  newPoints = traversePointsAndRemove(newPoints, (p) => {
    return p.id === point.id || siblingsAfter.some((s) => s.id === p.id);
  });

  // insert point as next sibling of parent
  newPoints = traversePointsAndInsertAfter(newPoints, newPoint, (p) => {
    return p.position.toString() === getParentPosition(point).toString();
  });

  return parseOutlineDoc({
    ...outlineDoc,
    body: {
      ...outlineDoc.body,
      points: newPoints,
    },
  });
}

/**
 * Adds a new point after the given point in the outline.
 */
export function addNewPointAfter(
  outlineDoc: OutlineDocParsed,
  point: PointParsed,
): OutlineDocParsed {
  const newPoint = parsePoint(createPoint(), [], []);

  return parseOutlineDoc({
    ...outlineDoc,
    body: {
      ...outlineDoc.body,
      points: traversePointsAndInsertAfter(
        outlineDoc.body.points,
        newPoint,
        (p) => {
          return p.id === point.id;
        },
      ),
    },
  });
}

/**
 * Removes a point from the outline.
 */
export function removePoint(
  outlineDoc: OutlineDocParsed,
  point: PointParsed,
): OutlineDocParsed {
  return parseOutlineDoc({
    ...outlineDoc,
    body: {
      ...outlineDoc.body,
      points: traversePointsAndRemove(outlineDoc.body.points, (p) => {
        return p.id === point.id;
      }),
    },
  });
}

// -----------------------------------------------------------------------------

/**
 * Flattens an array of points and their children into a single array.
 *
 * @param points The array of points to flatten.
 * @returns A new array of points with all children flattened.
 */
export function flattenPoints(points: PointParsed[]): PointParsed[] {
  return points.flatMap((point) => {
    return [point, ...(point.points ? flattenPoints(point.points) : [])];
  });
}

/**
 * Traverses an array of points and their children and updates the point that
 * matches the predicate.
 *
 * @param points The array of points to traverse.
 * @param updatedPoint The updated point.
 * @param predicate A function that returns true if a point should be updated.
 * @returns A new array of points with the point updated.
 */
function traversePointsAndUpdate(
  points: PointParsed[],
  updatedPoint: PointParsed,
  predicate: (point: PointParsed) => boolean,
): PointParsed[] {
  return points.map((p) => {
    if (predicate(p)) {
      return updatedPoint;
    }
    return {
      ...p,
      points: p.points
        ? traversePointsAndUpdate(p.points, updatedPoint, predicate)
        : p.points,
    };
  });
}

/**
 * Traverses an array of points and their children and removes any points that
 * match predicate.
 *
 * @param points The array of points to traverse.
 * @param predicate A function that returns true if a point should be removed.
 * @returns A new array of points with the points removed.
 */
function traversePointsAndRemove(
  points: PointParsed[],
  predicate: (point: PointParsed) => boolean,
): PointParsed[] {
  return points.reduce<PointParsed[]>((acc, p) => {
    if (predicate(p)) {
      return acc;
    }
    return [
      ...acc,
      {
        ...p,
        points: p.points
          ? traversePointsAndRemove(p.points, predicate)
          : p.points,
      },
    ];
  }, []);
}

/**
 * Traverses an array of points and their children and when a point matches the
 * predicate moves it up or down in the list.
 *
 * @param points The array of points to traverse.
 * @param direction The direction to move the point.
 * @param predicate A function that returns true if a point should be updated.
 * @returns A new array of points with the point moved.
 */
function traversePointsAndMove(
  points: PointParsed[],
  direction: 'up' | 'down',
  predicate: (point: PointParsed) => boolean,
): PointParsed[] {
  const index = points.findIndex(predicate);
  const newIndex = {
    up: index - 1,
    down: index + 1,
  }[direction];

  // point not in this level, traverse deeper
  if (index === -1) {
    return points.map((p) => ({
      ...p,
      points: p.points
        ? traversePointsAndMove(p.points, direction, predicate)
        : p.points,
    }));
  }

  // reorder points
  const newPoints = [...points];
  const [removed] = newPoints.splice(index, 1);
  newPoints.splice(newIndex, 0, removed!);

  return newPoints;
}

/**
 * Traverses an array of points and their children and when a point matches the
 * predicate appends the provided point to it's children.
 *
 * @param points The array of points to traverse.
 * @param childPoint The point to append as child.
 * @param predicate A function that returns true when the intended parent point is found.
 * @returns A new array of points with the child point appended.
 */
function traversePointsAndAppendChild(
  points: PointParsed[],
  childPoint: PointParsed,
  predicate: (point: PointParsed) => boolean,
): PointParsed[] {
  return points.map((p) => {
    if (predicate(p)) {
      return {
        ...p,
        points: p.points ? [...p.points, childPoint] : [childPoint],
      };
    }
    return {
      ...p,
      points: p.points
        ? traversePointsAndAppendChild(p.points, childPoint, predicate)
        : p.points,
    };
  });
}

/**
 * Traverses an array of points and their children and when a point matches the
 * predicate inserts the provided point after it.
 *
 * @param points The array of points to traverse.
 * @param point The point to insert.
 * @param predicate A function that returns true when the intended point is found.
 * @returns A new array of points with the point inserted.
 */
function traversePointsAndInsertAfter(
  points: PointParsed[],
  point: PointParsed,
  predicate: (point: PointParsed) => boolean,
): PointParsed[] {
  return points.reduce<PointParsed[]>((acc, p) => {
    if (predicate(p)) {
      return [...acc, p, point];
    }
    return [
      ...acc,
      {
        ...p,
        points: p.points
          ? traversePointsAndInsertAfter(p.points, point, predicate)
          : p.points,
      },
    ];
  }, []);
}
