import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import Animated, {Layout} from 'react-native-reanimated';

interface HomeHealthMetricCardInfoProps {
  metric: string;
  value: string;
  label: string;
  percentage: string;
  iconName: string;
  iconColor: string;
  backgroundColor: string;
  percentageColor: string;
  onPress: () => void;
  onInfoPress: () => void;
  error?: boolean;
}

const HomeHealthMetricCardInfo: React.FC<HomeHealthMetricCardInfoProps> = ({
  metric,
  value,
  label,
  percentage,
  iconName,
  iconColor,
  backgroundColor,
  percentageColor,
  onPress,
  onInfoPress,
  error = false,
}) => {
  if (error) {
    return (
      <View style={[styles.healthMetricCard, {backgroundColor: '#F8FAFC'}]}>
        <Icon name="warning" size={20} color="#64748B" />
        <Text style={[styles.healthMetricValue, {color: '#64748B'}]}>--</Text>
        <Text style={styles.healthMetricLabel}>{label}</Text>
        <Text style={[styles.healthMetricPercentage, {color: '#64748B'}]}>
          Error
        </Text>
      </View>
    );
  }

  return (
    <Animated.View layout={Layout.springify()}>
      <TouchableOpacity
        style={[styles.healthMetricCard, {backgroundColor}]}
        onPress={onPress}>
        <View style={styles.metricHeader}>
          <Icon name={iconName} size={20} color={iconColor} />
          <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
            <Icon name="information-circle-outline" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
        <Text style={styles.healthMetricValue}>{value}</Text>
        <Text style={styles.healthMetricLabel}>{label}</Text>
        <Text style={[styles.healthMetricPercentage, {color: percentageColor}]}>
          {percentage}%
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  healthMetricCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    marginLeft: 4,
  },
  healthMetricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginVertical: 8,
  },
  healthMetricLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  healthMetricPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeHealthMetricCardInfo;
