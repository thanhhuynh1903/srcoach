import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import { createSession, getUserInfo } from '../../../utils/useChatsAPI';
import { theme } from '../../../contants/theme';
import Toast from 'react-native-toast-message';

interface UserInfo {
  name: string;
  username: string;
  roles: string[];
  points: number;
  user_level: string;
}

const ChatsUserInviRunnerScreen = () => {
  const { goBack } = useNavigation();
  const { userId } = useRoute().params as { userId: string };
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserInfo(userId);
        if (res.status) setUserInfo(res.data);
        else Toast.show({ type: 'error', text1: 'Error', text2: res.message });
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load user' });
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
        Toast.show({ type: 'success', text1: 'Success', text2: res.message });
        goBack();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res.message });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create session' });
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1E90FF', '#00BFFF']} style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Runner Invitation</Text>
      </LinearGradient>
      <View style={styles.loadingContainer}>
        {[...Array(3)].map((_, i) => (
          <ContentLoader 
            key={i} 
            speed={1} 
            width="100%" 
            height={100} 
            viewBox="0 0 400 100" 
            backgroundColor="#f3f3f3" 
            foregroundColor="#ecebeb"
          >
            <Circle cx="50" cy="50" r="40" />
            <Rect x="110" y="20" rx="4" ry="4" width="200" height="20" />
            <Rect x="110" y="50" rx="3" ry="3" width="150" height="15" />
            <Rect x="110" y="75" rx="3" ry="3" width="100" height="15" />
          </ContentLoader>
        ))}
      </View>
    </SafeAreaView>
  );

  if (!userInfo) return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1E90FF', '#00BFFF']} style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Runner Invitation</Text>
      </LinearGradient>
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={40} color="#1E90FF" />
        <Text style={styles.errorText}>Failed to load runner profile</Text>
      </View>
    </SafeAreaView>
  );

  const isExpert = userInfo.roles.includes('expert');
  const isRunner = userInfo.roles.includes('runner');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1E90FF', '#00BFFF']} style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Runner Invitation</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#1E90FF', '#00BFFF']}
            style={styles.avatarContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${userInfo.name}&background=random`,
              }}
              style={styles.avatar}
            />
          </LinearGradient>

          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{userInfo.name}</Text>
            <Text style={styles.usernameText}>@{userInfo.username}</Text>
          </View>

          <View style={styles.rolesContainer}>
            {isExpert && (
              <View style={styles.expertBadge}>
                <Icon name="trophy" size={18} color="black" />
                <Text style={styles.expertBadgeText}>Expert</Text>
              </View>
            )}
            {isRunner && (
              <LinearGradient colors={['#1E90FF', '#00BFFF']} style={styles.runnerBadge}>
                <Icon name="walk" size={18} color="white" />
                <Text style={styles.runnerBadgeText}>Runner</Text>
              </LinearGradient>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="trophy" size={20} color="#1E90FF" />
              <Text style={styles.statText}>{userInfo.points} Points</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color="#1E90FF" />
              <Text style={styles.statText}>
                {userInfo.user_level.charAt(0).toUpperCase() + userInfo.user_level.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Runner-to-Runner Chat</Text>
          <Text style={styles.infoDescription}>
            You're about to start a chat session with another runner. This special connection allows you to:
          </Text>
          <View style={styles.benefitItem}>
            <Icon name="checkmark-circle" size={18} color="#1E90FF" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Exchange running tips and experiences</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="checkmark-circle" size={18} color="#1E90FF" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Coordinate meetups for group runs</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="checkmark-circle" size={18} color="#1E90FF" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Share your achievements and goals</Text>
          </View>
          <Text style={styles.footerNote}>
            By accepting, you agree to our Terms of Service and Community Guidelines.
          </Text>
        </View>
      </ScrollView>

      <LinearGradient colors={['#1E90FF', '#00BFFF']} style={styles.startButton}>
        <TouchableOpacity
          style={styles.startButtonTouchable}
          onPress={handleCreateSession}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={styles.buttonContent}>
              <Icon name="chatbubbles" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Start Chat Session</Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    height: 60,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    color: '#1E90FF',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(30, 144, 255, 0.3)',
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: 'white',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  usernameText: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  rolesContainer: {
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
  expertBadgeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  runnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  runnerBadgeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    backgroundColor: 'rgba(30, 144, 255, 0.1)',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 144, 255, 0.2)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(30, 144, 255, 0.3)',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E90FF',
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
    backgroundColor: 'rgba(30, 144, 255, 0.05)',
    borderRadius: 10,
    padding: 10,
  },
  benefitIcon: {
    marginTop: 2,
  },
  benefitText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  footerNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  startButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonTouchable: {
    width: '100%',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default ChatsUserInviRunnerScreen;