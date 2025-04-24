import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../contants/theme';

type CommonAvatarProps = {
  mode?: 'runner' | 'expert' | null;
  size?: number;
  uri?: string;
};

export const CommonAvatar = ({mode , size = 36, uri}: CommonAvatarProps) => {
  const badgeSize = size * 0.4;
  return (
    <View style={styles.avatarContainer}>
      {uri ? (
        <Image
          source={{uri}}
          style={[
            styles.avatarImage,
            {width: size, height: size, borderRadius: size / 2},
          ]}
        />
      ) : (
        <View
          style={[
            styles.avatarPlaceholder,
            {width: size, height: size, borderRadius: size / 2},
          ]}>
          <Icon name="person" size={size * 0.55} color="white" />
        </View>
      )}
      {mode === 'expert' && (
        <View
          style={[
            styles.roleBadge,
            styles.expertBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              right: -2,
              bottom: -2,
            },
          ]}>
          <Icon name="trophy" size={badgeSize * 0.5} color="white" />
        </View>
      )}
      {mode === 'runner' && (
        <View
          style={[
            styles.roleBadge,
            styles.runnerBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              right: -2,
              bottom: -2,
            },
          ]}>
          <Icon name="footsteps" size={badgeSize * 0.5} color="white" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    backgroundColor: '#f0f0f0',
  },
  roleBadge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  runnerBadge: {
    backgroundColor: theme.colors.success,
  },
  expertBadge: {
    backgroundColor: theme.colors.warning,
  },
});
