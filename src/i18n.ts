import { getLocales } from 'expo-localization';

const fr = {
  // Accueil
  heroTitle: 'Perdu·e ?\nOn te retrouve.',
  heroText: 'IMLOST envoie ta position exacte à un proche en un seul geste.',
  step1Title: 'Choisis ton contact',
  step1Text: 'Une personne de confiance qui recevra ton alerte.',
  step2Title: 'Appuie longuement sur SOS',
  step2Text: 'Un appui maintenu évite les envois par erreur.',
  step3Title: 'Ta position part par SMS',
  step3Text: 'Avec un lien Google Maps, sans compte ni internet côté contact.',
  start: 'Commencer',
  back: 'Retour',

  // Permission
  permTitle: 'Autorise la localisation',
  permText: 'C’est ce qui permet à IMLOST de dire à ton proche exactement où te trouver.',
  permPoint1: 'Ta position est prête à partir dès que tu en as besoin, sans perdre de temps.',
  permPoint2: 'Utilisée uniquement quand l’app est ouverte. Jamais stockée, jamais partagée.',
  permPoint3: 'Envoyée seulement à ton contact, et seulement quand tu déclenches le SOS.',
  permDenied:
    'Localisation refusée. Tu pourras l’activer plus tard dans les réglages ; en attendant, l’alerte partira sans ta position.',
  permAllow: 'Autoriser la localisation',
  permLater: 'Plus tard',
  openSettings: 'Ouvrir les réglages',
  continueWithout: 'Continuer sans',

  // Contact
  contactLabel: 'Contact de confiance',
  contactTitle: 'Qui doit recevoir ton alerte ?',
  contactText: 'Choisis quelqu’un qui pourra venir te chercher ou t’aider rapidement.',
  nameLabel: 'Prénom ou surnom',
  namePlaceholder: 'Maman, Léo…',
  phoneLabel: 'Numéro de téléphone',
  phonePlaceholder: '06 12 34 56 78',
  phoneError: 'Entre un numéro valide (8 à 15 chiffres, indicatif possible).',
  messageLabel: 'Message envoyé',
  smsPreview: 'Aperçu du SMS',
  saveError: 'Impossible d’enregistrer. Réessaie.',
  saveContinue: 'Enregistrer et continuer',
  save: 'Enregistrer',
  defaultContactName: 'Mon contact',
  legacyContactName: 'Maman',
  defaultMessageNamed: '{name}, je suis perdu·e et j’ai besoin d’aide. Voici ma position :',
  defaultMessage: 'Je suis perdu·e et j’ai besoin d’aide. Voici ma position :',

  // Écran SOS
  editContact: 'Modifier le contact',
  holdToAlert: 'Maintenir pour alerter {name}',
  yourContact: 'ton contact',
  sos: 'SOS',
  hold: 'Maintenir appuyé',
  preparing: 'Préparation…',
  alertSentTo: 'Alerte envoyée à',
  call: 'Appeler {name}',
  lastAlert: 'Dernière alerte {when}',
  noAlertYet: 'Aucune alerte envoyée pour le moment',
  justNow: 'à l’instant',
  minutesAgo: 'il y a {n} min',
  todayAt: 'aujourd’hui à {time}',
  dateAt: 'le {date} à {time}',

  locSearching: 'Recherche de ta position…',
  locSearchingDetail: 'Reste à découvert si possible pour un meilleur signal GPS.',
  locFound: 'Position trouvée',
  locReadyDetail: 'Précision ±{m} m · prête à être envoyée',
  locDenied: 'Localisation désactivée pour IMLOST',
  locDeniedDetail: 'Sans elle, ton contact recevra l’alerte mais pas ta position.',
  locAllow: 'Autoriser',
  locOff: 'Le GPS du téléphone est coupé',
  locOffDetail: 'Active la localisation pour joindre ta position.',
  locEnable: 'Activer',

  hintHold: 'Garde le doigt appuyé jusqu’à ce que le cercle soit rempli.',
  sentAt: 'Alerte envoyée à {name} à {time}',
  handedOff: 'Message préparé pour {name}. Vérifie qu’il est bien parti.',
  cancelled: 'Envoi annulé. Rien n’a été envoyé.',
  idleInfo: 'Ta position sera envoyée par SMS à {name}.',
  smsUnavailable: 'Cet appareil ne peut pas envoyer de SMS.',
  sendFailed: 'L’envoi a échoué. Réessaie ou appelle directement.',

  // Contenu du SMS
  smsAccuracy: ' (précision ±{m} m)',
  smsNear: '\nPrès de : {address}',
  smsNoLocation: ' (position indisponible, appelle-moi)',
};

