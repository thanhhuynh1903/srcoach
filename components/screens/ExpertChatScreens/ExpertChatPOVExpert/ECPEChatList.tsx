import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import useChatsAPI from '../../../utils/useChatsAPI';

type TabType = 'all' | 'current' | 'pending' | 'blocked';
type ModalAction = 'archive' | 'block' | 'unblock';

interface ChatSession {
  id: string;
  participant1_id: string;
  participant2_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED' | 'ARCHIVED' | 'REJECTED';
  participant1?: {
    id: string;
    name?: string;
    username?: string;
    is_expert?: boolean;
  };
  participant2?: {
    id: string;
    name?: string;
    username?: string;
    is_expert?: boolean;
  };
  initiatedByYou?: boolean;
  created_at: string;
  updated_at?: string;
}

const ECPEChatList = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null,
  );
  const [modalAction, setModalAction] = useState<ModalAction>('archive');

  const {
    getSessions,
    getPendingSessions,
    acceptSession,
    rejectOrArchiveSession,
    blockUser,
    unblockUser,
    getBlockedUsers,
  } = useChatsAPI();

  useEffect(() => {
    loadSessions();
  }, [activeTab]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      let result;

      if (activeTab === 'pending') {
        result = await getPendingSessions();
      } else if (activeTab === 'blocked') {
        result = await getBlockedUsers();
        if (result.status && result.data) {
          const blockedSessions = result.data.map(user => ({
            id: `blocked-${user.id}`,
            participant1_id: '',
            participant2_id: user.id,
            status: 'BLOCKED' as const,
            participant2: {
              id: user.id,
              name: user.name,
              username: user.username,
            },
            created_at: new Date().toISOString(),
          }));
          setSessions(blockedSessions);
          return;
        }
      } else {
        result = await getSessions();
      }

      if (result.status && result.data) {
        let filteredSessions = result.data;
        if (activeTab === 'current') {
          filteredSessions = result.data.filter(
            session => session.status === 'ACCEPTED',
          );
        }
        setSessions(filteredSessions);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load sessions',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (sessionId: string) => {
    const result = await acceptSession(sessionId);
    if (result.status) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Session accepted',
      });
      loadSessions();
    }
  };

  const handleReject = async (sessionId: string) => {
    const result = await rejectOrArchiveSession(sessionId);
    if (result.status) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Session rejected',
      });
      loadSessions();
    }
  };

  const handleArchive = async () => {
    if (!selectedSession) return;

    const result = await rejectOrArchiveSession(selectedSession.id);
    if (result.status) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Session archived',
      });
      loadSessions();
    }
    setModalVisible(false);
  };

  const handleBlock = async () => {
    if (!selectedSession) return;

    const userIdToBlock =
      selectedSession.participant1_id === selectedSession.participant2_id
        ? selectedSession.participant2_id
        : selectedSession.participant1_id === selectedSession.participant2_id
        ? selectedSession.participant1_id
        : selectedSession.initiatedByYou
        ? selectedSession.participant2_id
        : selectedSession.participant1_id;

    const result = await blockUser(userIdToBlock);
    if (result.status) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User blocked',
      });
      loadSessions();
    }
    setModalVisible(false);
  };

  const handleUnblock = async () => {
    if (!selectedSession) return;

    const result = await unblockUser(selectedSession.participant2_id);
    if (result.status) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User unblocked',
      });
      loadSessions();
    }
    setModalVisible(false);
  };

  const showActionModal = (session: ChatSession, action: ModalAction) => {
    setSelectedSession(session);
    setModalAction(action);
    setModalVisible(true);
  };

  const getOtherUser = (session: ChatSession) => {
    return session.initiatedByYou ? session.participant2 : session.participant1;
  };

  const renderItem = ({item}: {item: ChatSession}) => {
    const otherUser = getOtherUser(item);
    const isBlocked = item.status === 'BLOCKED';

    return (
      <View
        style={[
          styles.sessionItem,
          item.status === 'ACCEPTED' && styles.acceptedSession,
          item.status === 'PENDING' && styles.pendingSession,
          isBlocked && styles.blockedSession,
        ]}>
        <TouchableOpacity
          style={styles.sessionContent}
          onPress={() => {
            if (item.status === 'ACCEPTED') {
              navigation.navigate('ECPEMessageScreen', {sessionId: item.id});
            }
          }}>
          <View style={styles.avatarPlaceholder}>
            <Icon name="person" size={24} color="#fff" />
          </View>
          <View style={styles.sessionInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>
                {otherUser?.name || 'Unknown User'}
              </Text>
              {otherUser?.is_expert && (
                <View style={styles.expertBadge}>
                  <Text style={styles.expertBadgeText}>Expert</Text>
                </View>
              )}
            </View>
            <Text style={styles.username}>
              @{otherUser?.username || 'unknown'}
            </Text>
            {isBlocked && <Text style={styles.blockedText}>Blocked</Text>}
          </View>
        </TouchableOpacity>

        {item.status === 'ACCEPTED' ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => showActionModal(item, 'archive')}>
            <Icon name="ellipsis-horizontal" size={20} color="#666" />
          </TouchableOpacity>
        ) : item.status === 'BLOCKED' ? (
          <TouchableOpacity
            style={styles.unblockButton}
            onPress={() => showActionModal(item, 'unblock')}>
            <Icon name="lock-open" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.pendingActions}>
            {!item.initiatedByYou && (
              <>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAccept(item.id)}>
                  <Icon name="checkmark" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => showActionModal(item, 'block')}>
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const getModalConfig = () => {
    switch (modalAction) {
      case 'archive':
        return {
          title: 'Archive Conversation',
          text: 'Are you sure you want to archive this conversation?',
          actionText: 'Archive',
          action: handleArchive,
        };
      case 'block':
        return {
          title: 'Block User',
          text: 'Are you sure you want to block this user? You will no longer receive messages from them.',
          actionText: 'Block',
          action: handleBlock,
        };
      case 'unblock':
        return {
          title: 'Unblock User',
          text: 'Are you sure you want to unblock this user?',
          actionText: 'Unblock',
          action: handleUnblock,
        };
      default:
        return {
          title: '',
          text: '',
          actionText: '',
          action: () => {},
        };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText,
            ]}>
            All
          </Text>
        </TouchableOpacity>

        <View style={styles.tabSpacer} />

        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'current' && styles.activeTabText,
            ]}>
            Current
          </Text>
        </TouchableOpacity>

        <View style={styles.tabSpacer} />

        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'pending' && styles.activeTabText,
            ]}>
            Pending
          </Text>
        </TouchableOpacity>

        <View style={styles.tabSpacer} />

        <TouchableOpacity
          style={[styles.tab, activeTab === 'blocked' && styles.activeTab]}
          onPress={() => setActiveTab('blocked')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'blocked' && styles.activeTabText,
            ]}>
            Blocked
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B7BE5" />
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'blocked'
                  ? 'No blocked users'
                  : 'No sessions found'}
              </Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalText}>{modalConfig.text}</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={modalConfig.action}>
                <Text style={styles.buttonText}>{modalConfig.actionText}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  tabSpacer: {
    width: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  activeTab: {
    backgroundColor: '#4B7BE5',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sessionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  acceptedSession: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  pendingSession: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  blockedSession: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  sessionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4B7BE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 4,
  },
  expertBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  expertBadgeText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  blockedText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 2,
  },
  actionButton: {
    padding: 8,
  },
  pendingActions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  rejectButton: {
    backgroundColor: '#F44336',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unblockButton: {
    backgroundColor: '#4B7BE5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#4B7BE5',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ECPEChatList;
