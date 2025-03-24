import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Running Coach</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.text}>
          Your privacy is important to us. This Privacy Policy explains how Smart Running Coach collects, uses, and protects your personal information when you use our app.
        </Text>
        <Text style={styles.text}>
          By using Smart Running Coach, you agree to the collection and use of information in accordance with this policy.
        </Text>

        <Text style={styles.subtitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We may collect the following types of information:
        </Text>
        <Text style={styles.text}>
          - <Text style={styles.bold}>Personal Information:</Text> Name, email address, and other contact details you provide when registering or using the app.
        </Text>
        <Text style={styles.text}>
          - <Text style={styles.bold}>Usage Data:</Text> Information about how you use the app, such as your running activity, preferences, and device information.
        </Text>

        <Text style={styles.subtitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use the collected information for the following purposes:
        </Text>
        <Text style={styles.text}>
          - To provide and maintain our app.
        </Text>
        <Text style={styles.text}>
          - To improve and personalize your experience.
        </Text>
        <Text style={styles.text}>
          - To communicate with you, including sending updates and notifications.
        </Text>

        <Text style={styles.subtitle}>3. Data Security</Text>
        <Text style={styles.text}>
          We take the security of your data seriously and implement appropriate measures to protect it. However, no method of transmission over the internet or electronic storage is 100% secure.
        </Text>

        <Text style={styles.subtitle}>4. Third-Party Services</Text>
        <Text style={styles.text}>
          We may use third-party services to help operate our app. These third parties have access to your information only to perform specific tasks on our behalf and are obligated not to disclose or use it for other purposes.
        </Text>

        <Text style={styles.subtitle}>5. Changes to This Privacy Policy</Text>
        <Text style={styles.text}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
        </Text>

        <Text style={styles.text}>
          If you have any questions about this Privacy Policy, please contact us at privacy@smartrunningcoach.com.
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

export default PrivacyPolicyScreen;