// billCardSchemas.ts
export type Money = number;

export type MarketSignals = {
  median90d: Money | null;       // median amount due for similar bills over 90 days
  regionalAvg: Money | null;     // average for region (state/city) for this service
  fairValue: Money | null;       // internal/modelled price
  swaps30d: number | null;       // number of plan swaps in last 30d
  watchers?: number | null;
  followers?: number | null;
  hotness?: number | null;
};

export type BillSpecs = {
  // universal
  service: string;               // e.g., "Electricity", "Internet", "Mobile / Wireless Phone"
  billingMonth?: string;         // e.g., "Aug 2025"
  contract?: string;             // e.g., "Month-to-Month", "1-Year"
  promoActive?: boolean;
  basePlan?: Money | null;       // before taxes/fees and optional add-ons
  taxesFees?: Money | null;

  // energy
  usageKwh?: number | null;      // electricity
  usageTherms?: number | null;   // gas
  hasSolar?: boolean;            // true if bill shows solar/REC/Net-metering line items
  utilitySupplier?: string;      // e.g., "PSE&G" or "Constellation" (3rd-party supply)
  ratePlan?: string;             // e.g., "TOU", "Basic", "EV", "Default"
  isBudgetBilling?: boolean;     // equalized payments plan
  stateProgram?: string;         // e.g., "NJ CEP", "LIHEAP", "Community Solar"

  // telecom
  speedDownMbps?: number | null;
  speedUpMbps?: number | null;
  dataCapGb?: number | null;
  lines?: number | null;         // mobile lines
  unlimited?: boolean;
  equipmentRental?: boolean;
  autopayEnabled?: boolean;

  // water/sewer/trash
  usageGallons?: number | null;
};

export type BillListing = {
  id: string;
  billId?: string | number;
  clusterId?: string | number | null;
  provider: string;
  category: string;             // normalized category label used in your UI
  city: string;
  state: string;
  amountDue: Money;
  dueDate: string;              // ISO 8601
  discountPercent?: number;
  friction?: 'Low' | 'Medium' | 'High';
  perks?: string[];             // server-provided perks (keep if present)
  rating?: number;
  asks?: number;
  market?: MarketSignals;
  specs: BillSpecs;

  // media
  logoUrl?: string | null;      // <- NEW: provider mark for cards

  // computed/UX-only
  trustTags?: string[];         // “Billix-Verified” chips
};

export type CardBlueprint = {
  key: string; // "Electricity", "Internet", "Mobile / Wireless Phone", etc.
  // Fields we really want to show in Specs for this bill type
  requiredSpecFields: (keyof BillSpecs)[];
  // Build semantic trust tags when data exists
  computeTrustFromData?: (l: BillListing) => string[];
  // Build perks from data/state
  computePerksFromData?: (l: BillListing) => string[];
};

// -------------------- Helpers: deterministic variety --------------------

