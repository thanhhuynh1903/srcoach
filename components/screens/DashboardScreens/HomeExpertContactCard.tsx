import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import expertImage from '../../assets/2runner.png';

export default function HomeExpertContactCard() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

      <View style={styles.card}>
        <View style={styles.premiumBadge}>
          <Text style={styles.badgeText}>GET ADVICES FROM EXPERTS</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.stats}>
              1,922 <Text style={styles.statsLabel}>Experts Available</Text>
            </Text>

            <Text style={styles.description}>
              Get personalized coaching{'\n'}
              Improve your running form{'\n'}
              Connect with certified experts
            </Text>

            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => navigation.navigate('Chat')}>
              <Text style={styles.buttonText}>Contact Now</Text>
              <Icon name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Image source={expertImage} style={styles.expertImage} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  card: {
    backgroundColor: '#1A2E3B',
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  premiumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  stats: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: 'normal',
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 24,
  },
  expertImage: {
    width: 140,
    height: 160,
    resizeMode: 'contain',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});