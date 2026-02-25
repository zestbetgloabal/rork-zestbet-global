import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import { useUserStore } from '@/store/userStore';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();

  const [username, setUsername] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!username.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Benutzernamen ein.');
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    updateUser({
      username: username.trim(),
      bio: bio.trim(),
      avatar,
    });

    setIsSaving(false);
    Alert.alert('Gespeichert! ✅', 'Dein Profil wurde aktualisiert.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [username, bio, avatar, updateUser, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Profil bearbeiten' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} activeOpacity={0.7}>
            <Image source={{ uri: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop' }} style={styles.avatar} />
            <View style={styles.cameraOverlay}>
              <Camera size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Benutzername</Text>
          <TextInput
            style={styles.input}
            placeholder="Dein Benutzername"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            maxLength={30}
            testID="edit-username"
          />

          <Text style={styles.label}>Über mich</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Erzähl etwas über dich..."
            placeholderTextColor={colors.textMuted}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            maxLength={200}
            testID="edit-bio"
          />
          <Text style={styles.charCount}>{bio.length}/200</Text>

          <View style={styles.actions}>
            <Button
              title="Speichern"
              onPress={handleSave}
              loading={isSaving}
              size="large"
              testID="edit-save"
            />
            <Button
              title="Abbrechen"
              onPress={() => router.back()}
              variant="ghost"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 24,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  label: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top' as const,
  },
  charCount: {
    textAlign: 'right' as const,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    marginTop: 32,
    gap: 12,
  },
});
