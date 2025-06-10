import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Alert,
  Pressable
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { X, Send, ThumbsUp } from 'lucide-react-native';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function SuggestionScreen() {
  const router = useRouter();
  const [suggestion, setSuggestion] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const categories = [
    'Feature Request', 
    'Bug Report', 
    'User Experience', 
    'Betting Options', 
    'Charity Projects', 
    'Other'
  ];
  
  const handleSubmit = async () => {
    if (!suggestion.trim()) {
      Alert.alert('Error', 'Please enter your suggestion');
      return;
    }
    
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form after 2 seconds
    setTimeout(() => {
      setSuggestion('');
      setCategory('');
      setSubmitted(false);
    }, 2000);
  };
  
  const handleClose = () => {
    router.back();
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen 
        options={{ 
          title: 'Suggest Improvement',
          headerRight: () => (
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </Pressable>
          ),
        }} 
      />
      
      {submitted ? (
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <ThumbsUp size={40} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successMessage}>
            Your suggestion has been submitted successfully. We appreciate your feedback and will review it soon.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Help Us Improve ZestBet</Text>
          <Text style={styles.subtitle}>
            We value your feedback! Share your ideas, report bugs, or suggest improvements to make ZestBet better for everyone.
          </Text>
          
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
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
          
          <Text style={styles.label}>Your Suggestion</Text>
          <TextInput
            style={styles.textArea}
            value={suggestion}
            onChangeText={setSuggestion}
            placeholder="Describe your suggestion, idea, or the issue you're experiencing..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          
          <View style={styles.submitButtonContainer}>
            <Button
              title="Submit Suggestion"
              onPress={handleSubmit}
              loading={isSubmitting}
              style={styles.submitButton}
            />
            <View style={styles.submitIcon}>
              <Send size={18} color="white" />
            </View>
          </View>
          
          <Text style={styles.disclaimer}>
            Your feedback helps us prioritize improvements and build a better platform for our community.
          </Text>
        </>
      )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
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
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 24,
  },
  submitButtonContainer: {
    position: 'relative',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitIcon: {
    position: 'absolute',
    left: 24,
    top: '50%',
    marginTop: -9,
  },
  disclaimer: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 24,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.success}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});