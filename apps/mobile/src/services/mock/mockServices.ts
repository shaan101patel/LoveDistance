import type { ServiceRegistry } from '@/services/ports';
import { mockDb, mockMe, mockPartner, refreshRevealState } from '@/services/mock/mockData';
import { getPathFromRef, parseDeepLink } from '@/lib/deepLinking/deepLinkService';

async function withLatency<T>(result: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return result;
}

export const mockServices: ServiceRegistry = {
  auth: {
    async getSession() {
      return withLatency(mockDb.session);
    },
    async signIn(firstName) {
      mockDb.session = {
        user: { ...mockMe, firstName: firstName.trim() || mockMe.firstName },
        signedInAt: new Date().toISOString(),
      };
      return withLatency(mockDb.session);
    },
    async signOut() {
      mockDb.session = null;
      mockDb.couple = null;
      return withLatency(undefined);
    },
  },
  couple: {
    async getCouple() {
      return withLatency(mockDb.couple);
    },
    async createInviteLink() {
      return withLatency('lovedistance://invite/mock-invite-token');
    },
    async acceptInvite(token) {
      mockDb.couple = {
        id: 'couple-1',
        meId: mockDb.session?.user.id ?? mockMe.id,
        partner: mockPartner,
        reunionDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 42).toISOString(),
      };
      return withLatency({
        ...mockDb.couple,
        id: `${mockDb.couple.id}:${token}`,
      });
    },
  },
  prompt: {
    async getTodayPrompt() {
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
      if (!mockDb.prompt.answers.find((item) => item.userId === mockPartner.id)) {
        mockDb.prompt.answers.push({
          userId: mockPartner.id,
          answer: 'I felt close when we laughed on the call last night.',
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
  deepLinks: {
    parseUrl: parseDeepLink,
    toPath: getPathFromRef,
  },
};
