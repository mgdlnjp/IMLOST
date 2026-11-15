import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ContactScreen from './src/screens/ContactScreen';
import HomeScreen from './src/screens/HomeScreen';
import { isOnboarded, loadContact } from './src/storage';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, primary: colors.sos },
};

type Route = 'Onboarding' | 'Contact' | 'Home';

export default function App() {
  const [initialRoute, setInitialRoute] = useState<Route | null>(null);

  useEffect(() => {
    (async () => {
      const contact = await loadContact();
      if (contact) return setInitialRoute('Home');
      setInitialRoute((await isOnboarded()) ? 'Contact' : 'Onboarding');
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {initialRoute ? (
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            id={undefined}
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.bg } }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen
              name="Contact"
              component={ContactScreen}
              initialParams={initialRoute === 'Contact' ? { firstRun: true } : undefined}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.sos} />
        </View>
      )}
    </SafeAreaProvider>
  );
}
