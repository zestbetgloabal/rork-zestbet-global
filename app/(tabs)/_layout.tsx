import React from 'react';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Home, User, MessageCircle, UserPlus } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const router = useRouter();
  
  const InviteHeaderButton = () => (
    <Pressable 
      onPress={() => router.push('/invite')}
      style={styles.inviteButton}
    >
      <UserPlus size={16} color="white" />
    </Pressable>
  );
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerRight: () => <InviteHeaderButton />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="invite"
        options={{
          title: 'Invite',
          tabBarIcon: ({ color }) => <UserPlus size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="social"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  inviteButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
});