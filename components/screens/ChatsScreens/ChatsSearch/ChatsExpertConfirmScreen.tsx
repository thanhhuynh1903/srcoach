import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import BackButton from '../../../BackButton';
import {theme} from '../../../contants/theme';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import {getSessionInfo, respondToSession} from '../../../utils/useChatsAPI';
import {capitalizeFirstLetter} from '../../../utils/utils_format';
import {CommonAvatar} from '../../../commons/CommonAvatar';

interface SessionData {
  session: {
    id: string;
    status: string;
    created_at: string;
    accepted_at: string | null;
    is_expert_session: boolean;
    expert_rating_allowed: boolean;
    user1_archived: boolean;
    user2_archived: boolean;
    is_initiator: boolean;
    initial_message: string;
  };
  other_user: {
    id: string;
    name: string;
    username: string;
    email: string;
    image: string | null;
    points: number;
    user_level: string;
    roles: string[];
  };
}

const ChatsExpertConfirmScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = route.params as {userId: string};
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionInfo = async () => {
    try {
      setLoading(true);
      const response = await getSessionInfo(userId);
      if (response.status) {
        setSessionData(response.data);
      } else {
        setError(response.message || 'Failed to load session info');
      }
    } catch (err) {
      setError('An error occurred while fetching session info');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSessionInfo();
    }, [userId]),
  );

  const handleAccept = async () => {
    await respondToSession(userId, true);
    navigation.replace('ChatsMessageScreen', {userId});
    return;
  };

  const handleCancel = async () => {
    await respondToSession(userId, false);
    navigation.goBack();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && !sessionData) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, {backgroundColor: '#FFFFFF'}]}>
          <BackButton size={24} />
          <Text style={styles.headerTitle}>Runner Session Request</Text>
          <View style={{width: 24}} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <ContentLoader
            speed={1.5}
            width="100%"
            height={500}
            viewBox="0 0 400 500"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb">
            <Circle cx="50" cy="50" r="40" />
            <Rect x="100" y="20" rx="4" ry="4" width="200" height="20" />
            <Rect x="100" y="50" rx="4" ry="4" width="150" height="15" />
            <Rect x="20" y="100" rx="4" ry="4" width="360" height="15" />
            <Rect x="20" y="130" rx="4" ry="4" width="300" height="15" />
            <Rect x="20" y="160" rx="4" ry="4" width="360" height="15" />
            <Rect x="20" y="200" rx="4" ry="4" width="360" height="100" />
          </ContentLoader>
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, {backgroundColor: '#FFFFFF'}]}>
          <BackButton size={24} />
          <Text style={styles.headerTitle}>Session Request</Text>
          <View style={{width: 24}} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons
            name="warning-outline"
            size={48}
            color={theme.colors.warning}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchSessionInfo}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: '#FFFFFF'}]}>
        <BackButton size={24} />
        <Text style={styles.headerTitle}>Session Request</Text>
        <View style={{width: 24}} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <CommonAvatar
              size={100}
              uri={sessionData?.other_user?.image?.url}
            />
            <Text style={styles.userName}>{sessionData?.other_user.name}</Text>
            <Text style={styles.username}>
              @{sessionData?.other_user.username}
            </Text>
          </View>
          {/* Roles */}
          <View style={styles.rolesContainer}>
            {sessionData?.other_user.roles.map((role, index) => (
              <View
                key={index}
                style={[
                  styles.roleBadge,
                  role === 'expert'
                    ? {backgroundColor: theme.colors.warningLight}
                    : {backgroundColor: theme.colors.primaryLight},
                ]}>
                <Text
                  style={[
                    styles.roleText,
                    role === 'expert'
                      ? {color: theme.colors.warningDark}
                      : {color: theme.colors.primaryDark},
                  ]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </View>
            ))}
          </View>

          {/* Points and Level */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={20} color={theme.colors.warning} />
              <Text style={styles.statText}>
                {sessionData?.other_user.points} pts
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="medal" size={20} color={theme.colors.warning} />
              <Text style={styles.statText}>
                {capitalizeFirstLetter(sessionData?.other_user?.user_level)}
              </Text>
            </View>
          </View>

          {/* Session Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Session Request</Text>
            <Text style={styles.infoText}>
              Requested on {formatDate(sessionData?.session.created_at)}
            </Text>
            <Text style={styles.infoText}>
              Status: {sessionData?.session.status}
            </Text>
          </View>

          {/* Initial Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.messageTitle}>Initial Message:</Text>
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>
                {sessionData?.session.initial_message}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}>
            <Text style={styles.acceptButtonText}>Accept Request</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerNote}>
          By accepting, you agree to provide professional advice within your
          expertise
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
  profileContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  username: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 3,
  },
  rolesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statText: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 4,
  },
  infoSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  messageBubble: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#db0000',
    marginRight: 10,
  },
  acceptButton: {
    backgroundColor: theme.colors.primaryDark,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatsExpertConfirmScreen;
