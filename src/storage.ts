import AsyncStorage from '@react-native-async-storage/async-storage';

export type Contact = {
  name: string;
  phone: string;
  message: string;
};

const CONTACT_KEY = 'IMLOST_CONTACT_V2';
const LEGACY_PHONE_KEY = 'SAVED_PHONE_NUMBER';
const LAST_SENT_KEY = 'IMLOST_LAST_SENT';

export const defaultMessage = (name: string) =>
  `${name ? name + ', ' : ''}je suis perdu·e et j'ai besoin d'aide. Voici ma position :`;

export async function loadContact(): Promise<Contact | null> {
  try {
    const raw = await AsyncStorage.getItem(CONTACT_KEY);
    if (raw) return JSON.parse(raw) as Contact;
    // Migration depuis l'ancienne version (numéro seul)
    const legacy = await AsyncStorage.getItem(LEGACY_PHONE_KEY);
    if (legacy) return { name: 'Maman', phone: legacy, message: defaultMessage('Maman') };
  } catch {
    // stockage illisible : on repart de zéro
  }
  return null;
}

export async function saveContact(contact: Contact) {
  await AsyncStorage.setItem(CONTACT_KEY, JSON.stringify(contact));
}

export async function loadLastSent(): Promise<number | null> {
  try {
    const v = await AsyncStorage.getItem(LAST_SENT_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

export async function saveLastSent(ts: number) {
  try {
    await AsyncStorage.setItem(LAST_SENT_KEY, String(ts));
  } catch {
    // sans gravité
  }
}

export const cleanPhone = (raw: string) => raw.replace(/[^+\d]/g, '');
export const isValidPhone = (raw: string) => /^\+?\d{8,15}$/.test(cleanPhone(raw));

export const maskPhone = (phone: string) => {
  const p = cleanPhone(phone);
  if (p.length < 6) return p;
  return `${p.slice(0, p.length - 8)} •• •• ${p.slice(-4, -2)} ${p.slice(-2)}`.trim();
};
