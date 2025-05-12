import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import * as Progress from 'react-native-progress';
import Icon from '@react-native-vector-icons/ionicons';
import {wp} from '../helpers/common';
import welcome_1 from '../assets/welcome_1.png';
import welcome_2 from '../assets/welcome_2.png';
import welcome_3 from '../assets/welcome_3.png';
import welcome_4 from '../assets/welcome_4.png';
import AsyncStorage from '@react-native-async-storage/async-storage';

const slides = [
  {
    heading: 'Helpful Resources & Community.',
    subheading:
      'Join a community of 5,000+ users dedicating to healthy life with AI/ML.',
    image: welcome_1,
  },
  {
    heading: 'Intuitive Nutrition & Med Tracker with AI',
    subheading:
      'Easily track your medication & nutrition with the power of AI.',
    image: welcome_2,
  },
  {
    heading: 'Emphatic AI Wellness Chatbot For All.',
    subheading:
      'Experience compassionate and personalized care with our AI chatbot.',
    image: welcome_3,
  },
  {
    heading: 'Your Intelligent Fitness Companion.',
    subheading:
      'Track your calorie & fitness nutrition with AI and get special recommendations.',
    image: welcome_4,
  },
];

const WelcomeInfoScreen = ({navigation}: {navigation: any}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('LoginScreen');
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
        <TouchableOpacity
          onPress={async () => {
            await AsyncStorage.setItem('shouldNotShowWelcome', '1');
            navigation.navigate('LoginScreen');
          }}
          style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.heading}>{slides[currentSlide].heading}</Text>
        <Text style={styles.subheading}>{slides[currentSlide].subheading}</Text>
      </View>
      <View style={styles.illustrationContainer}>
        <Image source={slides[currentSlide].image} style={styles.image} />
      </View>
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
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    width: wp(100),
    height: wp(140),
    transform: [{translateY: 50}],
    resizeMode: 'cover',
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
