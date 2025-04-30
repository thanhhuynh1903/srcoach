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
  Animated,
  Easing,
  PanResponder,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { theme } from '../contants/theme';

type PanelDirection = 'top' | 'bottom' | 'left' | 'right';

interface ActionButton {
  label: string;
  color?: string;
  variant?: 'text' | 'outlined' | 'contained';
  handler: () => void;
  iconName?: string;
}

interface CommonPanelProps {
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
  direction?: PanelDirection;
  backdropOpacity?: number;
  swipeToClose?: boolean;
  animationDuration?: number;
  borderRadius?: number;
}

const CommonPanel: React.FC<CommonPanelProps> = ({
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
  direction = 'bottom',
  backdropOpacity = 0.5,
  swipeToClose = true,
  animationDuration = 300,
  borderRadius = 16,
}) => {
  const translateValue = React.useRef(new Animated.Value(0)).current;
  const [panelDimensions, setPanelDimensions] = React.useState({ width: 0, height: 0 });

  const getPanelStyle = (): Animated.WithAnimatedObject<ViewStyle> => {
    const isHorizontal = direction === 'left' || direction === 'right';
    const fullDimension = isHorizontal ? Dimensions.get('window').width : Dimensions.get('window').height;

    const baseStyle: ViewStyle = {
      width: isHorizontal ? width : '100%',
      height: isHorizontal ? '100%' : height,
      position: 'absolute',
      backgroundColor: 'white',
      borderTopLeftRadius: direction === 'bottom' ? borderRadius : 0,
      borderTopRightRadius: direction === 'bottom' ? borderRadius : 0,
      borderBottomLeftRadius: direction === 'top' ? borderRadius : 0,
      borderBottomRightRadius: direction === 'top' ? borderRadius : 0,
    };

    const transformConfig = {
      top: { translateY: translateValue.interpolate({ inputRange: [0, 1], outputRange: [-fullDimension, 0] }) },
      bottom: { translateY: translateValue.interpolate({ inputRange: [0, 1], outputRange: [fullDimension, 0] }) },
      left: { translateX: translateValue.interpolate({ inputRange: [0, 1], outputRange: [-fullDimension, 0] }) },
      right: { translateX: translateValue.interpolate({ inputRange: [0, 1], outputRange: [fullDimension, 0] }) },
    };

    return {
      ...baseStyle,
      [direction]: 0,
      transform: [transformConfig[direction]],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    };
  };

  const animatePanel = React.useCallback((show: boolean) => {
    Animated.timing(translateValue, {
      toValue: show ? 1 : 0,
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [animationDuration, translateValue]);

  React.useEffect(() => {
    if (visible) {
      animatePanel(true);
    }
  }, [visible, animatePanel]);

  const handleClose = React.useCallback(() => {
    animatePanel(false);
    setTimeout(() => onClose(), animationDuration);
  }, [animatePanel, animationDuration, onClose]);

  const handleBackdropPress = React.useCallback(() => {
    if (closeOnBackdropPress) {
      handleClose();
    }
  }, [closeOnBackdropPress, handleClose]);

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => swipeToClose,
    onPanResponderMove: (evt, gestureState) => {
      if (!swipeToClose) return;
      
      const isHorizontal = direction === 'left' || direction === 'right';
      const moveDistance = isHorizontal ? gestureState.dx : gestureState.dy;
      
      if (
        (direction === 'top' && moveDistance > 0) ||
        (direction === 'bottom' && moveDistance < 0) ||
        (direction === 'left' && moveDistance > 0) ||
        (direction === 'right' && moveDistance < 0)
      ) {
        const ratio = Math.min(Math.abs(moveDistance) / (isHorizontal ? panelDimensions.width : panelDimensions.height), 1);
        translateValue.setValue(1 - ratio);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (!swipeToClose) return;
      
      const isHorizontal = direction === 'left' || direction === 'right';
      const moveDistance = isHorizontal ? gestureState.dx : gestureState.dy;
      const threshold = 0.3 * (isHorizontal ? panelDimensions.width : panelDimensions.height);
      
      if (
        (direction === 'top' && moveDistance > threshold) ||
        (direction === 'bottom' && moveDistance < -threshold) ||
        (direction === 'left' && moveDistance > threshold) ||
        (direction === 'right' && moveDistance < -threshold)
      ) {
        handleClose();
      } else {
        animatePanel(true);
      }
    },
  }), [swipeToClose, direction, panelDimensions, translateValue, handleClose, animatePanel]);

  const onLayout = React.useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setPanelDimensions({ width, height });
  }, []);

  const renderActionButton = (button: ActionButton, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => button.handler()}
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
      ]}
    >
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
          (button.variant === 'outlined' || button.variant === 'contained') && {
            color: button.color || theme.colors.primaryDark,
          },
          button.variant === 'contained' && { color: 'white' },
          button.iconName && { marginLeft: 6 },
        ]}
      >
        {button.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={[styles.overlay, { backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` }]}>
          <Animated.View
            style={getPanelStyle()}
            onLayout={onLayout}
            {...panResponder.panHandlers}
          >
            <View style={styles.panelContainer}>
              {/* Header */}
              <View style={[styles.header, direction === 'bottom' ? { borderBottomWidth: 0 } : {}]}>
                <Text style={[styles.title, titleStyle]}>{title}</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={[styles.content, contentStyle]}>{content}</View>

              {/* Action Buttons */}
              {actionButtons.length > 0 && (
                <View style={[styles.buttonContainer, buttonContainerStyle]}>
                  {actionButtons.map(renderActionButton)}
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panelContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primaryDark,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    flex: 1,
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

export default CommonPanel;