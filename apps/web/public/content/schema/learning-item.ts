import { z } from 'zod';
import type { Subject, GradeBand, StemType, AnswerKind } from '@/lib/types';

export const stemSchema = z.object({
  type: z.enum(['text', 'audio', 'image', 'sim']),
  payload: z.any(),
});

export const choiceSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const answerSchema = z.object({
  kind: z.enum(['mcq', 'short', 'sequence']),
  value: z.any(),
});

export const learningItemSchema = z.object({
  id: z.string(),
  subject: z.enum(['math', 'english', 'science', 'social']),
  area: z.string(),
  gradeBand: z.array(z.enum(['ES12', 'ES34', 'ES56', 'MS1', 'MS23'])).min(1),
  conceptTag: z.array(z.string()).min(1),
  stem: stemSchema,
  choices: z.array(choiceSchema).optional(),
  answer: answerSchema,
  hints: z.array(z.string()).optional(),
  difficulty: z.number().min(1).max(10),
  variants: z.array(z.string()).optional(),
});

export type LearningItemSchema = z.infer<typeof learningItemSchema>;

