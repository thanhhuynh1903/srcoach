import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image as RNImage,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { CommonAvatar } from '../../../../commons/CommonAvatar';
import { theme } from '../../../../contants/theme';
import { formatTimestampAgo } from '../../../../utils/utils_format';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_IMAGE_WIDTH = SCREEN_WIDTH * 0.7;
const MAX_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4;

interface CMIImageProps {
  message: any;
  isMe: boolean;
}

export const CMIImage = ({ message, isMe }: CMIImageProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const pan = useState(new Animated.ValueXY())[0];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
  });

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    let displayWidth = width;
    let displayHeight = height;

    // Adjust for landscape images
    if (width > height) {
      displayWidth = Math.min(width, MAX_IMAGE_WIDTH);
      displayHeight = (height / width) * displayWidth;
    } 
    // Adjust for portrait images
    else {
      displayHeight = Math.min(height, MAX_IMAGE_HEIGHT);
      displayWidth = (width / height) * displayHeight;
    }

    setImageSize({ width: displayWidth, height: displayHeight });
  };

  const closeModal = () => {
    Animated.timing(pan, {
      toValue: { x: 0, y: 0 },
      duration: 200,
      useNativeDriver: false,
    }).start(() => setModalVisible(false));
  };

  return (
    <>
      <View style={[styles.container, isMe ? styles.myContainer : styles.otherContainer]}>
        {!isMe && (
          <View style={styles.avatar}>
            <CommonAvatar
              size={32}
              uri={message.sender.image?.url}
              mode={message.sender.roles.includes('EXPERT') ? 'expert' : 'runner'}
            />
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <View style={styles.header}>
            <Icon name="image" size={20} color={isMe ? '#fff' : theme.colors.primaryDark} />
            <Text style={[styles.title, isMe && styles.myText]}>
              Image
            </Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <RNImage
              source={{ uri: message.content.url }}
              style={[
                styles.image,
                {
                  width: imageSize.width || MAX_IMAGE_WIDTH,
                  height: imageSize.height || MAX_IMAGE_HEIGHT,
                },
              ]}
              resizeMode="contain"
              onLoad={handleImageLoad}
            />
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={isMe ? styles.myTime : styles.otherTime}>
              {formatTimestampAgo(message.created_at)}
            </Text>
            {isMe && (
              <Icon
                name={message.read_at ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={message.read_at ? theme.colors.primaryDark : 'rgba(255,255,255,0.5)'}
                style={styles.icon}
              />
            )}
          </View>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={closeModal}
          />
          
          <Animated.View
            style={[
              styles.fullImageContainer,
              {
                transform: [{ translateX: pan.x }, { translateY: pan.y }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <RNImage
              source={{ uri: message.content.url }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </Animated.View>

          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: theme.colors.primaryDark,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  myText: {
    color: '#fff',
  },
  image: {
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  myTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  otherTime: {
    fontSize: 12,
    color: '#666',
  },
  icon: {
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  fullImageContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.8,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});