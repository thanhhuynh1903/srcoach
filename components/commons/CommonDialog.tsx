import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { theme } from '../contants/theme';

interface ActionButton {
  label: string;
  color?: string;
  variant?: 'text' | 'outlined' | 'contained';
  handler: () => void;
  iconName?: string;
}

interface CommonDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  actionButtons?: ActionButton[];
  width?: number | string;
  height?: number | string;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  buttonContainerStyle?: ViewStyle;
  closeOnBackdropPress?: boolean;
}

const CommonDialog: React.FC<CommonDialogProps> = ({
  visible,
  onClose,
  title,
  content,
  actionButtons = [],
  width = '80%',
  height = 'auto',
  titleStyle = {},
  contentStyle = {},
  buttonContainerStyle = {},
  closeOnBackdropPress = true,
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialogContainer, { width, height }]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, titleStyle]}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={[styles.content, contentStyle]}>{content}</View>

              {/* Action Buttons */}
              {actionButtons.length > 0 && (
                <View style={[styles.buttonContainer, buttonContainerStyle]}>
                  {actionButtons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={button.handler}
                      style={[
                        styles.button,
                        button.variant === 'outlined' && styles.outlinedButton,
                        button.variant === 'contained' && styles.containedButton,
                        button.variant === 'contained' && {
                          backgroundColor: button.color || '#6200ee',
                        },
                        button.variant === 'outlined' && {
                          borderColor: button.color || '#6200ee',
                        },
                      ]}
                    >
                      {button.iconName && (
                        <Ionicons
                          name={button.iconName}
                          size={16}
                          color={
                            button.variant === 'contained'
                              ? 'white'
                              : button.color || '#6200ee'
                          }
                          style={styles.buttonIcon}
                        />
                      )}
                      <Text
                        style={[
                          styles.buttonText,
                          (button.variant === 'outlined' || button.variant === 'contained') && {
                            color: button.color || '#6200ee',
                          },
                          button.variant === 'contained' && { color: 'white' },
                          button.iconName && { marginLeft: 6 },
                        ]}
                      >
                        {button.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    maxHeight: Dimensions.get('window').height * 0.8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.primaryDark,
    color: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    padding: 16,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    borderRadius: 4,
    minWidth: 64,
  },
  outlinedButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  containedButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 0,
  },
});

export default CommonDialog;