import React from 'react';
import { View, Text, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/dark';
import { useLocalNotifs } from './orderNotifs';

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

export default function NotificationsScreen({ notifs: remote }: { notifs: Notif[]; onDelete?: (id: number) => void }) {
  const local = useLocalNotifs();
  const notifs = [...local, ...remote];
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
    <View>
      {notifs.map((n, i) => (
        <View key={n.id} style={[s.row, i < notifs.length - 1 && s.sep]}>
          <View style={s.line} />
          <View style={s.body}>
            <Text style={s.title}>{n.title}</Text>
            {!!n.description && <Text style={s.desc}>{n.description}</Text>}
            {!!n.image_url && <Image source={{ uri: n.image_url }} style={s.image} resizeMode="cover" />}
            {!!n.link && (
              <TouchableOpacity style={s.linkRow} onPress={() => Linking.openURL(n.link!)}>
                <Text style={s.link}>Open</Text>
                <Feather name="arrow-up-right" size={14} color={colors.goldLight} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={s.time}>{ago(n.created_at)}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 16 },
  sep: { borderBottomWidth: 1, borderBottomColor: colors.line },
  time: { color: colors.gray, fontSize: 12, fontWeight: '600', paddingTop: 2, textAlign: 'right' },
  line: { width: 3, height: 28, borderRadius: 2, backgroundColor: colors.goldLight, marginTop: 1 },
  body: { flex: 1, gap: 8 },
  title: { color: colors.white, fontSize: 15, fontWeight: '700' },
  desc: { color: colors.gray, fontSize: 14, lineHeight: 21 },
  image: { width: '100%', height: 160, borderRadius: 12 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  link: { color: colors.goldLight, fontSize: 13.5, fontWeight: '700' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 60 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(201,162,39,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
  emptySub: { color: colors.gray, fontSize: 14, textAlign: 'center' },
});
