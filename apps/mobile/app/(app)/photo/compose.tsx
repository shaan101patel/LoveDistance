import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import { PhotoSharePreviewForm, type MoodTag } from '@/components/presence';
import { Body, Heading, Screen } from '@/components/ui';
import { useSharePresence } from '@/features/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const DEMO_STILL_LIFE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';

export default function PhotoComposeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ ritual?: string | string[] }>();
  const ritualRaw = params.ritual;
  const ritualPreset = typeof ritualRaw === 'string' ? ritualRaw : ritualRaw?.[0];
  const share = useSharePresence();
  const [step, setStep] = useState<'pick' | 'preview'>('pick');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [mood, setMood] = useState<MoodTag>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const goodMorningPresetApplied = useRef(false);

  useEffect(() => {
    if (ritualPreset !== 'good_morning' || step !== 'preview' || !imageUri || goodMorningPresetApplied.current) {
      return;
    }
    goodMorningPresetApplied.current = true;
    setCaption((c) => (c.trim() === '' ? 'Good morning from my corner of the world ☀️' : c));
    setMood((m) => (m === null ? 'soft' : m));
  }, [ritualPreset, step, imageUri]);

  const showPicker = useCallback(
    (mode: 'library' | 'camera' | 'demo') => {
      if (mode === 'demo') {
        setImageUri(DEMO_STILL_LIFE);
        setStep('preview');
        return;
      }
    void (async () => {
      if (mode === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const r = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
        if (!r.canceled && r.assets[0]) {
          setImageUri(r.assets[0].uri);
          setStep('preview');
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const r = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.85,
        });
        if (!r.canceled && r.assets[0]) {
          setImageUri(r.assets[0].uri);
          setStep('preview');
        }
      }
    })();
  },
  [setStep],
  );

  const entryStyles = useMemo(
    () =>
      StyleSheet.create({
        entryColumn: { gap: spacing.md },
        entryButton: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
        },
        entryLabel: { ...theme.type.body, color: theme.colors.textPrimary, fontWeight: '600' as const },
        entryHint: { ...theme.type.caption, color: theme.colors.textMuted, marginTop: 4 },
        scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
        actions: { gap: spacing.sm, marginTop: spacing.md },
      }),
    [theme],
  );

  if (step === 'pick' || !imageUri) {
    return (
      <Screen>
        <Heading>New photo</Heading>
        <Body>
          {ritualPreset === 'good_morning'
            ? 'Good morning ritual: pick or capture a photo. We will suggest a warm caption and mood on the next step (you can edit).'
            : 'Share a still from your day—add details on the next step.'}
        </Body>
        <View style={entryStyles.entryColumn}>
          <Pressable onPress={() => showPicker('camera')} style={entryStyles.entryButton}>
            <Text style={entryStyles.entryLabel}>Take a photo</Text>
            <Text style={entryStyles.entryHint}>Use the camera to capture right now</Text>
          </Pressable>
          <Pressable onPress={() => showPicker('library')} style={entryStyles.entryButton}>
            <Text style={entryStyles.entryLabel}>Choose from library</Text>
            <Text style={entryStyles.entryHint}>Pick something you already have</Text>
          </Pressable>
          <Pressable onPress={() => showPicker('demo')} style={entryStyles.entryButton}>
            <Text style={entryStyles.entryLabel}>Use a demo image</Text>
            <Text style={entryStyles.entryHint}>No photos permission needed—local mock only</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={entryStyles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Heading>Preview & details</Heading>
        <Card elevated={false} style={{ gap: 0 }}>
          <PhotoSharePreviewForm
            caption={caption}
            imageUri={imageUri}
            locationLabel={locationLabel}
            onCaptionChange={setCaption}
            onLocationChange={setLocationLabel}
            onSelectMood={setMood}
            selectedMood={mood}
          />
        </Card>
        <View style={entryStyles.actions}>
          <Button
            disabled={share.isPending}
            label={share.isPending ? 'Sharing…' : 'Share with partner'}
            onPress={() => {
              share.mutate(
                {
                  imageUri,
                  caption: caption.trim() || undefined,
                  mood: mood ?? undefined,
                  locationLabel: locationLabel.trim() || undefined,
                },
                { onSuccess: () => router.back() },
              );
            }}
          />
          <Button
            label="Start over"
            onPress={() => {
              goodMorningPresetApplied.current = false;
              setStep('pick');
              setImageUri(null);
              setCaption('');
              setMood(null);
              setLocationLabel('');
            }}
            variant="ghost"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
