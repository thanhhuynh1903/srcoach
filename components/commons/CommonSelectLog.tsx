"use client"

import React from "react"

import type { ReactNode } from "react"
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  type ViewStyle,
  type TextStyle,
  ScrollView,
  Animated,
  StatusBar,
} from "react-native"
import { BlurView } from "@react-native-community/blur"
import Icon from "@react-native-vector-icons/ionicons"
import LinearGradient from "react-native-linear-gradient"

interface ActionButton {
  label: string
  color?: string
  variant?: "text" | "outlined" | "contained" | "gradient"
  handler: () => void
  iconName?: string
  disabled?: boolean
}

interface CommonDialogProps {
  visible: boolean
  onClose: () => void
  title: string
  subtitle?: string
  content: ReactNode
  actionButtons?: ActionButton[]
  width?: number | string
  height?: number | string
  titleStyle?: TextStyle
  contentStyle?: ViewStyle
  buttonContainerStyle?: ViewStyle
  closeOnBackdropPress?: boolean
  disableOutsideClick?: boolean
  showCloseButton?: boolean
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const CommonSelectLog: React.FC<CommonDialogProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  content,
  actionButtons = [],
  width = "90%",
  height = "auto",
  titleStyle = {},
  contentStyle = {},
  buttonContainerStyle = {},
  closeOnBackdropPress = true,
  disableOutsideClick = false,
  showCloseButton = true,
}) => {
  const scaleAnim = new Animated.Value(0)
  const opacityAnim = new Animated.Value(0)

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const handleBackdropPress = () => {
    if (!disableOutsideClick && closeOnBackdropPress) {
      onClose()
    }
  }

  const renderActionButton = (button: ActionButton, index: number) => {
    const buttonStyle = [
      styles.actionButton,
      button.variant === "outlined" && styles.outlinedButton,
      button.variant === "contained" && [styles.containedButton, { backgroundColor: button.color || "#007AFF" }],
      button.variant === "text" && styles.textButton,
      button.disabled && styles.disabledButton,
    ]

    const textStyle = [
      styles.actionButtonText,
      button.variant === "outlined" && { color: button.color || "#007AFF" },
      button.variant === "contained" && { color: "#FFFFFF" },
      button.variant === "text" && { color: button.color || "#007AFF" },
      button.disabled && styles.disabledButtonText,
    ]

    if (button.variant === "gradient") {
      return (
        <TouchableOpacity
          key={index}
          onPress={button.handler}
          disabled={button.disabled}
          style={[styles.actionButton, button.disabled && styles.disabledButton]}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={button.disabled ? ["#E5E5E5", "#D1D1D1"] : ["#007AFF", "#0056CC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {button.iconName && (
              <Icon
                name={button.iconName}
                size={16}
                color={button.disabled ? "#999" : "#FFFFFF"}
                style={styles.buttonIcon}
              />
            )}
            <Text style={[styles.actionButtonText, { color: button.disabled ? "#999" : "#FFFFFF" }]}>
              {button.label}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={button.handler}
        disabled={button.disabled}
        style={buttonStyle}
        activeOpacity={0.7}
      >
        {button.iconName && (
          <Icon
            name={button.iconName}
            size={16}
            color={button.variant === "contained" ? "#FFFFFF" : button.color || "#007AFF"}
            style={styles.buttonIcon}
          />
        )}
        <Text style={textStyle}>{button.label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity style={styles.backdrop} onPress={handleBackdropPress} activeOpacity={1}>
          <BlurView style={StyleSheet.absoluteFill} blurType="dark" blurAmount={10} />
        </TouchableOpacity>

        <Animated.View
          style={[styles.dialogContainer, { width, maxHeight: screenHeight * 0.8, transform: [{ scale: scaleAnim }] }]}
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={["#007AFF", "#0056CC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, titleStyle]}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                  <Icon name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {/* Content */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={[styles.content, contentStyle]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {content}
          </ScrollView>

          {/* Action Buttons */}
          {actionButtons.length > 0 && (
            <View style={[styles.buttonContainer, buttonContainerStyle]}>
              {actionButtons.map((button, index) => renderActionButton(button, index))}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    maxWidth: 400,
    width: "100%",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
    lineHeight: 18,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    maxHeight: screenHeight * 0.5,
  },
  content: {
    padding: 24,
    minHeight: 60,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    paddingTop: 16,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outlinedButton: {
    borderWidth: 1.5,
    borderColor: "#007AFF",
    backgroundColor: "#FFFFFF",
    elevation: 0,
    shadowOpacity: 0,
  },
  containedButton: {
    backgroundColor: "#007AFF",
    elevation: 3,
    shadowOpacity: 0.15,
  },
  textButton: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  disabledButton: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  disabledButtonText: {
    color: "#999999",
  },
  buttonIcon: {
    marginRight: 6,
  },
})

export default CommonSelectLog
