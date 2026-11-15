import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Background, Button, IconBubble } from '../ui';
import { colors, type } from '../theme';
import { setOnboarded } from '../storage';

const STEPS: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  { icon: 'person-circle', title: 'Choisis ton contact', text: 'Une personne de confiance qui recevra ton alerte.' },
  { icon: 'hand-left', title: 'Appuie longuement sur SOS', text: "Un appui maintenu évite les envois par erreur." },
  { icon: 'location', title: 'Ta position part par SMS', text: 'Avec un lien Google Maps, sans compte ni internet côté contact.' },
];

export default function OnboardingScreen({ navigation }: any) {
  const start = async () => {
    await setOnboarded();
    navigation.replace('Contact', { firstRun: true });
  };

  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <View style={styles.logoRing}>
            <View style={styles.logo}>
              <Ionicons name="navigate" size={44} color={colors.white} />
            </View>
          </View>
          <Text style={[type.hero, styles.center]}>Perdu·e ?{'\n'}On te retrouve.</Text>
          <Text style={[type.body, styles.center, { marginTop: 12 }]}>
            IMLOST envoie ta position exacte à un proche en un seul geste.
          </Text>
        </View>

        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <IconBubble name={s.icon} color={colors.sos} bg={colors.sosGlow} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>
                  {i + 1}. {s.title}
                </Text>
                <Text style={styles.stepText}>{s.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button label="Commencer" icon="arrow-forward" onPress={start} />
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 24, paddingBottom: 16, justifyContent: 'space-between' },
  hero: { alignItems: 'center', marginTop: 32 },
  center: { textAlign: 'center' },
  logoRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.sosGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.sos,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 10px 30px rgba(255, 77, 79, 0.5)',
  },
  steps: { gap: 20 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  stepText: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
});
