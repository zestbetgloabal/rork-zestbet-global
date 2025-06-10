import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Alert,
  Pressable,
  Image,
  FlatList,
  Switch,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Calendar, X, UserPlus, Check, Lock, Globe, Image as ImageIcon, Video, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useBetStore } from '@/store/betStore';
import { useUserStore } from '@/store/userStore';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function ProposeBetScreen() {
  const router = useRouter();
  const { proposeBet, isLoading } = useBetStore();
  const { user } = useUserStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<Array<{uri: string, type: 'image' | 'video', name?: string}>>([]);
  
  const categories = [
    'crypto', 'sports', 'weather', 'entertainment', 'science', 'politics', 'other'
  ];
  
  // Mock friends data - in a real app, this would come from an API
  const friends = [
    { id: '1', username: 'crypto_enthusiast', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww' },
    { id: '2', username: 'bet_master', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyfGVufDB8fDB8fHww' },
    { id: '3', username: 'lucky_charm', avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D' },
    { id: '4', username: 'prediction_pro', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww' },
    { id: '5', username: 'zest_king', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww' },
  ];
  
  // If bet is private, automatically show friend selector
  useEffect(() => {
    if (isPrivate) {
      setShowFriendSelector(true);
    }
  }, [isPrivate]);
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your bet');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description for your bet');
      return;
    }
    
    if (!category) {
      Alert.alert('Missing Category', 'Please select a category for your bet');
      return;
    }
    
    // If private bet, require at least one friend
    if (isPrivate && selectedFriends.length === 0) {
      Alert.alert('Missing Friends', 'Private bets require at least one invited friend');
      return;
    }
    
    const bet = {
      title,
      description,
      category,
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      invitedFriends: selectedFriends,
      visibility: isPrivate ? 'private' : 'public' as 'private' | 'public',
      mediaFiles
    };
    
    const success = await proposeBet(bet);
    
    if (success) {
      const visibilityMessage = isPrivate ? 'private' : 'public';
      const inviteMessage = selectedFriends.length > 0 
        ? ` and invited ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''}!`
        : '!';
      
      Alert.alert('Bet Proposed', `Your ${visibilityMessage} bet has been proposed successfully${inviteMessage}`);
      router.back();
    } else {
      Alert.alert('Error', 'Failed to propose bet. Please try again.');
    }
  };
  
  const handleClose = () => {
    router.back();
  };
  
  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };
  
  const pickImage = async () => {
    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
          return;
        }
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaFiles(prev => [...prev, {
          uri: asset.uri,
          type: 'image',
          name: asset.fileName || `image-${Date.now()}.jpg`
        }]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  const pickVideo = async () => {
    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need camera roll permissions to upload videos');
          return;
        }
      }
      
      // On web, use DocumentPicker instead of ImagePicker for videos
      if (Platform.OS === 'web') {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'video/*',
          copyToCacheDirectory: true,
        });
        
        if (result.canceled === false && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setMediaFiles(prev => [...prev, {
            uri: asset.uri,
            type: 'video',
            name: asset.name
          }]);
        }
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        videoMaxDuration: 60, // 1 minute max
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaFiles(prev => [...prev, {
          uri: asset.uri,
          type: 'video',
          name: asset.fileName || `video-${Date.now()}.mp4`
        }]);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    }
  };
  
  const takePhoto = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need camera permissions to take photos');
          return;
        }
      }
      
      // Camera is not fully supported on web, so we'll show an alert
      if (Platform.OS === 'web') {
        Alert.alert('Not Supported', 'Taking photos directly is not supported on web. Please upload an image instead.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaFiles(prev => [...prev, {
          uri: asset.uri,
          type: 'image',
          name: asset.fileName || `photo-${Date.now()}.jpg`
        }]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };
  
  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const renderFriendItem = ({ item }: { item: { id: string; username: string; avatar: string } }) => (
    <Pressable 
      style={[styles.friendItem, selectedFriends.includes(item.id) && styles.selectedFriendItem]} 
      onPress={() => toggleFriendSelection(item.id)}
    >
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <Text style={styles.friendName}>{item.username}</Text>
      {selectedFriends.includes(item.id) && (
        <View style={styles.checkIcon}>
          <Check size={16} color="white" />
        </View>
      )}
    </Pressable>
  );
  
  const renderMediaItem = ({ item, index }: { item: { uri: string, type: 'image' | 'video' }, index: number }) => (
    <View style={styles.mediaItem}>
      {item.type === 'image' ? (
        <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
      ) : (
        <View style={styles.videoPreview}>
          <Video size={24} color={colors.primary} />
          <Text style={styles.videoText}>Video</Text>
        </View>
      )}
      <Pressable style={styles.removeMediaButton} onPress={() => removeMedia(index)}>
        <X size={16} color="white" />
      </Pressable>
    </View>
  );
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen 
        options={{ 
          title: 'Propose a Bet',
          headerRight: () => (
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </Pressable>
          ),
        }} 
      />
      
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter a clear, concise title"
        maxLength={100}
      />
      
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textArea}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the bet in detail, including how the outcome will be determined"
        multiline
        maxLength={500}
        textAlignVertical="top"
      />
      
      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryContainer}>
        {categories.map(cat => (
          <Pressable
            key={cat}
            style={[
              styles.categoryButton,
              category === cat && styles.selectedCategory
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text 
              style={[
                styles.categoryText,
                category === cat && styles.selectedCategoryText
              ]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
      
      <Text style={styles.label}>End Date (Optional)</Text>
      <View style={styles.dateContainer}>
        <Calendar size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.dateInput}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD"
        />
      </View>
      <Text style={styles.helperText}>
        If not specified, the bet will end in 30 days
      </Text>
      
      {/* Media Upload Section */}
      <Text style={styles.label}>Add Photos/Videos (Optional)</Text>
      <View style={styles.mediaUploadSection}>
        <View style={styles.mediaButtons}>
          <Pressable style={styles.mediaButton} onPress={pickImage}>
            <ImageIcon size={20} color={colors.primary} />
            <Text style={styles.mediaButtonText}>Add Photo</Text>
          </Pressable>
          <Pressable style={styles.mediaButton} onPress={pickVideo}>
            <Video size={20} color={colors.primary} />
            <Text style={styles.mediaButtonText}>Add Video</Text>
          </Pressable>
          <Pressable style={styles.mediaButton} onPress={takePhoto}>
            <Camera size={20} color={colors.primary} />
            <Text style={styles.mediaButtonText}>Take Photo</Text>
          </Pressable>
        </View>
        
        {mediaFiles.length > 0 && (
          <View style={styles.mediaPreviewContainer}>
            <FlatList
              data={mediaFiles}
              renderItem={renderMediaItem}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mediaList}
            />
          </View>
        )}
        
        <Text style={styles.mediaHelperText}>
          Add photos or videos to provide evidence or context for your bet
        </Text>
      </View>
      
      {/* Visibility Toggle */}
      <View style={styles.visibilityContainer}>
        <View style={styles.visibilityHeader}>
          <Text style={styles.visibilityLabel}>Make this bet private</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={isPrivate ? colors.primary : '#f4f3f4'}
          />
        </View>
        <View style={styles.visibilityDescription}>
          {isPrivate ? (
            <View style={styles.visibilityInfo}>
              <Lock size={16} color={colors.textSecondary} />
              <Text style={styles.visibilityText}>
                Private bets are only visible to you and invited friends
              </Text>
            </View>
          ) : (
            <View style={styles.visibilityInfo}>
              <Globe size={16} color={colors.textSecondary} />
              <Text style={styles.visibilityText}>
                Public bets are visible to all ZestBet users
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Invite Friends Section */}
      <View style={styles.inviteFriendsSection}>
        <Pressable 
          style={styles.inviteFriendsHeader}
          onPress={() => setShowFriendSelector(!showFriendSelector)}
        >
          <View style={styles.inviteFriendsTitle}>
            <UserPlus size={20} color={colors.primary} />
            <Text style={styles.inviteFriendsText}>Invite Friends</Text>
          </View>
          <Text style={styles.selectedCount}>
            {selectedFriends.length > 0 ? `${selectedFriends.length} selected` : 'None selected'}
          </Text>
        </Pressable>
        
        {showFriendSelector && (
          <View style={styles.friendsContainer}>
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
      
      <Button
        title="Propose Bet"
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.submitButton}
      />
      
      <Text style={styles.disclaimer}>
        All proposed bets are subject to review before being published.
        Make sure your bet has clear conditions for determining the outcome.
        10% platform fee applies to all bets.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  closeButton: {
    padding: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  selectedCategoryText: {
    color: 'white',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  mediaUploadSection: {
    marginBottom: 16,
  },
  mediaButtons: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaButtonText: {
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  mediaPreviewContainer: {
    marginTop: 16,
  },
  mediaList: {
    paddingVertical: 8,
  },
  mediaItem: {
    marginRight: 12,
    position: 'relative',
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  videoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: colors.primary,
    marginTop: 4,
    fontSize: 12,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaHelperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  visibilityContainer: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
  },
  visibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visibilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  visibilityDescription: {
    marginTop: 8,
  },
  visibilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  inviteFriendsSection: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  inviteFriendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
  },
  inviteFriendsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteFriendsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  selectedCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  friendsContainer: {
    backgroundColor: colors.background,
    padding: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  selectedFriendItem: {
    backgroundColor: `${colors.primary}20`, // 20% opacity
    borderColor: colors.primary,
    borderWidth: 1,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: 24,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});