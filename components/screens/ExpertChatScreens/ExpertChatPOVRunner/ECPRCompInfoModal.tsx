import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

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

type ECPRCompInfoModalProps = {
  visible: boolean;
  onClose: () => void;
  sessionData: ChatSession;
  lastProfile: Message | null;
  lastRecommendation: Message | null;
};

const ECPRCompInfoModal = ({
  visible,
  onClose,
  sessionData,
  lastProfile,
  lastRecommendation,
}: ECPRCompInfoModalProps) => {
  if (!visible) return null;

  return (
    <Pressable style={styles.drawerOverlay} onPress={onClose}>
      <Pressable style={[styles.infoDrawer]}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>User Information</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.drawerContent}>
          <View style={styles.userProfile}>
            <View style={styles.drawerAvatarPlaceholder}>
              <Icon name="person" size={48} color="#fff" />
            </View>
            <Text style={styles.drawerUserName}>{sessionData.participant2.name}</Text>
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
              <Text style={styles.sectionTitle}>Recent Expert Recommendation</Text>
              {lastRecommendation ? (
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Icon name="ribbon" size={16} color="#FFC107" />
                    <Text style={styles.infoCardTitle}>Expert Recommendation</Text>
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
  );
};

const styles = StyleSheet.create({
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoDrawer: {
    width: '85%',
    backgroundColor: '#fff',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 5,
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
});

export default ECPRCompInfoModal;