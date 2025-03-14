import React from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const doctors = [
  {
    id: '1',
    name: 'Dr. Siles Duke',
    specialty: 'Dentistry',
    rating: 4.5,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    name: 'Dr. John Doe',
    specialty: 'Cardiology',
    rating: 5,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '3',
    name: 'Dr. Jane Smith',
    specialty: 'Neurology',
    rating: 4,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '4',
    name: 'Dr. Emily Johnson',
    specialty: 'Pediatrics',
    rating: 4.5,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '5',
    name: 'Dr. Michael Brown',
    specialty: 'Orthopedics',
    rating: 5,
    image: 'https://via.placeholder.com/150',
  },
];

const DoctorCard = ({ doctor }: { doctor: any }) => {
  return (
    <View style={styles.card}>
      {/* Doctor Image */}
      <Image source={{ uri: doctor.image }} style={styles.image} />

      {/* Doctor Info */}
      <Text style={styles.name}>{doctor.name}</Text>
      <Text style={styles.specialty}>{doctor.specialty}</Text>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, index) => (
          <Icon
            key={index}
            name={
              index < Math.floor(doctor.rating)
                ? 'star'
                : index < doctor.rating
                ? 'star-half'
                : 'star-outline'
            }
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    </View>
  );
};

const DocCardComponent = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={doctors}
        renderItem={({ item }) => <DoctorCard doctor={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2} // Hiển thị dạng grid
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf3fc',
  },
  
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxWidth: '100%',
    height: 300,
    alignItems: 'center',
    width: '100%', // Chiều rộng mỗi thẻ chiếm 45% màn hình
    margin: '2.5%', // Khoảng cách giữa các thẻ
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  specialty: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DocCardComponent;
