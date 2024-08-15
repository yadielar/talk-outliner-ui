import { JSONContent } from '@tiptap/react';
import { PointMovement, Voice, VoiceScope } from '@/enums';

export interface OutlineDoc {
  name: string;
  parsed?: boolean;
  head: {
    title: string;
    description: string;
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
  scriptRemoved?: boolean;
  voice?: Voice;
  voiceScope?: VoiceScope;
  points?: Point[];
}

export type Content = string | JSONContent;

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
