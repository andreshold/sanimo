import '@/i18n';

import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import {
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { isOnboarded, useSettings } from '@/storage/settings';
import { colors, fonts } from '@/ui/theme';

SplashScreen.preventAutoHideAsync();

const showDevScreens = __DEV__ || process.env.EXPO_PUBLIC_BENCH === '1';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });
  const settings = useSettings();
  const onboarded = isOnboarded(settings);
  const { t } = useTranslation();

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: fonts.titleSemi },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        {/* Première ouverture : langue → avertissement → pack IA */}
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="(onboarding)/langue" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)/avertissement" options={{ title: '' }} />
        </Stack.Protected>

        {/* Pack IA : à la première ouverture, puis depuis le bandeau de l'accueil ou les réglages */}
        <Stack.Screen name="(onboarding)/pack-ia" options={{ title: '' }} />

        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="ijans" options={{ title: t('screens.ijans'), presentation: 'modal' }} />

          {/* Parcours d'évaluation (E20 → E31) */}
          <Stack.Screen name="(triage)/animal" options={{ title: '' }} />
          <Stack.Screen name="(triage)/description" options={{ title: '' }} />
          <Stack.Screen name="(triage)/symptomes" options={{ title: '' }} />
          <Stack.Screen name="(triage)/questions" options={{ title: '' }} />
          <Stack.Screen name="(triage)/resultat" options={{ title: t('triage.resultTitle') }} />
          <Stack.Screen name="(triage)/consignes" options={{ title: t('triage.adviceTitle') }} />

          <Stack.Screen name="rage" options={{ title: t('screens.rabies') }} />
          <Stack.Screen name="toxiques" options={{ title: t('screens.toxics') }} />
          <Stack.Screen name="veterinaires" options={{ title: t('screens.vets') }} />
          <Stack.Screen name="fiche" options={{ title: t('screens.vetSheet') }} />
          <Stack.Screen name="istwa" options={{ title: t('screens.history') }} />
          <Stack.Screen name="reglaj" options={{ title: t('screens.settings') }} />
        </Stack.Protected>

        <Stack.Protected guard={showDevScreens}>
          <Stack.Screen name="dev/bench" options={{ title: 'Banc d’essai IA' }} />
          <Stack.Screen name="dev/catalogue" options={{ title: t('screens.catalogue') }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
