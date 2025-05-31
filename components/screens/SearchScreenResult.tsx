'use client';

import {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import {usePostStore} from '../utils/usePostStore';
import {useNavigation} from '@react-navigation/native';
import {useLoginStore} from '../utils/useLoginStore';
import {useFocusEffect} from '@react-navigation/native';
import {theme} from '../contants/theme';
import {CommonAvatar} from '../commons/CommonAvatar';
import { listSessions } from '../utils/useChatsAPI';

type SearchResult = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_upvoted: boolean;
  upvote_count: number;
  exercise_session_record_id?: string;
  comment_count: number;
  images?: string[];
  tags?: string[];
  user?: {
    username: string;
    image: {
      url: string;
    };
  };
  User?: {
    avatar?: string;
  };
};

type User = {
  id: number;
  name: string;
  username: string;
  bio?: string;
  image?: {url: string};
  roles?: string[];
};

type ChatSession = {
  id: string;
  status: string;
  created_at: string;
  is_expert_session: boolean;
  expert_rating_allowed: boolean;
  user_archived: boolean;
  is_initiator: boolean;
  other_user: {
    id: string;
    name: string;
    username: string;
    email: string;
    image: {url: string} | null;
    points: number;
    user_level: string;
    roles: string[];
  };
  last_message: {
    id: string;
    message_type: string;
    created_at: string;
    archived: boolean;
    content: any;
  } | null;
  unread_count: number;
  initial_message?: string;
};

