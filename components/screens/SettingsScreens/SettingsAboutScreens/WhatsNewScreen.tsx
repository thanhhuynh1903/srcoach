import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useCallback, useEffect, useState} from 'react';
import {getAllNews} from '../../../utils/useNewsAPI';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {formatTimeAgo} from '../../../utils/utils_format';
import BackButton from '../../../BackButton';
import ContentLoader, {Rect} from 'react-content-loader/native';

type NewsItem = {
  id: string;
  title: string;
  content: string;
  news_type: string;
  created_at: string;
};

const {width} = Dimensions.get('window');

export default function WhatsNewScreen() {
  const navigation = useNavigation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const fetchedNews = await getAllNews();
      setNews(fetchedNews || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNews();
    }, []),
  );

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <BackButton />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>What's New</Text>
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {[...Array(5)].map((_, index) => (
            <View key={index} style={styles.newsItem}>
              <ContentLoader
                speed={1}
                width={width - 32}
                height={120}
                viewBox={`0 0 ${width - 32} 120`}
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb">
                <Rect x="0" y="0" rx="4" ry="4" width="70%" height="20" />
                <Rect x="0" y="30" rx="4" ry="4" width="40%" height="14" />
                <Rect x="0" y="50" rx="4" ry="4" width="100%" height="14" />
                <Rect x="0" y="70" rx="4" ry="4" width="90%" height="14" />
                <Rect x="0" y="90" rx="4" ry="4" width="30%" height="20" />
              </ContentLoader>
            </View>
          ))}
        </ScrollView>
      ) : news.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No news available</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {news.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.newsItem}
              onPress={() => navigation.navigate('NewsDetailScreen', {id: item.id})}>
              <Text style={styles.newsTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.newsDate} numberOfLines={1}>
                {formatTimeAgo(item.created_at)}
              </Text>
              <Text style={styles.newsContent} numberOfLines={3}>
                {truncateText(stripHtml(item.content), 120)}
              </Text>
              <View style={styles.newsTypeContainer}>
                <Text style={styles.newsType} numberOfLines={1}>
                  {item.news_type}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  newsItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  newsContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    color: '#444',
  },
  newsTypeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  newsType: {
    fontSize: 12,
    color: '#333',
    textTransform: 'capitalize',
  },
});