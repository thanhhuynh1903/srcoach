import React from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.35;
const CARD_MARGIN = 10;

interface MetricCardProps {
  icon: string;
  iconColor: string;
  circleColor: string;
  value: string;
  label: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  iconColor,
  circleColor,
  value,
  label,
}) => {
  return (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}>
        <Icon name={icon as never} size={24} color={iconColor} />
        <View style={[styles.circle, {borderColor: circleColor}]} />
      </View>
      <View style={{flex:1, justifyContent: 'flex-start', alignItems: 'flex-start',width:"100%"}}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

interface MetricsSliderProps {
  metrics: Array<{
    id: string;
    icon: string;
    iconColor: string;
    circleColor: string;
    value: string;
    label: string;
  }>;
}

const SlideCard: React.FC<MetricsSliderProps> = ({metrics}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {metrics.map(metric => (
        <MetricCard
          key={metric.id}
          icon={metric.icon}
          iconColor={metric.iconColor}
          circleColor={metric.circleColor}
          value={metric.value}
          label={metric.label}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: CARD_MARGIN,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    alignItems: 'center',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    marginVertical: 12,
  },
  value: {
    textAlign: 'left',
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    color: '#64748B',
  },
});

export default SlideCard;