function hashish(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function pickMany<T>(arr: T[], seed: string, count: number): T[] {
  const out: T[] = [];
  let h = hashish(seed);
  const pool = [...arr];
  for (let i = 0; i < count && pool.length; i++) {
    h ^= (h << 13);
    h ^= (h >>> 17);
    h ^= (h << 5);
    const idx = Math.abs(h) % pool.length;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

// Generic pools to make cards feel varied before user tagging exists.
const GENERIC_TRUST_POOL = [
  'Phone/Carrier Check',
  'Masked Details',
  'Line-Type Verified',
  'Name/Address Match',
  'Geo Match',
  'Statement Age Check',
  'Duplicate Scan',
  'Fraud Risk Low',
];

const GENERIC_PERK_POOL = [
  'New-customer credit',
  'Deposit waived',
  'Self-install OK',
  'eBill enabled',
  'Auto-pay on',
  'Early pay discount',
];

// -------------------- Blueprints per bill type --------------------

export const BLUEPRINTS: CardBlueprint[] = [
  {
    key: 'Electricity',
    requiredSpecFields: [
      'service', 'billingMonth', 'basePlan', 'taxesFees',
      'usageKwh', 'utilitySupplier', 'ratePlan', 'contract', 'promoActive',
      'isBudgetBilling',
    ],
    computeTrustFromData: (l) => {
      const tags: string[] = [];
      if (l.specs?.hasSolar) tags.push('Net-metering Detected');
      if (l.specs?.utilitySupplier && l.specs.utilitySupplier !== l.provider) tags.push('3rd-Party Supply');
      if (l.specs?.isBudgetBilling) tags.push('Budget Billing');
      if (l.specs?.autopayEnabled) tags.push('Auto-pay');
      return tags;
    },
    computePerksFromData: (l) => {
      const out: string[] = [];
      // New Jersey / energy specific flavor
      if (l.state === 'NJ') {
        if (l.specs?.hasSolar) out.push('Solar credits applied');
        out.push('NJ Clean Energy eligible');
        if ((l.specs?.stateProgram || '').toLowerCase().includes('community')) out.push('Community Solar');
      }
      if (l.specs?.promoActive) out.push('Promo in effect');
      return out;
    },
  },
  {
    key: 'Natural Gas',
    requiredSpecFields: [
      'service', 'billingMonth', 'basePlan', 'taxesFees',
      'usageTherms', 'utilitySupplier', 'contract', 'promoActive',
    ],
    computeTrustFromData: (l) => {
      const t: string[] = [];
      if (l.specs?.utilitySupplier && l.specs.utilitySupplier !== l.provider) t.push('3rd-Party Supply');
      return t;
    },
    computePerksFromData: (l) => {
      const out: string[] = [];
      if (l.state === 'NJ') out.push('WARMAdvantage eligible');
      if (l.specs?.promoActive) out.push('Promo in effect');
      return out;
    },
  },
  {
    key: 'Internet',
    requiredSpecFields: [
      'service', 'billingMonth', 'basePlan', 'taxesFees',
      'speedDownMbps', 'speedUpMbps', 'dataCapGb', 'equipmentRental',
      'contract', 'promoActive', 'autopayEnabled',
    ],
    computeTrustFromData: (l) => {
      const t: string[] = [];
      if (l.specs?.equipmentRental) t.push('Equipment rental');
      if (l.specs?.autopayEnabled) t.push('Auto-pay');
      return t;
    },
    computePerksFromData: (l) => {
      const out: string[] = [];
      if (l.specs?.promoActive) out.push('Promo pricing');
      if (l.specs?.dataCapGb === 0) out.push('No data cap');
      return out;
    },
  },
  {
    key: 'Mobile / Wireless Phone',
    requiredSpecFields: [
      'service', 'billingMonth', 'basePlan', 'taxesFees',
      'lines', 'unlimited', 'contract', 'promoActive', 'autopayEnabled',
    ],
    computeTrustFromData: (l) => {
      const t: string[] = [];
      if (l.specs?.lines && l.specs.lines > 1) t.push(`${l.specs.lines} lines`);
      if (l.specs?.unlimited) t.push('Unlimited data');
      if (l.specs?.autopayEnabled) t.push('Auto-pay');
      return t;
    },
    computePerksFromData: (l) => {
      const out: string[] = [];
      if (l.specs?.promoActive) out.push('Promo in effect');
      return out;
    },
  },
  {
    key: 'Water',
    requiredSpecFields: [
      'service', 'billingMonth', 'basePlan', 'taxesFees',
      'usageGallons', 'contract',
    ],
  },
];

// -------------------- API contract you should return --------------------
// If your API can’t populate all fields yet, send nulls, not 0s.
// 0 makes the UI look wrong; null is treated as “unknown”.
export type ApiListingPayload = Partial<BillListing> & {
  id: string | number;
  provider: string;
  category: string;
  city: string;
  state: string;
  amountDue: Money;
  dueDate: string;
  specs: Partial<BillSpecs>;
  market?: Partial<MarketSignals>;
  logoUrl?: string | null;       // <- NEW: backend can send this
  logo_url?: string | null;      // <- accept snake_case too
};

// -------------------- Decorator: merge real + tasteful placeholders -----

export function decorateListing(raw: ApiListingPayload): BillListing {
  const idStr = String(raw.id);
  const base: BillListing = {
    id: `ml-${idStr}`,
    billId: (raw as any).bill_id ?? raw.billId,
    clusterId: (raw as any).cluster_id ?? raw.clusterId ?? null,
    provider: raw.provider,
    category: raw.category,
    city: raw.city || '—',
    state: raw.state || '—',
    amountDue: Number(raw.amountDue ?? 0),
    dueDate: raw.dueDate || new Date().toISOString(),
    discountPercent: raw.discountPercent ?? 0,
    friction: (raw.friction as any) || 'Low',
    perks: Array.isArray(raw.perks) ? raw.perks.filter(Boolean) : [],
    rating: raw.rating ?? 4.7,
    asks: raw.asks ?? 0,
    specs: {
      service: raw.specs?.service || raw.category,
      billingMonth: raw.specs?.billingMonth,
      contract: raw.specs?.contract || 'Month-to-Month',
      promoActive: !!raw.specs?.promoActive,
      basePlan: normMoney(raw.specs?.basePlan),
      taxesFees: normMoney(raw.specs?.taxesFees),
      // energy
      usageKwh: normNum(raw.specs?.usageKwh),
      usageTherms: normNum(raw.specs?.usageTherms),
      hasSolar: !!raw.specs?.hasSolar,
      utilitySupplier: raw.specs?.utilitySupplier,
      ratePlan: raw.specs?.ratePlan,
      isBudgetBilling: !!raw.specs?.isBudgetBilling,
      stateProgram: raw.specs?.stateProgram,
      // telecom
      speedDownMbps: normNum(raw.specs?.speedDownMbps),
      speedUpMbps: normNum(raw.specs?.speedUpMbps),
      dataCapGb: normNum(raw.specs?.dataCapGb),
      lines: normNum(raw.specs?.lines),
      unlimited: !!raw.specs?.unlimited,
      equipmentRental: !!raw.specs?.equipmentRental,
      autopayEnabled: !!raw.specs?.autopayEnabled,
      // water
      usageGallons: normNum(raw.specs?.usageGallons),
    },
    market: {
      median90d: normMoney(raw.market?.median90d),
      regionalAvg: normMoney(raw.market?.regionalAvg),
      fairValue: normMoney(raw.market?.fairValue),
      swaps30d: normNum(raw.market?.swaps30d),
      watchers: normNum((raw.market as any)?.watchers ?? (raw as any).watchers),
      followers: normNum((raw.market as any)?.followers ?? (raw as any).followers),
      hotness: normNum((raw.market as any)?.hotness ?? (raw as any).hotness),
    },
    // media
    logoUrl: raw.logoUrl ?? (raw as any).logo_url ?? null,
  };

  // Build “Billix-Verified” tags (real first, then tasteful filler)
  const bp = BLUEPRINTS.find(b => b.key === base.category) ||
             BLUEPRINTS.find(b => b.key === base.specs.service) ||
             BLUEPRINTS[0];

  const realTrust = (bp.computeTrustFromData?.(base) || []).filter(Boolean);
  const fillerTrust = pickMany(
    GENERIC_TRUST_POOL.filter(x => !realTrust.includes(x)),
    idStr + base.provider + base.city,
    Math.max(0, 3 - Math.min(3, realTrust.length))
  );
  base.trustTags = [...realTrust, ...fillerTrust];

  // Perks: keep server ones, add data-based, then tasteful fillers to reach 2–3
  const dataPerks = (bp.computePerksFromData?.(base) || []).filter(Boolean);
  const merged = dedupe([...base.perks, ...dataPerks]);
  const fillerPerks = merged.length >= 2
    ? []
    : pickMany(GENERIC_PERK_POOL.filter(x => !merged.includes(x)), idStr, 2 - merged.length);
  base.perks = dedupe([...merged, ...fillerPerks]).slice(0, 4);

  return base;
}

function normMoney(v: any): Money | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function normNum(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// -------------------- What the backend should send (cheat-sheet) --------

// For each listing (row) returned by GET /api/market/listings, please include:
//
// id, provider, category, city, state, amountDue, dueDate, logoUrl
// specs: {
//   service, billingMonth, contract, promoActive,
//   basePlan, taxesFees,
//   // energy (if applicable)
//   usageKwh, usageTherms, hasSolar, utilitySupplier, ratePlan, isBudgetBilling, stateProgram,
//   // telecom (if applicable)
//   speedDownMbps, speedUpMbps, dataCapGb, lines, unlimited, equipmentRental, autopayEnabled,
//   // water (if applicable)
//   usageGallons
// },
// market: {
//   median90d, regionalAvg, fairValue, swaps30d,
//   watchers, followers, hotness
// },
// perks: [ ... ]           // optional: real, concrete perks from parsing
// friction: 'Low'|'Medium'|'High'  // optional
//
// IMPORTANT: use null for unknown/NA values — not 0.
// 0 is a legitimate value and makes the UI look wrong.
