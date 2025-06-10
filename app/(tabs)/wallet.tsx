import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { CreditCard, Check } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { useImpactStore } from '@/store/impactStore';
import ZestCurrency from '@/components/ZestCurrency';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { DAILY_BET_LIMIT, ZEST_EXCHANGE_RATE } from '@/constants/app';

export default function WalletScreen() {
  const router = useRouter();
  const { user, addTestZest, getRemainingDailyLimit, updateZestBalance } = useUserStore();
  const { weeklyFeaturedProject } = useImpactStore();
  const [isAddingZest, setIsAddingZest] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [remainingLimit, setRemainingLimit] = useState(getRemainingDailyLimit());
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('creditCard');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  
  const handleAddTestZest = async () => {
    if (remainingLimit <= 0) {
      Alert.alert(
        "Daily Limit Reached", 
        "You've reached your daily free Zest limit. Purchase more Zest to continue betting!"
      );
      return;
    }
    
    setIsAddingZest(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Only add the remaining limit amount or 100, whichever is smaller
    const amountToAdd = Math.min(remainingLimit, 100);
    addTestZest(amountToAdd);
    
    // Update the displayed remaining limit
    setRemainingLimit(getRemainingDailyLimit());
    setIsAddingZest(false);
    
    Alert.alert(
      "Free Zest Added", 
      `${amountToAdd} Zest added to your wallet. You can get ${getRemainingDailyLimit()} more free Zest today.`
    );
  };
  
  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setShowPaymentOptions(true);
  };
  
  const handleSelectPaymentMethod = (method: string) => {
    setSelectedPaymentMethod(method);
  };
  
  const handlePurchaseZest = async () => {
    if (!selectedAmount) return;
    
    setIsPurchasing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would integrate with the selected payment method
    updateZestBalance(selectedAmount);
    
    setIsPurchasing(false);
    setShowPaymentOptions(false);
    setSelectedAmount(null);
    
    Alert.alert(
      "Purchase Successful", 
      `${selectedAmount} Zest has been added to your wallet!`
    );
  };
  
  const handleCancelPurchase = () => {
    setShowPaymentOptions(false);
    setSelectedAmount(null);
  };
  
  // Mock transaction history
  const transactions = [
    { id: '1', type: 'bet', amount: -50, description: 'Bet on Bitcoin price', date: new Date(2023, 10, 15) },
    { id: '2', type: 'win', amount: 120, description: 'Won bet on Lakers game', date: new Date(2023, 10, 14) },
    { id: '3', type: 'test', amount: 100, description: 'Added free Zest', date: new Date(2023, 10, 13) },
    { id: '4', type: 'purchase', amount: 500, description: 'Purchased Zest', date: new Date(2023, 10, 12) },
    { id: '5', type: 'win', amount: 75, description: 'Won bet on Taylor Swift album', date: new Date(2023, 10, 11) },
  ];
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Purchase options
  const purchaseOptions = [
    { amount: 100, price: 1 },
    { amount: 500, price: 5 },
    { amount: 1000, price: 10 },
    { amount: 5000, price: 45 }, // 10% discount
    { amount: 10000, price: 85 }, // 15% discount
  ];
  
  // Payment methods
  const paymentMethods = [
    { id: 'creditCard', name: 'Credit Card' },
    { id: 'paypal', name: 'PayPal' },
    { id: 'klarna', name: 'Klarna' },
    { id: 'apple', name: 'Apple Pay' }
  ];
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <View style={styles.balanceAmount}>
          <Text style={styles.currencySymbol}>Ƶ</Text>
          <Text style={styles.balance}>{user?.zestBalance.toLocaleString()}</Text>
        </View>
        
        <View style={styles.actions}>
          <Button
            title={`Get Free Zest (${remainingLimit} left)`}
            onPress={handleAddTestZest}
            loading={isAddingZest}
            style={styles.actionButton}
            disabled={remainingLimit <= 0}
          />
        </View>
      </View>
      
      <View style={styles.limitCard}>
        <Text style={styles.limitTitle}>Daily Free Zest Limit</Text>
        <View style={styles.limitInfo}>
          <View style={styles.limitProgress}>
            <View 
              style={[
                styles.limitProgressBar, 
                { width: `${(remainingLimit / DAILY_BET_LIMIT) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.limitText}>
            <ZestCurrency amount={remainingLimit} size="small" /> remaining today
          </Text>
        </View>
        <Text style={styles.limitDescription}>
          You can get up to Ƶ{DAILY_BET_LIMIT} free Zest per day. Need more? Purchase below!
        </Text>
      </View>
      
      {showPaymentOptions ? (
        <View style={styles.paymentSection}>
          <View style={styles.paymentHeader}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            <Text style={styles.purchaseAmountText}>
              <ZestCurrency amount={selectedAmount || 0} size="medium" /> for {(selectedAmount || 0) / ZEST_EXCHANGE_RATE}€
            </Text>
          </View>
          
          <View style={styles.paymentMethods}>
            {paymentMethods.map(method => (
              <Pressable 
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === method.id && styles.selectedPaymentMethod
                ]}
                onPress={() => handleSelectPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodContent}>
                  <View style={styles.paymentMethodIcon}>
                    <CreditCard size={24} color={colors.text} />
                  </View>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                </View>
                {selectedPaymentMethod === method.id && (
                  <View style={styles.checkIcon}>
                    <Check size={16} color="white" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
          
          <View style={styles.paymentActions}>
            <Button
              title="Cancel"
              onPress={handleCancelPurchase}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Complete Purchase"
              onPress={handlePurchaseZest}
              loading={isPurchasing}
              style={styles.completeButton}
            />
          </View>
          
          <View style={styles.securePaymentInfo}>
            <CreditCard size={16} color={colors.textSecondary} />
            <Text style={styles.securePaymentText}>
              Secure payment processing. Your payment details are encrypted.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.purchaseSection}>
          <Text style={styles.sectionTitle}>Purchase Zest</Text>
          <Text style={styles.purchaseDescription}>
            Need more Zest? Purchase now to continue betting! 1€ = {ZEST_EXCHANGE_RATE} Zest
          </Text>
          
          <View style={styles.purchaseOptions}>
            {purchaseOptions.map((option, index) => (
              <Pressable 
                key={index}
                style={styles.purchaseOption}
                onPress={() => handleSelectAmount(option.amount)}
                disabled={isPurchasing}
              >
                <View style={styles.purchaseAmountContainer}>
                  <Text style={styles.purchaseAmountText}>
                    <ZestCurrency amount={option.amount} size="medium" />
                  </Text>
                  {(option.amount >= 5000) && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {option.amount === 5000 ? '10% OFF' : '15% OFF'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.purchasePrice}>
                  <Text style={styles.purchasePriceText}>{option.price}€</Text>
                </View>
                <Button
                  title="Buy"
                  onPress={() => handleSelectAmount(option.amount)}
                  variant="primary"
                  size="small"
                  style={styles.buyButton}
                />
              </Pressable>
            ))}
          </View>
          
          <View style={styles.acceptedPayments}>
            <Text style={styles.acceptedPaymentsTitle}>We Accept</Text>
            <View style={styles.paymentLogos}>
              <View style={styles.paymentLogo}>
                <CreditCard size={24} color={colors.textSecondary} />
                <Text style={styles.paymentLogoText}>Credit Card</Text>
              </View>
              <View style={styles.paymentLogo}>
                <Text style={styles.paymentLogoTextBold}>Pay</Text>
                <Text style={styles.paymentLogoText}>Pal</Text>
              </View>
              <View style={styles.paymentLogo}>
                <Text style={styles.paymentLogoTextBold}>Klarna</Text>
              </View>
              <View style={styles.paymentLogo}>
                <Text style={styles.paymentLogoTextBold}>Apple Pay</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {weeklyFeaturedProject && (
        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>Weekly Charity Project</Text>
          <Text style={styles.projectName}>{weeklyFeaturedProject.name}</Text>
          <Text style={styles.impactDescription}>
            Check out this week's featured charity project in the Impact tab.
          </Text>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {transactions.map(transaction => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
            </View>
            
            <Text style={[
              styles.transactionAmount,
              transaction.amount > 0 ? styles.positiveAmount : styles.negativeAmount
            ]}>
              {transaction.amount > 0 ? '+' : ''}<ZestCurrency amount={Math.abs(transaction.amount)} size="small" />
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What is Zest?</Text>
        <Text style={styles.infoText}>
          Zest is the in-app currency used for placing bets. You can get Ƶ{DAILY_BET_LIMIT} free Zest daily or purchase more.
          You can also earn Zest by winning bets, completing missions, or inviting friends. 10% of all bets goes to platform fees.
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
    padding: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 4,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
  },
  limitCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  limitInfo: {
    marginBottom: 8,
  },
  limitProgress: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  limitProgressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  limitText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  limitDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  purchaseSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purchaseAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedPaymentMethod: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  completeButton: {
    flex: 2,
    marginLeft: 8,
  },
  securePaymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  securePaymentText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  purchaseDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  purchaseOptions: {
    gap: 12,
  },
  purchaseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  discountBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  purchasePrice: {
    marginHorizontal: 12,
  },
  purchasePriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  buyButton: {
    minWidth: 80,
  },
  acceptedPayments: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  acceptedPaymentsTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  paymentLogos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    minWidth: 70,
    justifyContent: 'center',
  },
  paymentLogoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentLogoTextBold: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  impactCard: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  impactDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginBottom: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveAmount: {
    color: colors.success,
  },
  negativeAmount: {
    color: colors.error,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});