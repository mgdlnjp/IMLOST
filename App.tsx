import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ---------- Types ----------
type PhoneScreenProps = {
  navigation: any;
  route: any;
};

type SendSmsScreenProps = {
  navigation: any;
  route: { params: { phoneNumber: string } };
};

const PHONE_KEY = 'SAVED_PHONE_NUMBER';

// ---------- Ecran 1 : Saisie du numéro ----------
const PhoneScreen: React.FC<PhoneScreenProps> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);

  // Charger le numéro sauvegardé au montage
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(PHONE_KEY);
        if (saved) setPhoneNumber(saved);
      } catch (e) {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  const handleConfirm = async () => {
    const cleaned = phoneNumber.replace(/[^+\d]/g, '');
    if (!/^(\+?\d{8,15})$/.test(cleaned)) {
      Alert.alert('Numéro invalide', 'Veuillez entrer un numéro de téléphone valide.');
      return;
    }
    try {
      await AsyncStorage.setItem(PHONE_KEY, cleaned);
    } catch (e) {
      Alert.alert('Erreur', "Impossible de sauvegarder le numéro.");
    }
    navigation.navigate('SendSms', { phoneNumber: cleaned });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inputBox}>
       {/* <Text style={styles.label}>
        Entrez le numéro de téléphone :
        </Text> */}
        <TextInput
          style={styles.input}
          placeholder="Numéro à contacter"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>ENREGISTRER</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ---------- Ecran 2 : Envoi du SMS ----------
const SendSmsScreen: React.FC<SendSmsScreenProps> = ({ navigation, route }) => {
  const { phoneNumber } = route.params;
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted' ? 'granted' : 'denied');
      if (status !== 'granted') {
        Alert.alert(
          'Permission localisation refusée',
          'Vous devez autoriser la localisation pour envoyer votre position par SMS.'
        );
      }
    })();
  }, []);

  const sendSMSWithLocation = async () => {
    setLoading(true);
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Non supporté", "L'envoi de SMS n'est pas disponible sur cet appareil.");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const message = `Maman, aide-moi! Je suis là : https://maps.google.com/?q=${latitude},${longitude}`;

      const { result } = await SMS.sendSMSAsync(
        [phoneNumber],
        message
      );

      if (result === 'sent') {
        Alert.alert('Succès', 'SMS avec position envoyé !');
      } else if (result === 'cancelled') {
        Alert.alert('Annulé', 'Envoi annulé.');
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'obtenir la position ou d'envoyer le SMS.");
    } finally {
      setLoading(false);
    }
  };

  if (locationPermission === 'denied') {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', margin: 20 }}>
          Permission de localisation refusée. Veuillez l'activer dans les paramètres de votre appareil pour utiliser cette application.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Numéro masqué ici */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={sendSMSWithLocation}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.sosButtonText}>SOS</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.changeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.changeButtonText}>MODIFIER CONTACT</Text>
      </TouchableOpacity>
    </View>
  );
};

// ---------- Navigation ----------
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Phone" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Phone" component={PhoneScreen} />
        <Stack.Screen name="SendSms" component={SendSmsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBox: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    width: '80%',
  },
  label: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmedLabel: {
    fontSize: 18,
    marginBottom: 24,
    color: '#333',
  },
  sosButton: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 80,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  changeButton: {
    marginTop: 8,
  },
  changeButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default App;
