import { Stack } from 'expo-router';
import colors from '@/constants/colors';

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' as const },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Rechtliches' }} />
      <Stack.Screen name="impressum" options={{ title: 'Impressum' }} />
      <Stack.Screen name="datenschutz" options={{ title: 'Datenschutz' }} />
    </Stack>
  );
}
