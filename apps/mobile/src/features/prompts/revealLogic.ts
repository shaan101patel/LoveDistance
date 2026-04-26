import { z } from 'zod';

const promptAnswerSchema = z.object({
  userId: z.string().min(1),
  answer: z.string().min(1),
  submittedAt: z.string().min(1),
  imageUri: z.string().min(1).optional(),
});

export const promptThreadSchema = z.object({
  promptId: z.string().min(1),
  answers: z.array(promptAnswerSchema),
});

export function getIsPromptRevealed(answers: { userId: string }[]): boolean {
  const uniqueUserCount = new Set(answers.map((item) => item.userId)).size;
  return uniqueUserCount >= 2;
}
