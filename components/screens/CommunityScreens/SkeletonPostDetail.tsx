// components/SkeletonPostDetail.tsx
import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const SkeletonPostDetail = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.skeletonBackButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Info Skeleton */}
        <View style={styles.userInfoContainer}>
          <View style={styles.userInfo}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonUserText}>
              <View style={styles.skeletonUsername} />
              <View style={styles.skeletonPostTime} />
            </View>
          </View>
          <View style={styles.skeletonMoreButton} />
        </View>

        {/* Post Content Skeleton */}
        <View style={styles.postContent}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonContentLine} />
          <View style={styles.skeletonContentLineShort} />
          
          {/* Image Skeleton */}
          <View style={styles.skeletonImage} />
          
          {/* Map Skeleton */}
          <View style={styles.skeletonMap} />
          
          {/* Tags Skeleton */}
          <View style={styles.skeletonTagsContainer}>
            <View style={styles.skeletonTag} />
            <View style={styles.skeletonTag} />
          </View>

          {/* Engagement Skeleton */}
          <View style={styles.skeletonEngagementContainer}>
            <View style={styles.skeletonEngagementButton} />
            <View style={styles.skeletonEngagementButton} />
          </View>
        </View>

        {/* Comments Skeleton */}
        <View style={styles.commentsSection}>
          <View style={styles.skeletonCommentsHeader} />
          
          {[1, 2, 3].map((_, index) => (
            <View key={index} style={styles.skeletonCommentContainer}>
              <View style={styles.skeletonCommentAvatar} />
              <View style={styles.skeletonCommentContent}>
                <View style={styles.skeletonCommentHeader} />
                <View style={styles.skeletonCommentText} />
                <View style={styles.skeletonCommentActions} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  skeletonBackButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  skeletonUserText: {
    marginLeft: 12,
    flex: 1,
  },
  skeletonUsername: {
    height: 16,
    width: 120,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonPostTime: {
    height: 12,
    width: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonMoreButton: {
    width: 20,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
  },
  postContent: {
    padding: 16,
  },
  skeletonTitle: {
    height: 24,
    width: '70%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonContentLine: {
    height: 16,
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonContentLineShort: {
    height: 16,
    width: '60%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonImage: {
    height: 200,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonMap: {
    height: 150,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonTagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  skeletonTag: {
    height: 24,
    width: 60,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  skeletonEngagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  skeletonEngagementButton: {
    height: 24,
    width: 60,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  commentsSection: {
    padding: 16,
  },
  skeletonCommentsHeader: {
    height: 20,
    width: 120,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonCommentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skeletonCommentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  skeletonCommentContent: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonCommentHeader: {
    height: 14,
    width: 100,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonCommentText: {
    height: 12,
    width: '80%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonCommentActions: {
    height: 12,
    width: 60,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});

export default SkeletonPostDetail;