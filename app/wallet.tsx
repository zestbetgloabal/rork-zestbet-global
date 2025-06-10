import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  ActivityIndicator 
} from 'react-native';
import { useUserStore } from '@/store/userStore';
import { useImpactStore } from '@/store/impactStore';
import ZestCurrency from '@/components/ZestCurrency';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function WalletScreen() {
  const { user, addTestZest } = useUserStore();
  const { userDonations, weeklyFeaturedProject } = useImpactStore();
  const [isAddingZest, setIsAddingZest] = useState(false);
  
  const handleAddTestZest = async () => {
    setIsAddingZest(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    addTestZest();
    setIsAddingZest(false);
  };
  
  // Mock transaction history
  const transactions = [
    { id: '1', type: 'bet', amount: -50, description: 'Bet on Bitcoin price', date: new Date(2023, 10, 15) },
    { id: '2', type: 'win', amount: 120, description: 'Won bet on Lakers game', date: new Date(2023, 10, 14) },
    { id: '3', type: 'test', amount: 100, description: 'Added test Zest', date: new Date(2023, 10, 13) },
    { id: '4', type: 'bet', amount: -30, description: 'Bet on weather forecast', date: new Date(2023, 10, 12) },
    { id: '5', type: 'win', amount: 75, description: 'Won bet on Taylor Swift album', date: new Date(2023, 10, 11) },
  ];
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
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
            title="Add Test Zest"
            onPress={handleAddTestZest}
            loading={isAddingZest}
            style={styles.actionButton}
          />
        </View>
      </View>
      
      <View style={styles.impactCard}>
        <Text style={styles.impactTitle}>Your Charitable Impact</Text>
        <View style={styles.impactAmount}>
          <ZestCurrency amount={userDonations} size="medium" />
        </View>
        <Text style={styles.impactDescription}>
          20% of our platform revenue goes to our weekly featured charity project.
        </Text>
        {weeklyFeaturedProject && (
          <Text style={styles.featuredProject}>
            Current project: {weeklyFeaturedProject.name}
          </Text>
        )}
      </View>
      
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
          Zest is the in-app currency used for placing bets. You can earn Zest by winning bets, 
          completing missions, or inviting friends. 10% of all bets goes to platform fees, with 20% 
          of that fee dedicated to our weekly featured charity project!
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
  impactCard: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  impactAmount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  impactDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  featuredProject: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
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