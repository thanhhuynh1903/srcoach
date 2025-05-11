import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {getNewsDetail} from '../../utils/useNewsAPI';
import RenderHtml from 'react-native-render-html';
import Icon from '@react-native-vector-icons/ionicons';
import ToastUtil from '../../utils/utils_toast';
import ContentLoader, {Rect} from 'react-content-loader/native';
import BackButton from '../../BackButton';

type RootStackParamList = {
  NewsDetail: {id: string};
};

type NewsDetailRouteProp = RouteProp<RootStackParamList, 'NewsDetail'>;

type NewsDetail = {
  id: string;
  title: string;
  content: string;
  news_type: string;
  created_at: string;
  AdminUser: {
    username: string;
  };
};

export default function NewsDetailScreen() {
  const route = useRoute<NewsDetailRouteProp>();
  const {width} = Dimensions.get('window');
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await getNewsDetail(route.params.id);
        if (response.status === 'success') {
          setNewsDetail(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch news detail:', error);
        Alert.alert('Error', 'Failed to load news detail');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [route.params.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    if (!newsDetail) return;

    try {
      const shareUrl = `myapp://news/${newsDetail.id}`;
      await Linking.openURL(
        `whatsapp://send?text=${encodeURIComponent(
          `${newsDetail.title}\n\n${shareUrl}`,
        )}`,
      );
    } catch (error) {
      Alert.alert('Error', 'Could not open sharing dialog');
    }
  };

  const handleCopy = async () => {
    if (!newsDetail) return;

    try {
      const Clipboard = require('@react-native-clipboard/clipboard').default;
      Clipboard.setString(`${newsDetail.title}\n\n${newsDetail.content}`);
      ToastUtil.success('Success', 'Copied to clipboard');
    } catch (error) {
      ToastUtil.error('Error', 'Could not copy to clipboard');
    }
  };

  if (!newsDetail && !loading) {
    return (
      <View style={styles.container}>
        <Text>News article not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        
        {loading ? (
          <ContentLoader
            speed={1}
            width={width - 72}
            height={24}
            viewBox={`0 0 ${width - 72} 24`}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb">
            <Rect x="0" y="0" rx="4" ry="4" width="100%" height="24" />
          </ContentLoader>
        ) : (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {newsDetail?.title}
          </Text>
        )}
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ContentLoader
            speed={1}
            width={width - 32}
            height={32}
            viewBox={`0 0 ${width - 32} 32`}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb">
            <Rect x="0" y="0" rx="4" ry="4" width="80%" height="32" />
          </ContentLoader>

          <View style={styles.metadata}>
            <ContentLoader
              speed={1}
              width={80}
              height={20}
              viewBox="0 0 80 20"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb">
              <Rect x="0" y="0" rx="10" ry="10" width="80" height="20" />
            </ContentLoader>
            <ContentLoader
              speed={1}
              width={160}
              height={20}
              viewBox="0 0 160 20"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb">
              <Rect x="0" y="0" rx="4" ry="4" width="160" height="20" />
            </ContentLoader>
          </View>

          {[...Array(8)].map((_, i) => (
            <ContentLoader
              key={i}
              speed={1}
              width={width - 32}
              height={16}
              viewBox={`0 0 ${width - 32} 16`}
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb">
              <Rect x="0" y="0" rx="4" ry="4" width={i % 2 ? '80%' : '100%'} height="16" />
            </ContentLoader>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>{newsDetail.title}</Text>
          <View style={styles.metadataContainer}>
            <View style={styles.metadata}>
              <Text style={styles.type}>{newsDetail?.news_type}</Text>
              <Text style={styles.date}>{formatDate(newsDetail.created_at)}</Text>
            </View>
          </View>
          <View style={styles.contentContainer}>
            <RenderHtml
              contentWidth={width - 32}
              source={{html: newsDetail.content}}
              baseStyle={styles.htmlBaseStyle}
            />
          </View>
        </ScrollView>
      )}

      {!loading && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share-social" size={24} color="#333" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <Icon name="copy" size={24} color="#333" />
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>
        </View>
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
    gap: 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  metadataContainer: {
    marginBottom: 16,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  type: {
    fontSize: 12,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    color: '#333',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 24,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  contentContainer: {
    marginTop: 8,
  },
  htmlBaseStyle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionText: {
    marginTop: 4,
    fontSize: 14,
    color: '#333',
  },
});