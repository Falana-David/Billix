// screens/InsightReport.jsx
// How to open this screen with FULL report:
//   const r = await fetch(`http://localhost:5000/api/bills/${billId}/report`, {
//     headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//   });
//   const j = await r.json();
//   navigation.navigate('InsightReport', { report: j.report, billId: j.bill_id, scanConfidence: j?.meta?.ocr_confidence, report_markdown: j?.report_markdown });

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Linking,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// REMOVED: Markdown import (no longer needed)

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

/* ───────────────────────── helpers ───────────────────────── */
const toNumber = (v) => {
  if (v == null) return null;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const fmtMoney = (v, fallback = '—') => {
  const n = typeof v === 'number' ? v : toNumber(v);
  if (n == null) return fallback;
  return `$${n.toFixed(2)}`;
};
const fmtMaybe = (v, fallback = '—') => (v == null || v === '' ? fallback : String(v));
const joinClean = (arr, sep = ' · ') => (arr || []).filter(Boolean).join(sep);

// CHANGED: make Billix detection tolerant if schema_version is missing
const isBillixReport = (obj) =>
  obj && typeof obj === 'object' && (obj.schema_version || obj.meta) && obj.validation && obj.extraction;

const getNormalized = (report) => report?.validation?.normalized || {};
const getGroups     = (report) => getNormalized(report)?.group_totals || {};
// CHANGED: some agents place fields directly on normalized; fall back to that
const getUsage      = (report) => getNormalized(report)?.usage || getNormalized(report) || {};
const getIssues     = (report) => report?.validation?.issues || [];
const getSpecs      = (report) => report?.specs_card || [];
const getActions    = (report) => report?.action_plan?.actions || [];
const getSavings    = (report) => report?.savings || {};
const getAssistance = (report) => report?.assistance || {};
const getCS         = (report) => report?.community_solar || {};
const getAnalytics  = (report) => report?.analytics || {};
const getExtraction = (report) => report?.extraction || {};
const getMeta       = (report) => report?.meta || {};

// ADDED: line items + narrative helpers (plain text only)
const getLineItems  = (report) => getNormalized(report)?.line_items || getExtraction(report)?.line_items || [];
const getNarrative  = (report, params) => {
  // prefer backend-provided long summary; else Billix .narrative; else ''
  return params?.report_markdown || report?.narrative || '';
};

const rateStr = (v) => (v == null ? '—' : `${fmtMoney(v)}/kWh`);

// ADDED: normalize 0–1 or 0–100 inputs into percent string
const pct = (v) => {
  if (v == null || v === '') return '—';
  const num = Number(v);
  if (!Number.isFinite(num)) return String(v);
  const val = num <= 1 ? num * 100 : num;
  return `${Math.round(val)}%`;
};

const Badge = ({ children, tone = 'neutral' }) => (
  <View style={[styles.badge, styles[`badge_${tone}`]]}>
    <Text style={[styles.badgeText, styles[`badgeText_${tone}`]]}>{children}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const KV = ({ label, value, mono = false }) => (
  <View style={styles.kvRow}>
    <Text style={styles.kvLabel}>{label}</Text>
    <Text style={[styles.kvValue, mono && styles.mono]} numberOfLines={2}>{value}</Text>
  </View>
);

const H = ({ children }) => <Text style={styles.sectionTitle}>{children}</Text>;

const Bullet = ({ children }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bulletDot}>•</Text>
    <Text style={styles.row}>{children}</Text>
  </View>
);

/* ───────────────────────── component ───────────────────────── */
const InsightReport = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // CHANGED: prefer FULL 'report' param; fallback to 'insight'
  const report = route.params?.report || route.params?.insight || null;
  const actionsParam = route.params?.actions || null; // legacy extra
  const scanConfidenceParam = route.params?.scanConfidence ?? null;
  if (!report) return null;

  const billix     = isBillixReport(report);
  const extraction = billix ? getExtraction(report) : report || {};
  const normalized = billix ? getNormalized(report) : {};
  const groups     = billix ? getGroups(report) : {};
  const usage      = billix ? getUsage(report) : {};
  const analytics  = billix ? getAnalytics(report) : {};
  const eff        = analytics?.effective_rate?.per_kwh || {};
  const issues     = billix ? getIssues(report) : {};
  const cs         = billix ? getCS(report) : {};
  const assistance = billix ? getAssistance(report) : {};
  const savings    = billix ? getSavings(report) : {};
  const specs      = billix ? getSpecs(report) : (report?.specs?.items ? report.specs.items : []);
  const rawPreview = extraction?.raw_excerpt_preview;

  // ADDED: capture line items + long narrative (plain text)
  const lineItems  = billix ? getLineItems(report) : [];
  const narrative  = billix ? getNarrative(report, route.params) : '';

  const meta       = billix ? getMeta(report) : {};
  const provider   = extraction?.provider || report?.provider || 'Unknown Provider';
  const rateCode   = normalized?.rate_code || extraction?.rate_code || null; // CHANGED
  const dueDate    = normalized?.due_date || report?.due_date || 'N/A';
  const amountDue  = normalized?.amount_due ?? report?.amount_due ?? report?.amount_due_str ?? null;

  // legacy averages
  const zipAvg       = report?.averages?.zip_avg ?? null;
  const stateAvg     = report?.averages?.state_avg ?? null;
  const nationalAvg  = report?.averages?.national_avg ?? null;

  // personalization (legacy)
  const concern   = report?.concern;
  const payer     = report?.payer;
  const duration  = report?.duration;
  const confidence= report?.confidence;

  // CHANGED: percent-normalized
  const scanConfidence = pct(scanConfidenceParam ?? meta?.ocr_confidence ?? null);

  const newActions = billix ? getActions(report) : [];
  const legacyActions = Array.isArray(actionsParam?.actions)
    ? actionsParam.actions
    : Array.isArray(actionsParam)
    ? actionsParam
    : [];
  const actions = (newActions.length ? newActions : legacyActions).map((a, i) => ({
    title: a.title || a.type || `Action ${i + 1}`,
    steps: a.steps || [],
    expected_outcome: a.expected_outcome || a.detail || '',
    cta_url: a.cta_url,
    cta_phone: a.cta_phone,
    risk: a.risk,
  }));

  const openLink = (url) => {
    if (!url) return;
    try { Linking.openURL(url); } catch {}
  };

  // Only keep "Allow others to contact me"
  const [allowContact, setAllowContact] = React.useState(false);
  const [showRaw, setShowRaw] = React.useState(false);

  // billId (needed when we append to MyBills)
  const billId =
    route.params?.billId ??
    report?.bill_id ??
    report?.id ??
    meta?.bill_id ??
    null;

  const toMoneyNumberLoose = (v) => {
    const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  const onCloseReport = () => {
    const appendedBill = {
      id: String(billId || `bill-${Date.now()}`),
      provider: extraction?.provider || provider || 'Unknown',
      category: normalized?.service || report?.category || 'Utility',
      total: toMoneyNumberLoose(amountDue),
      due:
        (normalized?.due_date || report?.due_date || '').toString() ||
        new Date().toISOString().slice(0, 10),
      status: 'Pending',
      verifiedScore: 0,
      last6: [],

      _readOnly: true,
      _insightReport: billix ? report : null,
      _legacyInsight: billix ? null : report,
      _scanConfidence: scanConfidence ?? null,
      _allowContact: !!allowContact,
    };

    // NOTE: change 'Upload' to your list route name if needed
    navigation.navigate('Upload', { appendedBill });
  };

  /* ───────────────────────── UI ───────────────────────── */
  return (
    <Modal visible animationType="slide" presentationStyle="formSheet">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.headerCard}>
              <Image source={require('../../assets/logo.png')} style={styles.logo} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Bill Insight Report</Text>
                <Text style={styles.subtitle}>
                  {billix ? 'AI-decoded utility bill with targeted savings' : 'Personalized analysis based on your uploaded bill'}
                </Text>
              </View>
              <Badge tone="brand">{(extraction?.state || meta?.state || '—').toString()}</Badge>
            </View>

            {/* Snapshot */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <H>Executive Snapshot</H>
                <View style={styles.badgeRow}>
                  <Badge tone="brand">{(extraction?.provider || provider || 'Provider').toString().slice(0, 22)}</Badge>
                  {/* CHANGED: confidence formatting is consistent */}
                  {scanConfidence !== '—' && (
                    <Badge tone={parseInt(scanConfidence, 10) < 70 ? 'danger' : 'success'}>
                      {`${scanConfidence} OCR`}
                    </Badge>
                  )}
                </View>
              </View>
              <Divider />
              <View style={styles.kvGrid}>
                <KV label="Amount Due" value={fmtMoney(amountDue)} mono />
                <KV label="Due Date" value={fmtMaybe(dueDate)} />
                <KV
                  label="Region"
                  value={joinClean(
                    [
                      extraction?.city ? String(extraction.city).trim() : null,
                      (extraction?.state || meta?.state || '').toString().trim(),
                      extraction?.zip5 || meta?.zip5 || null,
                    ],
                    ', '
                  )}
                />
                {eff && (eff.all_in_after_credits != null || eff.all_in_before_credits != null) && (
                  <KV
                    label="Effective Rate"
                    value={rateStr(eff.all_in_after_credits || eff.all_in_before_credits)}
                    mono
                  />
                )}
              </View>
              {scanConfidence !== '—' && parseInt(scanConfidence, 10) < 70 && (
                <View style={styles.alertBox}>
                  <Text style={styles.alertText}>Low scan confidence. Please review carefully.</Text>
                </View>
              )}
            </View>

            {/* Decoder (Key Fields) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}><H>Decoder (Key Fields)</H></View>
              <Divider />
              <View style={styles.kvGrid}>
                {/* CHANGED: ensure we pull from the right source */}
                <KV label="Account #" value={fmtMaybe(extraction?.account_number)} mono />
                <KV label="Service Address" value={fmtMaybe(normalized?.service_address || extraction?.service_address)} />
                <KV label="Rate Code" value={fmtMaybe(rateCode)} />
                <KV label="Meter #" value={fmtMaybe(extraction?.meter_number)} mono />
                <KV label="Usage (kWh)" value={fmtMaybe(usage?.kwh)} mono />
                <KV label="Supply $/kWh" value={rateStr(eff?.supply)} mono />
                <KV label="Delivery $/kWh" value={rateStr(eff?.delivery)} mono />
              </View>
              {extraction?.notes ? (
                <>
                  <Divider />
                  <Text style={styles.bodyText}><Text style={styles.bold}>Notes: </Text>{String(extraction.notes)}</Text>
                </>
              ) : null}
            </View>

            {/* ADDED: Line Items */}
            {billix && Array.isArray(lineItems) && lineItems.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}><H>Line Items</H></View>
                <Divider />
                {lineItems.map((li, i) => (
                  <View key={`li-${i}`} style={styles.actionBlock}>
                    <Text style={styles.bodyText}>
                      <Text style={styles.bold}>{li.description || li.name || `Item ${i + 1}`}:</Text>{' '}
                      {li.amount != null ? fmtMoney(li.amount) : '—'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Where your money went (group totals) */}
            {billix && (
              <View style={styles.card}>
                <View style={styles.cardHeader}><H>Where Your Money Went</H></View>
                <Divider />
                <View style={styles.kvGrid}>
                  <KV label="Supply" value={fmtMoney(groups?.supply)} mono />
                  <KV label="Delivery" value={fmtMoney(groups?.delivery)} mono />
                  <KV label="Fixed" value={fmtMoney(groups?.fixed)} mono />
                  <KV label="Add-ons" value={fmtMoney(groups?.addons)} mono />
                  <KV label="Taxes/Fees" value={fmtMoney(groups?.tax_fee)} mono />
                  <KV label="Credits" value={fmtMoney(groups?.credits)} mono />
                  <KV label="Current Charges Sum" value={fmtMoney(groups?.current_charges_sum)} mono />
                </View>
              </View>
            )}

            {/* Savings */}
            {billix && savings?.by_group && (
              <View style={styles.card}>
                <View style={styles.cardHeader}><H>Savings by Bucket</H></View>
                <Divider />
                {Object.entries(savings.by_group).map(([bucket, tips]) =>
                  (tips || []).length ? (
                    <View key={bucket} style={{ marginBottom: 10 }}>
                      <Text style={styles.bucketTitle}>{bucket.toUpperCase()}</Text>
                      {(tips || []).map((t, i) => <Bullet key={`${bucket}-${i}`}>{t}</Bullet>)}
                    </View>
                  ) : null
                )}
                {Array.isArray(savings?.quick_wins) && savings.quick_wins.length ? (
                  <>
                    <Divider />
                    <Text style={styles.bucketTitle}>QUICK WINS</Text>
                    {savings.quick_wins.map((t, i) => <Bullet key={`qw-${i}`}>{t}</Bullet>)}
                  </>
                ) : null}
              </View>
            )}

            {/* Community Solar */}
            {billix && (
              <View style={styles.card}>
                <View style={styles.cardHeader}><H>Community Solar</H></View>
                <Divider />
                <View style={styles.kvGrid}>
                  <KV label="Detected" value={cs?.detected ? 'Yes' : 'No'} />
                  <KV label="Credit Total" value={fmtMoney(cs?.credit_total)} mono />
                  <KV
                    label="Est. Discount vs Supply"
                    value={cs?.estimated_discount_pct_vs_supply != null ? `${cs.estimated_discount_pct_vs_supply}%` : '—'}
                  />
                </View>
                {cs?.notes ? (
                  <>
                    <Divider />
                    <Text style={styles.bodyText}>{String(cs.notes)}</Text>
                  </>
                ) : null}
              </View>
            )}

            {/* Assistance */}
            {billix && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <H>Local Assistance ({fmtMaybe(assistance?.state || extraction?.state || meta?.state || '—')})</H>
                </View>
                <Divider />
                {Array.isArray(assistance?.programs) && assistance.programs.length ? (
                  assistance.programs.map((p, i) => (
                    <View key={`prog-${i}`} style={styles.programBlock}>
                      <Text style={styles.programTitle}>{p.name}</Text>
                      {p.what ? <Text style={styles.bodyText}>{p.what}</Text> : null}
                      {p.how_to_apply ? (
                        <Text style={styles.bodyText}><Text style={styles.bold}>How to Apply: </Text>{p.how_to_apply}</Text>
                      ) : null}
                      {Array.isArray(p.next_steps) && p.next_steps.length ? (
                        <Text style={styles.bodyText}><Text style={styles.bold}>Next Steps: </Text>{p.next_steps.join(' · ')}</Text>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.bodyText}>No programs found.</Text>
                )}
              </View>
            )}

            {/* Action Plan */}
            {actions.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}><H>7-Day Action Plan</H></View>
                <Divider />
                {actions.map((a, i) => (
                  <View key={`${a.title}-${i}`} style={styles.actionBlock}>
                    <Text style={styles.actionTitle}>{a.title}</Text>
                    {a.expected_outcome ? (
                      <Text style={styles.bodyText}><Text style={styles.bold}>Outcome: </Text>{a.expected_outcome}</Text>
                    ) : null}
                    {Array.isArray(a.steps) && a.steps.length > 0 && (
                      <Text style={styles.bodyText}><Text style={styles.bold}>Steps: </Text>{a.steps.join(' · ')}</Text>
                    )}
                    {a.risk ? <Text style={styles.bodyText}><Text style={styles.bold}>Risk: </Text>{String(a.risk)}</Text> : null}
                    {(a.cta_url || a.cta_phone) && (
                      <Text style={styles.bodyText}>
                        {a.cta_url ? `URL: ${a.cta_url}` : ''}{a.cta_url && a.cta_phone ? ' · ' : ''}{a.cta_phone ? `Phone: ${a.cta_phone}` : ''}
                      </Text>
                    )}
                    {a.cta_url ? (
                      <TouchableOpacity onPress={() => openLink(a.cta_url)} style={styles.linkButton}>
                        <Text style={styles.linkButtonText}>Open Link</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {/* Parsing Issues */}
            {billix && Array.isArray(issues) && issues.length > 0 && (
              <View style={[styles.card, styles.cardDanger]}>
                <View style={styles.cardHeader}><H>Pitfalls / Parsing Notes</H></View>
                <Divider />
                {issues.map((it, idx) => (
                  <Text key={idx} style={styles.bodyText}>
                    <Text style={styles.bold}>{it.code || 'ISSUE'}: </Text>{fmtMaybe(it.message || it)}
                  </Text>
                ))}
              </View>
            )}

            {/* Specs */}
            {(Array.isArray(specs) && specs.length > 0) && (
              <View style={styles.card}>
                <View style={styles.cardHeader}><H>Specs</H></View>
                <Divider />
                {specs.map((it, idx) =>
                  it?.value ? <KV key={idx} label={it.label} value={String(it.value)} mono={/kWh|#|ID|Rate|Meter/i.test(it.label || '')} /> : null
                )}
              </View>
            )}

            {/* CHANGED: Narrative rendered as plain text (no markdown) */}
            {billix && !!narrative && (
              <View style={styles.card}>
                <View style={styles.cardHeader}><H>Report Narrative</H></View>
                <Divider />
                <Text style={styles.bodyText}>{String(narrative)}</Text>
              </View>
            )}

            {/* Raw excerpt preview */}
            {billix && rawPreview ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}><H>Raw Text Preview</H></View>
                <Divider />
                {!showRaw ? (
                  <>
                    <Text style={styles.codePreview} numberOfLines={8}>{rawPreview}</Text>
                    <TouchableOpacity style={styles.linkButton} onPress={() => setShowRaw(true)}>
                      <Text style={styles.linkButtonText}>Show More</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.codePreview}>{rawPreview}</Text>
                    <TouchableOpacity style={styles.linkButton} onPress={() => setShowRaw(false)}>
                      <Text style={styles.linkButtonText}>Show Less</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : null}

            {/* Legacy only: regional comparison */}
            {!billix && (
              <View style={styles.card}>
                <View style={styles.cardHeader}><H>Regional Comparison</H></View>
                <Divider />
                <View style={styles.kvGrid}>
                  <KV label="Your Bill" value={fmtMoney(report?.amount_due || report?.amount_due_str)} mono />
                  <KV label="ZIP Avg" value={fmtMoney(zipAvg)} mono />
                  <KV label="State Avg" value={fmtMoney(stateAvg)} mono />
                  <KV label="National Avg" value={fmtMoney(nationalAvg)} mono />
                </View>
              </View>
            )}

            {/* Legacy only: payer profile */}
            {(concern || payer || duration || confidence) && (
              <View style={styles.card}>
                <View style={styles.cardHeader}><H>Bill Payer Profile</H></View>
                <Divider />
                {concern && <KV label="Primary Concern" value={concern} />}
                {payer && <KV label="Payer" value={payer} />}
                {duration && <KV label="Provider Duration" value={duration} />}
                {confidence && <KV label="Confidence Level" value={confidence} />}
              </View>
            )}

            {/* Composer (reduced) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}><H>Share Your Insight</H></View>
              <Divider />
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Allow others to contact me</Text>
                <Switch value={allowContact} onValueChange={setAllowContact} />
              </View>
            </View>

            <View style={{ height: 12 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={onCloseReport}
            >
              <Text style={styles.buttonTextAlt}>Close Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ───────────────────────── styles ───────────────────────── */
const C = {
  bg: '#f5f7f9',
  card: '#ffffff',
  ink: '#132a2e',
  sub: '#4e636e',
  line: '#e6edf0',
  brand: '#1c3a36',
  brandSoft: '#eaf1ef',
  success: '#0b6b3a',
  danger: '#b30000',
  mono: '#0f172a',
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth > 560 ? 560 : screenWidth - 24,
    height: screenHeight * 0.9,
    backgroundColor: C.card,
    borderRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 10,
   shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  /* header */
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.line,
  },
  logo: { width: 46, height: 46, borderRadius: 10, marginRight: 12 },
  title: { fontSize: 20, fontWeight: '800', color: C.ink, marginBottom: 2 },
  subtitle: { fontSize: 13, color: C.sub },

  /* card */
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  cardDanger: {
    borderColor: '#ffd7d7',
    backgroundColor: '#fff7f7',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.ink },
  row: { fontSize: 14.5, color: C.ink, lineHeight: 22 },
  bodyText: { fontSize: 14.5, color: C.ink, lineHeight: 22, marginBottom: 6 },
  bold: { fontWeight: '700' },

  divider: { height: 1, backgroundColor: C.line, marginVertical: 10 },

  /* kv grid */
  kvGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 8,
  },
  kvRow: {
    width: '48%',
  },
  kvLabel: { fontSize: 12.5, color: C.sub, marginBottom: 3 },
  kvValue: { fontSize: 15, color: C.ink },
  mono: { fontVariant: ['tabular-nums'], color: C.mono },

  /* badges */
  badgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badge_neutral: { backgroundColor: '#f3f6f7', borderColor: '#dfe9ed' },
  badgeText_neutral: { color: C.sub, fontSize: 12.5, fontWeight: '700' },
  badge_brand: { backgroundColor: C.brandSoft, borderColor: '#cfe0dc' },
  badgeText_brand: { color: C.brand, fontSize: 12.5, fontWeight: '800' },
  badge_success: { backgroundColor: '#eaf8f0', borderColor: '#cdeeda' },
  badgeText_success: { color: C.success, fontSize: 12.5, fontWeight: '800' },
  badge_danger: { backgroundColor: '#ffeded', borderColor: '#ffd7d7' },
  badgeText_danger: { color: C.danger, fontSize: 12.5, fontWeight: '800' },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bulletDot: { color: C.ink, marginRight: 8, lineHeight: 22 },

  alertBox: {
    backgroundColor: '#fff4e5',
    borderColor: '#ffd9a7',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  alertText: { color: '#7a3e00', fontWeight: '700' },

  bucketTitle: { fontSize: 13, letterSpacing: 0.5, color: C.sub, fontWeight: '800', marginBottom: 6 },

  programBlock: { marginBottom: 12 },
  programTitle: { fontSize: 15, fontWeight: '800', color: C.ink, marginBottom: 4 },

  actionBlock: { marginBottom: 12 },
  actionTitle: { fontSize: 15, fontWeight: '800', color: C.ink, marginBottom: 4 },

  codePreview: {
    fontSize: 13,
    color: '#0b1520',
    backgroundColor: '#f6fafb',
    borderWidth: 1,
    borderColor: '#dfe9ed',
    borderRadius: 10,
    padding: 10,
    lineHeight: 20,
  },

  // links & buttons
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: C.brandSoft,
    borderColor: '#cfe0dc',
    borderWidth: 1,
    marginTop: 6,
  },
  linkButtonText: { color: C.brand, fontWeight: '800' },

  helperText: { color: C.sub, fontSize: 13, marginBottom: 8 },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  toggleLabel: { fontSize: 15, color: C.ink, fontWeight: '700' },

  footer: { paddingTop: 8 },
  buttonSecondary: {
    backgroundColor: C.brandSoft,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderColor: '#cfe0dc',
    borderWidth: 1,
    marginTop: 6,
  },
  buttonTextAlt: { color: C.brand, fontSize: 15, fontWeight: '800' },
});

// REMOVED mdStyles since we no longer render markdown

export default InsightReport;
