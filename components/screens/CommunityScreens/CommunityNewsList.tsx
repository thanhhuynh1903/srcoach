import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Image} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../contants/theme';
import {useNavigation} from '@react-navigation/native';
import {getAllNews} from '../../utils/useNewsAPI';
import {getNewsColorByType} from '../../contants/newsConst';
import {stripHtml, capitalizeFirstLetter} from '../../utils/utils_format';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  news_type?: string;
}

const NewsItemLoader = () => (
  <View style={styles.newsItem}>
    <ContentLoader 
      speed={1}
      width={240}
      height={200}
      viewBox="0 0 240 200"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <Rect x="0" y="0" rx="10" ry="10" width="216" height="100" />
      <Rect x="0" y="115" rx="4" ry="4" width="180" height="15" />
      <Rect x="0" y="140" rx="4" ry="4" width="216" height="10" />
      <Rect x="0" y="155" rx="4" ry="4" width="216" height="10" />
      <Rect x="0" y="170" rx="4" ry="4" width="150" height="10" />
      <Rect x="170" y="180" rx="4" ry="4" width="46" height="15" />
    </ContentLoader>
  </View>
);

const CommunityNewsList = () => {
  const navigation = useNavigation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNews();
      setNews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNewsItem = ({item}: {item: NewsItem}) => (
    <TouchableOpacity
      style={styles.newsItem}
      activeOpacity={0.85}
      onPress={() => {
        navigation.navigate('NewsDetailScreen', {
          id: item.id,
          newsItem: item,
        });
      }}>
      {/* News Image */}
      <View style={styles.newsImageContainer}>
        {item.image_url ? (
          <Image source={{uri: item.image_url}} style={styles.newsImage} />
        ) : (
          <Image
            source={require('../../assets/Community/newspaper.jpg')}
            style={[styles.newsImage, styles.newsImagePlaceholder]}
          />
        )}
        <View
          style={[
            styles.newsBadge,
            {backgroundColor: getNewsColorByType(item?.news_type || 'Unknown')},
          ]}>
          <Text style={styles.newsBadgeText}>
            {capitalizeFirstLetter(item?.news_type || 'Unknown', true)}
          </Text>
        </View>
      </View>
      {/* News Content */}
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.newsDescription} numberOfLines={3}>
          {item.content?.length > 80
            ? `${stripHtml(item.content).substring(0, 100)}...`
            : stripHtml(item.content)}
        </Text>
        <View style={styles.newsFooter}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon
              name="calendar-outline"
              size={14}
              color="#A0AEC0"
              style={{marginRight: 4}}
            />
            <Text style={styles.newsTime}>
              {`${new Date(item.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })} ${new Date(item.created_at).toLocaleTimeString()}`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => {
              navigation.navigate('NewsDetailScreen', {
                id: item.id,
                newsItem: item,
              });
            }}>
            <Icon
              name="chevron-forward"
              size={14}
              color={theme.colors.primaryDark}
              style={{marginLeft: 2}}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <Text style={styles.sectionTitle}>Official News</Text>
      {loading ? (
        <FlatList
          style={styles.newsList}
          data={[1, 2, 3]} // Dummy data for loading
          renderItem={() => <NewsItemLoader />}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.toString()}
        />
      ) : (
        <FlatList
          style={styles.newsList}
          data={news}
          renderItem={renderNewsItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    marginVertical: 16,
    marginBottom: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 16,
  },
  newsList: {
    paddingHorizontal: 16,
    marginRight: 16,
  },
  newsItem: {
    width: 240,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newsImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  newsBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  newsBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
    letterSpacing: 0.5,
  },
  newsImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  newsImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsContent: {flex: 1},
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  newsDescription: {
    color: '#475569',
    fontSize: 12,
    marginBottom: 10,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsTime: {color: '#6a6a6a', fontSize: 12},
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  readMoreText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 2,
  },
});

export default CommunityNewsList;