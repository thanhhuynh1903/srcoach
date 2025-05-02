import React from 'react';
import {View, StyleSheet} from 'react-native';
import ContentLoader from 'react-content-loader/native';
import {Rect, Circle} from 'react-content-loader/native';

export const ChatsContentLoader = () => {
  return (
    <View style={styles.contentLoaderContainer}>
      {[1, 2, 3, 4, 5].map((_, index) => (
        <ContentLoader
          key={index}
          speed={1}
          width="100%"
          height={72}
          viewBox="0 0 400 72"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <Circle cx="36" cy="36" r="20" />
          <Rect x="72" y="18" rx="3" ry="3" width="120" height="12" />
          <Rect x="72" y="38" rx="3" ry="3" width="80" height="10" />
          <Rect x="300" y="24" rx="3" ry="3" width="60" height="24" />
        </ContentLoader>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  contentLoaderContainer: {
    padding: 16,
  },
});