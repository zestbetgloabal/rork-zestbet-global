import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Switch,
  Pressable,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Users, User, Image as ImageIcon, DollarSign, ChevronRight } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useChallengeStore } from '@/store/challengeStore';
import { useUserStore } from '@/store/userStore';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { Challenge, ChallengePool } from '@/types';

export default function CreateChallengeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { createChallenge, isLoading } = useChallengeStore();
  
  // Basic challenge info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('fitness');
  const [image, setImage] = useState<string | undefined>(undefined);
  
  // Challenge type
  const [isTeamChallenge, setIsTeamChallenge] = useState(false);
  
  // Dates
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from now
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // Visibility
  const [isPrivate, setIsPrivate] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  
  // Pool settings
  const [hasPool, setHasPool] = useState(false);
  const [minContribution, setMinContribution] = useState('10');
  const [maxContribution, setMaxContribution] = useState('1000');
  const [customDistribution, setCustomDistribution] = useState(false);
  const [firstPlacePercentage, setFirstPlacePercentage] = useState('50');
  const [secondPlacePercentage, setSecondPlacePercentage] = useState('20');
  const [thirdPlacePercentage, setThirdPlacePercentage] = useState('10');
  const [participationPercentage, setParticipationPercentage] = useState('10');
  const [platformPercentage, setPlatformPercentage] = useState('10');
  
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      
      // If end date is before start date, update it
      if (endDate < selectedDate) {
        setEndDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)); // 1 day after start date
      }
    }
  };
  
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      // Ensure end date is after start date
      if (selectedDate > startDate) {
        setEndDate(selectedDate);
      } else {
        Alert.alert('Invalid Date', 'End date must be after start date');
      }
    }
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };
  
  const handleInviteFriends = () => {
    // In a real app, this would navigate to a friend selection screen
    // For now, we'll just show an alert
    Alert.alert(
      'Invite Friends',
      'This would open a friend selection screen in a real app.',
      [{ text: 'OK' }]
    );
  };
  
  const handleCreateChallenge = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your challenge');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description for your challenge');
      return;
    }
    
    // Validate pool settings if pool is enabled
    if (hasPool) {
      const min = parseInt(minContribution);
      const max = parseInt(maxContribution);
      
      if (isNaN(min) || min <= 0) {
        Alert.alert('Error', 'Minimum contribution must be a positive number');
        return;
      }
      
      if (isNaN(max) || max <= 0) {
        Alert.alert('Error', 'Maximum contribution must be a positive number');
        return;
      }
      
      if (min > max) {
        Alert.alert('Error', 'Minimum contribution cannot be greater than maximum contribution');
        return;
      }
      
      // Validate custom distribution if enabled
      if (customDistribution) {
        const first = parseInt(firstPlacePercentage);
        const second = parseInt(secondPlacePercentage);
        const third = parseInt(thirdPlacePercentage);
        const participation = parseInt(participationPercentage);
        const platform = parseInt(platformPercentage);
        
        if (
          isNaN(first) || isNaN(second) || isNaN(third) || 
          isNaN(participation) || isNaN(platform)
        ) {
          Alert.alert('Error', 'All percentages must be valid numbers');
          return;
        }
        
        const total = first + second + third + participation + platform;
        
        if (total !== 100) {
          Alert.alert('Error', `Total percentage must be 100%. Current total: ${total}%`);
          return;
        }
      }
    }
    
    try {
      const challengeId = `challenge-${Date.now()}`; // Generate a temporary ID
      const poolId = `pool-${Date.now()}`; // Generate a temporary ID for pool
      
      const challengeData: Partial<Challenge> = {
        title,
        description,
        category,
        image,
        creator: user?.id || 'unknown',
        startDate,
        endDate,
        status: (new Date() >= startDate ? 'active' : 'upcoming') as 'active' | 'upcoming' | 'completed',
        type: isTeamChallenge ? 'team' : 'individual',
        visibility: isPrivate ? 'private' : 'public',
        invitedFriends: isPrivate ? invitedFriends : undefined,
        hasPool,
        pool: hasPool ? {
          id: poolId,
          challengeId: challengeId,
          minContribution: parseInt(minContribution),
          maxContribution: parseInt(maxContribution),
          distributionStrategy: customDistribution ? 'custom' as const : 'standard' as const,
          customDistribution: customDistribution ? {
            firstPlace: parseInt(firstPlacePercentage),
            secondPlace: parseInt(secondPlacePercentage),
            thirdPlace: parseInt(thirdPlacePercentage),
            participation: parseInt(participationPercentage),
            platform: parseInt(platformPercentage)
          } : undefined,
          totalAmount: 0,
          contributions: [],
          isDistributed: false
        } as ChallengePool : undefined
      };
      
      const newChallengeId = await createChallenge(challengeData);
      
      if (newChallengeId) {
        Alert.alert(
          'Success',
          'Challenge created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace(`/challenge/${newChallengeId}`)
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to create challenge. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error(error);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create a Challenge</Text>
      
      {/* Basic Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter challenge title"
            placeholderTextColor={colors.textSecondary}
            maxLength={50}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your challenge"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {['fitness', 'creativity', 'learning', 'social', 'other'].map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.selectedCategoryButton
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  category === cat && styles.selectedCategoryButtonText
                ]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cover Image</Text>
          <Pressable style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <ImageIcon size={24} color={colors.textSecondary} />
                <Text style={styles.imagePickerText}>Tap to select an image</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
      
      {/* Challenge Type Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenge Type</Text>
        
        <View style={styles.switchContainer}>
          <View style={styles.switchLabel}>
            <User size={20} color={colors.text} />
            <Text style={styles.switchText}>Individual Challenge</Text>
          </View>
          <Switch
            value={isTeamChallenge}
            onValueChange={setIsTeamChallenge}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={isTeamChallenge ? colors.primary : colors.card}
          />
          <View style={styles.switchLabel}>
            <Users size={20} color={colors.text} />
            <Text style={styles.switchText}>Team Challenge</Text>
          </View>
        </View>
        
        <Text style={styles.helperText}>
          {isTeamChallenge 
            ? 'Participants will be able to form teams and compete as groups.'
            : 'Participants will compete individually against each other.'}
        </Text>
      </View>
      
      {/* Date Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenge Dates</Text>
        
        <Pressable 
          style={styles.datePickerButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <View style={styles.datePickerLabel}>
            <Calendar size={20} color={colors.text} />
            <Text style={styles.datePickerText}>Start Date</Text>
          </View>
          <Text style={styles.dateText}>
            {startDate.toLocaleDateString()}
          </Text>
          <ChevronRight size={20} color={colors.primary} />
        </Pressable>
        
        <Pressable 
          style={styles.datePickerButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <View style={styles.datePickerLabel}>
            <Clock size={20} color={colors.text} />
            <Text style={styles.datePickerText}>End Date</Text>
          </View>
          <Text style={styles.dateText}>
            {endDate.toLocaleDateString()}
          </Text>
          <ChevronRight size={20} color={colors.primary} />
        </Pressable>
        
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            minimumDate={new Date()}
          />
        )}
        
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)} // 1 day after start date
          />
        )}
      </View>
      
      {/* Visibility Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visibility</Text>
        
        <View style={styles.switchContainer}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchText}>Public</Text>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={isPrivate ? colors.primary : colors.card}
          />
          <View style={styles.switchLabel}>
            <Text style={styles.switchText}>Private</Text>
          </View>
        </View>
        
        <Text style={styles.helperText}>
          {isPrivate 
            ? 'Only invited friends can see and join this challenge.'
            : 'Anyone can see and join this challenge.'}
        </Text>
        
        {isPrivate && (
          <Button
            title="Invite Friends"
            onPress={handleInviteFriends}
            variant="outline"
            size="small"
            style={styles.inviteButton}
          />
        )}
      </View>
      
      {/* Pool Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Zest Token Pool</Text>
          <Switch
            value={hasPool}
            onValueChange={setHasPool}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={hasPool ? colors.primary : colors.card}
          />
        </View>
        
        <Text style={styles.helperText}>
          {hasPool 
            ? 'Participants can contribute Zest tokens to the pool. Tokens will be distributed to winners at the end of the challenge.'
            : 'Enable this to allow participants to contribute Zest tokens to a prize pool.'}
        </Text>
        
        {hasPool && (
          <>
            <View style={styles.poolSettingsContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Minimum Contribution</Text>
                <View style={styles.currencyInputContainer}>
                  <DollarSign size={16} color={colors.textSecondary} />
                  <TextInput
                    style={styles.currencyInput}
                    value={minContribution}
                    onChangeText={setMinContribution}
                    keyboardType="number-pad"
                    placeholder="10"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Maximum Contribution</Text>
                <View style={styles.currencyInputContainer}>
                  <DollarSign size={16} color={colors.textSecondary} />
                  <TextInput
                    style={styles.currencyInput}
                    value={maxContribution}
                    onChangeText={setMaxContribution}
                    keyboardType="number-pad"
                    placeholder="1000"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.distributionContainer}>
              <View style={styles.distributionHeader}>
                <Text style={styles.distributionTitle}>Distribution Strategy</Text>
                <Switch
                  value={customDistribution}
                  onValueChange={setCustomDistribution}
                  trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                  thumbColor={customDistribution ? colors.primary : colors.card}
                />
              </View>
              
              <Text style={styles.helperText}>
                {customDistribution 
                  ? 'Customize how the pool will be distributed.'
                  : 'Standard distribution: 50% to 1st place, 20% to 2nd place, 10% to 3rd place, 10% to all participants, 10% platform fee.'}
              </Text>
              
              {customDistribution && (
                <View style={styles.percentageContainer}>
                  <View style={styles.percentageRow}>
                    <Text style={styles.percentageLabel}>1st Place</Text>
                    <View style={styles.percentageInputContainer}>
                      <TextInput
                        style={styles.percentageInput}
                        value={firstPlacePercentage}
                        onChangeText={setFirstPlacePercentage}
                        keyboardType="number-pad"
                        maxLength={3}
                      />
                      <Text style={styles.percentageSymbol}>%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.percentageRow}>
                    <Text style={styles.percentageLabel}>2nd Place</Text>
                    <View style={styles.percentageInputContainer}>
                      <TextInput
                        style={styles.percentageInput}
                        value={secondPlacePercentage}
                        onChangeText={setSecondPlacePercentage}
                        keyboardType="number-pad"
                        maxLength={3}
                      />
                      <Text style={styles.percentageSymbol}>%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.percentageRow}>
                    <Text style={styles.percentageLabel}>3rd Place</Text>
                    <View style={styles.percentageInputContainer}>
                      <TextInput
                        style={styles.percentageInput}
                        value={thirdPlacePercentage}
                        onChangeText={setThirdPlacePercentage}
                        keyboardType="number-pad"
                        maxLength={3}
                      />
                      <Text style={styles.percentageSymbol}>%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.percentageRow}>
                    <Text style={styles.percentageLabel}>Participation</Text>
                    <View style={styles.percentageInputContainer}>
                      <TextInput
                        style={styles.percentageInput}
                        value={participationPercentage}
                        onChangeText={setParticipationPercentage}
                        keyboardType="number-pad"
                        maxLength={3}
                      />
                      <Text style={styles.percentageSymbol}>%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.percentageRow}>
                    <Text style={styles.percentageLabel}>Platform Fee</Text>
                    <View style={styles.percentageInputContainer}>
                      <TextInput
                        style={styles.percentageInput}
                        value={platformPercentage}
                        onChangeText={setPlatformPercentage}
                        keyboardType="number-pad"
                        maxLength={3}
                      />
                      <Text style={styles.percentageSymbol}>%</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.totalPercentage}>
                    Total: {
                      parseInt(firstPlacePercentage || '0') +
                      parseInt(secondPlacePercentage || '0') +
                      parseInt(thirdPlacePercentage || '0') +
                      parseInt(participationPercentage || '0') +
                      parseInt(platformPercentage || '0')
                    }%
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
      
      {/* Create Button */}
      <Button
        title={isLoading ? 'Creating...' : 'Create Challenge'}
        onPress={handleCreateChallenge}
        variant="primary"
        size="large"
        style={styles.createButton}
        disabled={isLoading}
        icon={isLoading ? <ActivityIndicator size="small" color="white" /> : undefined}
      />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  selectedCategoryButton: {
    backgroundColor: `${colors.primary}10`,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedCategoryButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  imagePicker: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  dateText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  inviteButton: {
    alignSelf: 'flex-start',
  },
  poolSettingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  distributionContainer: {
    marginTop: 8,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  percentageContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  percentageLabel: {
    fontSize: 16,
    color: colors.text,
  },
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    width: 80,
  },
  percentageInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  percentageSymbol: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  totalPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'right',
    marginTop: 8,
  },
  createButton: {
    marginTop: 16,
  },
});