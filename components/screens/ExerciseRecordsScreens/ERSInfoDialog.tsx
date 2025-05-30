import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../../contants/theme';
import CommonDialog from '../../commons/CommonDialog';

interface ERSInfoDialogProps {
  visible: boolean;
  onClose: () => void;
}

export const ERSInfoDialog = ({visible, onClose}: ERSInfoDialogProps) => {
  return (
    <CommonDialog
      visible={visible}
      onClose={onClose}
      title="Run Records Information"
      content={
        <View>
          <Text style={styles.dialogText}>
            This screen displays your recorded run sessions synced from Health Connect.
          </Text>
          <Text style={styles.dialogText}>
            Each session includes details such as duration, distance, steps, and more.
          </Text>
          <Text style={[styles.dialogText, {marginTop: 12}]}>
            <Text style={{fontWeight: 'bold'}}>Running sessions</Text> include:
          </Text>
          <View style={styles.dialogBullet}>
            <Text style={styles.dialogText}>• Distance covered</Text>
            <Text style={styles.dialogText}>• Duration</Text>
            <Text style={styles.dialogText}>• Estimated steps</Text>
            <Text style={styles.dialogText}>• Pace metrics</Text>
            <Text style={styles.dialogText}>• Routes run (visible via map)</Text>
          </View>
          <Text style={[styles.dialogText, {marginTop: 12}]}>
            <Text style={{fontWeight: 'bold'}}>User Points System</Text>
          </Text>
          <Text style={styles.dialogText}>
            Each synced exercise record earns points based on your performance, calculated using the following formula:
          </Text>
          <Text style={[styles.dialogText, styles.formulaText]}>
            Score = 1000 × (0.40 × (Distance in meters / 10,000) + 0.30 × (Calories / 1,200) + 0.15 × (Steps / 20,000) + 0.15 × (Time in minutes / 120))
          </Text>
          <Text style={styles.dialogText}>
            The reference values (10,000 meters, 1,200 calories, 20,000 steps, and 120 minutes) represent the typical performance of an average runner, ensuring a fair and balanced scoring system.
          </Text>
        </View>
      }
      actionButtons={[
        {
          label: 'Got it',
          variant: 'contained',
          color: theme.colors.primaryDark,
          handler: onClose,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dialogText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  dialogBullet: {
    marginLeft: 16,
    marginTop: 8,
  },
  formulaText: {
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 12,
  },
});