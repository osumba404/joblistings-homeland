import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';

function avatarHue(name) {
  return name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
}

function MessageBubble({ message }) {
  const { colors } = useAppTheme();
  const isSent = message.sent;

  return (
    <View style={[bubble.row, isSent ? bubble.rowSent : bubble.rowReceived]}>
      <View
        style={[
          bubble.wrap,
          {
            backgroundColor: isSent ? colors.bubbleSent : colors.bubbleReceived,
            borderBottomRightRadius: isSent ? 4 : 16,
            borderBottomLeftRadius: isSent ? 16 : 4,
          },
        ]}
      >
        <Text style={[bubble.text, { color: isSent ? colors.bubbleSentText : colors.bubbleReceivedText }]}>
          {message.text}
        </Text>
      </View>
      <Text style={[bubble.time, { color: colors.textMuted, alignSelf: isSent ? 'flex-end' : 'flex-start' }]}>
        {message.time}
      </Text>
    </View>
  );
}

const bubble = StyleSheet.create({
  row: { marginHorizontal: 16, marginBottom: 12, maxWidth: '78%' },
  rowSent: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  rowReceived: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  wrap: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: { fontSize: 14, lineHeight: 20 },
  time: { fontSize: 11, marginTop: 3 },
});

export default function ChatScreen({ route, navigation }) {
  const { conversation } = route.params;
  const { colors } = useAppTheme();
  const listRef = useRef(null);
  const hue = avatarHue(conversation.contact);

  useEffect(() => {
    // Scroll to bottom on mount
    setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.background === '#121212' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[chat.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={chat.backBtn} hitSlop={12}>
          <Text style={[chat.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>

        <View style={[chat.avatar, { backgroundColor: `hsl(${hue}, 50%, 38%)` }]}>
          <Text style={chat.avatarText}>{conversation.contact.charAt(0)}</Text>
        </View>

        <View style={chat.headerText}>
          <Text style={[chat.contactName, { color: colors.textPrimary }]} numberOfLines={1}>
            {conversation.contact}
          </Text>
          <Text style={[chat.contactRole, { color: colors.textMuted }]}>{conversation.role}</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={conversation.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input bar (static — send is out of scope) */}
      <View style={[chat.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={[chat.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[chat.inputPlaceholder, { color: colors.textMuted }]}>
            Type a message…
          </Text>
        </View>
        <View style={[chat.sendBtn, { backgroundColor: colors.primary }]}>
          <Text style={chat.sendIcon}>↑</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const chat = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: { marginRight: 4 },
  backText: { fontSize: 15, fontWeight: '500' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerText: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '700' },
  contactRole: { fontSize: 12, marginTop: 1 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  inputBox: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputPlaceholder: { fontSize: 14 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
