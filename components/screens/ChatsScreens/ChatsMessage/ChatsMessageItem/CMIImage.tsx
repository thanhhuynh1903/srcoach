import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image as RNImage,
  PanResponder,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { CommonAvatar } from '../../../../commons/CommonAvatar';
import { theme } from '../../../../contants/theme';
import { formatTimestampAgo } from '../../../../utils/utils_format';
import CommonDialog from '../../../../commons/CommonDialog';
import { archiveMessage } from '../../../../utils/useChatsAPI';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_IMAGE_WIDTH = SCREEN_WIDTH * 0.7;
const MAX_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.3;

interface CMIImageProps {
  message: {
    id: string;
    content: { url: string } | null;
    created_at: string;
    read_at?: string;
    archived?: boolean;
    sender: {
      image?: {
        url: string;
      };
      roles?: string[];
    };
  };
  isMe: boolean;
}

export const CMIImage: React.FC<CMIImageProps> = ({ message, isMe }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isArchived, setIsArchived] = useState(message?.archived || false);
  const [isPressed, setIsPressed] = useState(false);

  // Animation refs
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Gesture tracking refs
  const currentScale = useRef(1);
  const currentTranslate = useRef({ x: 0, y: 0 });
  const pinchDistance = useRef(0);
  const isPinching = useRef(false);

  const handleImageLoad = (event: any) => {
    if (isArchived || !message.content) return;
    
    const { width, height } = event.nativeEvent.source;
    const aspectRatio = width / height;
    
    let displayWidth = Math.min(width, MAX_IMAGE_WIDTH);
    let displayHeight = displayWidth / aspectRatio;
    
    if (displayHeight > MAX_IMAGE_HEIGHT) {
      displayHeight = MAX_IMAGE_HEIGHT;
      displayWidth = displayHeight * aspectRatio;
    }

    setImageSize({ width: displayWidth, height: displayHeight });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        if (e.nativeEvent.touches.length === 2) {
          isPinching.current = true;
          const touch1 = e.nativeEvent.touches[0];
          const touch2 = e.nativeEvent.touches[1];
          pinchDistance.current = Math.hypot(
            touch2.pageX - touch1.pageX,
            touch2.pageY - touch1.pageY
          );
        } else {
          isPinching.current = false;
          translateX.setOffset(currentTranslate.current.x);
          translateY.setOffset(currentTranslate.current.y);
          translateX.setValue(0);
          translateY.setValue(0);
        }
      },
      onPanResponderMove: (e, gestureState) => {
        if (isPinching.current && e.nativeEvent.touches.length === 2) {
          const touch1 = e.nativeEvent.touches[0];
          const touch2 = e.nativeEvent.touches[1];
          const distance = Math.hypot(
            touch2.pageX - touch1.pageX,
            touch2.pageY - touch1.pageY
          );
          
          const newScale = (distance / pinchDistance.current) * currentScale.current;
          scale.setValue(Math.min(Math.max(newScale, 0.5), 3));
        } else if (!isPinching.current) {
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        currentTranslate.current = {
          x: translateX._value + currentTranslate.current.x,
          y: translateY._value + currentTranslate.current.y
        };
        
        translateX.flattenOffset();
        translateY.flattenOffset();
        
        if (isPinching.current) {
          currentScale.current = scale._value;
          isPinching.current = false;
        }
      },
      onPanResponderTerminate: () => {
        isPinching.current = false;
      }
    })
  ).current;

  const openModal = () => {
    if (isArchived || !message.content) return;
    setModalVisible(true);
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    currentScale.current = 1;
    currentTranslate.current = { x: 0, y: 0 };
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(() => setModalVisible(false));
  };

  const handleArchive = async () => {
    setShowArchiveDialog(false);
    const response = await archiveMessage(message.id);
    if (response.status) {
      setIsArchived(true);
      setShowConfirmDialog(false);
    }
  };

  const handleLongPress = () => {
    if (isMe && !isArchived) {
      setShowArchiveDialog(true);
    }
  };

  useEffect(() => {
    setIsArchived(message?.archived || false);
  }, [message?.archived]);

  if (isArchived || !message.content) {
    return (
      <View
        style={[
          styles.container,
          isMe ? styles.myContainer : styles.otherContainer,
        ]}>
        {!isMe && (
          <View style={styles.avatar}>
            <CommonAvatar
              size={32}
              uri={message.sender.image?.url}
              mode={message.sender.roles?.includes('expert') ? 'expert' : 'runner'}
            />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isMe ? styles.myBubble : styles.otherBubble,
            isMe ? styles.archivedBubble : styles.archivedOtherBubble,
          ]}>
          <Text style={[styles.archivedText, isMe && styles.myArchivedText]}>
            Image deleted{isMe ? ' by you' : ''}
          </Text>
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
    );
  }

  return (
    <>
      <Pressable
        style={[
          styles.container,
          isMe ? styles.myContainer : styles.otherContainer,
        ]}
        onLongPress={handleLongPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        delayLongPress={300}>
        {!isMe && (
          <View style={styles.avatar}>
            <CommonAvatar
              size={32}
              uri={message.sender.image?.url}
              mode={message.sender.roles?.includes('expert') ? 'expert' : 'runner'}
            />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isMe ? styles.myBubble : styles.otherBubble,
            isPressed && isMe && styles.pressedBubble,
          ]}>
          <View style={styles.header}>
            <Icon name="image" size={20} color={isMe ? '#fff' : theme.colors.primaryDark} />
            <Text style={[styles.title, isMe && styles.myText]}>Image</Text>
          </View>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={openModal}>
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
          </View>
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
      </Pressable>

      <Modal visible={modalVisible} transparent={true} onRequestClose={closeModal}>
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
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
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

      <CommonDialog
        visible={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        title="Message Options"
        content={
          <View>
            <Text style={styles.dialogContentText}>
              What would you like to do with this image?
            </Text>
            <TouchableOpacity
              style={styles.dialogActionButton}
              onPress={() => {
                setShowArchiveDialog(false);
                setShowConfirmDialog(true);
              }}>
              <Icon name="archive" size={20} color={theme.colors.primaryDark} />
              <Text style={styles.dialogActionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <CommonDialog
        visible={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Confirm Delete"
        content={
          <View>
            <Text style={styles.dialogContentText}>
              Are you sure you want to delete this image?
            </Text>
            <View style={styles.dialogButtonGroup}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogCancelButton]}
                onPress={() => setShowConfirmDialog(false)}>
                <Text style={styles.dialogCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogConfirmButton]}
                onPress={handleArchive}>
                <Text style={styles.dialogConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
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
  archivedBubble: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: theme.colors.primaryDark,
  },
  archivedOtherBubble: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  pressedBubble: { opacity: 0.8 },
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
  imageContainer: {
    maxWidth: MAX_IMAGE_WIDTH,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'center',
    maxWidth: '100%',
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
  archivedText: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 14,
  },
  myArchivedText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dialogContentText: {
    color: '#000',
    fontSize: 16,
    marginBottom: 20,
  },
  dialogActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  dialogActionButtonText: {
    color: '#000',
    fontSize: 16,
    marginLeft: 12,
  },
  dialogButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  dialogButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginLeft: 10,
  },
  dialogCancelButton: {
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
  },
  dialogConfirmButton: {
    backgroundColor: '#d30000',
  },
  dialogCancelButtonText: {
    color: theme.colors.primaryDark,
  },
  dialogConfirmButtonText: {
    color: '#fff',
  },
});