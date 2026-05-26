import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import { CONVERSATIONS } from '../data/messages';

function avatarHue(name) {
  return name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
}

function ConversationRow({ item, onPress }) {
  const { colors } = useAppTheme();
  const hue = avatarHue(item.contact);

  return (
    <TouchableOpacity
      style={[row.wrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
    >
      {/* Avatar */}
      <View style={[row.avatar, { backgroundColor: `hsl(${hue}, 50%, 38%)` }]}>
        <Text style={row.avatarText}>{item.contact.charAt(0)}</Text>
      </View>

      {/* Body */}
      <View style={row.body}>
        <View style={row.topLine}>
          <Text style={[row.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.contact}
          </Text>
          <Text style={[row.time, { color: colors.textMuted }]}>{item.time}</Text>
        </View>
        <View style={row.bottomLine}>
          <Text
            style={[row.preview, { color: item.unread ? colors.textPrimary : colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={row.unreadBadge}>
              <Text style={row.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  body: { flex: 1 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  time: { fontSize: 12 },
  bottomLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  preview: { fontSize: 13, flex: 1, marginRight: 8 },
  unreadBadge: {
    backgroundColor: '#1B5E20',
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

export default function MessagesScreen({ navigation }) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle={colors.background === '#121212' ? 'light-content' : 'dark-content'} />

      <View style={[hdr.wrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[hdr.title, { color: colors.textPrimary }]}>Messages</Text>
      </View>

      <FlatList
        data={CONVERSATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationRow
            item={item}
            onPress={(conv) => navigation.navigate('Chat', { conversation: conv })}
          />
        )}
        contentContainerStyle={{ backgroundColor: colors.surface }}
      />
    </SafeAreaView>
  );
}

const hdr = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontWeight: '700' },
});
