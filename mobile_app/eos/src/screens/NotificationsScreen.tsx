import React from 'react';
import { View, Text, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, cardShadow } from '../theme/dark';

export type Notif = {
  id: number; title: string; description: string | null;
  image_url: string | null; link: string | null; created_at: string;
};

function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (isNaN(m) || m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsScreen({ notifs, onDelete }: { notifs: Notif[]; onDelete: (id: number) => void }) {
  if (!notifs.length) {
    return (
      <View style={s.empty}>
        <View style={s.emptyIcon}><Feather name="bell-off" size={26} color={colors.goldLight} /></View>
        <Text style={s.emptyTitle}>You're all caught up</Text>
        <Text style={s.emptySub}>New announcements and updates will show up here.</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {notifs.map((n) => (
        <View key={n.id} style={s.card}>
          <View style={s.head}>
            <View style={s.iconWrap}><Feather name="bell" size={16} color={colors.goldLight} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{n.title}</Text>
              <Text style={s.time}>{ago(n.created_at)}</Text>
            </View>
            <TouchableOpacity onPress={() => onDelete(n.id)} hitSlop={10} style={s.del}>
              <Feather name="trash-2" size={17} color={colors.gray} />
            </TouchableOpacity>
          </View>
          {!!n.description && <Text style={s.desc}>{n.description}</Text>}
          {!!n.image_url && <Image source={{ uri: n.image_url }} style={s.image} resizeMode="cover" />}
          {!!n.link && (
            <TouchableOpacity style={s.linkRow} onPress={() => Linking.openURL(n.link!)}>
              <Text style={s.link}>Open</Text>
              <Feather name="arrow-up-right" size={14} color={colors.goldLight} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.charcoal2, ...cardShadow, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 16, gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(201,162,39,0.15)', alignItems: 'center', justifyContent: 'center' },
  del: { padding: 4 },
  title: { color: colors.white, fontSize: 15, fontWeight: '700' },
  time: { color: colors.gray, fontSize: 12, marginTop: 2 },
  desc: { color: colors.gray, fontSize: 14, lineHeight: 21 },
  image: { width: '100%', height: 160, borderRadius: 12 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  link: { color: colors.goldLight, fontSize: 13.5, fontWeight: '700' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 60 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(201,162,39,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
  emptySub: { color: colors.gray, fontSize: 14, textAlign: 'center' },
});
