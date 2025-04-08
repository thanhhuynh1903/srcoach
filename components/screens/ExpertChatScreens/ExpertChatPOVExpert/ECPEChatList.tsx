import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import useChatExpertAPI from '../../../utils/useChatExpertAPI';
import {useNavigation} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';

type ChatSession = {
  id: string;
  participant1: {
    id: string;
    name: string;
    username: string;
  };
  status: string;
  updated_at: string;
  last_message?: {
    message: string;
    created_at: string;
  };
};

type TabType = 'All' | 'Active' | 'Pending' | 'Rating';

export default function ECPEChatList() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState<'accept' | 'archive' | null>(null);
  const slideAnim = useState(new Animated.Value(300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();
  const {
    listChatSessions,
    listActiveChatSessions,
    listPendingChatSessions,
    acceptChatSession,
    archiveChatSession,
  } = useChatExpertAPI();

  const showModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setModalVisible(false));
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      let response;

      if (activeTab === 'All') {
        response = await listChatSessions(page, 10);
      } else if (activeTab === 'Active') {
        response = await listActiveChatSessions(page, 10);
      } else if (activeTab === 'Pending') {
        response = await listPendingChatSessions(page, 10);
      } else {
        setChats([]);
        return;
      }

      if (page === 1) {
        setChats(response.data.data);
      } else {
        setChats(prev => [...prev, ...response.data.data]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchChats();
  }, [activeTab]);

  const handleChatPress = (sessionId: string) => {
    navigation.navigate('ECPEChatboxScreen', {sessionId});
  };

  const handleMorePress = (chat: ChatSession) => {
    setSelectedChat(chat);
    showModal();
  };

  const showActionConfirmation = (action: 'accept' | 'archive') => {
    setCurrentAction(action);
    setActionModalVisible(true);
    hideModal();
  };

  const handleConfirmAction = async () => {
    if (!selectedChat) return;
    
    try {
      if (currentAction === 'accept') {
        await acceptChatSession(selectedChat.id);
        Alert.alert('Success', 'Chat session accepted successfully');
      } else if (currentAction === 'archive') {
        await archiveChatSession(selectedChat.id);
        Alert.alert('Success', 'Chat session archived successfully');
      }
      fetchChats(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', error.message || `Failed to ${currentAction} chat session`);
    } finally {
      setActionModalVisible(false);
      setCurrentAction(null);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return '#FFC107'; // Yellow
    if (statusLower.includes('active')) return '#4CAF50'; // Green
    if (statusLower.includes('completed')) return '#9E9E9E'; // Gray
    if (statusLower.includes('rejected')) return '#F44336'; // Red
    return '#2196F3'; // Blue (default)
  };

  const renderChatItem = ({item}: {item: ChatSession}) => {
    const statusColor = getStatusColor(item.status);
    return (
      <View style={[styles.chatItem, {borderLeftWidth: 4, borderLeftColor: statusColor}]}>
        <TouchableOpacity
          style={styles.chatContent}
          onPress={() => handleChatPress(item.id)}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName}>{item.participant1.name}</Text>
            <Text style={styles.username}>@{item.participant1.username}</Text>
            <View style={[styles.statusBadge, {backgroundColor: statusColor}]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          {item.last_message && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message.message}
            </Text>
          )}
          <Text style={styles.chatDate}>
            {new Date(item.updated_at).toLocaleString()}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleMorePress(item)}>
          <Icon name="ellipsis-vertical" size={20} color="#616161" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator style={styles.loading} />;
  };

  const tabs: TabType[] = ['All', 'Active', 'Pending', 'Rating'];

  return (
    <View style={styles.container}>
      <View style={styles.tabWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTab,
                activeTab === tab && {backgroundColor: getStatusColor(tab === 'Active' ? 'active' : tab)}
              ]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {activeTab === 'Rating' ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No ratings available</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={renderFooter}
          onEndReachedThreshold={0.5}
          refreshing={loading && page === 1}
          onRefresh={() => {
            setPage(1);
            fetchChats();
          }}
        />
      )}

      {/* Action Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={hideModal}>
        <TouchableWithoutFeedback onPress={hideModal}>
          <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] }
          ]}>
          {activeTab === 'Pending' && (
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => showActionConfirmation('accept')}>
              <Text style={styles.modalButtonText}>Accept Chat</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => showActionConfirmation('archive')}>
            <Text style={styles.modalButtonText}>Archive Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={hideModal}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}>
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationDialog}>
            <Text style={styles.confirmationTitle}>
              {currentAction === 'accept' ? 'Accept Chat' : 'Archive Chat'}
            </Text>
            <Text style={styles.confirmationMessage}>
              Are you sure you want to {currentAction} this chat session?
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.cancelConfirmationButton]}
                onPress={() => setActionModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmationButton, {
                  backgroundColor: currentAction === 'accept' ? '#4CAF50' : '#F44336'
                }]}
                onPress={handleConfirmAction}>
                <Text style={styles.confirmButtonText}>
                  {currentAction === 'accept' ? 'Accept' : 'Archive'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  tabContainer: {
    paddingHorizontal: 10,
    height: 48,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    height: 35,
    justifyContent: 'center',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#616161',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 10,
  },
  chatItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  username: {
    fontSize: 14,
    color: '#757575',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 5,
  },
  chatDate: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
  },
  loading: {
    marginVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  moreButton: {
    padding: 8,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderBottomWidth: 0,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationDialog: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#616161',
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmationButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelConfirmationButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});