import type { CouplesPromptLibraryEntry } from '@/data/generatedCouplesPromptLibrary';
import { COUPLES_PROMPT_LIBRARY } from '@/data/generatedCouplesPromptLibrary';
import type { PromptThreadCategory } from '@/types/domain';

const LEGACY_FALLBACK_QUESTION = 'What brought you closer today?';

/** 32-bit FNV-1a over UTF-16 code units (stable with existing string keys in RN). */
export function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type PickedCouplesPrompt = {
  question: string;
  category: PromptThreadCategory | null;
};

function pickIndex(length: number, coupleId: string, ymd: string): number {
  if (length <= 0) return 0;
  const key = `${coupleId}|${ymd}`;
  return fnv1a32(key) % length;
}

/**
 * Deterministic daily prompt from the couples library (plan: FNV-1a + NSFW filter + fallbacks).
 */
export function pickCouplesPromptForDay(
  coupleId: string,
  ymd: string,
  allowNsfw: boolean,
  library: readonly CouplesPromptLibraryEntry[] = COUPLES_PROMPT_LIBRARY,
): PickedCouplesPrompt {
  const toCategory = (e: CouplesPromptLibraryEntry): PromptThreadCategory => ({
    id: e.categoryId,
    label: e.categoryLabel,
  });

  let eligible = allowNsfw ? [...library] : library.filter((e) => !e.nsfw);
  if (eligible.length === 0) {
    eligible = library.filter((e) => !e.nsfw);
  }
  if (eligible.length === 0 && library.length > 0) {
    eligible = [...library];
  }
  if (eligible.length === 0) {
    return { question: LEGACY_FALLBACK_QUESTION, category: null };
  }

  const idx = pickIndex(eligible.length, coupleId, ymd);
  const e = eligible[idx]!;
  return { question: e.text, category: toCategory(e) };
}
