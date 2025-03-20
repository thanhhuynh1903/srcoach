'use client';

import {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import { useNavigation } from '@react-navigation/native';
interface ScheduleCardProps {
  title: string;
  description: string;
  startDate: string;
  metrics: any[]; // You might want to define a more specific type for metrics
  days: number[];
  selectedDay: number;
  alarmEnabled: boolean;
  isExpertChoice: boolean;
}
const GenerateScheduleScreen = () => {
  const [activeTab, setActiveTab] = useState('All');
    const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedules</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['All', "Expert's Choice", 'My Schedules'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => {navigation.navigate('CalendarScreen' as never)}}>
          <Icon name="calendar-outline" size={24} color="#555" />
          <Text style={styles.actionButtonText}>Full{'\n'}Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="add-circle-outline" size={24} color="#555" />
          <Text style={styles.actionButtonText}>Add{'\n'}Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => {navigation.navigate('HistoryCalendarScreen' as never)}}>
          <Icon name="time-outline" size={24} color="#555" />
          <Text style={styles.actionButtonText}>History</Text>
        </TouchableOpacity>
      </View>
      {/* Schedule Cards */}
      <ScrollView style={styles.scrollView}>
        <ScheduleCard
          title="Spring Fitness Challenge"
          description="30-day comprehensive workout plan designed by fitness experts"
          startDate="Mar 15, 2024"
          metrics={[
            {icon: 'walk', value: '5km'},
            {icon: 'flame', value: '500kcal'},
            {icon: 'footsteps', value: '10,000'},
            {icon: 'time', value: '14:00pm'},
          ]}
          days={[15, 16, 17, 18, 19, 20, 21]}
          selectedDay={15}
          alarmEnabled={true}
          isExpertChoice={true}
        />

        <ScheduleCard
          title="Morning Cardio Routine"
          description="Personal cardio workout schedule for morning sessions"
          startDate="Mar 10, 2024"
          metrics={[
            {icon: 'walk', value: '3km'},
            {icon: 'flame', value: '300kcal'},
            {icon: 'footsteps', value: '8,000'},
            {icon: 'time', value: '13:00pm'},
          ]}
          days={[10, 11, 12, 13, 14, 15]}
          selectedDay={10}
          alarmEnabled={false}
          isExpertChoice={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const ScheduleCard = ({
  title,
  description,
  startDate,
  metrics,
  days,
  selectedDay,
  alarmEnabled,
  isExpertChoice,
}: ScheduleCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.startedText}>Started {startDate}</Text>
        {isExpertChoice && (
          <Text style={styles.expertChoiceText}>Expert's Choice</Text>
        )}
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>

      {/* Metrics */}
      <View style={styles.metricsContainer}>
        {metrics.map((metric: any, index: number) => (
          <View key={index} style={styles.metricItem}>
            <View style={styles.metricIconContainer}>
              {metric.icon === 'walk' && (
                <Icon name="walk" size={26} color="#052658" />
              )}
              {metric.icon === 'flame' && (
                <Icon name="flame-outline" size={26} color="#052658" />
              )}
              {metric.icon === 'footsteps' && (
                <Icon name="footsteps-outline" size={26} color="#052658" />
              )}
              {metric.icon === 'time' && (
                <Icon name="time-outline" size={26} color="#052658" />
              )}
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Days */}
      <View style={styles.daysContainer}>
        {days.map(day => (
          <View
            key={day}
            style={[
              styles.dayCircle,
              selectedDay === day && styles.selectedDayCircle,
            ]}>
            <Text
              style={[
                styles.dayText,
                selectedDay === day && styles.selectedDayText,
              ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <TouchableOpacity>
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>

        <View style={styles.alarmContainer}>
          <Text style={styles.alarmText}>Alarm</Text>
          <Switch
            value={alarmEnabled}
            trackColor={{false: '#E2E8F0', true: '#1E40AF'}}
            thumbColor={alarmEnabled ? '#fff' : '#fff'}
            ios_backgroundColor="#E2E8F0"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#F4F0FF',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeTabText: {
    color: '#052658',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 6,
    textAlign: 'center',
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  startedText: {
    fontSize: 12,
    color: '#64748B',
  },
  expertChoiceText: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor:"#F4F0FF",
    fontSize: 12,
    color: '#052658',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#0F172A',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 12,
    color: '#64748B',
  },
  daysContainer: {
    flexDirection: 'row',
    gap:15,
    justifyContent:"center",
    marginBottom: 16,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  selectedDayCircle: {
    backgroundColor: '#1E3A8A',
  },
  dayText: {
    fontSize: 14,
    color: '#64748B',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  alarmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
});

export default GenerateScheduleScreen;
