import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import {theme} from '../../../contants/theme';
import {capitalizeFirstLetter} from '../../../utils/utils_format';
import BackButton from '../../../BackButton';
import CommonDialog from '../../../commons/CommonDialog';

type OtherUser = {
  id: string;
  name: string;
  username: string;
  image?: {url: string};
  roles?: string[];
  points?: number;
  user_level?: string;
};

type CMSHeaderProps = {
  profile: any;
  otherUser: OtherUser | null;
  onBackPress: () => void;
  onSearchPress: () => void;
  onInfoPress: () => void;
};

export const CMSHeader = ({
  profile,
  otherUser,
  onBackPress,
  onSearchPress,
  onInfoPress,
}: CMSHeaderProps) => {
  const [showExpertInfo, setShowExpertInfo] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const isChattingWithExpert = 
    profile?.roles && 
    !profile.roles.includes('expert') && 
    otherUser?.roles?.includes('expert');

  React.useEffect(() => {
    if (isChattingWithExpert) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isChattingWithExpert]);

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFACD', '#FFEB3B'],
  });

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <BackButton size={20} />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <CommonAvatar
            size={40}
            uri={otherUser?.image?.url}
            mode={otherUser?.roles?.includes('expert') ? 'expert' : 'runner'}
          />

          <View style={styles.userDetails}>
            <View style={styles.userMainInfo}>
              <Text style={styles.userName}>{otherUser?.name}</Text>
              <Text style={styles.userUsername}>@{otherUser?.username}</Text>
            </View>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Icon name="trophy" size={14} color="#FFD700" />
                <Text style={styles.statText}>{otherUser?.points} pts</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="medal" size={14} color="#FFD700" />
                <Text style={styles.statText}>
                  {capitalizeFirstLetter(otherUser?.user_level)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onSearchPress} style={styles.actionButton}>
            <Icon name="search" size={20} color={theme.colors.primaryDark} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onInfoPress} style={styles.actionButton}>
            <Icon name="information-circle" size={20} color={theme.colors.primaryDark} />
          </TouchableOpacity>
        </View>
      </View>

      {isChattingWithExpert && (
        <Animated.View style={[styles.expertBanner, { backgroundColor }]}>
          <Text style={styles.expertBannerText}>You are chatting with an Expert</Text>
          <TouchableOpacity 
            onPress={() => setShowExpertInfo(true)}
            style={styles.expertInfoButton}
          >
            <Icon name="information-circle" size={18} color="#000" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <CommonDialog
        visible={showExpertInfo}
        onClose={() => setShowExpertInfo(false)}
        title="Expert Runner Benefits"
        content={
          <View>
            <Text style={styles.dialogText}>
              Our Expert Runners can provide you with:
            </Text>
            <Text style={styles.dialogText}>
              • Professional running advice and training plans
            </Text>
            <Text style={styles.dialogText}>
              • Personalized tips to improve your performance
            </Text>
            <Text style={styles.dialogText}>
              • Answers to your running-related questions
            </Text>
            <Text style={styles.dialogText}>
              • Motivation and guidance for your running journey
            </Text>
          </View>
        }
        actionButtons={[
          {
            label: 'Got it',
            variant: 'contained',
            handler: () => setShowExpertInfo(false),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  userDetails: {
    flex: 1,
    marginLeft: 10,
  },
  userMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  expertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFACD',
  },
  expertBannerText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  expertInfoButton: {
    marginLeft: 8,
  },
  dialogText: {
    fontSize: 14,
    marginBottom: 8,
  },
});