import SkeletonPost from "./SkeletonPost"
import type React from "react"
import { View, StyleSheet, ScrollView } from "react-native"
import SkeletonPostCard from "./SkeletonPostCard"

interface SkeletonPostListProps {
  count?: number
}

const SkeletonPostList: React.FC<SkeletonPostListProps> = ({ count = 4 }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <SkeletonPostCard isInput={true} />

      <View style={styles.titleContainer}>
        <SkeletonPost width={150} height={20} />
      </View>

      {Array(count)
        .fill(0)
        .map((_, index) => (
          <SkeletonPostCard key={`skeleton-post-${index}`} />
        ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    backgroundColor: "#F5F5F5",
  },
  contentContainer: {
    marginTop: 16,
    padding: 16,
  },
  titleContainer: {
    marginBottom: 16,
  },
})

export default SkeletonPostList
