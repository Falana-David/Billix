import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';
import { useBillStore } from './store/billstore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ----------------------------------
// Config
// ----------------------------------
const billTypes = [
  { label: 'Electricity',          value: 'electricity' },
  { label: 'Natural Gas',          value: 'natural_gas' },
  { label: 'Water',                value: 'water' },
  { label: 'Sewer / Wastewater',   value: 'sewer' },
  { label: 'Trash / Solid Waste',  value: 'trash' },
  { label: 'Propane (LPG)',        value: 'propane' },
  { label: 'Heating Oil',          value: 'heating_oil' },
  { label: 'District Energy',      value: 'district_energy' },
  { label: 'Internet',             value: 'internet' },
  { label: 'Mobile / Cellular',    value: 'mobile' },
  { label: 'Landline / VoIP',      value: 'landline_voip' },
  { label: 'Cable / Satellite TV', value: 'tv' },
  { label: 'Stormwater',           value: 'stormwater' },
  { label: 'Other Utility',        value: 'other_utility' },
];

// Theme tokens (shared look)
const BG = '#F3F7F2';
const FG = '#2C4731';
const ACCENT = '#2F5D4A';
const MINT = '#EAF2E7';
const CARD_BORDER = '#E6EFE9';
const INPUT_BORDER = '#A7C4B5';

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 2 },
});

// ----------------------------------
// Component
// ----------------------------------
const StartSwap = () => {
  const navigation = useNavigation();
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<any>(null);
  const [billType, setBillType] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 0..100

  // Animated progress (smooth tweening)
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  // Subtle shimmer while uploading
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!uploading) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 0, easing: Easing.linear, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [uploading, shimmer]);

  const setBillData = useBillStore(state => state.setBillData);

  const handlePick = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });
      setFile(res[0]);
      setFileName(res[0]?.name || 'Selected file');
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) console.error('Picker Error: ', e);
    }
  };

  const handleContinue = () => {
    if (!file || !billType) return;
    startUpload();
  };

  const startUpload = async () => {
    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'application/pdf',
        name: file.name || 'bill_upload',
      });
      formData.append('bill_type', billType!);

      const token = await AsyncStorage.getItem('token');

      const respText: string = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:5000/upload-bill');
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.min(99, Math.round((e.loaded / e.total) * 100));
            setProgress(pct);
          } else {
            setProgress((p) => (p < 95 ? p + 1 : p));
          }
        };

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
            else reject(new Error(xhr.responseText || `HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      setProgress(100);

      const data = JSON.parse(respText || '{}');

      const parseMoney = (s: any) => {
        if (!s) return null;
        const n = Number(String(s).replace(/[^0-9.]/g, ''));
        return Number.isFinite(n) ? n : null;
      };

      setBillData({
        billId: data.bill_id,
        fileUri: file.uri,
        billType,
        amountDue: parseMoney(data.insight?.amount_due),
        dueDate: data.insight?.due_date || null,
        provider: data.insight?.provider || null,
        scanConfidence: null,
        concern: null,
        payer: null,
        duration: null,
        confidence: null,
        tags: [],
      });

      try {
        await fetch('http://127.0.0.1:5000/api/market/listings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            billId: data.bill_id,
            insight: data.insight,
            friction: 'Low',
            perks: ['Self-install OK'],
            rating: 4.7,
            asks: 0,
          }),
        });
      } catch (e) {
        console.warn('market listing (light) failed', e);
      }

      setTimeout(() => {
        navigation.navigate('BillInsightQuestions' as never);
      }, 250);
    } catch (err: any) {
      console.error('Upload error:', err);
      Alert.alert('Upload Error', err?.message || 'Failed to upload');
      setProgress(0);
    } finally {
      setTimeout(() => setUploading(false), 400);
    }
  };

  // Animated widths
  const barWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  const shimmerLeft = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['-40%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerWrap}>
          <Text style={styles.header}>Upload your bill</Text>
          <Text style={styles.subText}>
            Got a utility bill? Add it here and we'll analyze it.
          </Text>
        </View>

        {/* Upload block */}
        <View style={styles.block}>
          <TouchableOpacity style={styles.uploadBox} onPress={handlePick} disabled={uploading}>
            <Text style={styles.uploadText}>
              {fileName || 'Tap to upload (PDF, JPG, PNG)'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Bill Type</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={billTypes}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select category"
            value={billType}
            onChange={item => setBillType(item.value)}
            disable={uploading}
          />
        </View>

        {/* Tips */}
        <View style={styles.block}>
          <Text style={styles.tip}>• Bill total and due date must be visible</Text>
          <Text style={styles.tip}>• Autopay bills are fine</Text>
          <Text style={styles.tip}>• Summary pages are accepted</Text>
        </View>

        {/* Privacy blurb */}
        <View style={styles.block}>
          <Text style={styles.securityText}>
            Your information is encrypted and securely stored. Billix will never share your
            bill data without your consent.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} disabled={uploading}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextButton, (!file || !billType || uploading) && styles.nextButtonDisabled]}
            disabled={!file || !billType || uploading}
            onPress={handleContinue}
          >
            <Text style={styles.nextButtonText}>
              {uploading ? 'Uploading…' : 'Continue →'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CENTERED uploading overlay */}
      <Modal visible={uploading} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.centerOverlay} pointerEvents="auto">
          <View style={styles.centerCard}>
            <Text style={styles.centerTitle}>Uploading</Text>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: barWidth }]}>
                <Animated.View style={[styles.shimmer, { left: shimmerLeft }]} />
              </Animated.View>
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
            <ActivityIndicator style={{ marginTop: 8 }} />
            <Text style={styles.uploadHint}>Please keep the app open while we process your file.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ----------------------------------
// Styles
// ----------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center' },
  headerWrap: { paddingTop: 80, paddingBottom: 8 },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: FG,
    textAlign: 'center',
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4A7C59',
    lineHeight: 20,
  },

  // Card blocks (match Insight page)
  block: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    width: '100%',
    ...shadow,
  },

  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ACCENT,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: { color: ACCENT, fontSize: 16, fontWeight: '600' },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: FG,
    marginBottom: 8,
    marginTop: 4,
  },
  dropdown: {
    backgroundColor: MINT,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: INPUT_BORDER,
  },
  dropdownText: { fontSize: 15, color: ACCENT },

  tip: { fontSize: 14, color: '#3C634B', marginBottom: 6, lineHeight: 20 },
  securityText: { fontSize: 14, color: ACCENT, lineHeight: 20, textAlign: 'center' },

  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 18, marginBottom: 12, width: '100%' },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#D9EDE1',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACCENT,
  },
  backButtonText: { color: ACCENT, fontSize: 15, fontWeight: '700' },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: ACCENT,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  nextButtonDisabled: { backgroundColor: '#A9B4A9' },

  // Centered overlay for uploading
  centerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  centerCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    ...shadow,
  },
  centerTitle: { color: FG, fontWeight: '900', fontSize: 18, marginBottom: 10 },

  // Animated progress
  progressTrack: {
    height: 10,
    backgroundColor: '#E6EFE9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 6,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  progressText: { marginTop: 6, color: ACCENT, fontSize: 12, textAlign: 'right', fontWeight: '700' },
  uploadHint: { marginTop: 8, color: '#3C634B', fontSize: 12, textAlign: 'center' },
});

export default StartSwap;
