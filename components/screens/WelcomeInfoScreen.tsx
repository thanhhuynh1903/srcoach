import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import * as Progress from 'react-native-progress';
import Icon from '@react-native-vector-icons/ionicons';
import { wp } from '../helpers/common';
const slides = [
  {
    heading: 'Helpful Resources & Community.',
    subheading: 'Join a community of 5,000+ users dedicating to healthy life with AI/ML.',
  },
  {
    heading: 'Intuitive Nutrition & Med Tracker with AI',
    subheading: 'Easily track your medication & nutrition with the power of AI.',
  },
  {
    heading: 'Emphatic AI Wellness Chatbot For All.',
    subheading: 'Experience compassionate and personalized care with our AI chatbot.',
  },
  {
    heading: 'Your Intelligent Fitness Companion.',
    subheading: 'Track your calorie & fitness nutrition with AI and get special recommendations.',
  },
];

const WelcomeInfoScreen = ({ navigation }: { navigation: any }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        <Progress.Bar
          progress={(currentSlide + 1) / slides.length}
          color="#1E293B"
          style={styles.progressBar}
          height={10}
          width={wp(60)}
        />
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.heading}>{slides[currentSlide].heading}</Text>
        <Text style={styles.subheading}>{slides[currentSlide].subheading}</Text>
      </View>
      <View style={styles.illustrationContainer}>{/* Illustration goes here */}</View>
      {currentSlide > 0 && (
        <TouchableOpacity style={styles.fabLeft} onPress={handleBack}>
          <Icon size={30} color={'white'} name="arrow-back-outline" />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.fab} onPress={handleNext}>
        <Icon size={30} color={'white'} name="arrow-forward-outline" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 60,
  },
  topBar: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: 10,
  },
  skipButton: {
    right: 20,
  },
  skipText: {
    fontSize: 20,
    color: '#1E293B',
    fontWeight: '600',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 30,
  },
  subheading: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 10,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#1E293B',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLeft: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    backgroundColor: '#1E293B',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WelcomeInfoScreen;