import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBillStore } from './store/billstore';

const BillSummaryPreview = () => {
  const navigation = useNavigation();
  const {
    fileUri,
    billType,
    concern,
    payer,
    payerOther,
    duration,
    confidence,
    tags,
    provider,
    amountDue,
    amount_due,
    dueDate,
    scanConfidence,
    billId,
  } = useBillStore(state => state.billData);

  const rawAmount = amountDue ?? amount_due;
const amt = React.useMemo(() => {
  if (rawAmount == null || rawAmount === '') return null;
  const n = Number(String(rawAmount).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}, [rawAmount]);

  const formattedPayer = payer === 'other' ? payerOther : payer;

  const handleGenerateReport = async () => {
    if (!billId) {
      Alert.alert('Missing Info', 'No bill ID found. Please upload a bill first.');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bills/${billId}/report`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
  
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(body || `HTTP ${res.status}`);
      }
  
      const j = await res.json();
      // Navigate with the FULL Billix report (j.report)
      // Enrich listing with non-PII fields from the FULL report (still masked)
      try {
        await fetch('http://localhost:5000/api/market/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            billId, 
            report: j.report,   // full Billix object; backend extracts ONLY safe fields
            // optional cosmetics
            friction: 'Medium',
            perks: ['New-customer credit', 'Deposit waived'],
          }),
        });
      } catch (e) {
        console.warn('market listing (enrich) failed', e);
      }

      navigation.navigate('InsightReport', {
        report: j.report,                    // <-- FULL report payload
        billId: j.bill_id,
        scanConfidence: j?.meta?.ocr_confidence,
      });
    } catch (err) {
      console.error('report fetch error:', err);
      Alert.alert('Error', String(err.message || err));
    }
  };
  
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Review Your Bill Summary</Text>
        <Text style={styles.subText}>
          Make sure the details look correct before generating your insights.
        </Text>

        {/* Preview */}
        {fileUri ? (
          fileUri.toLowerCase().endsWith('.pdf') ? (
            <View style={styles.pdfPreview}>
              <Text style={styles.pdfText}>PDF Preview Unavailable</Text>
            </View>
          ) : (
            <Image source={{ uri: fileUri }} style={styles.imagePreview} resizeMode="cover" />
          )
        ) : null}

        {/* Low confidence */}
        {scanConfidence != null && scanConfidence < 60 && (
          <View style={styles.bannerWarn}>
            <Text style={styles.bannerWarnText}>
              ⚠️ We had trouble reading this bill. Please double-check the details.
            </Text>
          </View>
        )}

        {/* Bill details */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            {billType ? <Text style={styles.pill}>{billType}</Text> : null}
          </View>

          {provider ? (
            <View style={styles.row}>
              <Text style={styles.label}>Provider</Text>
              <Text style={styles.value}>{provider}</Text>
            </View>
          ) : null}

{amt != null && (
  <View style={styles.row}>
    <Text style={styles.label}>Amount Due</Text>
    <Text style={styles.value}>${amt.toFixed(2)}</Text>
  </View>
)}


          {dueDate ? (
            <View style={styles.row}>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>{dueDate}</Text>
            </View>
          ) : null}

          {scanConfidence != null ? (
            <View style={styles.row}>
              <Text style={styles.label}>Scan Confidence</Text>
              <Text style={styles.value}>{scanConfidence}%</Text>
            </View>
          ) : null}
        </View>

        {/* Personalization inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Inputs</Text>

          {concern ? (
            <View style={styles.row}>
              <Text style={styles.label}>Concern</Text>
              <Text style={styles.value}>{concern}</Text>
            </View>
          ) : null}

          {formattedPayer ? (
            <View style={styles.row}>
              <Text style={styles.label}>Payer</Text>
              <Text style={styles.value}>{formattedPayer}</Text>
            </View>
          ) : null}

          {duration ? (
            <View style={styles.row}>
              <Text style={styles.label}>Provider Duration</Text>
              <Text style={styles.value}>{duration}</Text>
            </View>
          ) : null}

          {confidence ? (
            <View style={styles.row}>
              <Text style={styles.label}>Confidence</Text>
              <Text style={styles.value}>{confidence}</Text>
            </View>
          ) : null}

          {tags?.length ? (
            <View style={[styles.row, { alignItems: 'flex-start' }]}>
              <Text style={styles.label}>Tags</Text>
              <View style={styles.chipsWrap}>
                {tags.map(t => (
                  <View key={t} style={styles.chip}>
                    <Text style={styles.chipText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGenerateReport} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Generate Smart Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // page
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F7F2',
    padding: 20,
  },

  // card
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  // headings
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C4731',
    textAlign: 'center',
    marginBottom: 6,
  },
  subText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#4A7C59',
    marginBottom: 14,
    lineHeight: 22,
  },

  // media
  imagePreview: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#EAF2E7',
  },
  pdfPreview: {
    width: '100%',
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF2E7',
    borderRadius: 12,
    marginBottom: 12,
  },
  pdfText: { fontSize: 14, color: '#4A7C59' },

  // alert banner
  bannerWarn: {
    backgroundColor: '#FFF4E5',
    borderColor: '#F5C38A',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  bannerWarnText: { color: '#9A5300', fontSize: 13.5, lineHeight: 18 },

  // sections
  section: {
    backgroundColor: '#F9FCFA',
    borderWidth: 1,
    borderColor: '#DCE5DE',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#2C4731',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#E1EFE3',
    color: '#2F5D4A',
    borderRadius: 999,
    fontSize: 12.5,
    overflow: 'hidden',
  },

  // rows
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF4EF',
  },
  label: {
    color: '#2C4731',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  value: {
    color: '#2F5D4A',
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },

  // chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxWidth: '60%',
    justifyContent: 'flex-end',
  },
  chip: {
    backgroundColor: '#EAF2E7',
    borderColor: '#A6C1AF',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: { color: '#2F5D4A', fontSize: 12.5 },

    // actions
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 18,
        marginBottom: 6,
      },
      backButton: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D9EDE1',
        borderWidth: 1,
        borderColor: '#2F5D4A',
      },
      backButtonText: {
        color: '#2F5D4A',
        fontSize: 15,
        fontWeight: '700',
      },
      nextButton: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2F5D4A',
      },
      nextButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
        textAlign: 'center',
      },    
});

export default BillSummaryPreview;
