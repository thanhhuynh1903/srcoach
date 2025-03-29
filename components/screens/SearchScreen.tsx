"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, StatusBar } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("All")

  // Recent searches data
  const recentSearches = [
    { id: 1, query: "UI/UX Design Tips", timestamp: new Date() },
    { id: 2, query: "React Development", timestamp: new Date() },
    { id: 3, query: "Mobile App Design", timestamp: new Date() },
    { id: 4, query: "Frontend Jobs", timestamp: new Date() },
    { id: 5, query: "Design Systems", timestamp: new Date() },
  ]

  // Popular tags
  const popularTags = [
    { id: 1, name: "photography" },
    { id: 2, name: "technology" },
    { id: 3, name: "travel" },
  ]

  // Trending topics
  const trendingTopics = [
    { id: 1, name: "AI Development", percentage: 25 },
    { id: 2, name: "Remote Work Tips", percentage: 18 },
    { id: 3, name: "Design Tools", percentage: 15 },
    { id: 4, name: "Product Management", percentage: 12 },
    { id: 5, name: "Coding Bootcamps", percentage: 10 },
  ]

  // Clear a single recent search
  const clearRecentSearch = (id) => {
    // In a real app, you would remove the item from the array
    console.log(`Clearing search with id: ${id}`)
  }

  // Clear all recent searches
  const clearAllRecentSearches = () => {
    // In a real app, you would clear the entire array
    console.log("Clearing all recent searches")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts, users, or experts"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        {["All", "People", "Posts", "Experts"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* Recent Searches */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <TouchableOpacity onPress={clearAllRecentSearches}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {recentSearches.map((search) => (
          <View key={search.id} style={styles.recentSearchItem}>
            <Icon name="time-outline" size={20} color="#94A3B8" style={styles.timeIcon} />
            <Text style={styles.recentSearchText}>{search.query}</Text>
            <TouchableOpacity onPress={() => clearRecentSearch(search.id)}>
              <Icon name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Popular Tags */}
        <View style={styles.tagsSection}>
          <View style={styles.tagsSectionHeader}>
            <Icon name="pricetag" size={18} color="#000" />
            <Text style={styles.tagsSectionTitle}>Popular Tags</Text>
          </View>

          <View style={styles.tagsContainer}>
            {popularTags.map((tag) => (
              <TouchableOpacity key={tag.id} style={styles.tagChip}>
                <Text style={styles.tagText}># {tag.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Now */}
        <Text style={styles.sectionTitle}>Trending Now</Text>

        {trendingTopics.map((topic) => (
          <TouchableOpacity key={topic.id} style={styles.trendingItem}>
            <View style={styles.trendingItemLeft}>
              <Icon name="trending-up" size={20} color="#10B981" />
              <Text style={styles.trendingText}>{topic.name}</Text>
            </View>
            <View style={styles.trendingItemRight}>
              <Text style={styles.percentageText}>+{topic.percentage}%</Text>
              <Icon name="chevron-forward" size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    padding: 0,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  activeTab: {
    backgroundColor: "#0F2B5B",
  },
  tabText: {
    fontSize: 14,
    color: "#64748B",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
  },
  clearAllText: {
    fontSize: 14,
    color: "#3B82F6",
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  timeIcon: {
    marginRight: 12,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  },
  tagsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  tagsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tagsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: "#0F172A",
  },
  trendingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  trendingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendingItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendingText: {
    fontSize: 16,
    color: "#0F172A",
    marginLeft: 12,
  },
  percentageText: {
    fontSize: 14,
    color: "#10B981",
    marginRight: 8,
  },
})

export default SearchScreen