const SearchResultsScreen = () => {
  const [searchQuery, setSearchQuery] = useState(' ');
  const [activeTab, setActiveTab] = useState('All');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const navigation = useNavigation();
  const {
    searchAll,
    searchPost,
    searchResults,
    allSearchResults,
    searchLoading,
    searchError,
    likePost,
  } = usePostStore();
  const {profile} = useLoginStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSessions = async () => {
    try {
      const response = await listSessions(null);
      if (response.status) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSessions();
      if (debouncedQuery) {
        searchAll(debouncedQuery);
        searchPost({title: debouncedQuery});
      }
      return () => {};
    }, [debouncedQuery, searchAll, searchPost]),
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchAll({title: searchQuery});
      searchPost({title: searchQuery});
    }
  };

  const getExpertSessionStatus = (expertId: number) => {
    const session = sessions.find(
      session =>
        session.other_user.id === expertId.toString() &&
        session.is_expert_session,
    );
    return session ? session.status : null;
  };

  const hasPendingExpertSession = sessions.some(
    session => session.is_expert_session && session.status === 'PENDING',
  );

  const getAcceptedExpertSession = () => {
    return sessions.find(
      session => session.is_expert_session && session.status === 'ACCEPTED',
    );
  };

  const handleExpertChatPress = (expert: User) => {
    const sessionStatus = getExpertSessionStatus(expert.id);
    const acceptedSession = getAcceptedExpertSession();

    // If there's a PENDING expert session, all chat buttons are disabled
    if (hasPendingExpertSession) {
      return;
    }

    // If there's an ACCEPTED session, only the corresponding expert's chat is enabled
    if (acceptedSession) {
      if (acceptedSession.other_user.id === expert.id.toString()) {
        navigation.navigate('ChatsMessageScreen', {userId: expert.id});
      }
      return;
    }

    // If no expert session or no accepted session, follow the provided logic
    if (sessionStatus === 'ACCEPTED') {
      navigation.navigate('ChatsMessageScreen', {userId: expert.id});
    } else {
      navigation.navigate('ChatsExpertNotiScreen', {userId: expert.id});
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search-outline" size={40} color="#94A3B8" />
      <Text style={styles.emptyText}>
        {debouncedQuery
          ? 'No matching articles found'
          : 'Enter keywords to search for articles'}
      </Text>
    </View>
  );

  const renderTags = (tags: string[] = []) => {
    if (!tags || tags.length === 0) {
      return null;
    }

    if (tags.length <= 4) {
      return (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tags[0]}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tags[1]}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tags[2]}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>+{tags.length - 3}</Text>
        </View>
      </View>
    );
  };

  const renderPostItem = (post: SearchResult) => (
    <TouchableOpacity
      key={post.id}
      style={styles.postCard}
      onPress={() =>
        navigation.navigate('CommunityPostDetailScreen', {id: post.id})
      }>
      <TouchableOpacity
        style={styles.postHeader}
        onPress={() =>
          post?.user?.id === profile.id
            ? navigation.navigate('RunnerProfileScreen')
            : navigation.navigate('OtherProfileScreen', {postId: post?.id})
        }>
        <CommonAvatar mode={null} uri={post?.user?.image?.url} size={36} />
        <View style={{marginLeft: 8}}>
          <Text style={styles.authorName}>
            {post?.user?.username || 'Người dùng'}
          </Text>
          <Text style={styles.postTime}>
            {new Date(post.created_at).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postExcerpt}>
        {post.content.length > 150
          ? post.content.substring(0, 150) + '...'
          : post.content}
      </Text>
      {post.images && post.images.length > 0 && (
        <View style={styles.postImageContainer}>
          <Image
            source={{uri: post.images[0]}}
            style={styles.postImage}
            resizeMode="cover"
          />
          {post.images.length > 1 && (
            <View style={styles.remainingImagesIndicator}>
              <Icon
                name="images-outline"
                size={14}
                color="#FFFFFF"
                style={styles.imageIcon}
              />
              <Text style={styles.remainingImagesText}>
                +{post.images.length - 1}
              </Text>
            </View>
          )}
        </View>
      )}
      {post.exercise_session_record_id && (
        <View style={styles.runDataIndicator}>
          <View style={styles.runDataIndicatorContent}>
            <Icon name="walk" size={20} color="#FFFFFF" />
            <Text style={styles.runDataText}>Runner record included</Text>
          </View>
          <Icon
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
            style={{marginLeft: 4}}
          />
        </View>
      )}
      <View style={styles.postStats}>
        <View style={styles.postStats}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => handleLikePost(post.id, !post.is_upvoted)}>
            <Icon
              name={post?.is_upvoted ? 'heart' : 'heart-outline'}
              size={18}
              color={post?.is_upvoted ? '#3B82F6' : '#000'}
            />
            <Text style={styles.statText}>{post?.upvote_count}</Text>
          </TouchableOpacity>
          <View style={[styles.statItem, {marginLeft: 16}]}>
            <Icon name="chatbubble-outline" size={18} color="#000" />
            <Text style={styles.statText}>{post.comment_count}</Text>
          </View>
        </View>
        {renderTags(post.tags)}
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = (user: User) => (
    <TouchableOpacity
      key={user.id}
      style={styles.userCard}
      onPress={() =>
        navigation.navigate('OtherProfileScreen', {postId: user.id})
      }>
      <CommonAvatar
        uri={user.image?.url}
        mode={user.roles?.includes('expert') ? 'expert' : 'runner'}
        size={40}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userDetail}>@{user.username}</Text>
        {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderExpertItem = (expert: User) => {
    const sessionStatus = getExpertSessionStatus(expert.id);
    const acceptedSession = getAcceptedExpertSession();
    const isChatDisabled =
      hasPendingExpertSession ||
      (acceptedSession &&
        acceptedSession.other_user.id !== expert.id.toString());

    return (
      <View key={expert.id} style={styles.userCard}>
        <TouchableOpacity
          style={styles.userCardContent}
          onPress={() =>
            navigation.navigate('OtherProfileScreen', {postId: expert.id})
          }>
          <CommonAvatar
            uri={expert.image?.url}
            mode={expert?.roles?.includes('expert') ? 'expert' : 'runner'}
            size={40}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{expert.name}</Text>
            <Text style={styles.userDetail}>@{expert.username}</Text>
            {expert.bio && <Text style={styles.userBio}>{expert.bio}</Text>}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chatButton,
            isChatDisabled && styles.disabledChatButton,
          ]}
          onPress={() => handleExpertChatPress(expert)}
          disabled={isChatDisabled}>
          <View style={styles.chatButtonContainer}>
            <Icon
              name="chatbubble-outline"
              size={24}
              color={theme.colors.primaryDark}
            />
            {hasPendingExpertSession && <View style={styles.pendingBadge} />}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const handleLikePost = async (postId: string, isLike: boolean) => {
    if (!profile) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài viết', [
        {text: 'Đóng', style: 'cancel'},
      ]);
      return;
    }
    try {
      await likePost(postId, isLike);
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Lỗi', 'Không thể thích bài viết. Vui lòng thử lại sau.');
    }
  };

  // Filter out experts from runners
  const filteredRunners = allSearchResults.runners.filter(
    user => !user.roles?.includes('expert'),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#94A3B8"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts, users, or experts"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>
      <View style={styles.tabsContainer}>
        {['All', 'People', 'Posts', 'Experts', 'Runners'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.content}>
        {searchLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F2B5B" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : searchError ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={40} color="#EF4444" />
            <Text style={styles.errorText}>{searchError}</Text>
          </View>
        ) : (
          <>
            {activeTab === 'All' && (
              <>
                {debouncedQuery === '' ? (
                  renderEmptyState()
                ) : (
                  <>
                    {searchResults && searchResults.length > 0 && (
                      <>
                        <Text style={styles.sectionTitle}>Posts</Text>
                        {searchResults.map(post => renderPostItem(post))}
                      </>
                    )}
                    {allSearchResults.experts.length > 0 && (
                      <>
                        <Text style={styles.sectionTitle}>Experts</Text>
                        {allSearchResults.experts.map(renderExpertItem)}
                      </>
                    )}
                    {filteredRunners.length > 0 && (
                      <>
                        <Text style={styles.sectionTitle}>Runners</Text>
                        {filteredRunners.map(renderUserItem)}
                      </>
                    )}
                  </>
                )}
              </>
            )}
            {activeTab === 'Posts' && (
              <>
                {searchResults && searchResults.length > 0
                  ? searchResults.map(post => renderPostItem(post))
                  : renderEmptyState()}
              </>
            )}
            {activeTab === 'People' && (
              <>
                {allSearchResults.users.length > 0
                  ? allSearchResults.users.map(renderUserItem)
                  : renderEmptyState()}
              </>
            )}
            {activeTab === 'Experts' && (
              <>
                {allSearchResults.experts.length > 0
                  ? allSearchResults.experts.map(renderExpertItem)
                  : renderEmptyState()}
              </>
            )}
            {activeTab === 'Runners' && (
              <>
                {filteredRunners.length > 0
                  ? filteredRunners.map(renderUserItem)
                  : renderEmptyState()}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

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
  postImage: {width: '100%', height: 200, borderRadius: 10, marginBottom: 10},
  postImagePlaceholder: {backgroundColor: '#e0e0e0'},
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    padding: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#0F2B5B',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
    marginTop: 8,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  postTime: {
    fontSize: 14,
    color: '#64748B',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  postExcerpt: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    width: '56%',
    marginLeft: 16,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginTop: 5,
  },
  tagText: {fontSize: 12, color: '#666'},
  runDataIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primaryDark,
    padding: 8,
    borderRadius: 8,
    marginVertical: 8,
  },
  runDataIndicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runDataText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  postImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  remainingImagesIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  imageIcon: {
    marginRight: 4,
  },
  remainingImagesText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  userCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  userDetail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  chatButton: {
    padding: 8,
  },
  chatButtonContainer: {
    position: 'relative',
  },
  disabledChatButton: {
    opacity: 0.5,
  },
  pendingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFC107',
  },
});

export default SearchResultsScreen;
