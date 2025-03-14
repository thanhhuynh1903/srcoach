import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BackButton from "./BackButton";
const TopTab: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"All Request" | "Nearby Request">("All Request");

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            // Handle back button logic here (e.g., navigation.goBack())
            console.log("Back button pressed");
          }}
        >
          <BackButton/>
        </TouchableOpacity>
      </View>

      {/* Top Tab Navigator */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "All Request" && styles.selectedTab,
          ]}
          onPress={() => setSelectedTab("All Request")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "All Request" && styles.selectedTabText,
            ]}
          >
            All Request
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "Nearby Request" && styles.selectedTab,
          ]}
          onPress={() => setSelectedTab("Nearby Request")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "Nearby Request" && styles.selectedTabText,
            ]}
          >
            Nearby Request
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {selectedTab === "All Request" ? (
          <Text style={styles.contentText}>All Request Content</Text>
        ) : (
          <Text style={styles.contentText}>Nearby Request Content</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  backButton: {
    fontSize: 20,
    color: "#000",
    paddingHorizontal: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "#f1f1f1",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "bold",
  },
  selectedTabText: {
    color: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: {
    fontSize: 16,
    color: "#000",
  },
});

export default TopTab;
