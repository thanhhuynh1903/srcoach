import React from "react";
import { StyleSheet, View } from "react-native";
import LinearGradient from 'react-native-linear-gradient';


const BackgroundCustom = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={["#ffffff", "#0078d7"]}
        style={[styles.background, { transform: [{ rotate: "180deg" }] }]}
      />
      {/* Đường cong phía dưới */}
      <View style={[styles.curveContainer, { transform: [{ rotate: "180deg" }] }]}>
        <LinearGradient
          colors={["#0078d7", "#00aaff"]}
          style={styles.curve}
        />
      </View>
      {/* Nội dung bên trong */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  curveContainer: {
    position: "absolute",
    top: 0, // changed from bottom: 0 to top: 0
    width: "150%",
    height: "50%",
    transform: [{ rotate: "-15deg" }], // removed this line
    left: "-50%",
  },
  curve: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 300,
    borderTopRightRadius: 300,
  },
  content: {
    flex: 1,
  },
});

export default BackgroundCustom;