import type { ServiceRegistry } from '@/services/ports';
import type { Session, UserProfile } from '@/types/domain';
import {
  cloneThreadActivity,
  initialAppLock,
  initialPrefs,
  initialPrivacy,
  mockDb,
  mockMe,
  mockPartner,
  refreshRevealState,
  resetThreadActivityToInitial,
} from '@/services/mock/mockData';
import { getPathFromRef, parseDeepLink } from '@/lib/deepLinking/deepLinkService';

async function withLatency<T>(result: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return result;
}

function userIdFromEmail(email: string): string {
  const slug = email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `u-${slug || 'user'}`;
}

function buildUserFromInput(email: string, firstName: string, displayName?: string): UserProfile {
  return {
    id: userIdFromEmail(email),
    firstName: firstName.trim() || 'You',
    email: email.toLowerCase().trim(),
    displayName: displayName?.trim() || undefined,
  };
}

function buildSessionFromUser(user: UserProfile): Session {
  return { user, signedInAt: new Date().toISOString() };
}

/** Matches tokens produced by createInviteLink (also accepted on a fresh mock DB for two-device testing). */
function isMockStyleInviteToken(token: string): boolean {
  return /^inv-[a-z0-9]+-[a-z0-9]+$/i.test(token) && token.length >= 8;
}

