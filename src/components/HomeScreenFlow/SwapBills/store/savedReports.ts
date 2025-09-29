// utils/savedReports.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'billix:savedReports';

export type SavedReport = {
  billId: number;
  savedAt: string; // ISO
  snapshot: {
    insight: any;
    actions?: any;
    scanConfidence?: number | null;
  };
};

async function getAll(): Promise<SavedReport[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function listSavedReports(): Promise<SavedReport[]> {
  const all = await getAll();
  // newest first
  return all.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}

export async function getSavedReport(billId: number): Promise<SavedReport | undefined> {
  const all = await getAll();
  return all.find(r => r.billId === billId);
}

export async function removeSavedReport(billId: number): Promise<void> {
  const all = await getAll();
  const next = all.filter(r => r.billId !== billId);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function saveReportSnapshot(args: {
  billId: number;
  insight: any;
  actions?: any;
  scanConfidence?: number | null;
}) {
  const { billId, insight, actions, scanConfidence } = args;
  const all = await getAll();
  const savedAt = new Date().toISOString();

  // upsert by billId
  const existingIdx = all.findIndex(r => r.billId === billId);
  const next: SavedReport = { billId, savedAt, snapshot: { insight, actions, scanConfidence } };

  if (existingIdx >= 0) {
    all[existingIdx] = next;
  } else {
    all.push(next);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}
