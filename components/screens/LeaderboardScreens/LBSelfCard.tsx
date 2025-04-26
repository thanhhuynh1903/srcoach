import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '@react-native-vector-icons/ionicons';
import {CommonAvatar} from '../../commons/CommonAvatar';
import {theme} from '../../contants/theme';
import {capitalizeFirstLetter} from '../../utils/utils_format';

interface LBSelfCardProps {
  profile: any;
  pointsData: any;
  profileRank: number;
}

export const LBSelfCard = ({profile, pointsData, profileRank}: LBSelfCardProps) => {
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <CommonAvatar uri={profile?.image?.url || undefined} size={64} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.name || 'Anonymous'}</Text>
          <Text style={styles.profileUsername}>
            @{profile?.username || 'anonymous'}
          </Text>
          <View style={styles.rankContainer}>
            <Icon name="stats-chart" size={16} color="#fff" />
            <Text style={styles.rankText}>Rank #{profileRank || '--'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Icon name="trophy" size={20} color={'#FFF'} />
          </View>
          <Text style={styles.statValue}>
            {pointsData?.points?.toLocaleString() || '0'} pts
          </Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Icon name="star" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.statValue}>
            Level: {capitalizeFirstLetter(pointsData?.level || 'Unknown')}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${pointsData?.pointsPercentage || 0}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {pointsData?.pointsToNextLevel || 0} pts to rank up to next level
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 20,
    padding: 24,
    margin: 16,
    marginTop: 8,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 1,
  },
  profileUsername: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 5,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
});