import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';

import { Card } from '@/components/primitives/Card';
import type { HomeFeedViewModel, PartnerActivityRow } from '@/features/home/homeFeedComposer';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type FaName = ComponentProps<typeof FontAwesome>['name'];

const iconMap: Record<PartnerActivityRow['faIcon'], FaName> = {
  heart: 'heart',
  image: 'image',
  comment: 'comment',
};

type Props = {
  model: HomeFeedViewModel['partnerActivity'];
};

export function PartnerActivitySection({ model }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        heading: { ...theme.type.h2, color: theme.colors.textPrimary, marginBottom: spacing.sm },
        row: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.md,
          paddingVertical: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        rowFirst: { borderTopWidth: 0, paddingTop: 0 },
        textCol: { flex: 1, gap: 4 },
        title: { ...theme.type.body, color: theme.colors.textPrimary, fontWeight: '500' as const },
        subtitle: { ...theme.type.bodySm, color: theme.colors.textMuted },
        iconBox: { paddingTop: 2 },
      }),
    [theme],
  );

  return (
    <View>
      <Text style={styles.heading}>{model.heading}</Text>
      <Card elevated={false} style={{ padding: spacing.lg, gap: 0 }}>
        {model.rows.map((row, index) => (
          <View
            key={row.id}
            style={[styles.row, index === 0 && styles.rowFirst]}
            accessibilityLabel={`${row.title}. ${row.subtitle}`}
          >
            <View style={styles.iconBox}>
              <FontAwesome
                name={iconMap[row.faIcon]}
                size={18}
                color={theme.colors.textSecondary}
              />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.title}>{row.title}</Text>
              <Text style={styles.subtitle}>{row.subtitle}</Text>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}
