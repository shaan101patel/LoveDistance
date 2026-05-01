import { describe, expect, it } from 'vitest';

import {
  buildDiscoverBody,
  buildDiscoverLead,
  buildExtraQuestionBody,
  buildNoteBody,
} from '@/features/prompts/extraPromptReplyFormat';

describe('extraPromptReplyFormat', () => {
  it('buildExtraQuestionBody without user answer', () => {
    expect(buildExtraQuestionBody('What helps you reset?', '  ')).toBe(
      '[Extra question]\n\nWhat helps you reset?',
    );
  });

  it('buildExtraQuestionBody with user answer', () => {
    expect(buildExtraQuestionBody('What helps you reset?', ' Long walks ')).toBe(
      '[Extra question]\n\nWhat helps you reset?\n\n---\n\nLong walks',
    );
  });

  it('buildNoteBody trims', () => {
    expect(buildNoteBody('  hello  ')).toBe('[Note]\n\nhello');
  });

  it('buildDiscoverLead and body', () => {
    expect(buildDiscoverLead('Distance and reunion')).toBe('[Discover · Distance and reunion]');
    expect(buildDiscoverBody('Distance and reunion', 'Prompt line?', '')).toBe(
      '[Discover · Distance and reunion]\n\nPrompt line?',
    );
  });
});
