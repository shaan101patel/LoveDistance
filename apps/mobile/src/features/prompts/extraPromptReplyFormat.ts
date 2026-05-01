export const EXTRA_QUESTION_PREFIX = '[Extra question]' as const;
export const NOTE_PREFIX = '[Note]' as const;
export const DISCOVER_PREFIX = '[Discover ·' as const;

export function buildDiscoverLead(categoryLabel: string): string {
  return `${DISCOVER_PREFIX} ${categoryLabel}]`;
}

/**
 * Single thread reply: extra random question plus optional personal line.
 */
export function buildExtraQuestionBody(promptText: string, userAnswer: string): string {
  const answer = userAnswer.trim();
  if (!answer) {
    return `${EXTRA_QUESTION_PREFIX}\n\n${promptText.trim()}`;
  }
  return `${EXTRA_QUESTION_PREFIX}\n\n${promptText.trim()}\n\n---\n\n${answer}`;
}

export function buildNoteBody(body: string): string {
  return `${NOTE_PREFIX}\n\n${body.trim()}`;
}

export function buildDiscoverBody(categoryLabel: string, promptText: string, userAnswer: string): string {
  const lead = buildDiscoverLead(categoryLabel);
  const answer = userAnswer.trim();
  if (!answer) {
    return `${lead}\n\n${promptText.trim()}`;
  }
  return `${lead}\n\n${promptText.trim()}\n\n---\n\n${answer}`;
}
