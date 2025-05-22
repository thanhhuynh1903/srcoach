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
  ScrollView,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {theme} from '../contants/theme';

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
  disableOutsideClick?: boolean;
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
  disableOutsideClick = true, // Default to true to prevent accidental clicks
}) => {
  const handleBackdropPress = () => {
    if (!disableOutsideClick && closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialogContainer, {width, maxHeight: '70%'}]}>
          <View style={styles.header}>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={[styles.content, contentStyle]}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
            bounces={false}>
            {content}
          </ScrollView>

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
                      backgroundColor: button.color || theme.colors.primaryDark,
                    },
                    button.variant === 'outlined' && {
                      borderColor: button.color || theme.colors.primaryDark,
                    },
                  ]}>
                  {button.iconName && (
                    <Ionicons
                      name={button.iconName}
                      size={16}
                      color={
                        button.variant === 'contained'
                          ? 'white'
                          : button.color || theme.colors.primaryDark
                      }
                      style={styles.buttonIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.buttonText,
                      (button.variant === 'outlined' ||
                        button.variant === 'contained') && {
                        color: button.color || theme.colors.primaryDark,
                      },
                      button.variant === 'contained' && {color: 'white'},
                      button.iconName && {marginLeft: 6},
                    ]}>
                    {button.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollContainer: {
    flexGrow: 1,
    maxHeight: Platform.select({
      ios: undefined,
      android: Dimensions.get('window').height * 0.7,
    }),
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
    flexGrow: 1,
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
