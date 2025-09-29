import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import * as Progress from 'react-native-progress';
import { Buffer } from 'buffer';
import logo from '../../assets/logo.png';

const screenWidth = Dimensions.get('window').width;

/* ---------------- Theme (Billix) ---------------- */
const COLORS = {
  appBg: '#EAF6F0',
  surface: '#FFFFFF',
  primary: '#1F8A6E',
  primaryDark: '#176C57',
  primarySoft: '#E8F7F2',
  outline: '#DDEBE3',
  text: '#0B1C15',
  textSubtle: '#5B6A61',
  danger: '#D92D20',
};

const RADII = { sm: 10, md: 14, lg: 18, xl: 24, full: 999 };
const SPACING = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 };

/* ---------------- Utils ---------------- */
const convertImageToBase64 = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
};

const formatDate = (isoLike) => {
  if (!isoLike) return '';
  try {
    const d = new Date(isoLike);
    if (Number.isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  } catch {
    return String(isoLike);
  }
};

// get token from either 'token' or 'tokenData'
const getAuthToken = async () => {
  let token = await AsyncStorage.getItem('token');
  if (!token) {
    const td = await AsyncStorage.getItem('tokenData');
    if (td) {
      try {
        token = JSON.parse(td)?.token ?? null;
      } catch {
        token = null;
      }
    }
  }
  return token;
};

/* ---------------- Component ---------------- */
const ProfileScreen = ({ navigation }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [points, setPoints] = useState(0);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userState, setUserState] = useState(''); // renamed from "state"
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [trustScore, setTrustScore] = useState(4.2);
  const [accountStatus, setAccountStatus] = useState('Active');

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const fetchProfileData = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        console.warn('No token found; cannot fetch /profile');
        return;
      }
      const response = await fetch('http://127.0.0.1:5000/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const text = await response.text();
      if (response.ok) {
        const data = JSON.parse(text);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || '');
        setPhone(data.phone_number || '');
        setUserState((data.state ?? '').toString());
        setGender(data.gender || '');
        setDob(formatDate(data.dob ?? ''));
        setPoints(data.points || 0);
        setTrustScore(
          typeof data.trust_score === 'number'
            ? data.trust_score
            : (data.trust_score ? Number(data.trust_score) : 4.2)
        );
        setProfilePicture(
          data.profile_picture?.startsWith('data:')
            ? data.profile_picture
            : data.profile_picture
            ? `data:image/jpeg;base64,${data.profile_picture}`
            : null
        );
      } else {
        console.error('Failed to fetch profile data:', text);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    }
  };

  // Profile completeness (simple heuristic)
  const completeness = [
    firstName, lastName, email, phone, userState, gender, dob, profilePicture,
  ].filter(Boolean).length / 8;

  useEffect(() => { fetchProfileData(); }, []);

  const uploadProfilePicture = async (base64) => {
    try {
      setUploading(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Not signed in', 'Please log in again.');
        return false;
      }
      const cleanedBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
      const res = await fetch('http://127.0.0.1:5000/update-profile-picture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile_picture: cleanedBase64 }),
      });
      const resText = await res.text();
      if (!res.ok) throw new Error(resText);
      return true;
    } catch (err) {
      console.error('Upload ERROR:', err.message);
      Alert.alert('Upload failed', 'Please try a smaller image or check your connection.');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const choosePhotoFromLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.7,
      },
      async (response) => {
        if (!response.didCancel && !response.errorCode && response.assets?.[0]?.base64) {
          const base64Image = `data:${response.assets[0].type};base64,${response.assets[0].base64}`;
          setProfilePicture(base64Image);
          const success = await uploadProfilePicture(base64Image);
          if (success) await fetchProfileData();
        }
      }
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('tokenData');
    Alert.alert('Logout', 'You have been logged out.', [
      { text: 'OK', onPress: () => navigation.replace('Login') },
    ]);
  };

  const imageSource =
    profilePicture && profilePicture.startsWith('data:image/')
      ? { uri: profilePicture }
      : logo;

  const QuickButton = ({ label, onPress, variant = 'primary' }) => {
    const base = [styles.quickButtonBase];
    if (variant === 'primary') base.push(styles.quickButtonPrimary);
    if (variant === 'secondary') base.push(styles.quickButtonSecondary);
    if (variant === 'outline') base.push(styles.quickButtonOutline);
    const textStyle = [styles.quickText, variant === 'outline' ? { color: COLORS.primaryDark } : { color: '#fff' }];
    return (
      <TouchableOpacity style={base} onPress={onPress} activeOpacity={0.85}>
        <Text style={textStyle}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const Section = ({ title, children, right }) => (
    <View style={styles.section}>
      {(title || right) && (
        <View style={styles.sectionHead}>
          {title ? <Text style={styles.sectionTitle}>{title}</Text> : <View />}
          {right || null}
        </View>
      )}
      {children}
    </View>
  );

  const ItemRow = ({ label, value }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemValue} numberOfLines={1}>{value}</Text>
    </View>
  );

  const onOpenStatic = (title) => {
    navigation.navigate('StaticPage', {
      title,
      body:
        title === 'Privacy'
          ? 'Our Privacy Policy explains what data Billix collects, how we use it, and the choices you have.'
          : title === 'Legal'
          ? 'These Terms govern your use of Billix, including acceptable use, limitations of liability, and dispute resolution.'
          : 'Need help? Contact support@billix.app or check our in-app FAQs for common questions.',
    });
  };

  /* ---------------- Render ---------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
      >
        {/* Hero / Header */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.greeting}>Welcome back</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {firstName || 'John'} {lastName || 'Doe'}
              </Text>

              {/* Badges: trust, verified, and STATE */}
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: COLORS.primarySoft }]}>
                  <Text style={[styles.badgeText, { color: COLORS.primaryDark }]}>★ {Number(trustScore || 0).toFixed(2)} / 5</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: '#EAF6EF' }]}>
                  <Text style={[styles.badgeText, { color: COLORS.primaryDark }]}>Verified</Text>
                </View>
                {!!userState && (
                  <View style={[styles.badge, { backgroundColor: '#EEF8F2' }]}>
                    <Text style={[styles.badgeText, { color: COLORS.primaryDark }]}>
                      {String(userState).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity onPress={choosePhotoFromLibrary} activeOpacity={0.9} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={styles.avatarWrap}>
                <Image style={styles.avatar} source={imageSource} />
                <Text style={styles.editAvatar}>Edit</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Trust meter + points */}
          <View style={styles.heroMeters}>
            <View style={styles.meterBlock}>
              <Text style={styles.meterLabel}>Trust</Text>
              <Progress.Bar progress={Math.min(1, (Number(trustScore || 0) / 5))} width={null} height={8} color={COLORS.primary} unfilledColor={COLORS.outline} borderWidth={0} />
            </View>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>{points} pts</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions (removed "My Bills") */}
        <View style={styles.quickActionsRow}>
          <QuickButton label="Edit Profile" onPress={() => navigation.navigate('AccountControlsScreen')} variant="primary" />
          <QuickButton label="Help" onPress={() => onOpenStatic('Support')} variant="outline" />
        </View>

        {/* Profile completeness */}
        <Section
          title="Profile Completeness"
          right={<Text style={styles.sectionRightText}>{Math.round(completeness * 100)}%</Text>}
        >
          <Progress.Bar progress={completeness} width={null} height={10} color={COLORS.primary} unfilledColor={COLORS.outline} borderWidth={0} />
          <Text style={styles.completionHint}>Complete your profile to improve trust and unlock perks.</Text>
        </Section>

        {/* Account Overview */}
        <Section title="Account Overview">
          <ItemRow label="Name" value={`${firstName || 'John'} ${lastName || 'Doe'}`} />
          <ItemRow label="Email" value={email || 'you@email.com'} />
          <ItemRow label="Phone" value={phone || '—'} />
          {/* <ItemRow label="State" value={userState || '—'} /> */}
          <ItemRow label="Gender" value={gender || '—'} />
          {/* <ItemRow label="Date of Birth" value={dob || '—'} /> */}
          <ItemRow label="Account Status" value={accountStatus} />
        </Section>

        {/* Links */}
        <Section title="More">
          {[
            { key: 'Privacy', onPress: () => onOpenStatic('Privacy') },
            { key: 'Legal', onPress: () => onOpenStatic('Legal') },
            { key: 'Support', onPress: () => onOpenStatic('Support') },
          ].map(({ key, onPress }) => (
            <TouchableOpacity key={key} style={styles.linkItem} activeOpacity={0.7} onPress={onPress}>
              <Text style={styles.itemText}>{key}</Text>
              <Text style={styles.chev}>›</Text>
            </TouchableOpacity>
          ))}
        </Section>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Persistent Logout CTA */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.9}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.appBg },

  scrollContainer: { paddingBottom: 160 },

  /* Hero */
  hero: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    borderRadius: RADII.xl,
    padding: SPACING.lg,
    ...shadow(3),
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center' },
  greeting: { color: COLORS.textSubtle, fontWeight: '700', marginBottom: 2 },
  userName: { fontSize: 26, fontWeight: '900', color: COLORS.text, maxWidth: screenWidth - 170 },
  badgeRow: { flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' },
  badge: {
    borderRadius: RADII.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    ...shadow(1),
  },
  badgeText: { fontWeight: '800', fontSize: 12, color: COLORS.text },
  avatarWrap: { alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: COLORS.outline,
    backgroundColor: '#cfd8d1',
  },
  editAvatar: { marginTop: 6, fontSize: 12, fontWeight: '800', color: COLORS.primaryDark },

  heroMeters: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  meterBlock: { flex: 1 },
  meterLabel: { color: COLORS.textSubtle, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  heroChip: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.full,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  heroChipText: { color: COLORS.primaryDark, fontWeight: '900' },

  /* Quick actions */
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
  },
  quickButtonBase: {
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexGrow: 1,
    minWidth: (screenWidth - SPACING.xl * 2 - 10) / 2,
    ...shadow(1),
  },
  quickButtonPrimary: { backgroundColor: COLORS.primary },
  quickButtonSecondary: { backgroundColor: COLORS.primaryDark },
  quickButtonOutline: { borderWidth: 1.5, borderColor: COLORS.primaryDark, backgroundColor: 'transparent' },
  quickText: { fontWeight: '900', fontSize: 14 },

  /* Sections */
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    ...shadow(2),
  },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text },
  sectionRightText: { fontWeight: '900', color: COLORS.primaryDark },

  completionHint: { marginTop: 8, color: COLORS.textSubtle, fontWeight: '600', fontSize: 12 },

  /* Key-value rows */
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#EEF2EF',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLabel: { fontSize: 14, color: COLORS.textSubtle, fontWeight: '700' },
  itemValue: { fontSize: 15, color: COLORS.text, marginLeft: 12, flexShrink: 1, textAlign: 'right', fontWeight: '700' },

  itemText: { fontSize: 14, color: COLORS.text, fontWeight: '700' },
  linkItem: {
    paddingVertical: 14,
    borderTopColor: '#EEF2EF',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chev: { color: COLORS.textSubtle, fontSize: 20, marginLeft: 8 },

  /* Logout */
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.danger,
    paddingVertical: 15,
    borderRadius: RADII.lg,
    ...shadow(4),
  },
  logoutText: { color: '#fff', fontWeight: '900', fontSize: 16, textAlign: 'center', letterSpacing: 0.2 },
});

/* Consistent shadows */
function shadow(level = 2) {
  const elevation = Math.min(8, Math.max(1, level * 1.6));
  const opacity = 0.06 + level * 0.01;
  const radius = 3 + level * 1.6;
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 + level },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}

export default ProfileScreen;
