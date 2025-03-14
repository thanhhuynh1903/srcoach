import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { theme } from "./contants/theme";
import { hp } from "./helpers/common";

interface ButtonProps {
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  title?: string;
  onPress?: () => void;
  loading?: boolean;
  hasShadow?: boolean;
}

const ButtonModify: React.FC<ButtonProps> = ({
  buttonStyle,
  textStyle,
  title = "",
  onPress = () => {},
  loading = false,
  hasShadow = true,
}) => {
  const shadowStyle = {
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 10 }, // Fixed key name
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  };

  return (
    <Pressable
      onPress={!loading ? onPress : undefined} // Disable press when loading
      style={[styles.button, buttonStyle, hasShadow && shadowStyle, loading && styles.disabledButton]}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};

export default ButtonModify;

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.weightBrown,
    height: hp(6.6),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radius.xl,
  },
  text: {
    fontSize: hp(2.5),
    color: "white",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.7, // Make button look disabled when loading
  },
});
