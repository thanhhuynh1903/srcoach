import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import {createSession, getUserInfo} from '../../../utils/useChatsAPI';
import {theme} from '../../../contants/theme';
import Toast from 'react-native-toast-message';
import { CommonAvatar } from '../../../commons/CommonAvatar';
import BackButton from '../../../BackButton';

interface UserInfo {
  name: string;
  username: string;
  roles: string[];
  points: number;
  user_level: string;
  expert_badges?: string[];
  profile_picture?: string;
}

const ChatsUserInviRunnerScreen = () => {
  const {goBack} = useNavigation();
  const {userId} = useRoute().params as {userId: string};
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserInfo(userId);
        if (res.status) setUserInfo(res.data);
        else Toast.show({type: 'error', text1: 'Error', text2: res.message});
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load runner',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleCreateSession = async () => {
    setCreating(true);
    try {
      const res = await createSession(userId);
      if (res.status) {
        Toast.show({type: 'success', text1: 'Success', text2: res.message});
        goBack();
      } else {
        Toast.show({type: 'error', text1: 'Error', text2: res.message});
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create session',
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading)
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Runner Invitation</Text>
        </View>
        <View style={styles.loadingContainer}>
          {[...Array(3)].map((_, i) => (
            <ContentLoader
              key={i}
              speed={1}
              width="100%"
              height={100}
              viewBox="0 0 400 100"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb">
              <Circle cx="50" cy="50" r="40" />
              <Rect x="110" y="20" rx="4" ry="4" width="200" height="20" />
              <Rect x="110" y="50" rx="3" ry="3" width="150" height="15" />
              <Rect x="110" y="75" rx="3" ry="3" width="100" height="15" />
            </ContentLoader>
          ))}
        </View>
      </SafeAreaView>
    );

  if (!userInfo)
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Runner Invitation</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={40} color="#4CAF50" />
          <Text style={styles.errorText}>Failed to load runner profile</Text>
        </View>
      </SafeAreaView>
    );

  const isExpert = userInfo.roles.includes('expert');
  const isRunner = userInfo.roles.includes('runner');
  const expertBadges = userInfo.expert_badges || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Runner Invitation</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <CommonAvatar
              mode={isRunner ? 'runner' : isExpert ? 'expert' : undefined}
              size={140}
              uri={userInfo.profile_picture}
            />
          </View>

          <View style={{alignItems: 'center', marginBottom: 15}}>
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userHandle}>@{userInfo.username}</Text>
          </View>

          <View style={styles.badgeContainer}>
            {isExpert && (
              <View style={styles.expertBadge}>
                <Icon name="trophy" size={18} color="black" />
                <Text style={[styles.badgeText, {color: 'black'}]}>Expert</Text>
              </View>
            )}
            {isRunner && (
              <View style={styles.runnerBadge}>
                <Icon name="walk" size={18} color="white" />
                <Text style={styles.badgeText}>Runner</Text>
              </View>
            )}
          </View>

          {expertBadges.length > 0 && (
            <View style={{width: '100%', marginBottom: 15}}>
              <Text style={styles.badgesTitle}>Expert Badges</Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}>
                {expertBadges.map((badge, index) => (
                  <View key={index} style={styles.badgeItem}>
                    <Icon name="ribbon" size={14} color="#4CAF50" />
                    <Text style={styles.badgeItemText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="trophy" size={20} color="#4CAF50" />
              <Text style={styles.statText}>{userInfo.points} Points</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color="#4CAF50" />
              <Text style={styles.statText}>
                {userInfo.user_level.charAt(0).toUpperCase() +
                  userInfo.user_level.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Runner Connection</Text>
          <Text style={styles.infoDescription}>
            You're about to start a chat session with another runner. This
            connection allows you to:
          </Text>
          <View style={styles.benefitItem}>
            <Icon
              name="checkmark-circle"
              size={18}
              color="#4CAF50"
              style={{marginTop: 2}}
            />
            <Text style={styles.benefitText}>
              Exchange running tips and experiences
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon
              name="checkmark-circle"
              size={18}
              color="#4CAF50"
              style={{marginTop: 2}}
            />
            <Text style={styles.benefitText}>
              Coordinate meetups for group runs
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon
              name="checkmark-circle"
              size={18}
              color="#4CAF50"
              style={{marginTop: 2}}
            />
            <Text style={styles.benefitText}>
              Share your achievements and goals
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon
              name="checkmark-circle"
              size={18}
              color="#4CAF50"
              style={{marginTop: 2}}
            />
            <Text style={styles.benefitText}>
              Find motivation and running partners
            </Text>
          </View>
          <Text style={styles.disclaimerText}>
            By proceeding, you agree to our Terms of Service and Community
            Guidelines.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.actionButton}>
        <TouchableOpacity
          style={{width: '100%', alignItems: 'center'}}
          onPress={handleCreateSession}
          disabled={creating}>
          {creating ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={styles.buttonContent}>
              <Icon
                name="chatbubbles"
                size={20}
                color="white"
                style={{marginRight: 10}}
              />
              <Text style={styles.buttonText}>Start Chat Session</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    height: 60,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 10,
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  avatarWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  userHandle: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  expertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  runnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  badgeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 5,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  badgeItemText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 10,
    padding: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#888',
    marginTop: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
});

export default ChatsUserInviRunnerScreen;