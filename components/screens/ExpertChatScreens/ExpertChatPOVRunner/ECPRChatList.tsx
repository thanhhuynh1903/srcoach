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
  Pressable,
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
  PENDING: '#F59E0B',
  ACCEPTED: '#22C55E',
  BLOCKED: '#DC2626',
  ARCHIVED: '#64748B',
};

const ECPRChatList = () => {
  const navigation = useNavigation();
  const [isLoading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null,
  );
  const [showActionModal, setShowActionModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'ARCHIVE' | 'BLOCK' | null>(
    null,
  );

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
      const participantUsername =
        session.participant2?.username?.toLowerCase() || '';
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

  const handleMorePress = (session: ChatSession) => {
    setSelectedSession(session);
    setShowActionModal(true);
  };

  const handleAction = (type: 'ARCHIVE' | 'BLOCK') => {
    setActionType(type);
    setShowActionModal(false);
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
        contentContainerStyle={styles.tabsContainer}>
        {tabs.map(tab => {
          const tabColor =
            tab.id === 'All'
              ? theme.colors.primaryDark
              : statusColors[tab.id as keyof typeof statusColors];
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && {
                  backgroundColor: tabColor,
                  borderColor: tabColor,
                },
                {borderColor: tabColor},
              ]}
              onPress={() => setActiveTab(tab.id)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
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
              : `No ${tabs
                  .find(t => t.id === activeTab)
                  ?.label.toLowerCase()} chats`}
          </Text>
          {!searchQuery && activeTab === 'All' && (
            <TouchableOpacity
              style={styles.addButtonLarge}
              onPress={() =>
                navigation.navigate('ExpertChatSearchScreen' as never)
              }>
              <Icon name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>New Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView style={styles.chatList}>
          {filteredSessions.map(session => {
            const otherParticipant = session.other_participant;
            const lastMessage = session.last_message;
            const unreadCount = 0;
            const isActive =
              session.status === 'ACCEPTED' && session.status !== 'ARCHIVED';

            return (
              <View key={session.id}>
                <TouchableOpacity
                  style={[
                    styles.chatItemContainer,
                    {
                      borderLeftColor:
                        statusColors[
                          session.status as keyof typeof statusColors
                        ] || '#F1F5F9',
                      opacity: isActive ? 1 : 0.6,
                    },
                  ]}
                  onPress={() => handleChatPress(session)}
                  disabled={!isActive}>
                  <View style={styles.chatItem}>
                    <View style={styles.chatLeft}>
                      <View style={styles.avatarContainer}>
                        <Image
                          source={{
                            uri: `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=random`,
                          }}
                          style={styles.avatar}
                        />
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                statusColors[
                                  session.status as keyof typeof statusColors
                                ],
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.chatInfo}>
                        <View style={styles.nameContainer}>
                          <Text style={styles.doctorName}>
                            {otherParticipant?.name}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  statusColors[
                                    session.status as keyof typeof statusColors
                                  ],
                              },
                            ]}>
                            <Text style={styles.statusText}>
                              {session.status}
                            </Text>
                          </View>
                          {otherParticipant?.points && (
                            <View style={styles.pointsContainer}>
                              <Icon
                                name="trophy"
                                size={14}
                                color="#F59E0B"
                                style={styles.starIcon}
                              />
                              <Text style={styles.pointsText}>
                                {otherParticipant.points}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.username}>
                          @{otherParticipant?.username}
                        </Text>
                        <Text style={styles.specialty}>
                          {otherParticipant?.user_level &&
                            capitalizeFirstLetter(otherParticipant.user_level)}
                        </Text>
                        {lastMessage && (
                          <Text style={styles.lastMessage}>
                            {lastMessage.message}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.chatRight}>
                      {lastMessage && (
                        <Text style={styles.timestamp}>
                          {new Date(lastMessage.created_at).toLocaleTimeString(
                            [],
                            {hour: '2-digit', minute: '2-digit'},
                          )}
                        </Text>
                      )}
                      {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{unreadCount}</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() => handleMorePress(session)}
                        style={styles.moreButton}>
                        <Icon
                          name="ellipsis-vertical"
                          size={20}
                          color={isActive ? '#64748B' : '#D1D5DB'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Action Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showActionModal}
        onRequestClose={() => setShowActionModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowActionModal(false)}>
          <View style={styles.actionModalContent}>
            <TouchableOpacity
              style={styles.actionModalItem}
              onPress={() => handleAction('ARCHIVE')}>
              <Icon name="archive-outline" size={20} color="#64748B" />
              <Text style={styles.actionModalText}>
                {selectedSession?.status === 'ARCHIVED'
                  ? 'Unarchive'
                  : 'Archive'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionModalItem}
              onPress={() => handleAction('BLOCK')}>
              <Icon name="ban" size={20} color="#DC2626" />
              <Text style={styles.actionModalText}>
                {selectedSession?.status === 'BLOCKED' ? 'Unblock' : 'Block'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>
              {actionType === 'BLOCK'
                ? selectedSession?.status === 'BLOCKED'
                  ? 'Unblock User?'
                  : 'Block User?'
                : selectedSession?.status === 'ARCHIVED'
                ? 'Unarchive Chat?'
                : 'Archive Chat?'}
            </Text>
            <Text style={styles.confirmModalMessage}>
              {actionType === 'BLOCK'
                ? selectedSession?.status === 'BLOCKED'
                  ? `Are you sure you want to unblock ${selectedSession?.participant2?.name}?`
                  : `Are you sure you want to block ${selectedSession?.participant2?.name}? You won't receive messages from them.`
                : selectedSession?.status === 'ARCHIVED'
                ? `Are you sure you want to unarchive this chat with ${selectedSession?.participant2?.name}?`
                : `Are you sure you want to archive this chat with ${selectedSession?.participant2?.name}?`}
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={styles.confirmModalButtonCancel}
                onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.confirmModalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmModalButtonConfirm,
                  {
                    backgroundColor:
                      actionType === 'BLOCK' ? '#DC2626' : '#64748B',
                  },
                ]}
                onPress={confirmAction}>
                <Text style={styles.confirmModalButtonConfirmText}>
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
    backgroundColor: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },
  addButton: {
    padding: 8,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    height: 30,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    height: 40,
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  chatList: {
    flex: 1,
    marginTop: 8,
  },
  chatItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderLeftWidth: 4,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 4,
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  chatLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  starIcon: {
    marginRight: 2,
  },
  pointsText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  username: {
    fontSize: 12,
    color: '#64748B',
  },
  specialty: {
    fontSize: 14,
    color: '#64748B',
    marginVertical: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
  },
  chatRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#2563EB',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  unreadText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  moreButton: {
    padding: 4,
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
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    backgroundColor: '#F8FAFC',
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '80%',
  },
  actionModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  actionModalText: {
    fontSize: 16,
    color: '#1E293B',
  },
  confirmModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmModalMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmModalButtonCancel: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmModalButtonCancelText: {
    color: '#1E293B',
    fontWeight: '500',
  },
  confirmModalButtonConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmModalButtonConfirmText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ECPRChatList;