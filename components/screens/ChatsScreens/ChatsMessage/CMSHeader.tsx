import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import {theme} from '../../../contants/theme';
import {capitalizeFirstLetter} from '../../../utils/utils_format';
import BackButton from '../../../BackButton';

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
  otherUser: OtherUser | null;
  onBackPress: () => void;
  onSearchPress: () => void;
  onInfoPress: () => void;
};

export const CMSHeader = ({
  otherUser,
  onBackPress,
  onSearchPress,
  onInfoPress,
}: CMSHeaderProps) => {
  return (
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
              <Text style={styles.statText}>{otherUser?.points}</Text>
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
});