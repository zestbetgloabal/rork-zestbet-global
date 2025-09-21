import { Stack } from 'expo-router';
import colors from '@/constants/colors';

export default function AuthLayout() {
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
        name="login" 
        options={{ 
          title: "Log In",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="phone-login" 
        options={{ 
          title: "Phone Login",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: "Create Account",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="phone-verification" 
        options={{ 
          title: "Verify Phone",
          presentation: "card"
        }} 
      />
    </Stack>
  );
}