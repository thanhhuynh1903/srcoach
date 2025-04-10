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

type TabType = 'all' | 'current' | 'pending';

const ECPRChatList = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const {
    getSessions,
    getPendingSessions,
    acceptSession,
    rejectOrArchiveSession,
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

    const result = await rejectOrArchiveSession(selectedSession);
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

  const renderItem = ({item}: {item: ChatSession}) => (
    <View
      style={[
        styles.sessionItem,
        item.status === 'ACCEPTED' && styles.acceptedSession,
        item.status === 'PENDING' && styles.pendingSession,
      ]}>
      <TouchableOpacity
        style={styles.sessionContent}
        onPress={() => {
          if (item.status === 'ACCEPTED') {
            navigation.navigate('ECPRMessageScreen', {sessionId: item.id});
          }
        }}>
        <View style={styles.avatarPlaceholder}>
          <Icon name="person" size={24} color="#fff" />
        </View>
        <View style={styles.sessionInfo}>
          <Text style={styles.name}>
            {item.participant2?.name || 'Unknown User'}
          </Text>
          <Text style={styles.username}>
            @{item.participant2?.username || 'unknown'}
          </Text>
        </View>
      </TouchableOpacity>

      {item.status === 'ACCEPTED' ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedSession(item.id);
            setModalVisible(true);
          }}>
          <Icon name="ellipsis-horizontal" size={20} color="#666" />
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
                onPress={() => handleReject(item.id)}>
                <Icon name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );

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
              <Text style={styles.emptyText}>No sessions found</Text>
            </View>
          }
        />
      )}

      {/* Archive Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Archive Conversation</Text>
            <Text style={styles.modalText}>
              Are you sure you want to archive this conversation?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleArchive}>
                <Text style={styles.buttonText}>Archive</Text>
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
  header: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  activeTab: {
    backgroundColor: '#4B7BE5',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
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
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#666',
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
  // Modal styles
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

export default ECPRChatList;
