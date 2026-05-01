import type { CouplesPromptLibraryEntry } from '@/data/generatedCouplesPromptLibrary';

export function eligiblePromptEntries(allowNsfw: boolean, library: readonly CouplesPromptLibraryEntry[]) {
  if (allowNsfw) {
    return [...library];
  }
  return library.filter((e) => !e.nsfw && e.categoryId !== 'sexual_intimacy');
}

export function pickRandomPrompt(
  entries: CouplesPromptLibraryEntry[],
  avoidText?: string,
): CouplesPromptLibraryEntry {
  if (entries.length === 0) {
    throw new Error('No prompts available.');
  }
  let idx = Math.floor(Math.random() * entries.length);
  if (avoidText && entries.length > 1) {
    let guard = 0;
    while (entries[idx]?.text === avoidText && guard < 24) {
      idx = Math.floor(Math.random() * entries.length);
      guard += 1;
    }
  }
  return entries[idx]!;
}
