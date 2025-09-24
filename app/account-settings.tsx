import React, { useMemo, useState, useCallback } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { LogOut, ShieldOff, UserX } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const deactivateMutation = trpc.user.deactivateAccount.useMutation();
  const deleteMutation = trpc.user.deleteAccount.useMutation();

  const [reason, setReason] = useState<string>('');

  const isBusy = useMemo(() => deactivateMutation.isPending || deleteMutation.isPending, [deactivateMutation.isPending, deleteMutation.isPending]);

  const onDeactivate = async () => {
    try {
      const res = await deactivateMutation.mutateAsync({ reason });
      Alert.alert('Account deactivated', res.message);
      await logout();
      router.replace('/(auth)/welcome');
    } catch (e) {
      Alert.alert('Error', 'Could not deactivate your account. Please try again.');
    }
  };

  const onDelete = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteMutation.mutateAsync({ confirm: true });
              Alert.alert('Deletion scheduled', res.message);
              await logout();
              router.replace('/(auth)/welcome');
            } catch (e) {
              Alert.alert('Error', 'Could not delete your account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const onLogout = useCallback(async () => {
    try {
      console.log('AccountSettings: onLogout pressed');
      await logout();
      console.log('AccountSettings: logout finished, navigating to /(auth)/welcome');
      router.replace('/(auth)/welcome');
    } catch (e) {
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  }, [logout, router]);

  return (
    <View style={styles.container} testID="account-settings">
      <Stack.Screen
        options={{
          title: 'Account',
        }}
      />

      <View style={styles.card}>
        <Button
          title="Deactivate account"
          onPress={onDeactivate}
          variant="outline"
          icon={<ShieldOff size={18} color={colors.text} />}
          disabled={isBusy}
          testID="deactivate-btn"
        />
        <Button
          title="Delete account"
          onPress={onDelete}
          variant="danger"
          icon={<UserX size={18} color={colors.error} />}
          disabled={isBusy}
          style={styles.mt12}
          testID="delete-btn"
        />
        <Button
          title="Log out"
          onPress={onLogout}
          variant="ghost"
          icon={<LogOut size={18} color={colors.textSecondary} />}
          disabled={isBusy}
          style={styles.mt12}
          testID="logout-btn"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mt12: {
    marginTop: 12,
  },
});