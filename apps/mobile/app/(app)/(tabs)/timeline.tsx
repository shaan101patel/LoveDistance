import { Link } from 'expo-router';
import { Text } from 'react-native';

import { EmptyState } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { SectionCard } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function TimelineScreen() {
  const theme = useTheme();
  return (
    <SectionScaffold
      kicker="Together"
      lead="Prompts, photos, gratitude, and milestones in one scrollable story — filters and search come next."
      title="Timeline"
    >
      <SectionCard>
        <EmptyState
          title="Your story starts with the first shared moment"
          description="Nothing here yet. As you answer prompts and share photos, this line will fill in."
        />
        <Link href="/(app)/memory/memory-placeholder">
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
            Open memory detail placeholder
          </Text>
        </Link>
      </SectionCard>
    </SectionScaffold>
  );
}
