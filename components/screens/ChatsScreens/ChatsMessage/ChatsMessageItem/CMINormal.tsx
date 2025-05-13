import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { CommonAvatar } from '../../../../commons/CommonAvatar';
import { theme } from '../../../../contants/theme';
import { formatTimestampAgo } from '../../../../utils/utils_format';

interface CMINormalProps {
  message: any;
  isMe: boolean;
}

export const CMINormal = ({ message, isMe }: CMINormalProps) => {
  const [hasLink, setHasLink] = useState(false);
  const [linkData, setLinkData] = useState<{
    url: string;
    title?: string;
    description?: string;
    image?: string;
  } | null>(null);

  useEffect(() => {
    const detectLinks = () => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = message.content.match(urlRegex);
      
      if (urls && urls.length > 0) {
        setHasLink(true);
        // For simplicity, we'll just use the first URL found
        const url = urls[0];
        
        // In a real app, you might want to fetch metadata from the URL here
        // For now, we'll just extract the domain and use a placeholder image
        const domain = url.replace(/^https?:\/\/(?:www\.)?([^\/]+).*$/, '$1');
        
        setLinkData({
          url,
          title: domain,
          description: 'Tap to open link',
          image: `https://logo.clearbit.com/${domain}?size=200`
        });
      } else {
        setHasLink(false);
        setLinkData(null);
      }
    };

    detectLinks();
  }, [message.content]);

  const handleLinkPress = () => {
    if (linkData?.url) {
      Linking.openURL(linkData.url).catch(err => 
        console.error('Failed to open URL:', err)
      );
    }
  };

  const renderTextWithLinks = () => {
    if (!hasLink) {
      return <Text style={isMe ? styles.myText : styles.otherText}>{message.content}</Text>;
    }

    const parts = message.content.split(/(https?:\/\/[^\s]+)/g);
    
    return (
      <Text style={isMe ? styles.myText : styles.otherText}>
        {parts.map((part: string, index: number) => {
          if (part.match(/https?:\/\/[^\s]+/)) {
            return (
              <Text 
                key={index} 
                style={styles.linkText}
                onPress={() => Linking.openURL(part).catch(err => console.error('Failed to open URL:', err))}
              >
                {part}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <View style={[styles.container, isMe ? styles.myContainer : styles.otherContainer]}>
      {!isMe && (
        <View style={styles.avatar}>
          <CommonAvatar
            size={32}
            uri={message.sender.image?.url}
            mode={message.sender.roles?.includes('expert') ? 'expert' : 'runner'}
          />
        </View>
      )}
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        {renderTextWithLinks()}
        
        {hasLink && linkData && (
          <TouchableOpacity 
            style={[
              styles.linkPreview, 
              isMe ? styles.myLinkPreview : styles.otherLinkPreview
            ]}
            onPress={handleLinkPress}
            activeOpacity={0.7}
          >
            {linkData.image && (
              <Image 
                source={{ uri: linkData.image }} 
                style={styles.linkImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.linkTextContainer}>
              <Text 
                style={[
                  styles.linkTitle,
                  isMe && styles.myLinkText
                ]}
                numberOfLines={1}
              >
                {linkData.title}
              </Text>
              {linkData.description && (
                <Text 
                  style={[
                    styles.linkDescription,
                    isMe && styles.myLinkText
                  ]}
                  numberOfLines={2}
                >
                  {linkData.description}
                </Text>
              )}
              <Text 
                style={[
                  styles.linkUrl,
                  isMe && styles.myLinkText
                ]}
                numberOfLines={1}
              >
                {linkData.url}
              </Text>
            </View>
          </TouchableOpacity>
        )}

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
  myText: {
    color: '#fff',
    fontSize: 16,
  },
  otherText: {
    color: '#000',
    fontSize: 16,
  },
  linkText: {
    color: '#1a73e8',
    textDecorationLine: 'underline',
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
  linkPreview: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  myLinkPreview: {
    borderColor: 'rgba(255,255,255,0.2)',
  },
  otherLinkPreview: {
    borderColor: 'rgba(0,0,0,0.1)',
  },
  linkImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  linkTextContainer: {
    padding: 10,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 12,
    color: '#1a73e8',
  },
  myLinkText: {
    color: '#fff',
  },
});