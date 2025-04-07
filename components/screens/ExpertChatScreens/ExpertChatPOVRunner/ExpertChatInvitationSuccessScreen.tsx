import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import { theme } from '../../../contants/theme';

const ExpertChatInvitationSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {expertId} = route.params as {expertId: string};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Request Sent</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Icon name="checkmark-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.successTitle}>Chat Request Sent!</Text>
        <Text style={styles.successText}>
          Your request to chat with the expert has been sent successfully.
          You'll be notified when the expert accepts your request.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigation.navigate('HomeTabs', { screen: 'Chat', params: { screen: 'HomeMain' } });
          }}>
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExpertChatInvitationSuccessScreen;
