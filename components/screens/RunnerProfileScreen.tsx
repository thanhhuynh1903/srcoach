import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import {usePostStore} from '../utils/usePostStore';
import {useLoginStore} from '../utils/useLoginStore';
import {useNavigation} from '@react-navigation/native';

const RunnerProfileScreen = () => {
  const {myPosts, getMyPosts, isLoading} = usePostStore();
  const {profile} = useLoginStore();
  const navigate = useNavigation();
  useEffect(() => {
    getMyPosts();
  }, [getMyPosts]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        // Nếu đang tải dữ liệu thì hiển thị loading
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image
              source={{uri: 'https://randomuser.me/api/portraits/women/32.jpg'}}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{profile?.name}</Text>
            <Text style={styles.profileBio}>
              Fitness enthusiast | Marathon runner | Helping others achieve
              their fitness goals
            </Text>
            <View style={styles.locationContainer}>
              <Icon name="location-outline" size={16} color="#64748B" />
              <Text style={styles.locationText}>San Francisco, CA</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1.2K</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>45.6K</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>328</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>

          {/* Achievements Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsContainer}>
              <View style={styles.achievementItem}>
                <View style={styles.achievementIconContainer}>
                  <Icon name="medal" size={24} color="#0F2B5B" />
                </View>
                <Text style={styles.achievementTitle}>Marathon Master</Text>
                <Text style={styles.achievementDescription}>
                  Completed 10 marathons
                </Text>
              </View>

              <View style={styles.achievementItem}>
                <View style={styles.achievementIconContainer}>
                  <Icon name="trophy" size={24} color="#0F2B5B" />
                </View>
                <Text style={styles.achievementTitle}>Top Contributor</Text>
                <Text style={styles.achievementDescription}>
                  1000+ helpful posts
                </Text>
              </View>

              <View style={styles.achievementItem}>
                <View style={styles.achievementIconContainer}>
                  <Icon name="people" size={24} color="#0F2B5B" />
                </View>
                <Text style={styles.achievementTitle}>Community Leader</Text>
                <Text style={styles.achievementDescription}>
                  Most active expert
                </Text>
              </View>
            </View>
          </View>

          {/* Posts Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>My Posts</Text>

            {myPosts && myPosts.length > 0 ? (
              myPosts.map(post => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.postCard}
                  onPress={() =>
                    navigate.navigate('CommunityPostDetailScreen', {
                      id: post.id,
                    })
                  }>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postContent}>{post.content}</Text>

                  <View style={styles.runStatsContainer}>
                    <View style={styles.runStatItem}>
                      <Icon name="walk" size={16} color="#64748B" />
                      <Text style={styles.runStatText}>10.2km</Text>
                    </View>
                    <Text style={styles.runStatDot}>•</Text>
                    <View style={styles.runStatItem}>
                      <Icon name="time" size={16} color="#64748B" />
                      <Text style={styles.runStatText}>48:23</Text>
                    </View>
                    <Text style={styles.runStatDot}>•</Text>
                    <View style={styles.runStatItem}>
                      <Icon name="speedometer" size={16} color="#64748B" />
                      <Text style={styles.runStatText}>4'45"/km</Text>
                    </View>
                  </View>

                  {post.images && post.images.length > 0 && (
                    <Image
                      source={{uri: post.images[0]}}
                      style={styles.postImage}
                    />
                  )}

                  {/* Engagement */}
                  <View style={styles.postEngagement}>
                    <View style={styles.engagementItem}>
                      <Icon name="arrow-up" size={20} color="#0F2B5B" />
                      <Text style={styles.engagementText}>
                        {post.upvote_count || 0}
                      </Text>
                    </View>
                    <View style={styles.engagementItem}>
                      <Icon name="arrow-down" size={20} color="#64748B" />
                      <Text style={styles.engagementText}>
                        {post.downvote_count || 0}
                      </Text>
                    </View>
                    <View style={styles.engagementItemRight}>
                      <Icon
                        name="chatbubble-outline"
                        size={20}
                        color="#64748B"
                      />
                      <Text style={styles.engagementText}>
                        {post.comment_count || 0}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{color: '#64748B'}}>No posts yet.</Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RunnerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#F1F5F9',
    alignSelf: 'center',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    padding: 16,
    paddingBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  postEngagement: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  engagementItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  engagementText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  achievementItem: {
    alignItems: 'center',
    width: '30%',
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  runStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  runStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runStatText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  runStatDot: {
    fontSize: 14,
    color: '#64748B',
    marginHorizontal: 8,
  },
});
