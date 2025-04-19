import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../contants/theme';
import {useLoginStore} from '../../utils/useLoginStore';
import LinearGradient from 'react-native-linear-gradient';
import {
  getSessions,
  getPendingSessions,
  getBlockedUsers,
  acceptSession,
  rejectSession,
} from '../../utils/useChatsAPI';
import {useNavigation} from '@react-navigation/native';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import { CommonAvatar } from '../../commons/CommonAvatar';
import { capitalizeFirstLetter } from '../../utils/utils_format';

type Session = {
  id: string;
  health_data_package_id: string | null;
  created_at: string;
  updated_at: string | null;
  participant1_id: string;
  participant2_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
  participant1: User;
  participant2: User;
  initiatedByYou: boolean;
};

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  points: number;
  user_level: string;
  roles: string[];
  image?: {
    url: string;
  };
};

type FilterType = 'ALL' | 'ACCEPTED' | 'PENDING' | 'BLOCKED';

type PendingSessions = {
  initiated: Session[];
  invited: Session[];
};

export default function ChatsScreen() {
  const navigation = useNavigation();
  const {profile} = useLoginStore();
  const userId = profile?.id;

  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [acceptedSessions, setAcceptedSessions] = useState<Session[]>([]);
  const [pendingSessions, setPendingSessions] = useState<PendingSessions>({
    initiated: [],
    invited: [],
  });
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [acceptedRes, pendingRes, blockedRes] = await Promise.all([
        getSessions(),
        getPendingSessions(),
        getBlockedUsers(),
      ]);

      if (acceptedRes.status) setAcceptedSessions(acceptedRes.data);
      if (pendingRes.status) setPendingSessions(pendingRes.data);
      if (blockedRes.status) setBlockedUsers(blockedRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptSession = async (sessionId: string) => {
    try {
      const response = await acceptSession(sessionId);
      if (response.status) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error accepting session:', error);
    }
  };

  const handleRejectSession = async (sessionId: string) => {
    try {
      const response = await rejectSession(sessionId);
      if (response.status) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error rejecting session:', error);
    }
  };

  const getFilteredSections = () => {
    const allData = [
      ...acceptedSessions,
      ...pendingSessions.initiated,
      ...pendingSessions.invited,
      ...blockedUsers.map(
        user =>
          ({
            id: `blocked-${user.id}`,
            status: 'BLOCKED',
            participant1: {
              id: userId!,
              name: '',
              username: '',
              email: '',
              points: 0,
              user_level: '',
              roles: [],
            },
            participant2: user,
            initiatedByYou: true,
          } as any),
      ),
    ];

    const expertSessions = allData.filter(
      item => 'status' in item && item.participant2.roles.includes('expert'),
    );
    const runnerSessions = allData.filter(
      item => 'status' in item && !item.participant2.roles.includes('expert'),
    );
    const blockedItems = allData.filter(item => !('status' in item));

    switch (activeFilter) {
      case 'ACCEPTED':
        return [
          {
            title: `Expert Sessions (${
              expertSessions.filter(s => s.status === 'ACCEPTED').length
            })`,
            data: expertSessions.filter(s => s.status === 'ACCEPTED'),
          },
          {
            title: `Messages (${
              runnerSessions.filter(s => s.status === 'ACCEPTED').length
            })`,
            data: runnerSessions.filter(s => s.status === 'ACCEPTED'),
          },
        ];
      case 'PENDING':
        return [
          {
            title: `Expert Sessions (${
              expertSessions.filter(s => s.status === 'PENDING').length
            })`,
            data: expertSessions.filter(s => s.status === 'PENDING'),
          },
          {
            title: `Messages (${
              runnerSessions.filter(s => s.status === 'PENDING').length
            })`,
            data: runnerSessions.filter(s => s.status === 'PENDING'),
          },
        ];
      case 'BLOCKED':
        return [
          {
            title: `Blocked Users (${blockedItems.length})`,
            data: blockedItems,
          },
        ];
      default:
        return [
          {
            title: `Expert Sessions (${expertSessions.length})`,
            data: expertSessions,
          },
          {
            title: `Messages (${runnerSessions.length})`,
            data: runnerSessions,
          },
          {
            title: `Blocked Users (${blockedItems.length})`,
            data: blockedItems,
          },
        ];
    }
  };

  const getFilterColor = (filter: FilterType) => {
    switch (filter) {
      case 'ACCEPTED':
        return theme.colors.success;
      case 'PENDING':
        return theme.colors.warning;
      case 'BLOCKED':
        return theme.colors.error;
      default:
        return '#8E8E93';
    }
  };

  const handleChatPress = (session: Session) => {
    if (session.status === 'ACCEPTED') {
      if (profile.roles.includes('expert')) {
        navigation.navigate('ChatsExpertMessageScreen', {
          sessionId: session.id,
        });
      } else {
        navigation.navigate('ChatsRunnerMessageScreen', {
          sessionId: session.id,
        });
      }
    }
  };

  const renderItem = ({item}: {item: Session | User}) => {
    const isBlockedUser = !('status' in item);
    const session = item as Session;
    const otherUser =
      userId === session.participant1.id
        ? session.participant2
        : session.participant1;
    const isExpert = otherUser.roles.includes('expert');

    // Only show buttons if it's an invited pending session (not initiated by you)
    const isPendingForYou =
      session.status === 'PENDING' &&
      pendingSessions.invited.some(
        invitedSession => invitedSession.id === session.id,
      );

    const content = (
      <View style={styles.itemContainer}>
        <View style={styles.avatarContainer}>
          <CommonAvatar
            mode={isExpert ? 'expert' : 'runner'}
            uri={otherUser.image?.url}
            size={40}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{otherUser.name}</Text>
            <Text style={styles.usernameText}>@{otherUser.username}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="trophy" size={16} color={theme.colors.warning} />
              <Text style={styles.statText}>{otherUser.points}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={16} color={theme.colors.warning} />
              <Text style={styles.statText}>{capitalizeFirstLetter(otherUser.user_level)}</Text>
            </View>
          </View>
        </View>
        {session.status === 'PENDING' && session.initiatedByYou && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}
        {isBlockedUser && (
          <View style={styles.blockedBadge}>
            <Text style={styles.blockedText}>Blocked</Text>
          </View>
        )}
        {isPendingForYou && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptSession(session.id)}>
              <Icon name="checkmark" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectSession(session.id)}>
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );

    const containerStyle = isExpert
      ? styles.expertContainer
      : styles.regularContainer;

    if (session.status === 'ACCEPTED') {
      return (
        <TouchableOpacity
          onPress={() => handleChatPress(session)}
          style={[containerStyle, {marginHorizontal: 16, marginVertical: 4}]}>
          {content}
        </TouchableOpacity>
      );
    }

    if (isExpert) {
      return (
        <LinearGradient
          colors={['#FFF9E6', '#FFF0C2']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.expertContainer}>
          {content}
        </LinearGradient>
      );
    }

    return <View style={styles.regularContainer}>{content}</View>;
  };

  const renderSectionHeader = ({
    section: {title},
  }: {
    section: {title: string};
  }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderLoader = () => (
    <View style={styles.contentLoaderContainer}>
      {[1, 2, 3, 4, 5].map((_, index) => (
        <ContentLoader
          key={index}
          speed={1}
          width="100%"
          height={72}
          viewBox="0 0 400 72"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb">
          <Circle cx="36" cy="36" r="20" />
          <Rect x="72" y="18" rx="3" ry="3" width="120" height="12" />
          <Rect x="72" y="38" rx="3" ry="3" width="80" height="10" />
          <Rect x="300" y="24" rx="3" ry="3" width="60" height="24" />
        </ContentLoader>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header - Always visible */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon
            name="chatbubble-ellipses"
            size={24}
            color={theme.colors.primaryDark}
          />
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ChatsUserSearchScreen')}>
            <Icon
              name="person-add-outline"
              size={24}
              color={theme.colors.primaryDark}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ManageNotificationsScreen')}>
            <Icon
              name="notifications-outline"
              size={24}
              color={theme.colors.primaryDark}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('LeaderBoardScreen')}>
            <Icon
              name="trophy-outline"
              size={24}
              color={theme.colors.primaryDark}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor="#8E8E93"
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: theme.colors.primaryDark }]}
          onPress={() => navigation.navigate('ChatsSearchAllMessagesScreen')}
        >
          <Icon
            name="search-outline"
            size={20}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>

      {/* Filter Chips - Always visible */}
      <View style={styles.filterContainer}>
        {(['ALL', 'ACCEPTED', 'PENDING', 'BLOCKED'] as FilterType[]).map(
          filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && {
                  backgroundColor: getFilterColor(filter),
                },
              ]}
              onPress={() => setActiveFilter(filter)}>
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && {color: 'white'},
                ]}>
                {filter.charAt(0) + filter.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </View>

      {/* Content Area */}
      {isLoading ? (
        renderLoader()
      ) : (
        <SectionList
          sections={getFilteredSections()}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No {activeFilter.toLowerCase()} chats found
              </Text>
            </View>
          }
          refreshing={refreshing}
          onRefresh={fetchData}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
    color: theme.colors.primaryDark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchIcon: {
    marginRight: 8,
    color: theme.colors.primaryDark,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#E5E5EA',
  },
  filterText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EFEFF4',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  usernameText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  pendingBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    color: 'white',
    fontSize: 12,
  },
  blockedBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  blockedText: {
    color: 'white',
    fontSize: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
  },
  rejectButton: {
    backgroundColor: theme.colors.error,
  },
  expertContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fffee9',
  },
  regularContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  contentLoaderContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});