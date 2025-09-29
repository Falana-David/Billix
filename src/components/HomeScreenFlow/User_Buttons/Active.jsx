// screens/SavedReports.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { listSavedReports, removeSavedReport } from '../SwapBills/store/savedReports';

const Active = () => {
  const navigation = useNavigation();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const data = await listSavedReports();
    setItems(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const openSnapshot = (it) => {
    navigation.navigate('InsightReport', {
      // open from local snapshot
      insight: it.snapshot.insight,
      actions: it.snapshot.actions,
      scanConfidence: it.snapshot.scanConfidence,
      billId: it.billId,
      fromSaved: true,
    });
  };

  const confirmDelete = (billId) => {
    Alert.alert('Delete saved report?', 'This removes your local copy (the server copy stays).', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeSavedReport(billId);
          load();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const insight = item.snapshot.insight || {};
    return (
      <View style={s.card}>
        <Text style={s.title}>{insight.provider || 'Unknown Provider'}</Text>
        <Text style={s.small}>
          Amount: {insight.amount_due || '$0.00'} · Due: {insight.due_date || 'N/A'}
        </Text>
        <Text style={s.small}>Saved: {new Date(item.savedAt).toLocaleString()}</Text>

        <View style={s.row}>
          <TouchableOpacity style={s.btn} onPress={() => openSnapshot(item)}>
            <Text style={s.btnText}>Open (Offline)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btn, s.btnOutline]}
            onPress={() =>
              navigation.navigate('BillSummaryPreview', {
                refetchBillId: item.billId,
              })
            }
          >
            <Text style={[s.btnText, s.btnTextOutline]}>Refresh from Server</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn, s.btnDanger]} onPress={() => confirmDelete(item.billId)}>
            <Text style={s.btnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={s.container}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {items.length === 0 ? (
        <Text style={s.empty}>No saved reports yet. Open a report and tap “Save Offline”.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.billId)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f9' },
  empty: { padding: 24, textAlign: 'center', color: '#334' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6ece9',
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#123' },
  small: { fontSize: 13, color: '#456', marginTop: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  btn: {
    backgroundColor: '#1c3a36',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnDanger: { backgroundColor: '#b30000' },
  btnOutline: {
    backgroundColor: '#eaf1ef',
    borderWidth: 1,
    borderColor: '#b5ccc7',
  },
  btnText: { color: '#fff', fontWeight: '700' },
  btnTextOutline: { color: '#1c3a36' },
});

export default Active;
