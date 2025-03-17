import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {LineChart, BarChart} from 'react-native-chart-kit';
import {useNavigation, NavigationProp} from '@react-navigation/native';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width - 48; // Full width minus padding
const CARD_MARGIN = 8;
type RootStackParamList = {
  HeartRateScreen: undefined;
  // Add other routes as needed
};
const HealthMetricsSlider = () => {
  // Dummy data for charts
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  const heartRateData = {
    labels: ['', '', '', '', ''],
    datasets: [
      {
        data: [65, 78, 69, 90, 78.2],
      },
    ],
  };

  const sleepData = {
    labels: ['', '', '', ''],
    datasets: [
      {
        data: [65, 87, 69, 85],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Health Metrics</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast">
        {/* Heart Rate Card */}
        <TouchableOpacity
          style={[styles.card, styles.heartRateCard]}
          onPress={() => {
            navigate.navigate('HeartRateScreen');
          }}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Heart Rate</Text>
            <Icon name="heart" size={20} color="#fff" />
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={heartRateData}
              width={CARD_WIDTH - 32} // Adjust for padding
              height={100}
              chartConfig={{
                backgroundGradientFrom: '#4361EE',
                backgroundGradientTo: '#4361EE',
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                strokeWidth: 2,
                propsForBackgroundLines: {
                  stroke: 'transparent',
                },
              }}
              bezier
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withHorizontalLabels={false}
              withVerticalLabels={false}
              style={styles.chart}
            />
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.measurementLarge}>78.2</Text>
            <Text style={styles.measurementUnit}>BPM</Text>
          </View>
        </TouchableOpacity>

        {/* Blood Pressure Card */}
        <TouchableOpacity
          style={[styles.card, styles.bloodPressureCard]}
          onPress={() => {
            navigate.navigate('BloodPressureScreen' as never);
          }}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Blood Pressure</Text>
            <Icon name="water-outline" size={20} color="#fff" />
          </View>
          <View style={styles.normalContainer}>
            <Text style={styles.normalText}>NORMAL</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.measurementLarge}>120</Text>
            <Text style={styles.measurementUnit}>mmHg</Text>
          </View>
        </TouchableOpacity>

        {/* Sleep Card */}
        <TouchableOpacity
          style={[styles.card, styles.sleepCard]}
          onPress={() => {
            navigate.navigate('SleepScreen' as never);
          }}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sleep</Text>
            <Icon name="moon" size={20} color="#fff" />
          </View>
          <View style={styles.chartContainer}>
            <BarChart
              data={sleepData}
              width={CARD_WIDTH - 32} // Adjust for padding
              height={100}
              chartConfig={{
                backgroundGradientFrom: '#06B6D4',
                backgroundGradientTo: '#06B6D4',
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                barPercentage: 0.5,
                propsForBackgroundLines: {
                  stroke: 'transparent',
                },
              }}
              yAxisLabel="Hours"
              yAxisSuffix="h"
              style={styles.chart}
            />
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.measurementLarge}>87</Text>
            <Text style={styles.measurementUnit}>hrs</Text>
          </View>
        </TouchableOpacity>

        {/* Calories burned */}
        <TouchableOpacity
          style={[styles.card, styles.caloriesCard]}
          onPress={() => {
            navigate.navigate('CaloriesScreen' as never);
          }}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Calories Burned</Text>
            <Icon name="flame-outline" size={20} color="#fff" />
          </View>
          <View style={styles.chartContainer}>
            <BarChart
              data={sleepData}
              width={CARD_WIDTH - 32} // Adjust for padding
              height={100}
              chartConfig={{
                backgroundGradientFrom: '#FF6B2D',
                backgroundGradientTo: '#FF6B2D',
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                barPercentage: 0.5,
                propsForBackgroundLines: {
                  stroke: 'transparent',
                },
              }}
              yAxisLabel="Hours"
              yAxisSuffix="h"
              style={styles.chart}
            />
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.measurementLarge}>87</Text>
            <Text style={styles.measurementUnit}>hrs</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Pagination Dots */}
      {/* <View style={styles.pagination}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  seeAll: {
    fontSize: 14,
    color: '#3B82F6',
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 24,
    padding: 16,
    height: 240,
  },
  heartRateCard: {
    backgroundColor: '#4361EE',
  },
  bloodPressureCard: {
    backgroundColor: '#EF4444',
  },
  sleepCard: {
    backgroundColor: '#06B6D4',
  },
  caloriesCard: {
    backgroundColor: '#FF6B2D',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
    paddingLeft: 0,
  },
  normalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginVertical: 24,
  },
  normalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
  },
  measurementLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 4,
  },
  measurementUnit: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    backgroundColor: '#3B82F6',
  },
});

export default HealthMetricsSlider;
