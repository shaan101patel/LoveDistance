import { Link } from 'expo-router';
import { Text } from 'react-native';

import { EmptyState } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { SectionCard } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function PhotosTabScreen() {
  const theme = useTheme();
  return (
    <SectionScaffold
      kicker="Presence"
      lead="Fast photo sharing, mood, and lightweight reactions. Library and upload flow will connect here."
      title="Photos"
    >
      <SectionCard>
        <EmptyState
          title="Your shared gallery will appear here"
          description="Quick captures and the latest from your partner, in one calm feed."
        />
        <Link href="/(app)/photo/photo-placeholder">
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
            Open photo detail placeholder
          </Text>
        </Link>
      </SectionCard>
    </SectionScaffold>
  );
}
