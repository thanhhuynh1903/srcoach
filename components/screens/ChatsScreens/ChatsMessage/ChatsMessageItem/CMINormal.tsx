import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  Pressable,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {CommonAvatar} from '../../../../commons/CommonAvatar';
import {theme} from '../../../../contants/theme';
import {formatTimestampAgo} from '../../../../utils/utils_format';
import CommonDialog from '../../../../commons/CommonDialog';
import {archiveMessage} from '../../../../utils/useChatsAPI';

export const CMINormal = ({message, isMe}: {message: any; isMe: boolean}) => {
  const [hasLink, setHasLink] = useState(false);
  const [linkData, setLinkData] = useState<any>(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isArchived, setIsArchived] = useState(message.archived || false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (message.archived) {
      setIsArchived(true);
    } else {
      detectLinks();
    }
  }, [message.content]);

  const detectLinks = () => {
    if (isArchived) {
      setHasLink(false);
      return;
    }
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content?.match(urlRegex);
    if (!urls) {
      setHasLink(false);
      return;
    }

    setHasLink(true);
    const url = urls[0];
    const domain = url.replace(/^https?:\/\/(?:www\.)?([^\/]+).*$/, '$1');
    setLinkData({
      url,
      title: domain,
      description: 'Tap to open link',
      image: `https://logo.clearbit.com/${domain}?size=200`,
    });
  };

  const renderTextWithLinks = () => {
    if (!hasLink)
      return (
        <Text style={isMe ? styles.myText : styles.otherText}>
          {message.content}
        </Text>
      );

    return (
      <Text style={isMe ? styles.myText : styles.otherText}>
        {message.content
          .split(/(https?:\/\/[^\s]+)/g)
          .map((part: string, index: number) =>
            part.match(/https?:\/\/[^\s]+/) ? (
              <Text
                key={index}
                style={styles.linkText}
                onPress={() => Linking.openURL(part)}>
                {part}
              </Text>
            ) : (
              <Text key={index}>{part}</Text>
            ),
          )}
      </Text>
    );
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
    if (isMe) {
      setShowArchiveDialog(true);
    }
  };

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
          <CommonAvatar
            size={32}
            uri={message.sender.image?.url}
            mode={
              message.sender.roles?.includes('expert') ? 'expert' : 'runner'
            }
          />
        )}
        <View
          style={[
            styles.bubble,
            isMe ? styles.myBubble : styles.otherBubble,
            isPressed && isMe && styles.pressedBubble,
            isArchived &&
              (isMe ? styles.archivedBubble : styles.archivedOtherBubble),
          ]}>
          {isArchived ? (
            <Text style={[styles.archivedText, isMe && styles.myArchivedText]}>
              Message deleted{isMe ? ' by you' : ''}
            </Text>
          ) : (
            <>
              {renderTextWithLinks()}
              {hasLink && linkData && (
                <TouchableOpacity
                  style={[
                    styles.linkPreview,
                    isMe ? styles.myLinkPreview : styles.otherLinkPreview,
                  ]}
                  onPress={() => Linking.openURL(linkData.url)}>
                  {linkData.image && (
                    <Image
                      source={{uri: linkData.image}}
                      style={styles.linkImage}
                    />
                  )}
                  <View style={styles.linkTextContainer}>
                    <Text style={[styles.linkTitle, isMe && styles.myLinkText]}>
                      {linkData.title}
                    </Text>
                    <Text
                      style={[
                        styles.linkDescription,
                        isMe && styles.myLinkText,
                      ]}>
                      {linkData.description}
                    </Text>
                    <Text style={[styles.linkUrl, isMe && styles.myLinkText]}>
                      {linkData.url}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              <View style={styles.footer}>
                <Text style={isMe ? styles.myTime : styles.otherTime}>
                  {formatTimestampAgo(message.created_at)}
                </Text>
                {isMe && !isArchived && (
                  <Icon
                    name={message.read_at ? 'checkmark-done' : 'checkmark'}
                    size={14}
                    color={
                      message.read_at
                        ? theme.colors.primaryDark
                        : 'rgba(255,255,255,0.5)'
                    }
                  />
                )}
              </View>
            </>
          )}
        </View>
      </Pressable>

      <CommonDialog
        visible={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        title="Message Options"
        content={
          <View>
            <Text style={styles.dialogContentText}>
              What would you like to do with this message?
            </Text>
            <TouchableOpacity
              style={styles.dialogActionButton}
              onPress={() => {
                setShowArchiveDialog(false);
                setShowConfirmDialog(true);
              }}>
              <Icon name="archive" size={20} color={theme.colors.primaryDark} />
              <Text style={styles.dialogActionButtonText}>Archive</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <CommonDialog
        visible={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Confirm Archive"
        content={
          <View>
            <Text style={styles.dialogContentText}>
              Are you sure you want to archive this message?
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
                <Text style={styles.dialogConfirmButtonText}>Archive</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end'},
  myContainer: {justifyContent: 'flex-end'},
  otherContainer: {justifyContent: 'flex-start'},
  bubble: {maxWidth: '80%', padding: 12, borderRadius: 16, marginLeft: 8},
  myBubble: {
    backgroundColor: theme.colors.primaryDark,
    borderBottomRightRadius: 4,
  },
  otherBubble: {backgroundColor: '#e5e5ea', borderBottomLeftRadius: 4},
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
  pressedBubble: {opacity: 0.8},
  myText: {color: '#fff', fontSize: 16},
  otherText: {color: '#000', fontSize: 16},
  linkText: {color: '#1a73e8', textDecorationLine: 'underline'},
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  myTime: {fontSize: 12, color: 'rgba(255,255,255,0.7)'},
  otherTime: {fontSize: 12, color: '#666'},
  linkPreview: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  myLinkPreview: {borderColor: 'rgba(255,255,255,0.2)'},
  otherLinkPreview: {borderColor: 'rgba(0,0,0,0.1)'},
  linkImage: {width: '100%', height: 90, backgroundColor: '#f5f5f5'},
  linkTextContainer: {padding: 10},
  linkTitle: {fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 4},
  linkDescription: {fontSize: 12, color: '#666', marginBottom: 4},
  linkUrl: {fontSize: 12, color: '#1a73e8'},
  myLinkText: {color: '#fff'},
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
