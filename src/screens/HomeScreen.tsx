import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as Haptics from 'expo-haptics';
import { Background, Card, IconBubble } from '../ui';
import { colors, radius, type } from '../theme';
import { Contact, loadContact, loadLastSent, maskPhone, saveLastSent } from '../storage';

const HOLD_MS = 1200;
const SOS_SIZE = 220;

type LocState =
  | { kind: 'checking' }
  | { kind: 'denied'; canAskAgain: boolean }
  | { kind: 'searching' }
  | { kind: 'ready'; coords: Location.LocationObjectCoords; at: number; address?: string }
  | { kind: 'off' };

type SendState =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; at: number }
  | { kind: 'handed-off'; at: number }
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string };

const timeLabel = (ts: number) =>
  new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const relativeLabel = (ts: number) => {
  const min = Math.round((Date.now() - ts) / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const d = new Date(ts);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? `aujourd'hui à ${timeLabel(ts)}` : `le ${d.toLocaleDateString('fr-FR')} à ${timeLabel(ts)}`;
};

function formatAddress(a?: Location.LocationGeocodedAddress) {
  if (!a) return undefined;
  const street = [a.streetNumber, a.street].filter(Boolean).join(' ');
  return [street || a.name, a.city].filter(Boolean).join(', ') || undefined;
}

export default function HomeScreen({ navigation }: any) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loc, setLoc] = useState<LocState>({ kind: 'checking' });
  const [send, setSend] = useState<SendState>({ kind: 'idle' });
  const [lastSent, setLastSent] = useState<number | null>(null);
  const [hint, setHint] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const holdAnim = useRef<Animated.CompositeAnimation | null>(null);
  const watcher = useRef<Location.LocationSubscription | null>(null);
  const lastGeocode = useRef(0);
  const pressStart = useRef(0);

  // ---------- Contact ----------
  useEffect(() => {
    const refresh = () => loadContact().then((c) => (c ? setContact(c) : navigation.replace('Contact', { firstRun: true })));
    refresh();
    loadLastSent().then(setLastSent);
    return navigation.addListener('focus', refresh);
  }, [navigation]);

  // ---------- Localisation ----------
  const startWatching = useCallback(async () => {
    watcher.current?.remove();
    if (!(await Location.hasServicesEnabledAsync())) {
      setLoc({ kind: 'off' });
      return;
    }
    setLoc((prev) => (prev.kind === 'ready' ? prev : { kind: 'searching' }));
    watcher.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
      async (pos) => {
        setLoc((prev) => ({
          kind: 'ready',
          coords: pos.coords,
          at: pos.timestamp,
          address: prev.kind === 'ready' ? prev.address : undefined,
        }));
        if (Date.now() - lastGeocode.current > 30000) {
          lastGeocode.current = Date.now();
          try {
            const [a] = await Location.reverseGeocodeAsync(pos.coords);
            const address = formatAddress(a);
            setLoc((prev) => (prev.kind === 'ready' ? { ...prev, address } : prev));
          } catch {
            // adresse facultative
          }
        }
      }
    );
  }, []);

  const checkPermission = useCallback(
    async (ask: boolean) => {
      let perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== 'granted' && ask && perm.canAskAgain) {
        perm = await Location.requestForegroundPermissionsAsync();
      }
      if (perm.status === 'granted') startWatching();
      else setLoc({ kind: 'denied', canAskAgain: perm.canAskAgain });
    },
    [startWatching]
  );

  useEffect(() => {
    checkPermission(true);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && checkPermission(false));
    return () => {
      sub.remove();
      watcher.current?.remove();
    };
  }, [checkPermission]);

  const fixLocation = async () => {
    if (loc.kind === 'denied' && loc.canAskAgain) checkPermission(true);
    else if (loc.kind === 'denied') Linking.openSettings();
    else if (loc.kind === 'off') {
      try {
        await Location.enableNetworkProviderAsync();
      } catch {
        Linking.openSettings();
      }
      checkPermission(false);
    }
  };

  // ---------- Pulsation du bouton ----------
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // ---------- Envoi ----------
  const getFreshCoords = async (): Promise<Location.LocationObjectCoords | null> => {
    if (loc.kind === 'ready' && Date.now() - loc.at < 60000) return loc.coords;
    if (loc.kind === 'denied' || loc.kind === 'off') return null;
    try {
      const timeout = new Promise<null>((r) => setTimeout(() => r(null), 10000));
      const pos = await Promise.race([Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }), timeout]);
      if (pos) return pos.coords;
      const last = await Location.getLastKnownPositionAsync();
      return last?.coords ?? null;
    } catch {
      return null;
    }
  };

  const sendAlert = async () => {
    if (!contact) return;
    setSend({ kind: 'sending' });
    try {
      if (!(await SMS.isAvailableAsync())) {
        setSend({ kind: 'error', message: "Cet appareil ne peut pas envoyer de SMS." });
        return;
      }
      const coords = await getFreshCoords();
      const address = loc.kind === 'ready' ? loc.address : undefined;
      const body = coords
        ? `${contact.message} https://maps.google.com/?q=${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}` +
          (coords.accuracy ? ` (précision ±${Math.round(coords.accuracy)} m)` : '') +
          (address ? `\nPrès de : ${address}` : '')
        : `${contact.message} (position indisponible, appelle-moi)`;

      const { result } = await SMS.sendSMSAsync([contact.phone], body);
      const now = Date.now();
      if (result === 'cancelled') {
        setSend({ kind: 'cancelled' });
        return;
      }
      // iOS renvoie "sent" ; Android renvoie "unknown" une fois la messagerie ouverte.
      setSend(result === 'sent' ? { kind: 'sent', at: now } : { kind: 'handed-off', at: now });
      setLastSent(now);
      saveLastSent(now);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setSend({ kind: 'error', message: "L'envoi a échoué. Réessaie ou appelle directement." });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const onPressIn = () => {
    if (send.kind === 'sending') return;
    setHint(false);
    pressStart.current = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    holdAnim.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    holdAnim.current.start(({ finished }) => {
      if (finished) {
        pressStart.current = 0;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        progress.setValue(0);
        sendAlert();
      }
    });
  };

  const onPressOut = () => {
    holdAnim.current?.stop();
    // Relâché trop tôt : on explique le geste
    if (pressStart.current && Date.now() - pressStart.current < HOLD_MS) setHint(true);
    pressStart.current = 0;
    Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  const call = () => contact && Linking.openURL(`tel:${contact.phone}`);

  // ---------- Rendu ----------
  const fillScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.01, 1] });
  const btnScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  const sending = send.kind === 'sending';

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
          {/* En-tête */}
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandDot}>
                <Ionicons name="navigate" size={14} color={colors.white} />
              </View>
              <Text style={styles.brandText}>IMLOST</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('Contact', { firstRun: false })}
              hitSlop={10}
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
              accessibilityLabel="Modifier le contact"
            >
              <Ionicons name="settings-outline" size={22} color={colors.text} />
            </Pressable>
          </View>

          <LocationCard loc={loc} onFix={fixLocation} />

          {/* Bouton SOS */}
          <View style={styles.sosZone}>
            <Animated.View
              pointerEvents="none"
              style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
            />
            <View pointerEvents="none" style={styles.ringStatic} />
            <Pressable
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={sending}
              accessibilityRole="button"
              accessibilityLabel={`Maintenir pour alerter ${contact?.name ?? 'ton contact'}`}
            >
              <Animated.View style={[styles.sosOuter, { transform: [{ scale: btnScale }] }]}>
                <LinearGradient colors={[colors.sosWarm, colors.sos, colors.sosDeep]} style={styles.sosBtn}>
                  <Animated.View style={[styles.sosFill, { transform: [{ scale: fillScale }] }]} />
                  {sending ? (
                    <>
                      <Ionicons name="paper-plane" size={44} color={colors.white} />
                      <Text style={styles.sosSub}>Préparation…</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.sosText}>SOS</Text>
                      <Text style={styles.sosSub}>Maintenir appuyé</Text>
                    </>
                  )}
                </LinearGradient>
              </Animated.View>
            </Pressable>
          </View>

          <SendFeedback send={send} hint={hint} contactName={contact?.name} />

          {/* Contact */}
          {contact && (
            <Card style={styles.contactCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{contact.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type.label}>Alerte envoyée à</Text>
                <Text style={styles.contactName} numberOfLines={1}>
                  {contact.name}
                </Text>
                <Text style={styles.contactPhone}>{maskPhone(contact.phone)}</Text>
              </View>
              <Pressable
                onPress={call}
                style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.7 }]}
                accessibilityLabel={`Appeler ${contact.name}`}
              >
                <Ionicons name="call" size={20} color={colors.ok} />
              </Pressable>
            </Card>
          )}

          <Text style={styles.footnote}>
            {lastSent ? `Dernière alerte ${relativeLabel(lastSent)}` : 'Aucune alerte envoyée pour le moment'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

// ---------- Sous-composants ----------
function LocationCard({ loc, onFix }: { loc: LocState; onFix: () => void }) {
  let icon: keyof typeof Ionicons.glyphMap = 'locate';
  let tint = colors.warn;
  let bg = colors.warnSoft;
  let title = '';
  let detail = '';
  let action: string | null = null;

  switch (loc.kind) {
    case 'checking':
    case 'searching':
      title = 'Recherche de ta position…';
      detail = 'Reste à découvert si possible pour un meilleur signal GPS.';
      break;
    case 'ready':
      icon = 'location';
      tint = colors.ok;
      bg = colors.okSoft;
      title = loc.address ?? 'Position trouvée';
      detail = `Précision ±${Math.round(loc.coords.accuracy ?? 0)} m · prête à être envoyée`;
      break;
    case 'denied':
      icon = 'location-outline';
      tint = colors.danger;
      bg = colors.dangerSoft;
      title = 'Localisation désactivée pour IMLOST';
      detail = "Sans elle, ton contact recevra l'alerte mais pas ta position.";
      action = loc.canAskAgain ? 'Autoriser' : 'Ouvrir les réglages';
      break;
    case 'off':
      icon = 'location-outline';
      tint = colors.danger;
      bg = colors.dangerSoft;
      title = 'Le GPS du téléphone est coupé';
      detail = 'Active la localisation pour joindre ta position.';
      action = 'Activer';
      break;
  }

  return (
    <Card style={styles.locCard}>
      <IconBubble name={icon} color={tint} bg={bg} size={40} />
      <View style={{ flex: 1 }}>
        <Text style={styles.locTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.locDetail}>{detail}</Text>
      </View>
      {action && (
        <Pressable onPress={onFix} style={({ pressed }) => [styles.locAction, pressed && { opacity: 0.7 }]}>
          <Text style={styles.locActionText}>{action}</Text>
        </Pressable>
      )}
    </Card>
  );
}

function SendFeedback({ send, hint, contactName }: { send: SendState; hint: boolean; contactName?: string }) {
  let icon: keyof typeof Ionicons.glyphMap | null = null;
  let color = colors.textMuted;
  let text = '';

  if (hint) {
    icon = 'hand-left-outline';
    text = 'Garde le doigt appuyé jusqu’à ce que le cercle soit rempli.';
  } else if (send.kind === 'sent') {
    icon = 'checkmark-circle';
    color = colors.ok;
    text = `Alerte envoyée à ${contactName} à ${timeLabel(send.at)}`;
  } else if (send.kind === 'handed-off') {
    icon = 'checkmark-circle';
    color = colors.ok;
    text = `Message préparé pour ${contactName}. Vérifie qu’il est bien parti.`;
  } else if (send.kind === 'cancelled') {
    icon = 'close-circle-outline';
    text = 'Envoi annulé. Rien n’a été envoyé.';
  } else if (send.kind === 'error') {
    icon = 'alert-circle';
    color = colors.danger;
    text = send.message;
  } else {
    text = `Ta position sera envoyée par SMS à ${contactName ?? 'ton contact'}.`;
  }

  return (
    <View style={styles.feedback}>
      {icon && <Ionicons name={icon} size={18} color={color} />}
      <Text style={[styles.feedbackText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.sos,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: 1.5 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  locCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  locTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  locDetail: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  locAction: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locActionText: { color: colors.text, fontSize: 13, fontWeight: '700' },

  sosZone: { flex: 1, minHeight: 320, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  ring: {
    position: 'absolute',
    width: SOS_SIZE,
    height: SOS_SIZE,
    borderRadius: SOS_SIZE / 2,
    backgroundColor: colors.sos,
  },
  ringStatic: {
    position: 'absolute',
    width: SOS_SIZE + 36,
    height: SOS_SIZE + 36,
    borderRadius: (SOS_SIZE + 36) / 2,
    backgroundColor: colors.sosGlow,
  },
  sosOuter: {
    width: SOS_SIZE,
    height: SOS_SIZE,
    borderRadius: SOS_SIZE / 2,
    boxShadow: '0px 16px 40px rgba(255, 77, 79, 0.45)',
  },
  sosBtn: {
    width: SOS_SIZE,
    height: SOS_SIZE,
    borderRadius: SOS_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  sosFill: {
    position: 'absolute',
    width: SOS_SIZE,
    height: SOS_SIZE,
    borderRadius: SOS_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  sosText: { color: colors.white, fontSize: 64, fontWeight: '900', letterSpacing: 4 },
  sosSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },

  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  feedbackText: { fontSize: 14, lineHeight: 20, textAlign: 'center', flexShrink: 1 },

  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontSize: 20, fontWeight: '800' },
  contactName: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 2 },
  contactPhone: { color: colors.textMuted, fontSize: 14, marginTop: 1 },
  callBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.okSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footnote: { color: colors.textFaint, fontSize: 13, textAlign: 'center', marginTop: 16 },
});
