import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import Toast from 'react-native-toast-message';
import useChatsAPI from '../../utils/useChatsAPI';

type RouteParams = {
  userId: string;
};

const ExpertChatInvitationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = route.params as RouteParams;
  const {createSession} = useChatsAPI();

  console.log('userId', userId);

  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: 'thanh',
    isExpert: false,
    points: 0,
    userLevel: 'Newbie',
  });

  const handleCreateSession = async () => {
    setIsCreatingSession(true);
    try {
      const response = await createSession(userId);
      if (response.status) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Chat request sent successfully!',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to create chat session',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred',
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start Conversation</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Icon name="information-circle" size={24} color="#4A90E2" />
          <Text style={styles.infoText}>
            The other user will need to accept your conversation request before
            you can start chatting.
          </Text>
        </View>

        <View style={styles.userInfoSection}>
          <Text style={styles.sectionTitle}>User Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{userDetails.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>
              {userDetails.isExpert ? 'Expert' : 'Runner'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Points:</Text>
            <Text style={styles.infoValue}>{userDetails.points}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Level:</Text>
            <Text style={styles.infoValue}>{userDetails.userLevel}</Text>
          </View>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.sectionTitle}>Important Notes</Text>
          <View style={styles.termItem}>
            <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.termText}>
              You can only have one pending request with this user at a time
            </Text>
          </View>
          <View style={styles.termItem}>
            <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.termText}>
              The request will expire if not accepted within 7 days
            </Text>
          </View>
          <View style={styles.termItem}>
            <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.termText}>
              You'll be notified when the request is accepted
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateSession}
          disabled={isCreatingSession}>
          {isCreatingSession ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Send Chat Request</Text>
          )}
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: '#4A5568',
    lineHeight: 20,
  },
  userInfoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2D3748',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  infoLabel: {
    width: 100,
    color: '#718096',
  },
  infoValue: {
    flex: 1,
    color: '#2D3748',
    fontWeight: '500',
  },
  termsSection: {
    marginBottom: 20,
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  termText: {
    flex: 1,
    marginLeft: 8,
    color: '#4A5568',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  createButton: {
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ExpertChatInvitationScreen;
