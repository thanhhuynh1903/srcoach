import React, {useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../../BackButton';
import {usePostStore} from '../../utils/usePostStore';
import {useRoute} from '@react-navigation/native';
const CommunityPostDetailScreen = () => {
  const {getDetail, currentPost, isLoading, error} = usePostStore();
  const id = useRoute().params?.id;
  useEffect(() => {
    if (id) {
      getDetail(id);
    } else {
      console.error('No post ID provided');
    }
  }, [id]);

  const formatTimeAgo = dateString => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity>
          <BackButton size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User info section */}
        <View style={styles.userInfoContainer}>
          <View style={styles.userInfo}>
            <Image
              source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}}
              style={styles.avatar}
            />
            <View style={styles.userTextInfo}>
              <Text style={styles.userName}>{currentPost?.User?.username}</Text>
              <View style={styles.postMetaInfo}>
                <Text style={styles.postTime}>
                  {formatTimeAgo(currentPost?.created_at)}
                </Text>
                <Text style={styles.postTime}> • </Text>
                <Icon name="location-outline" size={14} color="#666" />
                <Text style={styles.postTime}>Central Park</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Icon name="ellipsis-horizontal" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Post content */}
        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{currentPost?.title}</Text>
          <Text style={styles.postDescription}>{currentPost?.content}.</Text>

          {/* Run photo */}

          <Image
            source={{uri: currentPost?.images[0].url}}
            style={styles.runPhoto}
            resizeMode="cover"
          />

          {/* Run map */}
          <View style={styles.mapContainer}>
            <View style={styles.mapTitleContainer}>
              <Icon name="trending-up" size={16} color="#4285F4" />
              <Text style={styles.mapTitle}>Morning Route</Text>
            </View>
            <Image
              source={{
                uri: 'https://maps.googleapis.com/maps/api/staticmap?center=40.7831,-73.9712&zoom=14&size=600x300&maptype=roadmap&path=color:0x4285F4|weight:3|40.7831,-73.9712|40.7735,-73.9675|40.7685,-73.9751&key=YOUR_API_KEY',
              }}
              style={styles.mapImage}
              resizeMode="cover"
            />
          </View>

          {/* Run stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8.2 km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>45:23</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>154 bpm</Text>
              <Text style={styles.statLabel}>Avg Heart Rate</Text>
            </View>
          </View>

          {/* Post engagement */}
          <View style={styles.engagementContainer}>
            <View style={styles.engagementLeft}>
              <TouchableOpacity style={styles.voteButton}>
                <Icon name="arrow-up" size={20} color="#4285F4" />
              </TouchableOpacity>
              <Text style={styles.voteCount}>428</Text>
              <TouchableOpacity style={styles.voteButton}>
                <Icon name="arrow-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.engagementMiddle}>
              <TouchableOpacity style={styles.commentButton}>
                <Icon name="chatbubble-outline" size={20} color="#666" />
                <Text style={styles.commentCount}>234</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.engagementRight}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="bookmark-outline" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="share-social-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Comments section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsSectionTitle}>Comments (234)</Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortButtonText}>Sort by: Best</Text>
              <Icon name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Comment 1 */}
          <View style={styles.commentContainer}>
            <Image
              source={{uri: 'https://randomuser.me/api/portraits/women/32.jpg'}}
              style={styles.commentAvatar}
            />
            <View style={styles.commentContent}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUserName}>Sarah Chen</Text>
                <Text style={styles.commentTime}>1 hour ago</Text>
              </View>
              <Text style={styles.commentText}>
                Amazing pace! I run this route too, but never managed to get
                such a good time. Any tips for improving speed?
              </Text>
              <View style={styles.commentActions}>
                <View style={styles.commentVotes}>
                  <TouchableOpacity>
                    <Icon name="arrow-up" size={16} color="#4285F4" />
                  </TouchableOpacity>
                  <Text style={styles.commentVoteCount}>24</Text>
                  <TouchableOpacity>
                    <Icon name="arrow-down" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <Text style={styles.replyButton}>Reply</Text>
                </TouchableOpacity>
              </View>

              {/* Reply to comment 1 */}
              <View style={styles.replyContainer}>
                <Image
                  source={{
                    uri: 'https://randomuser.me/api/portraits/men/32.jpg',
                  }}
                  style={styles.replyAvatar}
                />
                <View style={styles.replyContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUserName}>Alex Runner</Text>
                    <Text style={styles.commentTime}>45 mins ago</Text>
                  </View>
                  <Text style={styles.commentText}>
                    Thanks Sarah! Consistent interval training has been key for
                    me. Happy to share my training schedule!
                  </Text>
                  <View style={styles.commentActions}>
                    <View style={styles.commentVotes}>
                      <TouchableOpacity>
                        <Icon name="arrow-up" size={16} color="#4285F4" />
                      </TouchableOpacity>
                      <Text style={styles.commentVoteCount}>12</Text>
                      <TouchableOpacity>
                        <Icon name="arrow-down" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity>
                      <Text style={styles.replyButton}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Comment 2 */}
          <View style={styles.commentContainer}>
            <Image
              source={{uri: 'https://randomuser.me/api/portraits/men/44.jpg'}}
              style={styles.commentAvatar}
            />
            <View style={styles.commentContent}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUserName}>Mike Johnson</Text>
                <Text style={styles.commentTime}>2 hours ago</Text>
              </View>
              <Text style={styles.commentText}>
                That heart rate is impressive for the distance. Great job
                maintaining the pace!
              </Text>
              <View style={styles.commentActions}>
                <View style={styles.commentVotes}>
                  <TouchableOpacity>
                    <Icon name="arrow-up" size={16} color="#4285F4" />
                  </TouchableOpacity>
                  <Text style={styles.commentVoteCount}>8</Text>
                  <TouchableOpacity>
                    <Icon name="arrow-down" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <Text style={styles.replyButton}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 8,
    height: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userTextInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  postMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  postTime: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    padding: 8,
  },
  postContent: {
    paddingHorizontal: 16,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  postDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
  },
  runPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  mapContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  mapTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
    color: '#000',
  },
  mapImage: {
    width: '100%',
    height: 180,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  engagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  engagementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
    color: '#000',
  },
  engagementMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    fontSize: 16,
    marginLeft: 6,
    color: '#666',
  },
  engagementRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 16,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  commentTime: {
    fontSize: 13,
    color: '#666',
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#333',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  commentVotes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentVoteCount: {
    fontSize: 14,
    marginHorizontal: 6,
    color: '#666',
  },
  replyButton: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  replyContent: {
    flex: 1,
    marginLeft: 10,
  },
});

export default CommunityPostDetailScreen;
