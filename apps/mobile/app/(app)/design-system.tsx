import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  Avatar,
  Badge,
  BottomNav,
  Button,
  Card,
  EmptyState,
  Input,
  Textarea,
  TopBar,
} from '@/components/primitives';
import { Body, Heading, Screen, SectionCard } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function DesignSystemScreen() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [input, setInput] = useState('');
  const [area, setArea] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar
        left={<FontAwesome color={theme.colors.textPrimary} name="chevron-left" size={18} />}
        right={<FontAwesome color={theme.colors.textPrimary} name="heart" size={18} />}
        title="Design system"
      />
      <Screen padded>
        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing.xxxl * 2 }}
          showsVerticalScrollIndicator={false}
        >
          <Heading>LoveDistance UI</Heading>
          <Body>Warm minimal tokens; switch system dark mode to preview both themes.</Body>

          <SectionCard>
            <Text style={[theme.type.h2, { color: theme.colors.textPrimary }]}>Typography</Text>
            <Text style={theme.type.display}>Display</Text>
            <Text style={theme.type.h1}>Heading 1</Text>
            <Text style={theme.type.h2}>Heading 2</Text>
            <Text style={theme.type.body}>Body text for emotional, readable copy.</Text>
            <Text style={theme.type.bodySm}>Body small and supporting lines.</Text>
            <Text style={theme.type.caption}>Caption · metadata</Text>
          </SectionCard>

          <SectionCard>
            <Text style={[theme.type.h2, { color: theme.colors.textPrimary }]}>Buttons</Text>
            <Button label="Primary" onPress={() => {}} variant="primary" />
            <Button label="Secondary" onPress={() => {}} variant="secondary" />
            <Button label="Ghost" onPress={() => {}} variant="ghost" />
            <Button label="Danger" onPress={() => {}} variant="danger" />
            <Button disabled label="Disabled" onPress={() => {}} variant="primary" />
          </SectionCard>

          <SectionCard>
            <Text style={[theme.type.h2, { color: theme.colors.textPrimary }]}>Card</Text>
            <Card elevated={false}>
              <Text style={{ color: theme.colors.textSecondary }}>Flat card (no elevation)</Text>
            </Card>
            <Card elevated>
              <Text style={{ color: theme.colors.textSecondary }}>
                Elevated card with soft shadow
              </Text>
            </Card>
          </SectionCard>

          <SectionCard>
            <Text style={[theme.type.h2, { color: theme.colors.textPrimary }]}>Inputs</Text>
            <Input label="Label" onChangeText={setInput} placeholder="Single line" value={input} />
            <Textarea
              label="Notes"
              onChangeText={setArea}
              placeholder="Multi-line emotional note…"
              value={area}
            />
            <Input error="This field needs your attention" label="With error" value="" />
          </SectionCard>

          <SectionCard>
            <Text style={[theme.type.h2, { color: theme.colors.textPrimary }]}>Badges</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              <Badge label="Neutral" tone="neutral" />
              <Badge label="Primary" tone="primary" />
              <Badge label="Success" tone="success" />
              <Badge label="Alert" tone="danger" />
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={[theme.type.h2, { color: theme.colors.textPrimary }]}>Avatars</Text>
            <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <Avatar name="Alex River" size="sm" />
              <Avatar name="Jamie Lee" size="md" />
              <Avatar name="Sam Pat" size="lg" />
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={[theme.type.h2, { color: theme.colors.textPrimary }]}>Empty state</Text>
            <EmptyState
              description="When there is nothing here yet, we still feel warm."
              title="Nothing to show"
            />
          </SectionCard>

          <View
            style={{
              marginTop: spacing.lg,
              overflow: 'hidden',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                padding: spacing.md,
                ...theme.type.caption,
                color: theme.colors.textSecondary,
              }}
            >
              Bottom nav (demo)
            </Text>
            <BottomNav
              items={[
                {
                  key: 'home',
                  label: 'Home',
                  active: activeTab === 'home',
                  onPress: () => setActiveTab('home'),
                  icon: (
                    <FontAwesome
                      name="home"
                      size={20}
                      color={
                        activeTab === 'home' ? theme.colors.tabActive : theme.colors.tabInactive
                      }
                    />
                  ),
                },
                {
                  key: 'time',
                  label: 'Time',
                  active: activeTab === 'time',
                  onPress: () => setActiveTab('time'),
                  icon: (
                    <FontAwesome
                      name="clock-o"
                      size={20}
                      color={
                        activeTab === 'time' ? theme.colors.tabActive : theme.colors.tabInactive
                      }
                    />
                  ),
                },
                {
                  key: 'heart',
                  label: 'Love',
                  active: activeTab === 'heart',
                  onPress: () => setActiveTab('heart'),
                  icon: (
                    <FontAwesome
                      name="heart"
                      size={20}
                      color={
                        activeTab === 'heart' ? theme.colors.tabActive : theme.colors.tabInactive
                      }
                    />
                  ),
                },
              ]}
            />
          </View>
        </ScrollView>
      </Screen>
    </View>
  );
}
