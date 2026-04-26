import { useMemo } from 'react';
import {
  type ImageSourcePropType,
  Image,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

type Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, number> = { sm: 32, md: 40, lg: 56 };

type Props = {
  source?: ImageSourcePropType;
  name?: string;
  size?: Size;
  style?: ViewStyle;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

export function Avatar({ source, name, size = 'md', style }: Props) {
  const theme = useTheme();
  const dim = sizeMap[size];
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: dim,
          height: dim,
          borderRadius: radius.pill,
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        text: {
          fontSize: size === 'lg' ? 18 : 14,
          fontWeight: '600',
          color: theme.colors.textPrimary,
        },
      }),
    [dim, size, theme],
  );

  if (source) {
    return (
      <View style={[styles.wrap, style]}>
        <Image
          source={source}
          style={{ width: dim, height: dim }}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.text} accessibilityLabel={name ? `Avatar for ${name}` : 'Avatar'}>
        {name ? initialsFromName(name) : '•'}
      </Text>
    </View>
  );
}
