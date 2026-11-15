import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
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

const LOCATION_POINTS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: 'flash-outline', text: 'Ta position est prête à partir dès que tu en as besoin, sans perdre de temps.' },
  { icon: 'eye-off-outline', text: 'Utilisée uniquement quand l’app est ouverte. Jamais stockée, jamais partagée.' },
  { icon: 'chatbubble-ellipses-outline', text: 'Envoyée seulement à ton contact, et seulement quand tu déclenches le SOS.' },
];

export default function OnboardingScreen({ navigation }: any) {
  const [step, setStep] = useState<'intro' | 'location'>('intro');
  const [asking, setAsking] = useState(false);
  const [denied, setDenied] = useState(false);

  const goToContact = async () => {
    await setOnboarded();
    navigation.replace('Contact', { firstRun: true });
  };

  const askLocation = async () => {
    setAsking(true);
    try {
      const current = await Location.getForegroundPermissionsAsync();
      if (current.status === 'granted') return goToContact();
      if (!current.canAskAgain) {
        setDenied(true);
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') return goToContact();
      setDenied(true);
    } catch {
      setDenied(true);
    } finally {
      setAsking(false);
    }
  };

  if (step === 'location') {
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <View>
            <Text style={[type.label, styles.stepLabel]}>Étape 1 sur 2</Text>
            <View style={[styles.hero, { marginTop: 16 }]}>
              <View style={[styles.logoRing, { backgroundColor: colors.okSoft }]}>
                <View style={[styles.logo, styles.logoOk]}>
                  <Ionicons name="location" size={44} color={colors.bg} />
                </View>
              </View>
              <Text style={[type.title, styles.center]}>Autorise la localisation</Text>
              <Text style={[type.body, styles.center, { marginTop: 10 }]}>
                C’est ce qui permet à IMLOST de dire à ton proche exactement où te trouver.
              </Text>
            </View>
          </View>

          <View style={styles.steps}>
            {LOCATION_POINTS.map((p) => (
              <View key={p.icon} style={styles.step}>
                <IconBubble name={p.icon} color={colors.ok} bg={colors.okSoft} size={40} />
                <Text style={[styles.stepText, { flex: 1, fontSize: 15, color: colors.text }]}>{p.text}</Text>
              </View>
            ))}
          </View>

          <View style={{ gap: 12 }}>
            {denied && (
              <Text style={styles.denied}>
                Localisation refusée. Tu pourras l’activer plus tard dans les réglages ; en attendant, l’alerte partira
                sans ta position.
              </Text>
            )}
            {denied ? (
              <>
                <Button label="Ouvrir les réglages" icon="settings-outline" onPress={() => Linking.openSettings()} />
                <Button label="Continuer sans" variant="ghost" onPress={goToContact} />
              </>
            ) : (
              <>
                <Button label="Autoriser la localisation" icon="location" onPress={askLocation} loading={asking} />
                <Pressable onPress={goToContact} hitSlop={8} style={styles.later}>
                  <Text style={styles.laterText}>Plus tard</Text>
                </Pressable>
              </>
            )}
          </View>
        </SafeAreaView>
      </Background>
    );
  }

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

        <Button label="Commencer" icon="arrow-forward" onPress={() => setStep('location')} />
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
  logoOk: { backgroundColor: colors.ok, boxShadow: '0px 10px 30px rgba(61, 220, 151, 0.45)' },
  stepLabel: { textAlign: 'center', marginTop: 16 },
  denied: { color: colors.warn, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  later: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16 },
  laterText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  steps: { gap: 20 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  stepText: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
});
