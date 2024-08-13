import { z } from 'zod';
import { OutlineDoc, Point } from './types';

export const VoiceSchema = z.enum([
  'none',
  'info',
  'question',
  'reference',
  'example',
  'story',
  'lesson',
  'action',
]);

export const VoiceScopeSchema = z.enum(['node', 'subtree']);

export const PointSchema: z.ZodSchema<Point> = z.object({
  idea: z.string(),
  script: z.string().optional(),
  voice: VoiceSchema.optional(),
  voiceScope: VoiceScopeSchema.optional(),
  points: z.array(z.lazy(() => PointSchema)).optional(), // Recursive schema
});

export const OutlineDocSchema: z.ZodSchema<OutlineDoc> = z.object({
  head: z.object({
    title: z.string(),
    objective: z.string(),
  }),
  body: z.object({
    points: z.array(PointSchema),
  }),
});
