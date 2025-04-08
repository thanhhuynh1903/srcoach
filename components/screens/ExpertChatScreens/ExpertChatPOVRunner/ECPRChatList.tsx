import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {theme} from '../../../contants/theme';
import useChatStore from '../../../utils/useChatStore';
import ChatAPI from '../../../utils/useChatAPI';

const tabs = [
  {id: 'All', label: 'All'},
  {id: 'ACCEPTED', label: 'Active'},
  {id: 'PENDING', label: 'Pending'},
  {id: 'BLOCKED', label: 'Blocked'},
  {id: 'ARCHIVED', label: 'Archived'},
];

const statusColors = {
  PENDING: '#FFC107',
  ACCEPTED: '#4CAF50',
  BLOCKED: '#F44336',
  ARCHIVED: '#9E9E9E',
};

const ECPRChatList = () => {
  const navigation = useNavigation();
  const [isLoading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'ARCHIVE' | 'BLOCK' | null>(null);
  const slideAnim = useState(new Animated.Value(300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await ChatAPI.listChatSessions(
        activeTab === 'All' ? undefined : activeTab,
      );
      if (res.status && res.data) {
        setSessions(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSessions();
    }, [activeTab]),
  );

  const filteredSessions = sessions.filter(session => {
    if (activeTab !== 'All' && session.status !== activeTab) {
      return false;
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const participantName = session.participant2?.name?.toLowerCase() || '';
      const participantUsername = session.participant2?.username?.toLowerCase() || '';
      const lastMessage = session.last_message?.message?.toLowerCase() || '';

      return (
        participantName.includes(searchLower) ||
        participantUsername.includes(searchLower) ||
        lastMessage.includes(searchLower)
      );
    }

    return true;
  });

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const handleChatPress = (session: ChatSession) => {
    if (session.status !== 'ACCEPTED') return;

    useChatStore.setState({currentSession: session});
    navigation.navigate('ExpertChatboxScreen' as never, {
      sessionId: session.id,
    });
  };

  const showModal = () => {
    setShowActionModal(true);
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
    ]).start(() => setShowActionModal(false));
  };

  const handleMorePress = (session: ChatSession) => {
    setSelectedSession(session);
    showModal();
  };

  const handleAction = (type: 'ARCHIVE' | 'BLOCK') => {
    setActionType(type);
    hideModal();
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedSession || !actionType) return;

    try {
      let response;
      if (actionType === 'BLOCK') {
        if (selectedSession.status === 'BLOCKED') {
          response = await ChatAPI.unblockChat(selectedSession.id);
        } else {
          response = await ChatAPI.blockChat(selectedSession.id);
        }
      } else if (actionType === 'ARCHIVE') {
        if (selectedSession.status === 'ARCHIVED') {
          response = await ChatAPI.unarchiveChat(selectedSession.id);
        } else {
          response = await ChatAPI.archiveChat(selectedSession.id);
        }
      }

      if (response?.status) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setShowConfirmModal(false);
      setSelectedSession(null);
      setActionType(null);
    }
  };

  const renderChatItem = ({item}: {item: ChatSession}) => {
    const otherParticipant = item.other_participant;
    const lastMessage = item.last_message;
    const isActive = item.status === 'ACCEPTED' && item.status !== 'ARCHIVED';

    return (
      <View style={[styles.chatItem, {borderLeftWidth: 4, borderLeftColor: statusColors[item.status as keyof typeof statusColors]}]}>
        <TouchableOpacity
          style={styles.chatContent}
          onPress={() => handleChatPress(item)}
          disabled={!isActive}>
          <View style={styles.chatHeader}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=random`,
              }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{otherParticipant?.name}</Text>
              <Text style={styles.username}>@{otherParticipant?.username}</Text>
              <Text style={styles.specialty}>
                {otherParticipant?.user_level && capitalizeFirstLetter(otherParticipant.user_level)}
              </Text>
            </View>
            <View style={[styles.statusBadge, {backgroundColor: statusColors[item.status as keyof typeof statusColors]}]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          
          {lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage.message}
            </Text>
          )}
          
          <View style={styles.chatFooter}>
            <Text style={styles.chatDate}>
              {new Date(lastMessage?.created_at || item.updated_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleMorePress(item)}>
          <Icon name="ellipsis-vertical" size={20} color="#616161" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar with Add Button */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ExpertChatSearchScreen' as never)}>
          <Icon name="add" size={24} color={theme.colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}>
        {tabs.map(tab => {
          const tabColor = tab.id === 'All' ? theme.colors.primaryDark : statusColors[tab.id as keyof typeof statusColors];
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTab,
                activeTab === tab.id && {backgroundColor: tabColor}
              ]}
              onPress={() => setActiveTab(tab.id)}>
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Chat List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryDark} />
        </View>
      ) : filteredSessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <Icon
              name="chatbubbles-outline"
              size={80}
              color={theme.colors.primaryLight}
            />
          </View>
          <Text style={styles.emptyTitle}>No chats found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'No results match your search'
              : activeTab === 'All'
              ? 'Start a new chat with an expert'
              : `No ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} chats`}
          </Text>
          {!searchQuery && activeTab === 'All' && (
            <TouchableOpacity
              style={styles.addButtonLarge}
              onPress={() => navigation.navigate('ExpertChatSearchScreen' as never)}>
              <Icon name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>New Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No chats available</Text>
            </View>
          }
        />
      )}

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
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
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => handleAction('ARCHIVE')}>
            <Text style={styles.modalButtonText}>
              {selectedSession?.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => handleAction('BLOCK')}>
            <Text style={styles.modalButtonText}>
              {selectedSession?.status === 'BLOCKED' ? 'Unblock' : 'Block'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={hideModal}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationDialog}>
            <Text style={styles.confirmationTitle}>
              {actionType === 'BLOCK'
                ? selectedSession?.status === 'BLOCKED'
                  ? 'Unblock User?'
                  : 'Block User?'
                : selectedSession?.status === 'ARCHIVED'
                ? 'Unarchive Chat?'
                : 'Archive Chat?'}
            </Text>
            <Text style={styles.confirmationMessage}>
              {actionType === 'BLOCK'
                ? selectedSession?.status === 'BLOCKED'
                  ? `Are you sure you want to unblock ${selectedSession?.participant2?.name}?`
                  : `Are you sure you want to block ${selectedSession?.participant2?.name}? You won't receive messages from them.`
                : selectedSession?.status === 'ARCHIVED'
                ? `Are you sure you want to unarchive this chat with ${selectedSession?.participant2?.name}?`
                : `Are you sure you want to archive this chat with ${selectedSession?.participant2?.name}?`}
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.cancelConfirmationButton]}
                onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmationButton, {
                  backgroundColor: actionType === 'BLOCK' ? '#F44336' : '#9E9E9E'
                }]}
                onPress={confirmAction}>
                <Text style={styles.confirmButtonText}>
                  {actionType === 'BLOCK'
                    ? selectedSession?.status === 'BLOCKED'
                      ? 'Unblock'
                      : 'Block'
                    : selectedSession?.status === 'ARCHIVED'
                    ? 'Unarchive'
                    : 'Archive'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  addButton: {
    marginLeft: 8,
    padding: 8,
  },
  tabContainer: {
    paddingHorizontal: 10,
    height: 48,
    backgroundColor: '#fff',
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
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#757575',
  },
  specialty: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  lastMessage: {
    fontSize: 14,
    color: '#616161',
    marginVertical: 8,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatDate: {
    fontSize: 12,
    color: '#9E9E9E',
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
    padding: 20,
  },
  emptyIllustration: {
    backgroundColor: '#f8f8f8',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  addButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
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

export default ECPRChatList;