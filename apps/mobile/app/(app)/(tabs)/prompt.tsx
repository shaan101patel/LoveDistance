import { Link } from 'expo-router';
import { Text } from 'react-native';

import { EmptyState } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { SectionCard } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function PromptTabScreen() {
  const theme = useTheme();
  return (
    <SectionScaffold
      kicker="Today"
      lead="One thoughtful question, answered when you are both ready. Thread and reactions will live here."
      title="Prompt"
    >
      <SectionCard>
        <EmptyState
          title="No prompt session yet"
          description="The daily prompt, delayed reveal, and thread will show in this space."
        />
        <Link href="/(app)/prompt/prompt-placeholder">
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
            Open prompt thread placeholder
          </Text>
        </Link>
      </SectionCard>
    </SectionScaffold>
  );
}
