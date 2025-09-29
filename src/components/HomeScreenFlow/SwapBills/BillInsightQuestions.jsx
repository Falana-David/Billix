import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';
import { useBillStore } from './store/billstore';

const BillInsightQuestions = () => {
  const navigation = useNavigation();

  // state (same as before)
  const [concern, setConcern] = useState(null);
  const [payer, setPayer] = useState(null);
  const [payerOther, setPayerOther] = useState('');
  const [duration, setDuration] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [tags, setTags] = useState([]);
  const [consent, setConsent] = useState(false);
  const [autopay, setAutopay] = useState(null);         // 'yes' | 'no' | null
  const [lateNotice, setLateNotice] = useState(null);   // 'yes' | 'no' | null
  const [lateNoticeDate, setLateNoticeDate] = useState('');
  const [discounts, setDiscounts] = useState([]);
  const [note, setNote] = useState('');

  const { billId } = useBillStore(state => state);
  const setBillData = useBillStore(state => state.setBillData);

  const toggle = (arrSetter, arr, item) =>
    arrSetter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);

  const handleNext = () => {
    setBillData({ concern, payer, payerOther, duration, confidence, tags, consent, autopay, lateNotice, lateNoticeDate, discounts, note });
    navigation.navigate('BillSummaryPreview');
  };

  const concerns = [
    { label: 'It’s too high this month', value: 'High' },
    { label: 'I don’t understand some charges', value: 'Confusing' },
    { label: 'I’m behind on payment', value: 'Behind' },
    { label: 'I want to lower this for the future', value: 'Lower_Future' },
    { label: 'It seems incorrect or unfair', value: 'Unfair' },
    { label: 'Just curious / no problem', value: 'Curious' },
  ];
  const payers = [
    { label: 'Just me', value: 'Solo' },
    { label: 'I split it with roommates/family', value: 'Shared' },
    { label: 'Employer reimburses', value: 'Employer' },
    { label: 'Other', value: 'Other' },
  ];
  const durations = [
    { label: 'Under 6 months', value: 'Short' },
    { label: '6 months – 2 years', value: 'Mid' },
    { label: 'Over 2 years', value: 'Long' },
  ];
  const confidences = [
    { label: 'Not confident', value: 'Low' },
    { label: 'Somewhat', value: 'Medium' },
    { label: 'Very confident', value: 'High' },
  ];
  const crisisTags = [
    'Medical bill',
    'Shut-off notice',
    'Collections',
    'Late fee applied',
    'Provider dispute in progress',
  ];
  const discountOptions = [
    'Low-income program',
    'Senior',
    'Student',
    'Military',
    'LifeLine/ACP',
    'Solar / EV',
    'Paperless/Autopay',
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerWrap}>
          <Text style={styles.header}>Want smarter insights?</Text>
          <Text style={styles.subText}>
            Answer a few optional questions so we can tailor your report.
          </Text>
        </View>

        {/* Block */}
        <View style={styles.block}>
          <Text style={styles.label}>What concerns you most about this bill?</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={concerns}
            labelField="label"
            valueField="value"
            placeholder="Select a concern"
            value={concern}
            onChange={item => setConcern(item.value)}
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Who pays this bill?</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={payers}
            labelField="label"
            valueField="value"
            placeholder="Select payer type"
            value={payer}
            onChange={item => setPayer(item.value)}
          />
          {payer === 'other' && (
            <TextInput
              placeholder="Please specify"
              style={styles.input}
              value={payerOther}
              onChangeText={setPayerOther}
              placeholderTextColor="#7A9888"
            />
          )}
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>How long have you had this provider?</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={durations}
            labelField="label"
            valueField="value"
            placeholder="Select duration"
            value={duration}
            onChange={item => setDuration(item.value)}
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>How confident are you in handling this bill?</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={confidences}
            labelField="label"
            valueField="value"
            placeholder="Select confidence level"
            value={confidence}
            onChange={item => setConfidence(item.value)}
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Autopay enabled?</Text>
          <View style={styles.row}>
            {['yes', 'no'].map(val => (
              <TouchableOpacity
                key={val}
                onPress={() => setAutopay(val)}
                style={[styles.pill, autopay === val && styles.pillActive]}
              >
                <Text style={[styles.pillText, autopay === val && styles.pillTextActive]}>
                  {val === 'yes' ? 'Yes' : 'No'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Any shut-off / past-due notices?</Text>
          <View style={styles.row}>
            {['yes', 'no'].map(val => (
              <TouchableOpacity
                key={val}
                onPress={() => setLateNotice(val)}
                style={[styles.pill, lateNotice === val && styles.pillActive]}
              >
                <Text style={[styles.pillText, lateNotice === val && styles.pillTextActive]}>
                  {val === 'yes' ? 'Yes' : 'No'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {lateNotice === 'yes' && (
            <TextInput
              placeholder="Notice date (MM/DD/YYYY, optional)"
              style={styles.input}
              value={lateNoticeDate}
              onChangeText={setLateNoticeDate}
              placeholderTextColor="#7A9888"
            />
          )}
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Eligible discounts (optional)</Text>
          <View style={styles.tagContainer}>
            {discountOptions.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, discounts.includes(d) && styles.chipActive]}
                onPress={() => toggle(setDiscounts, discounts, d)}
              >
                <Text style={[styles.chipText, discounts.includes(d) && styles.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Optional: Tag any complex issues</Text>
          <View style={styles.tagContainer}>
            {crisisTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.chip, tags.includes(tag) && styles.chipActive]}
                onPress={() => toggle(setTags, tags, tag)}
              >
                <Text style={[styles.chipText, tags.includes(tag) && styles.chipTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Anything else we should know?</Text>
          <TextInput
            style={[styles.input, styles.note]}
            placeholder="Free-text notes (optional)"
            multiline
            value={note}
            onChangeText={setNote}
            placeholderTextColor="#7A9888"
          />
        </View>

        <View style={[styles.block, styles.consentWrap]}>
          <Switch value={consent} onValueChange={setConsent} />
          <Text style={styles.consentText}>
            Use my answers to improve Billix for everyone (never shared externally).
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={handleNext} style={styles.backButton}>
            <Text style={styles.backButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Save & Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const BG = '#F3F7F2';
const FG = '#2C4731';
const ACCENT = '#2F5D4A';
const MINT = '#EAF2E7';
const CHIP_BG = '#E1EFE3';
const BORDER = '#A7C4B5';

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 2 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerWrap: {
    paddingTop: 8,         // breathing room under the notch
    paddingBottom: 8,
  },
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

  block: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    ...shadow,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: FG,
    marginBottom: 8,
  },

  dropdown: {
    backgroundColor: MINT,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  dropdownText: { fontSize: 15, color: ACCENT },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: ACCENT,
    marginTop: 10,
  },
  note: { minHeight: 92, textAlignVertical: 'top' },

  row: { flexDirection: 'row', gap: 10 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: MINT,
    borderWidth: 1,
    borderColor: BORDER,
  },
  pillActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  pillText: { color: ACCENT, fontWeight: '600' },
  pillTextActive: { color: '#fff' },

  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: CHIP_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { color: FG, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  consentWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  consentText: { flex: 1, color: FG },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    marginBottom: 12,
  },
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
});

export default BillInsightQuestions;
