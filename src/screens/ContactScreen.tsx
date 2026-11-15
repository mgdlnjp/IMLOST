import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Background, Button, Card } from '../ui';
import { StepHeader } from './OnboardingScreen';
import { colors, radius, type } from '../theme';
import { cleanPhone, defaultMessage, isValidPhone, loadContact, saveContact } from '../storage';

export default function ContactScreen({ navigation, route }: any) {
  const firstRun: boolean = !!route.params?.firstRun;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [messageTouched, setMessageTouched] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    loadContact().then((c) => {
      if (c) {
        setName(c.name);
        setPhone(c.phone);
        setMessage(c.message);
        setMessageTouched(true);
      }
      setLoading(false);
    });
  }, []);

  // Le message suit le prénom tant que l'utilisateur ne l'a pas personnalisé
  const effectiveMessage = messageTouched ? message : defaultMessage(name.trim());

  const save = async () => {
    if (!isValidPhone(phone)) {
      setPhoneError('Entre un numéro valide (8 à 15 chiffres, indicatif possible).');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await saveContact({
        name: name.trim() || 'Mon contact',
        phone: cleanPhone(phone),
        message: effectiveMessage.trim() || defaultMessage(name.trim()),
      });
      // Fin de l'accueil : l'écran SOS devient la seule page de la pile
      if (firstRun || !navigation.canGoBack()) navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      else navigation.goBack();
    } catch {
      setSaveError("Impossible d'enregistrer. Réessaie.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Background>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.sos} size="large" />
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {firstRun ? (
              <StepHeader
                step={2}
                total={2}
                onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
              />
            ) : (
              <View style={styles.header}>
                {navigation.canGoBack() && (
                  <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.back} accessibilityLabel="Retour">
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                  </Pressable>
                )}
                <Text style={type.label}>Contact de confiance</Text>
              </View>
            )}

            <Text style={type.title}>Qui doit recevoir ton alerte ?</Text>
            <Text style={[type.body, { marginTop: 8, marginBottom: 24 }]}>
              Choisis quelqu'un qui pourra venir te chercher ou t'aider rapidement.
            </Text>

            <Text style={styles.fieldLabel}>Prénom ou surnom</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Maman, Léo…"
                placeholderTextColor={colors.textFaint}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.fieldLabel}>Numéro de téléphone</Text>
            <View style={[styles.inputWrap, phoneError && { borderColor: colors.danger }]}>
              <Ionicons name="call-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="06 12 34 56 78"
                placeholderTextColor={colors.textFaint}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (phoneError) setPhoneError(null);
                }}
                autoCorrect={false}
              />
              {isValidPhone(phone) && <Ionicons name="checkmark-circle" size={20} color={colors.ok} />}
            </View>
            {phoneError && <Text style={styles.error}>{phoneError}</Text>}

            <Text style={styles.fieldLabel}>Message envoyé</Text>
            <TextInput
              style={[styles.inputWrap, styles.textarea]}
              multiline
              value={effectiveMessage}
              onChangeText={(t) => {
                setMessageTouched(true);
                setMessage(t);
              }}
              placeholderTextColor={colors.textFaint}
              maxLength={200}
            />

            <Card style={styles.preview}>
              <Text style={[type.label, { marginBottom: 10 }]}>Aperçu du SMS</Text>
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>
                  {effectiveMessage}{' '}
                  <Text style={styles.link}>maps.google.com/?q=48.85,2.35</Text>
                </Text>
              </View>
            </Card>

            {saveError && <Text style={[styles.error, { textAlign: 'center' }]}>{saveError}</Text>}
          </ScrollView>

          <View style={styles.footer}>
            <Button label={firstRun ? 'Enregistrer et continuer' : 'Enregistrer'} icon="checkmark" onPress={save} loading={saving} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, marginBottom: 8 },
  back: { marginLeft: -6 },
  fieldLabel: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    minHeight: 56,
    marginBottom: 16,
  },
  input: { flex: 1, color: colors.text, fontSize: 17, paddingVertical: 14 },
  textarea: {
    color: colors.text,
    fontSize: 16,
    minHeight: 96,
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: 'top',
  },
  error: { color: colors.danger, fontSize: 13, marginTop: -8, marginBottom: 16 },
  preview: { marginTop: 4, marginBottom: 16 },
  bubble: {
    alignSelf: 'flex-end',
    maxWidth: '90%',
    backgroundColor: '#2F7BF6',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleText: { color: colors.white, fontSize: 15, lineHeight: 21 },
  link: { textDecorationLine: 'underline' },
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
});
