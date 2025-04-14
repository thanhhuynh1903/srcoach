import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import {createSession, getUserInfo} from '../../../utils/useChatsAPI';
import {theme} from '../../../contants/theme';
import Toast from 'react-native-toast-message';

const ChatsUserInviExpertScreen = () => {
  const {goBack} = useNavigation();
  const {userId} = useRoute().params;
  const [userInfo, setUserInfo] = useState(null);
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
          text2: 'Failed to load expert',
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
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expert Invitation</Text>
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
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expert Invitation</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={40} color="#D4AF37" />
          <Text style={styles.errorText}>Failed to load expert profile</Text>
        </View>
      </SafeAreaView>
    );

  const isExpert = userInfo.roles.includes('expert');
  const isRunner = userInfo.roles.includes('runner');
  const expertBadges = userInfo.expert_badges || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expert Invitation</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#FFD700', '#D4AF37']}
            style={styles.avatarGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${userInfo.name}&background=random`,
              }}
              style={styles.avatarImage}
            />
            <View style={styles.avatarBadge}>
              <Icon name="ribbon" size={14} color="white" />
            </View>
          </LinearGradient>

          <View style={{alignItems: 'center', marginBottom: 15}}>
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userHandle}>@{userInfo.username}</Text>
          </View>

          <View style={styles.badgeContainer}>
            {isExpert && (
              <LinearGradient
                colors={['#FFD700', '#D4AF37']}
                style={styles.expertBadge}>
                <Icon name="trophy" size={18} color="white" />
                <Text style={styles.badgeText}>Certified Expert</Text>
              </LinearGradient>
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
                    <Icon name="ribbon" size={14} color="#D4AF37" />
                    <Text style={styles.badgeItemText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="trophy" size={20} color="#D4AF37" />
              <Text style={styles.statText}>{userInfo.points} Points</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color="#D4AF37" />
              <Text style={styles.statText}>
                {userInfo.user_level.charAt(0).toUpperCase() +
                  userInfo.user_level.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Expert Consultation</Text>
          <Text style={styles.infoDescription}>
            You're about to start a consultation session with a certified
            expert. This privileged access allows you to:
          </Text>
          <View style={styles.benefitItem}>
            <Icon
              name="checkmark-circle"
              size={18}
              color="#D4AF37"
              style={{marginTop: 2}}
            />
            <Text style={styles.benefitText}>
              Get professional advice on training techniques and strategies
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon
              name="checkmark-circle"
              size={18}
              color="#D4AF37"
              style={{marginTop: 2}}
            />
            <Text style={styles.benefitText}>
              Receive personalized recommendations for your running goals
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon
              name="checkmark-circle"
              size={18}
              color="#D4AF37"
              style={{marginTop: 2}}
            />
            <Text style={styles.benefitText}>
              Learn about injury prevention and recovery techniques
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon
              name="checkmark-circle"
              size={18}
              color="#D4AF37"
              style={{marginTop: 2}}
            />
            <Text style={styles.benefitText}>
              Discuss equipment and nutrition for optimal performance
            </Text>
          </View>
          <Text style={styles.disclaimerText}>
            By proceeding, you acknowledge that this is a professional
            consultation and agree to our Terms of Service.
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
              <Text style={styles.buttonText}>Start Expert Consultation</Text>
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
    backgroundColor: '#FFF9E6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    height: 60,
    backgroundColor: theme.colors.primaryDark,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  backButton: {
    marginRight: 15,
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
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  avatarGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  avatarImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D4AF37',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
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
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginHorizontal: 5,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  runnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginHorizontal: 5,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
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
    color: '#D4AF37',
    marginBottom: 10,
    textAlign: 'center',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 5,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  badgeItemText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
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
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
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
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
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
    backgroundColor: theme.colors.primaryDark,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
});

export default ChatsUserInviExpertScreen;
