import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

interface ECProfileProps {
  showProfileModal: boolean;
  toggleProfileModal: () => void;
  profileSlideAnim: Animated.Value;
  onSubmit: (profileData: {
    height?: number;
    weight?: number;
    age?: number;
    runningLevel?: string;
    goal?: string;
    weeklyDistance?: number;
  }) => Promise<void>;
  initialProfileData?: {
    height?: number;
    weight?: number;
    age?: number;
    runningLevel?: string;
    goal?: string;
    weeklyDistance?: number;
  };
}

const ECProfile: React.FC<ECProfileProps> = ({
  showProfileModal,
  toggleProfileModal,
  profileSlideAnim,
  onSubmit,
  initialProfileData = {
    height: '',
    weight: '',
    age: '',
    runningLevel: '',
    goal: '',
    weeklyDistance: '',
  },
}) => {
  const [profileData, setProfileData] = useState(initialProfileData);
  const [isLoading, setIsLoading] = useState(false);

  const profileModalTranslateY = profileSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit(profileData);
      toggleProfileModal();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={showProfileModal}
      transparent
      animationType="none"
      onRequestClose={toggleProfileModal}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={toggleProfileModal}>
        <Animated.View
          style={[
            styles.profileModal,
            {transform: [{translateY: profileModalTranslateY}]},
          ]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Runner Profile</Text>
            <TouchableOpacity onPress={toggleProfileModal}>
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.profileModalContent}>
            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="170"
                  keyboardType="numeric"
                  value={profileData.height}
                  onChangeText={text =>
                    setProfileData({...profileData, height: text})
                  }
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="65"
                  keyboardType="numeric"
                  value={profileData.weight}
                  onChangeText={text =>
                    setProfileData({...profileData, weight: text})
                  }
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="30"
                  keyboardType="numeric"
                  value={profileData.age}
                  onChangeText={text =>
                    setProfileData({...profileData, age: text})
                  }
                />
              </View>
            </View>

            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>Running Profile</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Running Level</Text>
                <View style={styles.optionRow}>
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.optionButton,
                        profileData.runningLevel === level &&
                          styles.selectedOption,
                      ]}
                      onPress={() =>
                        setProfileData({...profileData, runningLevel: level})
                      }>
                      <Text
                        style={[
                          styles.optionText,
                          profileData.runningLevel === level &&
                            styles.selectedOptionText,
                        ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weekly Distance (km)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="20"
                  keyboardType="numeric"
                  value={profileData.weeklyDistance}
                  onChangeText={text =>
                    setProfileData({...profileData, weeklyDistance: text})
                  }
                />
              </View>
            </View>

            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>Goals</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Primary Goal</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  placeholder="Example: Run a sub-25 minute 5k by end of year"
                  multiline
                  numberOfLines={3}
                  value={profileData.goal}
                  onChangeText={text =>
                    setProfileData({...profileData, goal: text})
                  }
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Save Profile</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  profileModal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
    maxHeight: '90%',
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
  profileModalContent: {
    paddingBottom: 20,
  },
  profileSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  optionButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#2563EB',
  },
  optionText: {
    fontSize: 14,
    color: '#64748B',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ECProfile;