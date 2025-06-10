import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  Platform
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Lock, Globe, Check, X, Camera, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useBetStore } from '@/store/betStore';
import { useUserStore } from '@/store/userStore';
import { useImpactStore } from '@/store/impactStore';
import ZestCurrency from '@/components/ZestCurrency';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { Bet } from '@/types';
import { DAILY_BET_LIMIT } from '@/constants/app';

export default function BetDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { bets, placeBet } = useBetStore();
  const { user, updateZestBalance, getRemainingDailyLimit, updateDailyBetAmount } = useUserStore();
  
  const [bet, setBet] = useState<Bet | null>(null);
  const [amount, setAmount] = useState('10');
  const [prediction, setPrediction] = useState('');
  const [selectedOption, setSelectedOption] = useState<'yes' | 'no' | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [showCustomPrediction, setShowCustomPrediction] = useState(false);
  const [betImage, setBetImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Calculate fees
  const betAmount = parseInt(amount) || 0;
  const platformFee = betAmount * 0.1; // 10% platform fee
  const netBetAmount = betAmount - platformFee;
  
  // Get remaining daily limit
  const remainingDailyLimit = getRemainingDailyLimit();
  
  useEffect(() => {
    if (id && bets.length > 0) {
      const foundBet = bets.find(b => b.id === id);
      if (foundBet) {
        setBet(foundBet);
      }
    }
  }, [id, bets]);

  // Update prediction when yes/no option is selected
  useEffect(() => {
    if (selectedOption === 'yes') {
      setPrediction('Yes');
    } else if (selectedOption === 'no') {
      setPrediction('No');
    }
  }, [selectedOption]);
  
  const handlePlaceBet = async () => {
    if (!bet || !user) return;
    
    if (isNaN(betAmount) || betAmount < bet.minBet || betAmount > bet.maxBet) {
      Alert.alert('Invalid Amount', `Please enter an amount between Ƶ${bet.minBet} and Ƶ${bet.maxBet}`);
      return;
    }
    
    if (!prediction.trim()) {
      Alert.alert('Missing Prediction', 'Please select Yes/No or enter your prediction');
      return;
    }
    
    if (user.zestBalance < betAmount) {
      Alert.alert(
        'Insufficient Balance', 
        'You don\'t have enough Zest to place this bet. Purchase more Zest in the Wallet tab!'
      );
      return;
    }
    
    // Check daily limit
    if (betAmount > remainingDailyLimit) {
      Alert.alert(
        'Daily Limit Exceeded', 
        `You can only bet Ƶ${remainingDailyLimit} more today. The daily limit is Ƶ${DAILY_BET_LIMIT}.`
      );
      return;
    }
    
    setIsPlacing(true);
    
    const success = await placeBet({
      betId: bet.id,
      amount: betAmount,
      prediction,
      platformFee,
      betImage: betImage || undefined
    });
    
    if (success) {
      // Update user's balance
      updateZestBalance(-betAmount);
      
      // Update daily bet amount
      updateDailyBetAmount(betAmount);
      
      Alert.alert('Bet Placed', 'Your bet has been placed successfully!');
      router.back();
    } else {
      Alert.alert('Error', 'Failed to place bet. Please try again.');
    }
    
    setIsPlacing(false);
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSelectOption = (option: 'yes' | 'no') => {
    setSelectedOption(option);
    setShowCustomPrediction(false);
  };

  const handleCustomPrediction = () => {
    setSelectedOption(null);
    setShowCustomPrediction(true);
    setPrediction('');
  };
  
  const handlePickImage = async () => {
    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
          return;
        }
      }
      
      setIsUploadingImage(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // In a real app, this would upload the image to a server
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBetImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  const handleRemoveImage = () => {
    setBetImage(null);
  };
  
  if (!bet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Determine if this bet has a clear yes/no outcome
  const isBinaryOutcomeBet = bet.title.toLowerCase().includes('will') || 
                            bet.description.toLowerCase().includes('will') ||
                            bet.description.toLowerCase().includes('yes or no');
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen 
        options={{ 
          title: bet.title,
          headerBackTitle: 'Bets'
        }} 
      />
      
      {bet.image && (
        <Image 
          source={{ uri: bet.image }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.header}>
        <View style={styles.categoryRow}>
          <Text style={styles.category}>{bet.category.toUpperCase()}</Text>
          <View style={styles.visibilityBadge}>
            {bet.visibility === 'private' ? (
              <>
                <Lock size={14} color={colors.textSecondary} />
                <Text style={styles.visibilityText}>Private Bet</Text>
              </>
            ) : (
              <>
                <Globe size={14} color={colors.textSecondary} />
                <Text style={styles.visibilityText}>Public Bet</Text>
              </>
            )}
          </View>
        </View>
        <Text style={styles.title}>{bet.title}</Text>
        <Text style={styles.creator}>Created by {bet.creator}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{bet.description}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}><ZestCurrency amount={bet.totalPool} size="small" /></Text>
          <Text style={styles.statLabel}>Total Pool</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{bet.participants}</Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDate(bet.endDate)}</Text>
          <Text style={styles.statLabel}>End Date</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Place Your Bet</Text>
        
        <View style={styles.dailyLimitInfo}>
          <Text style={styles.dailyLimitText}>
            Daily Limit Remaining: <ZestCurrency amount={remainingDailyLimit} size="small" />
          </Text>
        </View>
        
        <Text style={styles.inputLabel}>Amount (Ƶ{bet.minBet}-Ƶ{bet.maxBet})</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.amountPrefix}>Ƶ</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            placeholder="10"
          />
        </View>
        
        {betAmount > 0 && (
          <View style={styles.feeBreakdown}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Your Bet</Text>
              <ZestCurrency amount={betAmount} size="small" />
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Platform Fee (10%)</Text>
              <Text style={styles.feeValue}>-<ZestCurrency amount={platformFee} size="small" /></Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.feeRow}>
              <Text style={styles.netLabel}>Net Bet Amount</Text>
              <ZestCurrency amount={netBetAmount} size="small" />
            </View>
          </View>
        )}
        
        <Text style={styles.inputLabel}>Your Prediction</Text>
        
        {isBinaryOutcomeBet && (
          <View style={styles.yesNoContainer}>
            <Pressable 
              style={[
                styles.yesNoButton, 
                styles.yesButton,
                selectedOption === 'yes' && styles.selectedYesButton
              ]}
              onPress={() => handleSelectOption('yes')}
            >
              <Check size={20} color={selectedOption === 'yes' ? 'white' : colors.success} />
              <Text style={[
                styles.yesNoText,
                styles.yesText,
                selectedOption === 'yes' && styles.selectedYesNoText
              ]}>Yes</Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.yesNoButton, 
                styles.noButton,
                selectedOption === 'no' && styles.selectedNoButton
              ]}
              onPress={() => handleSelectOption('no')}
            >
              <X size={20} color={selectedOption === 'no' ? 'white' : colors.error} />
              <Text style={[
                styles.yesNoText,
                styles.noText,
                selectedOption === 'no' && styles.selectedYesNoText
              ]}>No</Text>
            </Pressable>
          </View>
        )}

        {(isBinaryOutcomeBet && !showCustomPrediction) && (
          <Pressable onPress={handleCustomPrediction} style={styles.customPredictionLink}>
            <Text style={styles.customPredictionText}>
              Need a custom prediction? Click here
            </Text>
          </Pressable>
        )}
        
        {(!isBinaryOutcomeBet || showCustomPrediction) && (
          <TextInput
            style={styles.predictionInput}
            value={prediction}
            onChangeText={setPrediction}
            placeholder="Enter your prediction..."
            multiline
          />
        )}
        
        {/* Image Upload Section */}
        <Text style={styles.inputLabel}>Add Image (Optional)</Text>
        
        {betImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: betImage }} style={styles.imagePreview} />
            <Pressable style={styles.removeImageButton} onPress={handleRemoveImage}>
              <X size={16} color="white" />
            </Pressable>
          </View>
        ) : (
          <Pressable 
            style={styles.imageUploadButton} 
            onPress={handlePickImage}
            disabled={isUploadingImage}
          >
            {isUploadingImage ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <ImageIcon size={24} color={colors.primary} />
                <Text style={styles.imageUploadText}>Upload an image for your bet</Text>
              </>
            )}
          </Pressable>
        )}
        
        <Text style={styles.imageHelperText}>
          Adding an image helps document your bet and provides evidence for verification
        </Text>
        
        <Button
          title="Place Bet"
          onPress={handlePlaceBet}
          loading={isPlacing}
          style={styles.placeButton}
        />
        
        <Text style={styles.disclaimer}>
          By placing this bet, you agree to the terms and conditions. 
          10% platform fee applies to all bets.
          Daily betting limit: Ƶ{DAILY_BET_LIMIT}.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
  },
  header: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visibilityText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  creator: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dailyLimitInfo: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dailyLimitText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  amountPrefix: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  feeBreakdown: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  feeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  feeValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  netLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  yesNoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  yesNoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
  },
  yesButton: {
    borderColor: colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  noButton: {
    borderColor: colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  selectedYesButton: {
    backgroundColor: colors.success,
  },
  selectedNoButton: {
    backgroundColor: colors.error,
  },
  yesNoText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  yesText: {
    color: colors.success,
  },
  noText: {
    color: colors.error,
  },
  selectedYesNoText: {
    color: 'white',
  },
  customPredictionLink: {
    alignItems: 'center',
    marginBottom: 16,
  },
  customPredictionText: {
    color: colors.primary,
    fontSize: 14,
  },
  predictionInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  imageUploadButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    marginBottom: 8,
    flexDirection: 'row',
  },
  imageUploadText: {
    color: colors.primary,
    marginLeft: 8,
    fontSize: 14,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHelperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  placeButton: {
    marginTop: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});