import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type Props = {
  isFavorite: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function FavoriteMemoryButton({ isFavorite, onPress, disabled, style }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () => ({
      hit: { padding: spacing.xs, justifyContent: 'center' as const },
    }),
    [],
  );

  return (
    <Pressable
      accessibilityLabel={isFavorite ? 'Remove from saved moments' : 'Save to moments'}
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite, disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [
        styles.hit,
        style,
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      <FontAwesome
        color={isFavorite ? theme.colors.primary : theme.colors.textMuted}
        name={isFavorite ? 'heart' : 'heart-o'}
        size={20}
      />
    </Pressable>
  );
}
