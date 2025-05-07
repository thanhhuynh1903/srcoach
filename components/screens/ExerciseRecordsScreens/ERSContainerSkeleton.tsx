import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import ContentLoader, {Rect} from 'react-content-loader/native';

const {width} = Dimensions.get('window');

export const ERSContainerSkeleton = () => {
  return (
    <View style={styles.loadingContainer}>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.skeletonDayContainer}>
          <ContentLoader
            speed={1}
            width={width - 32}
            height={200}
            viewBox={`0 0 ${width - 32} 200`}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb">
            <Rect x="0" y="0" rx="4" ry="4" width="150" height="24" />
            <Rect x={width - 182} y="0" rx="4" ry="4" width="150" height="24" />
            <Rect x="0" y="40" rx="4" ry="4" width={width - 32} height="20" />
            <Rect x="0" y="70" rx="4" ry="4" width={width - 32} height="20" />
            <Rect x="0" y="100" rx="4" ry="4" width={width - 32} height="20" />
            <Rect x="0" y="140" rx="4" ry="4" width={width - 32} height="20" />
            <Rect x="0" y="170" rx="4" ry="4" width={width - 32} height="20" />
          </ContentLoader>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    width: '100%',
  },
  skeletonDayContainer: {
    marginBottom: 24,
    width: '100%',
  },
});