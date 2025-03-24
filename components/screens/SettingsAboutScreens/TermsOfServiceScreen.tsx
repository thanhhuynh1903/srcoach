import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const TermsOfServiceScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Running Coach</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.text}>
          Welcome to Smart Running Coach! These Terms of Service ("Terms") govern your use of the Smart Running Coach app and services. By accessing or using our app, you agree to be bound by these Terms.
        </Text>

        <Text style={styles.subtitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By using Smart Running Coach, you agree to these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the app.
        </Text>

        <Text style={styles.subtitle}>2. Use of the App</Text>
        <Text style={styles.text}>
          - You must be at least 13 years old to use Smart Running Coach.
        </Text>
        <Text style={styles.text}>
          - You are responsible for maintaining the confidentiality of your account and password.
        </Text>
        <Text style={styles.text}>
          - You agree to use the app only for lawful purposes and in accordance with these Terms.
        </Text>

        <Text style={styles.subtitle}>3. User Content</Text>
        <Text style={styles.text}>
          - You retain ownership of any content you submit or post on the app.
        </Text>
        <Text style={styles.text}>
          - By submitting content, you grant Smart Running Coach a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content.
        </Text>

        <Text style={styles.subtitle}>4. Prohibited Activities</Text>
        <Text style={styles.text}>
          You agree not to:
        </Text>
        <Text style={styles.text}>
          - Use the app for any illegal or unauthorized purpose.
        </Text>
        <Text style={styles.text}>
          - Attempt to gain unauthorized access to the app or its related systems.
        </Text>
        <Text style={styles.text}>
          - Interfere with or disrupt the app or its servers.
        </Text>

        <Text style={styles.subtitle}>5. Limitation of Liability</Text>
        <Text style={styles.text}>
          Smart Running Coach is not liable for any indirect, incidental, or consequential damages arising out of your use of the app.
        </Text>

        <Text style={styles.subtitle}>6. Changes to Terms</Text>
        <Text style={styles.text}>
          We may update these Terms from time to time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the app after any changes constitutes your acceptance of the new Terms.
        </Text>

        <Text style={styles.text}>
          If you have any questions about these Terms, please contact us at support@smartrunningcoach.com.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingLeft: 45,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 24,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default TermsOfServiceScreen;