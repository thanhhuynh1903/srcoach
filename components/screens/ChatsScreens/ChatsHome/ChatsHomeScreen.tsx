import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Text, RefreshControl} from 'react-native';
import {theme} from '../../../contants/theme';
import CHSHeader from './CHSHeader';
import CHSSearch from './CHSSearch';
import CHSTabFilter from './CHSTabFilter';
import Icon from '@react-native-vector-icons/ionicons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {listSessions, respondToSession} from '../../../utils/useChatsAPI';
import CHSChatList from './CHSChatList';
import ToastUtil from '../../../utils/utils_toast';
import {useLoginStore} from '../../../utils/useLoginStore';

interface ChatSession {
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
}

const ChatsHomeScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const {profile} = useLoginStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchSessions();
    }, [activeFilter])
  )

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const status = activeFilter === 'All' ? null : activeFilter.toUpperCase();
      const response = await listSessions(status);
      if (response.status) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleChatPress = (session: ChatSession) => {
    if (
      profile.roles && profile.roles.includes('expert') &&
      session.other_user?.roles?.includes('runner') &&
      session.status == 'PENDING'
    ) {
      navigation.navigate('ChatsExpertConfirmScreen', {userId: session.other_user.id});
      return;
    }

    navigation.navigate('ChatsMessageScreen', {
      userId: session.other_user.id,
    });
  };

  const handleAccept = (session: ChatSession) => {
    handleRespondToSession(session.id, true);
  };

  const handleDeny = (session: ChatSession) => {
    handleRespondToSession(session.id, false);
  };

  const handleRespondToSession = async (sessionId: string, accept: boolean) => {
    try {
      const response = await respondToSession(sessionId, accept);
      if (response.status) {
        if (accept) {
          ToastUtil.success('Success', 'Session accepted successfully');
        } else {
          ToastUtil.success('Success', 'Session rejected successfully');
        }
        fetchSessions();
      }
    } catch (error) {
      console.error('Error responding to session:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  return (
    <View style={styles.container}>
      <CHSHeader />
      <CHSSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => {}}
      />
      <CHSTabFilter
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <Text>Loading chats...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={48} color={'#c2c2c2'} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching chats found' : 'No chats found'}
            </Text>
          </View>
        ) : (
          <CHSChatList
            sessions={sessions}
            onItemPress={handleChatPress}
            onAccept={handleAccept}
            onDeny={handleDeny}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebebeb',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    color: '#c2c2c2',
    fontSize: 16,
  },
});

export default ChatsHomeScreen;
