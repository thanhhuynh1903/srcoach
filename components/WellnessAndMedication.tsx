import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import imageexpert from '../components/assets/2runner.png';
import { useNavigation } from '@react-navigation/native';

const WellnessAndMedication = () => {
  // Generate calendar data
  const generateCalendarData = () => {
    return Array(35)
      .fill(null)
      .map((_, i) => {
        if (i < 9) return 'taken';
        if (i >= 9 && i < 12) return 'missed';
        return 'skipped';
      });
  };
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Wellness AI Chatbot */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Wellness Expert Contact</Text>
          <TouchableOpacity>
            <Icon name="help-circle" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.chatbotCard}>
          <View style={styles.basicBadge}>
            <Text style={styles.basicText}>BASIC</Text>
          </View>

          <View style={styles.chatbotContent}>
            <View style={{width: '48%'}}>
              <Text style={styles.totalNumber}>
                1,922 <Text style={styles.totalLabel}> Total</Text>
              </Text>

              <Text style={styles.chatbotDescription}>
                Good Schedule{'\n'}Good heart rate{'\n'}Search Expert to contact
              </Text>
            </View>

            <Image source={imageexpert} style={styles.robotImage} />
          </View>

          <TouchableOpacity style={styles.addButton}>
            <Icon name="chatbubbles-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Medication Management */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medication Management</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.medicationCard}>
          <View style={styles.medicationHeader}>
            <View>
              <Text style={styles.medicationNumber}>205</Text>
              <Text style={styles.medicationLabel}>Medications</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => {navigation.navigate('SetGoalsScreen' as never);}}>
              <Icon name="add-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendar}>
            {generateCalendarData().map((status, index) => (
              <View
                key={index}
                style={[
                  styles.calendarDay,
                  status === 'taken' && styles.dayTaken,
                  status === 'missed' && styles.dayMissed,
                  status === 'skipped' && styles.daySkipped,
                ]}
              />
            ))}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendTaken]} />
              <Text style={styles.legendText}>Taken</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendMissed]} />
              <Text style={styles.legendText}>Missed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendSkipped]} />
              <Text style={styles.legendText}>Skipped</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  seeAll: {
    fontSize: 14,
    color: '#3B82F6',
  },
  chatbotCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  basicBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  basicText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  chatbotContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  totalNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  chatbotDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  robotImage: {
    width: 150,
    height: 180,
    resizeMode: 'cover',
    marginRight: 50,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  medicationNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  medicationLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 16,
  },
  calendarDay: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  dayTaken: {
    backgroundColor: '#3B82F6',
  },
  dayMissed: {
    backgroundColor: '#EF4444',
  },
  daySkipped: {
    backgroundColor: '#E2E8F0',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTaken: {
    backgroundColor: '#3B82F6',
  },
  legendMissed: {
    backgroundColor: '#EF4444',
  },
  legendSkipped: {
    backgroundColor: '#E2E8F0',
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
});

export default WellnessAndMedication;
