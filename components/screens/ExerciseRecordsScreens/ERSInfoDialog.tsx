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
      title="Run Records Info"
      content={
        <View>
          <Text style={styles.dialogText}>
            This screen displays your recorded run sessions from Health Connect.
          </Text>
          <Text style={styles.dialogText}>
            Each session shows details like duration, distance, and steps.
          </Text>
          <Text style={[styles.dialogText, {marginTop: 12}]}>
            <Text style={{fontWeight: 'bold'}}>Running sessions</Text> include:
          </Text>
          <View style={styles.dialogBullet}>
            <View style={styles.dialogBullet}>
              <Text style={styles.dialogText}>• Distance covered</Text>
            </View>
            <View style={styles.dialogBullet}>
              <Text style={styles.dialogText}>• Duration</Text>
            </View>
            <View style={styles.dialogBullet}>
              <Text style={styles.dialogText}>• Estimated steps</Text>
            </View>
            <View style={styles.dialogBullet}>
              <Text style={styles.dialogText}>• Pace metrics</Text>
            </View>
            <View style={styles.dialogBullet}>
              <Text style={styles.dialogText}>
                • Routes run (visible via map)
              </Text>
            </View>
          </View>
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
});