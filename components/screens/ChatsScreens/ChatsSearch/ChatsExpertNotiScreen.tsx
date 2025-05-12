import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import BackButton from '../../../BackButton';
import {theme} from '../../../contants/theme';
import { createOrGetSession } from '../../../utils/useChatsAPI';

const ChatsExpertNotiScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = route.params as {userId: string};
  const [message, setMessage] = useState('');
  const maxChars = 2000;

  const handleProceed = () => {
    createOrGetSession(userId, message).then((response) => {
      if (response.status) {
        navigation.navigate('ChatsMessageScreen', {userId});
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: '#FFFFFF'}]}>
        <BackButton size={24} />
        <Text style={styles.headerTitle}>Expert Verification</Text>
        <View style={{width: 24}} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warningContainer}>
          <Ionicons
            name="warning"
            size={48}
            color={theme.colors.warning}
            style={styles.warningIcon}
          />
          <Text style={styles.warningTitle}>
            Warning: You are about to chat with a certified running expert
          </Text>
          
          <Text style={styles.description}>
            This coach is a verified expert specialized in running with legal 
            marathon certificates and licenses. They can provide professional 
            advice on:
          </Text>
          
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
              <Text style={styles.bulletText}>Running techniques and form</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
              <Text style={styles.bulletText}>Marathon training plans</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
              <Text style={styles.bulletText}>Injury prevention</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
              <Text style={styles.bulletText}>Race preparation</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
              <Text style={styles.bulletText}>Create a Running scheduling plan for you</Text>
            </View>
          </View>
          
          <Text style={styles.note}>
            Please note that while our experts are certified, you should always 
            consult with a medical professional for health-related concerns.
          </Text>

          {/* Initial Message Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Initial Message <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.messageInput}
              multiline
              placeholder="Type your initial message to the expert here..."
              placeholderTextColor="#9E9E9E"
              value={message}
              onChangeText={setMessage}
              maxLength={maxChars}
            />
            <Text style={styles.charCounter}>
              {message.length}/{maxChars}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.proceedButton, 
            {backgroundColor: message.length > 0 ? theme.colors.primaryDark : '#CCCCCC'}
          ]}
          onPress={handleProceed}
          disabled={message.length === 0}>
          <Text style={styles.proceedButtonText}>Proceed to Chat</Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By proceeding, you agree to our Privacy Policy and Terms of Service
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  warningContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  warningIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffc043',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: '#424242',
    marginBottom: 16,
    lineHeight: 22,
  },
  bulletList: {
    marginBottom: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 8,
  },
  note: {
    fontSize: 13,
    color: '#757575',
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 20,
  },
  inputContainer: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  requiredStar: {
    color: 'red',
  },
  messageInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#424242',
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  charCounter: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  proceedButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default ChatsExpertNotiScreen;