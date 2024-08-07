import { JSONContent } from '@tiptap/react';

export interface OutlineDoc {
  name: string;
  head: {
    title: string;
    objective: string;
  };
  body: {
    points: Point[];
  };
}

export interface Point {
  id?: string;
  position?: number[];
  movement?: PointMovement[];
  idea: Content;
  script?: Content;
  voice?: Voice;
  voiceScope?: 'node' | 'subtree';
  points?: Point[];
}

export type Content = JSONContent;

export type PointMovement =
  | 'move_up'
  | 'move_down'
  | 'indent_left'
  | 'indent_right';

export type Voice =
  | 'info'
  | 'question'
  | 'reference'
  | 'example'
  | 'story'
  | 'lesson'
  | 'action';

export interface OutlineDocParsed extends OutlineDoc {
  body: {
    points: PointParsed[];
  };
}

export interface PointParsed extends Point {
  id: string;
  position: number[];
  movement: PointMovement[];
  points?: PointParsed[];
}