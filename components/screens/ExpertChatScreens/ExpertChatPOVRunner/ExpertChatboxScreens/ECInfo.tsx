import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import ContentLoader, {Rect} from 'react-content-loader/native';
import {capitalizeFirstLetter} from '../../../../utils/utils_format';

const screenWidth = Dimensions.get('window').width;

export default function ECInfo({
  isLoading,
  otherParticipant,
  profile,
  recommendations,
  showInfoModal,
  toggleInfoModal,
  chatSessionId,
  archiveChatSession,
}: {
  isLoading: boolean;
  otherParticipant: any;
  profile: any;
  recommendations: any;
  showInfoModal: boolean;
  toggleInfoModal: () => void;
  chatSessionId: string;
  archiveChatSession: (sessionId: string) => Promise<void>;
}) {
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  useEffect(() => {
    if (showInfoModal) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [slideAnim, showInfoModal]);

  const handleArchive = async () => {
    try {
      await archiveChatSession(chatSessionId);
      setShowArchiveConfirm(false);
      toggleInfoModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to archive conversation');
    }
  };

  return (
    <>
      <Modal
        visible={showInfoModal}
        transparent
        animationType="none"
        onRequestClose={toggleInfoModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleInfoModal}>
          <Animated.View
            style={[styles.infoModal, {transform: [{translateX: slideAnim}]}]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Expert Information</Text>
              <TouchableOpacity onPress={toggleInfoModal}>
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.userInfoContainer}>
                <Image
                  source={{
                    uri: 'https://api.randomuser.me/portraits/lego/1.jpg',
                  }}
                  style={styles.avatar}
                />
                <Text style={styles.userName}>{otherParticipant?.name}</Text>
                <Text style={styles.userUsername}>
                  @{otherParticipant?.username}
                </Text>
                <View style={styles.userLevelContainer}>
                  <Icon
                    name={'star'}
                    size={20}
                    color="#F59E0B"
                    style={styles.rankIcon}
                  />
                  <Text style={styles.userLevel}>
                    {capitalizeFirstLetter(otherParticipant?.user_level || '')}
                  </Text>
                  <Text style={styles.userPoints}>
                    {otherParticipant?.points} pts
                  </Text>
                </View>
              </View>

              {/* User Profile Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Your Profile</Text>
                {isLoading ? (
                  <ContentLoader
                    speed={1}
                    width="100%"
                    height={100}
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb">
                    <Rect x="0" y="0" rx="4" ry="4" width="100%" height="20" />
                    <Rect x="0" y="30" rx="4" ry="4" width="100%" height="20" />
                    <Rect x="0" y="60" rx="4" ry="4" width="100%" height="20" />
                  </ContentLoader>
                ) : profile ? (
                  <View style={styles.profileInfo}>
                    <View style={styles.profileRow}>
                      <Text style={styles.profileLabel}>Height:</Text>
                      <Text style={styles.profileValue}>
                        {profile.height} cm
                      </Text>
                    </View>
                    <View style={styles.profileRow}>
                      <Text style={styles.profileLabel}>Weight:</Text>
                      <Text style={styles.profileValue}>
                        {profile.weight} kg
                      </Text>
                    </View>
                    <View style={styles.profileRow}>
                      <Text style={styles.profileLabel}>Age:</Text>
                      <Text style={styles.profileValue}>{profile.age}</Text>
                    </View>
                    <View style={styles.profileRow}>
                      <Text style={styles.profileLabel}>Running Level:</Text>
                      <Text style={styles.profileValue}>
                        {profile.runningLevel}
                      </Text>
                    </View>
                    <View style={styles.profileRow}>
                      <Text style={styles.profileLabel}>Goal:</Text>
                      <Text style={styles.profileValue}>{profile.goal}</Text>
                    </View>
                    <View style={styles.profileRow}>
                      <Text style={styles.profileLabel}>Weekly Distance:</Text>
                      <Text style={styles.profileValue}>
                        {profile.weeklyDistance} km
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.noDataText}>
                    No profile information available
                  </Text>
                )}
              </View>

              {/* Expert Recommendations Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Expert Recommendations</Text>
                {isLoading ? (
                  <ContentLoader
                    speed={1}
                    width="100%"
                    height={100}
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb">
                    <Rect x="0" y="0" rx="4" ry="4" width="100%" height="20" />
                    <Rect x="0" y="30" rx="4" ry="4" width="100%" height="20" />
                    <Rect x="0" y="60" rx="4" ry="4" width="100%" height="20" />
                  </ContentLoader>
                ) : recommendations.length > 0 ? (
                  recommendations.map(rec => (
                    <View key={rec.id} style={styles.recommendationItem}>
                      <Text style={styles.recommendationText}>
                        {rec.message}
                      </Text>
                      <Text style={styles.recommendationDate}>
                        {new Date(rec.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>
                    No recommendations yet from the expert
                  </Text>
                )}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.archiveButton}
              onPress={() => setShowArchiveConfirm(true)}>
              <Icon name="archive" size={20} color="#FFFFFF" />
              <Text style={styles.archiveButtonText}>
                Archive this conversation
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        visible={showArchiveConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowArchiveConfirm(false)}>
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmModalTitle}>Archive Conversation</Text>
            <Text style={styles.confirmModalText}>
              Are you sure you want to archive this conversation? You can always
              unarchive it later.
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowArchiveConfirm(false)}>
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.archiveConfirmButton]}
                onPress={handleArchive}>
                <Text style={styles.confirmButtonText}>Archive</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoModal: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: 'white',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalContent: {
    flex: 1,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  userUsername: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  userLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankIcon: {
    marginRight: 4,
  },
  userLevel: {
    fontSize: 14,
    color: '#64748B',
  },
  userPoints: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  profileInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  profileLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  noDataText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    padding: 16,
  },
  recommendationItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  recommendationDate: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  archiveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  confirmModalText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    color: '#000000',
  },
  archiveConfirmButton: {
    backgroundColor: '#EF4444',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