type Dict = typeof fr;

const en: Dict = {
  heroTitle: 'Lost?\nWe’ll find you.',
  heroText: 'IMLOST sends your exact location to someone you trust in a single gesture.',
  step1Title: 'Pick your contact',
  step1Text: 'Someone you trust who will receive your alert.',
  step2Title: 'Press and hold SOS',
  step2Text: 'Holding the button prevents accidental alerts.',
  step3Title: 'Your location goes out by text',
  step3Text: 'With a Google Maps link. Your contact needs no app or account.',
  start: 'Get started',
  back: 'Back',

  permTitle: 'Allow location access',
  permText: 'This is how IMLOST tells your contact exactly where to find you.',
  permPoint1: 'Your location is ready to send the moment you need it, no time lost.',
  permPoint2: 'Only used while the app is open. Never stored, never shared.',
  permPoint3: 'Sent only to your contact, and only when you trigger SOS.',
  permDenied:
    'Location denied. You can turn it on later in Settings; until then, your alert will be sent without your location.',
  permAllow: 'Allow location',
  permLater: 'Not now',
  openSettings: 'Open Settings',
  continueWithout: 'Continue without',

  contactLabel: 'Trusted contact',
  contactTitle: 'Who should receive your alert?',
  contactText: 'Choose someone who can come and get you or help quickly.',
  nameLabel: 'First name or nickname',
  namePlaceholder: 'Mom, Leo…',
  phoneLabel: 'Phone number',
  phonePlaceholder: '+1 555 123 4567',
  phoneError: 'Enter a valid number (8 to 15 digits, country code allowed).',
  messageLabel: 'Message sent',
  smsPreview: 'Text preview',
  saveError: 'Couldn’t save. Please try again.',
  saveContinue: 'Save and continue',
  save: 'Save',
  defaultContactName: 'My contact',
  legacyContactName: 'Mom',
  defaultMessageNamed: '{name}, I’m lost and I need help. Here’s my location:',
  defaultMessage: 'I’m lost and I need help. Here’s my location:',

  editContact: 'Edit contact',
  holdToAlert: 'Hold to alert {name}',
  yourContact: 'your contact',
  sos: 'SOS',
  hold: 'Press and hold',
  preparing: 'Preparing…',
  alertSentTo: 'Alert goes to',
  call: 'Call {name}',
  lastAlert: 'Last alert {when}',
  noAlertYet: 'No alert sent yet',
  justNow: 'just now',
  minutesAgo: '{n} min ago',
  todayAt: 'today at {time}',
  dateAt: 'on {date} at {time}',

  locSearching: 'Finding your location…',
  locSearchingDetail: 'Stay in the open if you can for a better GPS signal.',
  locFound: 'Location found',
  locReadyDetail: 'Accuracy ±{m} m · ready to send',
  locDenied: 'Location is off for IMLOST',
  locDeniedDetail: 'Without it, your contact gets the alert but not your location.',
  locAllow: 'Allow',
  locOff: 'Your phone’s GPS is off',
  locOffDetail: 'Turn on location to include where you are.',
  locEnable: 'Turn on',

  hintHold: 'Keep your finger down until the circle fills up.',
  sentAt: 'Alert sent to {name} at {time}',
  handedOff: 'Message ready for {name}. Make sure it was sent.',
  cancelled: 'Cancelled. Nothing was sent.',
  idleInfo: 'Your location will be texted to {name}.',
  smsUnavailable: 'This device can’t send text messages.',
  sendFailed: 'Sending failed. Try again or call directly.',

  smsAccuracy: ' (accuracy ±{m} m)',
  smsNear: '\nNear: {address}',
  smsNoLocation: ' (location unavailable, please call me)',
};

const dictionaries: Record<string, Dict> = { fr, en };

const deviceLocale = getLocales()[0];
// Langue du téléphone ; anglais par défaut pour les langues non traduites
export const lang: keyof typeof dictionaries = deviceLocale?.languageCode === 'fr' ? 'fr' : 'en';
// Balise complète (ex. fr-FR, en-US) pour formater dates et heures à la mode locale
export const localeTag = deviceLocale?.languageTag ?? (lang === 'fr' ? 'fr-FR' : 'en-US');

export type TKey = keyof Dict;

export function t(key: TKey, params?: Record<string, string | number>) {
  let s = dictionaries[lang][key];
  if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
  return s;
}
