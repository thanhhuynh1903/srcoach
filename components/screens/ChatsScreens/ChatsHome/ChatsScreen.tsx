import React, {useState, useEffect, useCallback} from 'react';
import { View, Text } from 'react-native';
import {
  StyleSheet,
  SafeAreaView,
  SectionList,
} from 'react-native';
import {useLoginStore} from '../../../utils/useLoginStore';
import {useNavigation} from '@react-navigation/native';
import {
  getSessions,
  getPendingSessions,
  getBlockedUsers,
  acceptSession,
  rejectSession,
  blockUser,
  unblockUser,
} from '../../../utils/useChatsAPI';
import {ChatsHeader} from './ChatsHeader';
import {ChatsSearch} from './ChatsSearch';
import {ChatsFilterTabs} from './ChatsFilterTabs';
import {ChatsListItem} from './ChatsListItem';
import {ChatsActionMenu} from './ChatsActionMenu';
import {ChatsConfirmationDialog} from './ChatsConfirmationDialog';
import {ChatsEmptyState} from './ChatsEmptyState';
import {ChatsContentLoader} from './ChatsContentLoader';
import {Session, BlockedUser} from './types';
import { theme } from '../../../contants/theme';
import Icon from '@react-native-vector-icons/ionicons';

export default function ChatsScreen() {
  const navigation = useNavigation();
  const {profile} = useLoginStore();
  const userId = profile?.id;

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACCEPTED' | 'PENDING' | 'BLOCKED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [acceptedSessions, setAcceptedSessions] = useState<Session[]>([]);
  const [pendingSessions, setPendingSessions] = useState<{initiated: Session[], invited: Session[]}>({initiated: [], invited: []});
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [confirmationDialogVisible, setConfirmationDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Session | BlockedUser | null>(null);
  const [selectedAction, setSelectedAction] = useState<{title: string, handler: () => void} | null>(null);

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAcceptSession = useCallback(async (sessionId: string) => {
    try {
      const response = await acceptSession(sessionId);
      if (response.status) fetchData();
    } catch (error) {
      console.error('Error accepting session:', error);
    }
  }, [fetchData]);

  const handleRejectSession = useCallback(async (sessionId: string) => {
    try {
      const response = await rejectSession(sessionId);
      if (response.status) fetchData();
    } catch (error) {
      console.error('Error rejecting session:', error);
    }
  }, [fetchData]);

  const handleBlockUser = useCallback(async (userId: string) => {
    try {
      const response = await blockUser(userId);
      if (response.status) fetchData();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }, [fetchData]);

  const handleUnblockUser = useCallback(async (userId: string) => {
    try {
      const response = await unblockUser(userId);
      if (response.status) fetchData();
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  }, [fetchData]);

  const getOtherUser = useCallback((item: Session | BlockedUser): User => {
    if ('blockedAt' in item) return item.user;
    return userId === item.participant1_id ? item.participant2 : item.participant1;
  }, [userId]);

  const getFilteredSections = useCallback(() => {
    const allSessions: Session[] = [
      ...acceptedSessions,
      ...pendingSessions.initiated,
      ...pendingSessions.invited,
    ];

    const expertSessions = allSessions.filter(item => 
      item.participant2.roles.includes('expert')
    );
    const runnerSessions = allSessions.filter(item => 
      !item.participant2.roles.includes('expert')
    );

    switch (activeFilter) {
      case 'ACCEPTED':
        return [
          {
            title: `Expert Sessions (${expertSessions.filter(s => s.status === 'ACCEPTED').length})`,
            data: expertSessions.filter(s => s.status === 'ACCEPTED'),
            icon: 'trophy',
          },
          {
            title: `Direct Messages (${runnerSessions.filter(s => s.status === 'ACCEPTED').length})`,
            data: runnerSessions.filter(s => s.status === 'ACCEPTED'),
            icon: 'chatbubble',
          },
        ];
      case 'PENDING':
        return [
          {
            title: `Expert Sessions (${expertSessions.filter(s => s.status === 'PENDING').length})`,
            data: expertSessions.filter(s => s.status === 'PENDING'),
            icon: 'trophy',
          },
          {
            title: `Direct Messages (${runnerSessions.filter(s => s.status === 'PENDING').length})`,
            data: runnerSessions.filter(s => s.status === 'PENDING'),
            icon: 'chatbubble',
          },
        ];
      case 'BLOCKED':
        return [{
          title: `Blocked Users (${blockedUsers.length})`,
          data: blockedUsers,
          icon: 'ban',
        }];
      default:
        const sections = [
          {
            title: `Expert Sessions (${expertSessions.length})`,
            data: expertSessions,
            icon: 'trophy',
          },
          {
            title: `Direct Messages (${runnerSessions.length})`,
            data: runnerSessions,
            icon: 'chatbubble',
          },
        ];
        
        // Only show blocked users in ALL tab if there are any
        if (blockedUsers.length > 0) {
          sections.push({
            title: `Blocked Users (${blockedUsers.length})`,
            data: blockedUsers,
            icon: 'ban',
          });
        }
        
        return sections;
    }
  }, [acceptedSessions, pendingSessions, blockedUsers, activeFilter]);

  const getFilterColor = useCallback((filter: string) => {
    const colors = {
      ACCEPTED: theme.colors.success,
      PENDING: theme.colors.warning,
      BLOCKED: theme.colors.error,
      ALL: theme.colors.primaryDark,
    };
    return colors[filter as keyof typeof colors] || colors.ALL;
  }, []);

  const handleChatPress = useCallback((session: Session) => {
    if (session.status === 'ACCEPTED') {
      const screen = profile?.roles.includes('expert') 
        ? 'ChatsExpertMessageScreen' 
        : 'ChatsRunnerMessageScreen';
      navigation.navigate(screen as never, {sessionId: session.id} as never);
    }
  }, [navigation, profile?.roles]);

  const showActionMenu = useCallback((item: Session | BlockedUser) => {
    setSelectedItem(item);
    setActionMenuVisible(true);
  }, []);

  const renderSectionHeader = ({section: {title, icon}}) => (
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={16} color="#64748B" style={styles.sectionIcon} />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ChatsHeader />
      <ChatsSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ChatsFilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

      {isLoading ? (
        <ChatsContentLoader />
      ) : (
        <SectionList
          sections={getFilteredSections()}
          renderItem={({item}) => (
            <ChatsListItem
              item={item}
              userId={userId}
              pendingSessions={pendingSessions}
              onChatPress={handleChatPress}
              onShowActionMenu={showActionMenu}
              onAcceptSession={handleAcceptSession}
              onRejectSession={handleRejectSession}
              getFilterColor={getFilterColor}
            />
          )}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<ChatsEmptyState />}
          refreshing={refreshing}
          onRefresh={fetchData}
          stickySectionHeadersEnabled={false}
        />
      )}

      <ChatsActionMenu
        visible={actionMenuVisible}
        onClose={() => setActionMenuVisible(false)}
        selectedItem={selectedItem}
        getOtherUser={getOtherUser}
        handleBlockUser={handleBlockUser}
        handleUnblockUser={handleUnblockUser}
        setConfirmationDialogVisible={setConfirmationDialogVisible}
        setSelectedAction={setSelectedAction}
      />

      <ChatsConfirmationDialog
        visible={confirmationDialogVisible}
        onClose={() => setConfirmationDialogVisible(false)}
        selectedAction={selectedAction}
        selectedItem={selectedItem}
        getOtherUser={getOtherUser}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  sectionIcon: {
    marginRight: 4,
  },
});