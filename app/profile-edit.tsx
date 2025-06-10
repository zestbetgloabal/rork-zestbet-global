import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { Brain, Camera, ChevronRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useUserStore();
  
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [username, setUsername] = useState(user?.username || '');
  const [biography, setBiography] = useState(user?.biography || '');
  const [instagram, setInstagram] = useState(user?.socialMedia?.instagram || '');
  const [twitter, setTwitter] = useState(user?.socialMedia?.twitter || '');
  const [tiktok, setTiktok] = useState(user?.socialMedia?.tiktok || '');
  
  const handleSave = () => {
    updateUserProfile({
      username,
      biography,
      avatar,
      socialMedia: {
        ...user?.socialMedia,
        instagram,
        twitter,
        tiktok
      }
    });
    
    router.back();
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Profile',
          headerRight: () => (
            <Button
              title="Save"
              onPress={handleSave}
              variant="outline"
            />
          )
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Pressable style={styles.avatarContainer} onPress={pickImage}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.cameraButton}>
              <Camera size={16} color="white" />
            </View>
          </Pressable>
        </View>
        
        {/* Profile Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Your username"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Biography</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={biography}
              onChangeText={setBiography}
              placeholder="Tell us about yourself"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <Text style={styles.sectionTitle}>Social Media</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <TextInput
              style={styles.input}
              value={instagram}
              onChangeText={setInstagram}
              placeholder="Your Instagram username"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Twitter</Text>
            <TextInput
              style={styles.input}
              value={twitter}
              onChangeText={setTwitter}
              placeholder="Your Twitter username"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>TikTok</Text>
            <TextInput
              style={styles.input}
              value={tiktok}
              onChangeText={setTiktok}
              placeholder="Your TikTok username"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
        
        {/* AI Preferences Link */}
        <Pressable 
          style={styles.aiPreferencesLink}
          onPress={() => router.push('/user-preferences')}
        >
          <View style={styles.aiPreferencesContent}>
            <Brain size={20} color={colors.primary} />
            <View style={styles.aiPreferencesTextContainer}>
              <Text style={styles.aiPreferencesTitle}>AI Preferences</Text>
              <Text style={styles.aiPreferencesDescription}>
                Customize your AI recommendations
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </Pressable>
        
        <Button
          title="Save Profile"
          onPress={handleSave}
          variant="primary"
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 16,
  },
  aiPreferencesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  aiPreferencesContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiPreferencesTextContainer: {
    marginLeft: 12,
  },
  aiPreferencesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  aiPreferencesDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  saveButton: {
    margin: 16,
    marginTop: 24,
  },
});