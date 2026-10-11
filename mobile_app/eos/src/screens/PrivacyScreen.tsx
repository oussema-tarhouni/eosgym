import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import BackButton from '../components/backbtnforspecific';


const SECTIONS = [
  { title: 'The short version', body: "We collect what we need to run your membership and bookings well, we never sell your data, and you can always ask to see, fix, or delete what we hold on you. The details are below." },
  { title: 'What we collect', body: "Account basics like your name, email, and phone number; membership and billing details; your fitness level and any health notes you choose to share with trainers; and usage data such as class bookings, attendance, and how you use the app." },
  { title: 'How we use it', body: "To run your membership — approving your account, processing bookings, tracking class credits, and renewing your plan. To keep you safe, by matching you to the right class level. To reach you about bookings, schedule changes, or renewals. And to see what's working in the app so we can improve it." },
  { title: 'Who sees it', body: "Trainers see what they need to run your session safely (your name, level, and any notes you've shared). We don't sell your personal data to anyone, ever. We share the minimum necessary with the service providers who keep the app and payments running — for example our hosting and payment processors — and only under contracts that protect your data." },
  { title: 'How long we keep it', body: "We keep your account and booking history for as long as your membership is active, plus a reasonable period after for legal, tax, and support purposes. If you ask us to delete your account, we'll remove what we can beyond what we're required to retain." },
  { title: 'Keeping it safe', body: "Your data is stored on secured servers with access limited to staff who need it to do their job. No system is perfectly unbreakable, but we take reasonable, industry-standard steps to protect what you share with us." },
  { title: 'Your rights', body: "You can ask to see, correct, export, or delete your personal data at any time — just message our support team in the app. You can also turn off non-essential notifications from your profile settings whenever you like." },
  { title: 'Changes to this policy', body: "If we make a meaningful change to how we handle your data, we'll let you know in the app before it takes effect." },
];

export default function PrivacyScreen() {
  const navigation = useNavigation<any>();
  return (
    <ScrollView contentContainerStyle={s.screen} bounces={false}>
      <View style={s.card}>
        <View style={s.ring} />

        <View style={s.back}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <Text style={s.h1}>Privacy Policy</Text>
        <Text style={s.sub}>How EOS Fitness & Pilates collects, uses, and protects your data.</Text>

        {SECTIONS.map((sec) => (
          <View key={sec.title} style={s.section}>
            <Text style={s.sectionTitle}>{sec.title}</Text>
            <Text style={s.body}>{sec.body}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: colors.charcoal },
  card: { flex: 1, width: '100%', backgroundColor: colors.charcoal, padding: 24, paddingTop: 110, gap: 18, overflow: 'hidden' },
  ring: { position: 'absolute', top: -60, right: -70, width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)' },
  back: { position: 'absolute', top: 60, left: 24, zIndex: 2 },
  h1: { color: colors.white, fontSize: 24, fontWeight: '700', marginTop: '30px' },
  sub: { color: colors.gray, fontSize: 13.5, lineHeight: 19, marginTop: -8 },
  section: { gap: 6 },
  sectionTitle: { color: colors.goldLight, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { color: colors.gray, fontSize: 13.5, lineHeight: 20 },
});
