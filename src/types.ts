import { JSONContent } from '@tiptap/react';

export interface OutlineDoc {
  parsed?: boolean;
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
  voiceScope?: VoiceScope;
  points?: Point[];
}

export type Content = string | JSONContent;

export type PointMovement =
  | 'move_up'
  | 'move_down'
  | 'indent_left'
  | 'indent_right';

export type Voice =
  | 'none'
  | 'info'
  | 'question'
  | 'reference'
  | 'example'
  | 'story'
  | 'lesson'
  | 'action';

export type VoiceScope = 'node' | 'subtree';

export interface OutlineDocParsed extends OutlineDoc {
  parsed: true;
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