export const mockServices: ServiceRegistry = {
  auth: {
    async getSession() {
      return withLatency(mockDb.session);
    },
    async signIn({ email, password }) {
      const trimmed = email.trim();
      if (!trimmed || !password) {
        throw new Error('Email and password are required');
      }
      const user = buildUserFromInput(trimmed, 'You');
      mockDb.session = buildSessionFromUser(user);
      return withLatency(mockDb.session);
    },
    async signUp({ email, password, firstName }) {
      const trimmed = email.trim();
      if (!trimmed || !password) {
        throw new Error('Email and password are required');
      }
      if (!firstName?.trim()) {
        throw new Error('First name is required');
      }
      const user = buildUserFromInput(trimmed, firstName.trim());
      mockDb.session = buildSessionFromUser(user);
      return withLatency(mockDb.session);
    },
    async updateProfile(partial) {
      if (!mockDb.session) {
        throw new Error('Not signed in');
      }
      const u = mockDb.session.user;
      mockDb.session = {
        ...mockDb.session,
        user: {
          ...u,
          firstName: partial.firstName?.trim() ?? u.firstName,
          displayName: partial.displayName?.trim() ?? u.displayName,
        },
        signedInAt: mockDb.session.signedInAt,
      };
      return withLatency(mockDb.session);
    },
    async signOut() {
      mockDb.session = null;
      mockDb.couple = null;
      mockDb.invite = { issuedToken: null, redeemedTokens: [] };
      mockDb.prefs = { ...initialPrefs };
      mockDb.privacy = { ...initialPrivacy };
      mockDb.appLock = { ...initialAppLock };
      resetThreadActivityToInitial();
      return withLatency(undefined);
    },
  },
  couple: {
    async getCouple() {
      return withLatency(mockDb.couple);
    },
    async createInviteLink() {
      if (mockDb.couple) {
        throw new Error(
          'You are already linked with a partner. Use another account to test a fresh invite, or sign out to reset mock state.',
        );
      }
      const token = `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      mockDb.invite.issuedToken = token;
      const path = `invite/${token}`;
      return withLatency(`lovedistance://${path}`);
    },
    async acceptInvite(token) {
      const normalized = token.trim();
      if (!normalized) {
        throw new Error('Add an invite code or open the full link your partner sent.');
      }
      if (mockDb.couple) {
        throw new Error('You are already paired with someone.');
      }
      if (normalized === 'invalid') {
        throw new Error('This invite is not valid. Double-check the code or ask for a new link.');
      }
      if (normalized === 'expired') {
        throw new Error('This invite has expired. Ask your partner to send a new one.');
      }
      if (normalized === 'used') {
        throw new Error('This invite was already used.');
      }
      if (mockDb.invite.redeemedTokens.includes(normalized)) {
        throw new Error('This invite was already used.');
      }
      const matchesThisDevice = Boolean(
        mockDb.invite.issuedToken && normalized === mockDb.invite.issuedToken,
      );
      const validShape = isMockStyleInviteToken(normalized);
      if (!matchesThisDevice && !validShape) {
        throw new Error('This invite is not valid. Double-check the code or request a new link.');
      }

      mockDb.invite.redeemedTokens.push(normalized);
      if (matchesThisDevice) {
        mockDb.invite.issuedToken = null;
      }

      mockDb.couple = {
        id: `couple-${normalized}`,
        meId: mockDb.session?.user.id ?? mockMe.id,
        partner: mockPartner,
        reunionDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 42).toISOString(),
      };
      return withLatency({ ...mockDb.couple });
    },
  },
  prompt: {
    async getTodayPrompt() {
      return withLatency({ ...mockDb.prompt });
    },
    async getPromptById(promptId: string) {
      if (promptId !== mockDb.prompt.promptId) {
        return withLatency(null);
      }
      return withLatency({ ...mockDb.prompt });
    },
    async submitPromptAnswer(promptId, answer) {
      const existing = mockDb.prompt.answers.find(
        (item) => item.userId === (mockDb.session?.user.id ?? mockMe.id),
      );
      if (existing) {
        existing.answer = answer;
      } else {
        mockDb.prompt.answers.push({
          userId: mockDb.session?.user.id ?? mockMe.id,
          answer,
          submittedAt: new Date().toISOString(),
        });
      }
      refreshRevealState();
      if (promptId !== mockDb.prompt.promptId) {
        throw new Error('Prompt id mismatch in mock service.');
      }
      return withLatency({ ...mockDb.prompt });
    },
    async reactToPrompt(promptId, emoji) {
      mockDb.prompt.reactions.push({
        id: `reaction-${Date.now()}`,
        userId: mockDb.session?.user.id ?? mockMe.id,
        emoji,
      });
      if (promptId !== mockDb.prompt.promptId) {
        throw new Error('Prompt id mismatch in mock service.');
      }
      return withLatency({ ...mockDb.prompt });
    },
  },
  threadInteraction: {
    async getThreadActivity(promptId: string) {
      if (promptId !== mockDb.prompt.promptId) {
        return withLatency(null);
      }
      return withLatency(cloneThreadActivity(mockDb.threadActivity));
    },
    async addThreadReply({ promptId, body, parentReplyId = null }) {
      if (promptId !== mockDb.prompt.promptId) {
        throw new Error('Unknown prompt for thread activity.');
      }
      const text = body.trim();
      if (!text) {
        throw new Error('Message cannot be empty.');
      }
      if (parentReplyId) {
        const parent = mockDb.threadActivity.replies.find((r) => r.id === parentReplyId);
        if (!parent) {
          throw new Error('Parent reply not found.');
        }
      }
      const id = `reply-${Date.now()}`;
      const authorId = mockDb.session?.user.id ?? mockMe.id;
      const next: (typeof mockDb.threadActivity.replies)[number] = {
        id,
        promptId,
        parentReplyId: parentReplyId ?? null,
        authorId,
        body: text,
        createdAt: new Date().toISOString(),
        reactions: [],
      };
      mockDb.threadActivity = {
        ...mockDb.threadActivity,
        replies: [...mockDb.threadActivity.replies, next],
      };
      return withLatency(cloneThreadActivity(mockDb.threadActivity));
    },
    async reactToThreadReply({ promptId, replyId, emoji }) {
      if (promptId !== mockDb.prompt.promptId) {
        throw new Error('Unknown prompt for thread activity.');
      }
      const reply = mockDb.threadActivity.replies.find((r) => r.id === replyId);
      if (!reply) {
        throw new Error('Reply not found.');
      }
      const userId = mockDb.session?.user.id ?? mockMe.id;
      const nextReaction: (typeof reply.reactions)[number] = {
        id: `rr-${Date.now()}`,
        userId,
        emoji,
      };
      const replies = mockDb.threadActivity.replies.map((r) => {
        if (r.id !== replyId) {
          return r;
        }
        return { ...r, reactions: [...r.reactions, nextReaction] };
      });
      mockDb.threadActivity = { ...mockDb.threadActivity, replies };
      return withLatency(cloneThreadActivity(mockDb.threadActivity));
    },
  },
  presence: {
    async getLatestPosts() {
      return withLatency([...mockDb.posts]);
    },
    async sharePost(input) {
      const post = {
        id: `photo-${Date.now()}`,
        authorId: mockDb.session?.user.id ?? mockMe.id,
        imageUri: input.imageUri,
        caption: input.caption,
        mood: input.mood,
        createdAt: new Date().toISOString(),
        reactionCount: 0,
      };
      mockDb.posts = [post, ...mockDb.posts];
      return withLatency(post);
    },
    async reactToPost(postId) {
      mockDb.posts = mockDb.posts.map((post) =>
        post.id === postId ? { ...post, reactionCount: post.reactionCount + 1 } : post,
      );
      return withLatency(undefined);
    },
  },
  habits: {
    async getHabitsForMonth() {
      return withLatency([...mockDb.habits]);
    },
    async toggleHabitCompletion(habitId, date) {
      const userId = mockDb.session?.user.id ?? mockMe.id;
      mockDb.habits = mockDb.habits.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }
        const current = habit.completionsByDate[date] ?? [];
        const nextUsers = current.includes(userId)
          ? current.filter((id) => id !== userId)
          : [...current, userId];
        return {
          ...habit,
          completionsByDate: {
            ...habit.completionsByDate,
            [date]: nextUsers,
          },
        };
      });
      return withLatency([...mockDb.habits]);
    },
  },
  timeline: {
    async listMemories(filter = 'all') {
      const list =
        filter === 'all' ? mockDb.memories : mockDb.memories.filter((item) => item.type === filter);
      return withLatency([...list]);
    },
    async getMemoryById(memoryId) {
      const found = mockDb.memories.find((item) => item.id === memoryId) ?? null;
      return withLatency(found);
    },
  },
  notificationPrefs: {
    async getPreferences() {
      return withLatency({ ...mockDb.prefs });
    },
    async updatePreferences(prefs) {
      mockDb.prefs = {
        ...mockDb.prefs,
        ...prefs,
      };
      return withLatency({ ...mockDb.prefs });
    },
  },
  userSettings: {
    async getPrivacy() {
      return withLatency({ ...mockDb.privacy });
    },
    async updatePrivacy(partial) {
      mockDb.privacy = {
        ...mockDb.privacy,
        ...partial,
      };
      return withLatency({ ...mockDb.privacy });
    },
    async getAppLock() {
      return withLatency({ ...mockDb.appLock });
    },
    async updateAppLock(partial) {
      const next: typeof mockDb.appLock = {
        ...mockDb.appLock,
        ...partial,
      };
      if (next.requirePasscode && !mockDb.appLock.isPasscodeSet) {
        next.isPasscodeSet = true;
      }
      if (!next.requirePasscode) {
        next.isPasscodeSet = false;
        next.useBiometric = false;
      }
      mockDb.appLock = next;
      return withLatency({ ...mockDb.appLock });
    },
  },
  deepLinks: {
    parseUrl: parseDeepLink,
    toPath: getPathFromRef,
  },
};
