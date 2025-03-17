import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { LineChart } from 'react-native-chart-kit';

interface MetricCardProps {
  icon: string;
  iconColor: string;
  value: string;
  unit: string;
  label: string;
  chartColor: string;
  chartData: number[];
  chartStyle?: 'flat' | 'wave';
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

const GridCard: React.FC<MetricCardProps> = ({
  icon,
  iconColor,
  value,
  unit,
  label,
  chartColor,
  chartData,
  chartStyle = 'flat',
}) => {
  // Generate bezier curve data based on style
  const bezierData = chartStyle === 'wave' 
    ? chartData 
    : chartData.map(() => Math.max(...chartData) * 0.9); // Flatter line

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name={icon as never} size={24} color={iconColor} />
        <Text style={styles.valueText}>
          {value}<Text style={styles.unitText}>{unit}</Text>
        </Text>
      </View>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: [],
            datasets: [
              {
                data: bezierData,
              },
            ],
          }}
          width={CARD_WIDTH - 32} // Card width minus padding
          height={60}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={false}
          withVerticalLabels={false}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'white',
            backgroundGradientTo: 'white',
            decimalPlaces: 0,
            color: () => chartColor,
            style: {
              borderRadius: 16,
            },
            propsForBackgroundLines: {
              stroke: 'transparent',
            },
            propsForDots: {
              r: '0',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
      
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  chart: {
    paddingRight: 0,
    borderRadius: 16,
  },
  labelText: {
    fontSize: 16,
    color: '#64748B',
  },
});

export default GridCard;