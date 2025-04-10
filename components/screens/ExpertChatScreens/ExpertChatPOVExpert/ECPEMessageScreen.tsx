import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import useChatsAPI from '../../../utils/useChatsAPI';
import {useLoginStore} from '../../../utils/useLoginStore';
import ECPRCompMessage from './ECPECompMessage';

const {height, width} = Dimensions.get('window');

type User = {
  id: string;
  name: string;
  username: string;
  is_expert: boolean;
  points: number;
  user_level: string;
};

type Message = {
  id: string;
  type: 'MESSAGE' | 'EXPERT_RECOMMENDATION' | 'PROFILE';
  message?: string;
  created_at: string;
  user_id?: string;
  expert_id?: string;
  weight?: number;
  height?: number;
  running_level?: string;
  running_goal?: string;
  User?: User;
};

type ChatSession = {
  participant1: User;
  participant2: User;
};

const runningLevels = ['Beginner', 'Intermediate', 'Advanced', 'Tournament'];

const ECPEMessageScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {sessionId} = route.params;
  const {profile} = useLoginStore();
  const user = profile;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [infoDrawerVisible, setInfoDrawerVisible] = useState(false);
  const [profileActionModalVisible, setProfileActionModalVisible] =
    useState(false);
  const [profileFormModalVisible, setProfileFormModalVisible] = useState(false);
  const [profileData, setProfileData] = useState<Partial<Message> | null>(null);
  const [sessionData, setSessionData] = useState<ChatSession | null>(null);
  const [lastProfile, setLastProfile] = useState<Message | null>(null);
  const [lastRecommendation, setLastRecommendation] = useState<Message | null>(
    null,
  );
  const flatListRef = useRef<FlatList>(null);

  const {getMessages, sendMessage, sendProfile} = useChatsAPI();

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }

    // Find last profile and recommendation
    const profileMessages = messages.filter(m => m.type === 'PROFILE');
    const recommendationMessages = messages.filter(
      m => m.type === 'EXPERT_RECOMMENDATION',
    );

    if (profileMessages.length > 0) {
      setLastProfile(profileMessages[profileMessages.length - 1]);
    }

    if (recommendationMessages.length > 0) {
      setLastRecommendation(
        recommendationMessages[recommendationMessages.length - 1],
      );
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const result = await getMessages(sessionId, user?.id || '');
      if (result.status && result.data) {
        setMessages(result.data.messages);
        setSessionData({
          participant1: result.data.participant1,
          participant2: result.data.participant2,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load messages',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const result = await sendMessage(sessionId, newMessage);
    if (result.status && result.data) {
      setNewMessage('');
      loadMessages();
    }
  };

  const handleSendProfile = async () => {
    if (!profileData) return;

    const result = await sendProfile(sessionId, {
      weight: profileData.weight,
      height: profileData.height,
      running_level: profileData.running_level,
      running_goal: profileData.running_goal,
    });

    if (result.status) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated',
      });
      setProfileFormModalVisible(false);
      setProfileActionModalVisible(false);
      loadMessages();
    }
  };

  const renderMessageItem = ({item}: {item: Message}) => {
    const isCurrentUser = item.user_id === user?.id;
    return <ECPRCompMessage item={item} isCurrentUser={isCurrentUser} />;
  };

  if (loading || !sessionData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B7BE5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => setInfoDrawerVisible(true)}>
          <View style={styles.avatarPlaceholder}>
            <Icon name="person" size={20} color="#fff" />
          </View>
          <View style={styles.userText}>
            <Text style={styles.userName}>{sessionData.participant2.name}</Text>
            <View style={styles.userStats}>
              <Icon name="trophy" size={16} color="#FFD700" />
              <Text style={styles.userStatText}>
                {sessionData.participant2.user_level} (
                {sessionData.participant2.points} pts)
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="search" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setInfoDrawerVisible(true)}>
            <Icon name="information-circle" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({animated: true})
        }
        onLayout={() => flatListRef.current?.scrollToEnd({animated: true})}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setProfileActionModalVisible(true)}>
          <Icon name="add" size={24} color="#4B7BE5" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          placeholderTextColor="#999"
          multiline
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}>
          <Icon
            name="send"
            size={24}
            color={newMessage.trim() ? '#4B7BE5' : '#ccc'}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Action Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileActionModalVisible}
        onRequestClose={() => setProfileActionModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setProfileActionModalVisible(false)}>
          <Pressable style={styles.actionModal}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setProfileActionModalVisible(false);
                setProfileFormModalVisible(true);
              }}>
              <Text style={styles.actionButtonText}>Submit Profile</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Profile Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileFormModalVisible}
        onRequestClose={() => setProfileFormModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setProfileFormModalVisible(false)}>
          <Pressable style={styles.formModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Profile</Text>
              <TouchableOpacity
                onPress={() => setProfileFormModalVisible(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <TextInput
                style={styles.formInput}
                placeholder="Weight (kg)"
                keyboardType="numeric"
                onChangeText={text =>
                  setProfileData(prev => ({
                    ...prev,
                    weight: text ? Number(text) : undefined,
                  }))
                }
                value={profileData?.weight?.toString() || ''}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Height (cm)"
                keyboardType="numeric"
                onChangeText={text =>
                  setProfileData(prev => ({
                    ...prev,
                    height: text ? Number(text) : undefined,
                  }))
                }
                value={profileData?.height?.toString() || ''}
              />

              <View style={styles.levelContainer}>
                <Text style={styles.levelLabel}>Running Level:</Text>
                <View style={styles.levelOptions}>
                  {runningLevels.map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.levelOption,
                        profileData?.running_level === level &&
                          styles.levelOptionSelected,
                      ]}
                      onPress={() =>
                        setProfileData(prev => ({
                          ...prev,
                          running_level: level,
                        }))
                      }>
                      <Text
                        style={[
                          styles.levelOptionText,
                          profileData?.running_level === level &&
                            styles.levelOptionTextSelected,
                        ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                style={styles.formInput}
                placeholder="Running Goal"
                onChangeText={text =>
                  setProfileData(prev => ({
                    ...prev,
                    running_goal: text,
                  }))
                }
                value={profileData?.running_goal || ''}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSendProfile}>
                <Text style={styles.submitButtonText}>Update Profile</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Info Drawer */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={infoDrawerVisible}
        onRequestClose={() => setInfoDrawerVisible(false)}>
        <Pressable
          style={styles.drawerOverlay}
          onPress={() => setInfoDrawerVisible(false)}>
          <Pressable style={[styles.infoDrawer, {height}]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>User Information</Text>
              <TouchableOpacity onPress={() => setInfoDrawerVisible(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.drawerContent}>
              <View style={styles.userProfile}>
                <View style={styles.drawerAvatarPlaceholder}>
                  <Icon name="person" size={48} color="#fff" />
                </View>
                <Text style={styles.drawerUserName}>
                  {sessionData.participant2.name}
                </Text>
                <Text style={styles.drawerUserUsername}>
                  @{sessionData.participant2.username}
                </Text>

                <View style={styles.userStatsContainer}>
                  <View style={styles.statItem}>
                    <Icon name="trophy" size={24} color="#FFD700" />
                    <View>
                      <Text style={styles.statLabel}>Rank</Text>
                      <Text style={styles.statValue}>
                        {sessionData.participant2.user_level}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statItem}>
                    <Icon name="star" size={24} color="#4B7BE5" />
                    <View>
                      <Text style={styles.statLabel}>Points</Text>
                      <Text style={styles.statValue}>
                        {sessionData.participant2.points}
                      </Text>
                    </View>
                  </View>

                  {sessionData.participant2.is_expert && (
                    <View style={styles.statItem}>
                      <Icon name="ribbon" size={24} color="#FFC107" />
                      <View>
                        <Text style={styles.statLabel}>Status</Text>
                        <Text style={styles.statValue}>Expert</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Latest Profile Section */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Latest Profile</Text>
                  {lastProfile ? (
                    <View style={styles.infoCard}>
                      <View style={styles.infoCardHeader}>
                        <Icon name="person-circle" size={16} color="#4CAF50" />
                        <Text style={styles.infoCardTitle}>Profile Update</Text>
                      </View>
                      <View style={styles.infoCardContent}>
                        {lastProfile.weight && (
                          <Text style={styles.infoCardText}>
                            Weight: {lastProfile.weight} kg
                          </Text>
                        )}
                        {lastProfile.height && (
                          <Text style={styles.infoCardText}>
                            Height: {lastProfile.height} cm
                          </Text>
                        )}
                        {lastProfile.running_level && (
                          <Text style={styles.infoCardText}>
                            Level: {lastProfile.running_level}
                          </Text>
                        )}
                        {lastProfile.running_goal && (
                          <Text style={styles.infoCardText}>
                            Goal: {lastProfile.running_goal}
                          </Text>
                        )}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.noInfoText}>
                      No profile information available
                    </Text>
                  )}
                </View>

                {/* Recent Recommendations Section */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>
                    Recent Expert Recommendation
                  </Text>
                  {lastRecommendation ? (
                    <View style={styles.infoCard}>
                      <View style={styles.infoCardHeader}>
                        <Icon name="ribbon" size={16} color="#FFC107" />
                        <Text style={styles.infoCardTitle}>
                          Expert Recommendation
                        </Text>
                      </View>
                      <View style={styles.infoCardContent}>
                        <Text style={styles.infoCardText}>
                          {lastRecommendation.message}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.noInfoText}>
                      No expert recommendations yet
                    </Text>
                  )}
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
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
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  userStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  profileButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    color: '#333',
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#4B7BE5',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
  },
  // Drawer Styles
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoDrawer: {
    width: width * 0.85,
    backgroundColor: '#fff',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  userProfile: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  drawerAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4B7BE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  drawerUserName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  drawerUserUsername: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  userStatsContainer: {
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    marginTop: 2,
  },
  infoSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B7BE5',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  infoCardContent: {
    paddingLeft: 24,
  },
  infoCardText: {
    marginBottom: 4,
  },
  noInfoText: {
    color: '#666',
    fontStyle: 'italic',
  },
  // Form Styles
  formInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  levelContainer: {
    marginBottom: 16,
  },
  levelLabel: {
    marginBottom: 8,
    fontSize: 16,
    color: '#666',
  },
  levelOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  levelOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 4,
  },
  levelOptionSelected: {
    backgroundColor: '#4B7BE5',
    borderColor: '#4B7BE5',
  },
  levelOptionText: {
    color: '#333',
  },
  levelOptionTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4B7BE5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ECPEMessageScreen;
