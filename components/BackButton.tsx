import { Pressable, StyleSheet } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import Icon from "@react-native-vector-icons/ionicons";
import { theme } from "./contants/theme";

const BackButton = ({ size = 26 }: { size?: number }) => {
  const navigation = useNavigation();

  return (
    <Pressable onPress={() => navigation.goBack()} style={styles.button}>
      <Icon name="arrow-back" size={size} color={theme.colors.text} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 5,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(0,0,0,0.07)",
  },
});

export default BackButton;
