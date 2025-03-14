import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import Icon from '@react-native-vector-icons/ionicons';
import ScreenWrapper from '../ScreenWrapper';
import BackButton from '../BackButton';
const {width} = Dimensions.get('window');
const PADDING = 16;
const CARD_GAP = 8;
const CONTENT_WIDTH = width - PADDING * 4;

const StatCard = ({
  title,
  value,
  total,
  color,
  subtitle,
  style,
}: {
  title: string;
  value: string;
  total?: string;
  color: string;
  subtitle?: string;
  style?: object;
}) => (
  <View style={[styles.statCard, {backgroundColor: color}, style]}>
    <Text style={styles.statTitle}>{title}</Text>
    <View style={styles.statValues}>
      <Text style={styles.statValue}>{value}</Text>
      {total && <Text style={styles.statTotal}>/{total}</Text>}
    </View>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

const MetricCard = ({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) => (
  <View style={styles.metricCard}>
    <Icon name={icon as any} size={25} color={color} />
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricSubtitle}>{subtitle}</Text>
  </View>
);

const ChartDetailScreen = () => {
  const [activePeriod, setActivePeriod] = useState('Week');
  const [activeMetric, setActiveTric] = useState('Weight');

  const data = [
    {value: 45, label: 'Mon'},
    {value: 70, label: 'Tue'},
    {value: 50, label: 'Wed'},
    {value: 72, label: 'Thu'},
    {value: 30, label: 'Fri'},
    {value: 74, label: 'Sat'},
    {value: 71, label: 'Sun'},
  ];

  return (
    <ScreenWrapper bg={'#FFF'}>
      <ScrollView style={styles.scrollView}>
        <View
          style={{
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF',
            paddingBottom: 16,
          }}>
          <BackButton size={26} />
          <Text style={{fontSize: 18, fontWeight: '600', marginLeft: 8}}>
            Home
          </Text>
        </View>
        {/* Top Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.topRow}>
            <StatCard
              title="Steps"
              value="8,439"
              total="10,000"
              color="#3B82F6"
              style={styles.stepsCard}
            />
            <StatCard
              title="Calories"
              value="1,842"
              total="2,200"
              color="#F87171"
              style={styles.caloriesCard}
            />
          </View>
          <StatCard
            title="Avg Steps"
            value="9,234"
            subtitle="+5.2% vs last week"
            color="#4ADE80"
            style={styles.avgStepsCard}
          />
        </View>

        {/* Highlights Section */}
        <View style={styles.highlightsSection}>
          <View style={styles.sectionHeader}>
            <Icon name="heart-circle-outline" size={30} color="#1E293B" />
            <Text style={styles.sectionTitle}>Highlights</Text>
          </View>
          <View style={{backgroundColor: '#FFF', borderRadius: 20}}>
            {/* Period Toggle */}
            <View style={styles.periodToggle}>
              {['Daily', 'Week', 'Month', 'Year'].map(period => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setActivePeriod(period)}
                  style={[
                    styles.periodButton,
                    period === activePeriod
                      ? styles.periodButtonActive
                      : styles.periodButtonDisActive,
                  ]}>
                  <Text
                    style={[
                      styles.periodButtonText,
                      period === activePeriod
                        ? styles.periodButtonTextActive
                        : styles.periodButtonTextDisActive,
                    ]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Line Chart */}
            <View style={styles.chartContainer}>
              <LineChart
                data={data}
                width={CONTENT_WIDTH}
                height={250} // Adjusted height
                isAnimated
                hideRules
                hideYAxisText
                areaChart
                yAxisThickness={0}
                xAxisThickness={0}
                color="#052658"
                startFillColor="#052658"
                endFillColor="#FFFFFF"
                startOpacity={0.8}
                endOpacity={0.2}
                spacing={CONTENT_WIDTH / (data.length - 1)}
                initialSpacing={2} // Adjusted initial spacing
                noOfSections={4}
                maxValue={80}
         
                style={{ marginVertical: 10 }} // Adjusted margin
              />
            </View>

            {/* Metric Toggle */}
            <View style={styles.metricToggle}>
              {['Weight', 'Calories', 'Blood Pressure'].map(metric => (
                <TouchableOpacity
                  key={metric}
                  onPress={() => setActiveTric(metric)}
                  style={[
                    styles.periodButton,
                    metric === activeMetric
                      ? styles.periodButtonActive
                      : styles.periodButtonDisActive,
                  ]}>
                  <Text
                    style={[
                      styles.periodButtonText,
                      metric === activeMetric
                        ? styles.periodButtonTextActive
                        : styles.periodButtonTextDisActive,
                    ]}>
                    {metric}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <MetricCard
              icon="moon"
              title="Sleep"
              value="7h 23m"
              subtitle="Deep sleep: 2h 45m"
              color="#2C62FF"
            />
            <MetricCard
              icon="heart-outline"
              title="Heart Rate"
              value="72 bpm"
              subtitle="Resting: 65 bpm"
              color="#FF6B6B"
            />
          </View>
          <View style={styles.metricsRow}>
            <MetricCard
              icon="grid-outline"
              title="Mindfulness"
              value="15 min"
              subtitle="Today's session"
              color="#4ECB71"
            />
            <MetricCard
              icon="water-outline"
              title="Water"
              value="1.2L"
              subtitle="Goal: 2.5L"
              color="#2C62FF"
            />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    backgroundColor: '#edf3fc',
    flex: 1,
  },
  statsContainer: {
    padding: 16,
    gap: CARD_GAP,
  },
  topRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  stepsCard: {
    flex: 3,
  },
  caloriesCard: {
    flex: 2,
  },
  avgStepsCard: {
    width: '100%',
  },
  statCard: {
    padding: 16,
    borderRadius: 16,
  },
  statTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statTotal: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginLeft: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
  },
  highlightsSection: {
    padding: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  periodToggle: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 8,
    marginBottom: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  periodButtonActive: {
    backgroundColor: '#052658',
  },
  periodButtonDisActive: {
    backgroundColor: '#F3F4F6',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  periodButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  periodButtonTextDisActive: {
    color: '#000',
    fontWeight: '600',
  },
  chartContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 0,
  },
  metricToggle: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  metricButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  metricButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  metricsGrid: {
    padding: 16,
    gap: CARD_GAP,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    gap: 4,
  },
  metricTitle: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 8,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1E293B',
  },
  metricSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
});

export default ChartDetailScreen;
