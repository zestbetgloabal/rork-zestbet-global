import { Stack } from 'expo-router';
import colors from '@/constants/colors';

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Legal Information",
        }} 
      />
      <Stack.Screen 
        name="impressum" 
        options={{ 
          title: "Impressum",
        }} 
      />
      <Stack.Screen 
        name="agb" 
        options={{ 
          title: "Terms and Conditions",
        }} 
      />
      <Stack.Screen 
        name="datenschutz" 
        options={{ 
          title: "Privacy Policy",
        }} 
      />
    </Stack>
  );
}