import React, {useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import {Card, Avatar, Button, useTheme} from 'react-native-paper';
import Icon from '@react-native-vector-icons/ionicons';
import HomeHeader from '../HomeHeader';
import HealthMetrics from '../HealthMetric';
import WellnessAndMedication from '../WellnessAndMedication';
import HealthMetricsSlider from '../HealthMetricsSlider';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
  FadeInLeft,
  FadeOutLeft,
  FadeInRight,
  FadeOutRight,
  FadeInDown,
  FadeOutDown,
  Layout,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
const AnimatedView = Animated.createAnimatedComponent(View);

const HomeScreen = (props: any) => {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const navigation = useNavigation();
  useEffect(() => {
    opacity.value = withTiming(1, {duration: 1000});
    return () => {
      opacity.value = withTiming(0, {duration: 500});
    };
  }, [opacity]);

  const fadeInStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [3, 5.2, 4, 6, 3.5, 7, 4.5],
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedView
        entering={FadeInDown.delay(300).duration(500)}
        exiting={FadeOutDown.duration(300)}
        layout={Layout.springify()}>
        <HomeHeader />
      </AnimatedView>
      <ScrollView style={styles.scrollView}>
        {/* Health Score */}
        <AnimatedView
          entering={FadeIn.delay(300).duration(500)}
          exiting={FadeOut.duration(300)}
          layout={Layout.springify()}
          style={[styles.section, fadeInStyle]}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Health Score</Text>
            <Icon
              name="ellipsis-horizontal-outline"
              size={16}
              color="#64748B"
            />
          </View>
          <TouchableOpacity style={styles.scoreCard} onPress={() => navigation.navigate('ChartDetailScreen')}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNumber}>88</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreTitle}>Asklepios Score</Text>
              <Text style={styles.scoreDescription}>
                Based on your data, how well are you?
              </Text>
            </View>
          </TouchableOpacity>
        </AnimatedView>

        <AnimatedView
          entering={FadeIn.delay(600).duration(500)}
          exiting={FadeOut.duration(300)}
          layout={Layout.springify()}>
          <HealthMetricsSlider />
        </AnimatedView>

        {/* Smart Health Metrics */}
        <AnimatedView
          entering={FadeInLeft.delay(900).duration(500)}
          exiting={FadeOutLeft.duration(300)}
          layout={Layout.springify()}>
          <HealthMetrics />
        </AnimatedView>

        {/* Wellness and AI Chatbot */}
        <AnimatedView
          entering={FadeInRight.delay(1200).duration(500)}
          exiting={FadeOutRight.duration(300)}
          layout={Layout.springify()}>
          <WellnessAndMedication />
        </AnimatedView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    marginLeft: 15,
  },
  whiteText: {
    color: 'white',
  },
  progressCard: {
    margin: 16,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    color: '#666',
    marginTop: 5,
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  quickActions: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 0,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    elevation: 4,
  },
  actionContent: {
    alignItems: 'center',
    padding: 16,
  },
  workoutCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  workoutText: {
    flex: 1,
    marginLeft: 12,
  },
  grayText: {
    color: '#666',
  },
  viewButton: {
    backgroundColor: '#4A90E2',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  scoreInfo: {
    marginLeft: 16,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  scoreDescription: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default HomeScreen;
