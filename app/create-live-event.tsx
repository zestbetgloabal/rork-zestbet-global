import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Switch, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useLiveEventStore } from '@/store/liveEventStore';
import { useUserStore } from '@/store/userStore';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { Calendar, Clock, Users, Video, Image as ImageIcon, DollarSign } from 'lucide-react-native';

type EventType = 'bet' | 'challenge';
type EventVisibility = 'public' | 'private';
type EventDifficulty = 'easy' | 'medium' | 'hard';

export default function CreateLiveEventScreen() {
  const router = useRouter();
  const { createUserEvent, isLoading } = useLiveEventStore();
  const { user } = useUserStore();
  
  const [eventType, setEventType] = useState<EventType>('challenge');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<EventVisibility>('public');
  const [difficulty, setDifficulty] = useState<EventDifficulty>('medium');
  const [duration, setDuration] = useState('30'); // in minutes
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [hasFunding, setHasFunding] = useState(false);
  const [fundingGoal, setFundingGoal] = useState('');
  const [scheduledTime, setScheduledTime] = useState<'now' | 'later'>('now');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Titel ein.');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Fehler', 'Bitte gib eine Beschreibung ein.');
      return;
    }
    
    if (!user) {
      Alert.alert('Fehler', 'Du musst angemeldet sein, um ein Live-Event zu erstellen.');
      return;
    }
    
    const eventData = {
      title: title.trim(),
      description: description.trim(),
      type: eventType,
      visibility,
      difficulty,
      duration: parseInt(duration) * 60, // Convert to seconds
      maxParticipants: parseInt(maxParticipants),
      hasFunding,
      fundingGoal: hasFunding ? parseFloat(fundingGoal) || 0 : undefined,
      scheduledTime,
      thumbnailUrl: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000',
      creatorId: user.id,
      creatorUsername: user.username
    };
    
    try {
      const success = await createUserEvent(eventData);
      if (success) {
        Alert.alert(
          'Erfolgreich!', 
          scheduledTime === 'now' 
            ? 'Dein Live-Event wurde erstellt und ist jetzt live!' 
            : 'Dein Live-Event wurde geplant und wird zur gewählten Zeit gestartet.',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Fehler', 'Das Live-Event konnte nicht erstellt werden. Bitte versuche es erneut.');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Live-Event erstellen',
          headerBackTitle: 'Zurück'
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Event Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event-Typ</Text>
          <View style={styles.typeContainer}>
            <Button
              title="Challenge"
              onPress={() => setEventType('challenge')}
              variant={eventType === 'challenge' ? 'primary' : 'outline'}
              style={styles.typeButton}
              icon={<Users size={18} color={eventType === 'challenge' ? 'white' : colors.primary} />}
            />
            <Button
              title="Wette"
              onPress={() => setEventType('bet')}
              variant={eventType === 'bet' ? 'primary' : 'outline'}
              style={styles.typeButton}
              icon={<DollarSign size={18} color={eventType === 'bet' ? 'white' : colors.primary} />}
            />
          </View>
        </View>
        
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grundinformationen</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titel *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Gib deinem Event einen spannenden Titel..."
              placeholderTextColor={colors.textSecondary}
              maxLength={100}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Beschreibung *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Beschreibe dein Event und was die Teilnehmer erwartet..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thumbnail URL (optional)</Text>
            <TextInput
              style={styles.input}
              value={thumbnailUrl}
              onChangeText={setThumbnailUrl}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={colors.textSecondary}
              keyboardType="url"
            />
          </View>
        </View>
        
        {/* Event Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event-Einstellungen</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Sichtbarkeit</Text>
            <View style={styles.segmentedControl}>
              <Button
                title="Öffentlich"
                onPress={() => setVisibility('public')}
                variant={visibility === 'public' ? 'primary' : 'outline'}
                style={styles.segmentButton}
              />
              <Button
                title="Privat"
                onPress={() => setVisibility('private')}
                variant={visibility === 'private' ? 'primary' : 'outline'}
                style={styles.segmentButton}
              />
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Schwierigkeit</Text>
            <View style={styles.segmentedControl}>
              <Button
                title="Leicht"
                onPress={() => setDifficulty('easy')}
                variant={difficulty === 'easy' ? 'primary' : 'outline'}
                style={styles.segmentButtonSmall}
              />
              <Button
                title="Mittel"
                onPress={() => setDifficulty('medium')}
                variant={difficulty === 'medium' ? 'primary' : 'outline'}
                style={styles.segmentButtonSmall}
              />
              <Button
                title="Schwer"
                onPress={() => setDifficulty('hard')}
                variant={difficulty === 'hard' ? 'primary' : 'outline'}
                style={styles.segmentButtonSmall}
              />
            </View>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dauer (Minuten)</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="30"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max. Teilnehmer</Text>
              <TextInput
                style={styles.input}
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                placeholder="10"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
        
        {/* Funding Settings */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.settingLabel}>Funding aktivieren</Text>
              <Text style={styles.settingDescription}>
                Erlaube Zuschauern, Geld für dein Event zu spenden
              </Text>
            </View>
            <Switch
              value={hasFunding}
              onValueChange={setHasFunding}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : hasFunding ? 'white' : colors.textSecondary}
            />
          </View>
          
          {hasFunding && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Funding-Ziel (€)</Text>
              <TextInput
                style={styles.input}
                value={fundingGoal}
                onChangeText={setFundingGoal}
                placeholder="100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>
        
        {/* Timing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zeitplanung</Text>
          <View style={styles.segmentedControl}>
            <Button
              title="Jetzt starten"
              onPress={() => setScheduledTime('now')}
              variant={scheduledTime === 'now' ? 'primary' : 'outline'}
              style={styles.segmentButton}
              icon={<Video size={18} color={scheduledTime === 'now' ? 'white' : colors.primary} />}
            />
            <Button
              title="Später planen"
              onPress={() => setScheduledTime('later')}
              variant={scheduledTime === 'later' ? 'primary' : 'outline'}
              style={styles.segmentButton}
              icon={<Calendar size={18} color={scheduledTime === 'later' ? 'white' : colors.primary} />}
            />
          </View>
          
          {scheduledTime === 'later' && (
            <View style={styles.infoBox}>
              <Clock size={16} color={colors.primary} />
              <Text style={styles.infoText}>
                Die Zeitplanung wird in einer zukünftigen Version verfügbar sein. 
                Für jetzt wird dein Event sofort gestartet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title={scheduledTime === 'now' ? 'Live gehen!' : 'Event planen'}
          onPress={handleCreate}
          loading={isLoading}
          style={styles.createButton}
          icon={<Video size={20} color="white" />}
        />
      </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
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
    height: 100,
    textAlignVertical: 'top',
  },
  settingRow: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
  },
  segmentButtonSmall: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  createButton: {
    width: '100%',
  },
});