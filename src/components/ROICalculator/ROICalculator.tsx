// @ts-nocheck
/**
 * ROI Calculator — Webflow React Component
 * Ported from the updated UI design (Direction A, card-based layout).
 */
import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const A = {
  purple: "#5f46ff",
  purple2: "#7c6fcd",
  purpleDeep: "#4a34e0",
  purpleTint: "rgba(95, 70, 255, 0.07)",
  purpleTint2: "rgba(95, 70, 255, 0.12)",
  purpleBorder: "rgba(95, 70, 255, 0.2)",
  ink: "#0d0a40",
  inkSoft: "rgb(68,66,102)",
  mute: "rgba(112, 109, 161, 1)",
  muteSoft: "#9B97AE",
  line: "#e0dff5",
  lineSoft: "#eeedf8",
  bg: "#f6f5fe",
  bgWarm: "#ebe9fc",
  green: "#0A8C5C",
  greenTint: "rgba(10, 140, 92, 0.08)",
  red: "#C03021",
  redLight: "#DC2626",
  amber: "#B45309",
  amberLight: "#D97706",
  amberBg: "#FEF3C7",
  amberBorder: "#FDE68A",
  mono: '"Inter","SF Pro Text",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',
  sans: '"Inter","SF Pro Text",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',
  serif: '"Inter","SF Pro Text",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',

  // ─── Centralized Style Guide ──────────────────────────────────────────────────
  label: {
    fontFamily: '"Inter","SF Pro Text",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: "20px",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: "rgba(13, 10, 64, 1)",
  },
  sectionHeader: {
    title: {
      fontFamily: '"Inter","SF Pro Text",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',
      fontSize: 16,
      fontWeight: 500,
      lineHeight: "24px",
      letterSpacing: 0,
      color: "rgba(13, 10, 64, 1)",
    },
    subtitle: {
      fontFamily: '"Inter","SF Pro Text",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',
      fontSize: 12,
      fontWeight: 400,
      lineHeight: "16px",
      letterSpacing: 0,
      color: "rgba(112, 109, 161, 1)",
    }
  },
  bodyText: {
    fontFamily: '"Inter","SF Pro Text",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',
    fontSize: 13,
    fontWeight: 400,
    lineHeight: "20px",
    color: "rgba(68, 66, 102, 1)",
  },
  helperText: {
    fontFamily: '"Inter","SF Pro Text",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',
    fontSize: 10,
    fontWeight: 400,
    lineHeight: "14px",
    letterSpacing: 0,
    textTransform: "uppercase" as const,
    color: "rgba(112, 109, 161, 1)",
  }
};

// ─── Calculation Data ─────────────────────────────────────────────────────────
const PRICING = { india: 1200, us: 40, singapore: 25, uk: 30 };

const STAGE_HOURLY_RATES = {
  india: {
    preseed: { founder: 500, hr: 288, finance: 325, cs: 250 },
    seed: { founder: 1000, hr: 563, finance: 650, cs: 475 },
    seriesab: { founder: 1875, hr: 1025, finance: 1188, cs: 875 },
    seriesbc: { founder: 2750, hr: 1438, finance: 1688, cs: 1225 },
    seriesc: { founder: 4000, hr: 2000, finance: 2313, cs: 1688 },
  },
  us: {
    preseed: { founder: 113, hr: 63, finance: 69, cs: 56 },
    seed: { founder: 181, hr: 94, finance: 110, cs: 88 },
    seriesab: { founder: 288, hr: 131, finance: 156, cs: 119 },
    seriesbc: { founder: 356, hr: 169, finance: 200, cs: 150 },
    seriesc: { founder: 431, hr: 219, finance: 250, cs: 200 },
  },
  singapore: {
    preseed: { founder: 100, hr: 63, finance: 69, cs: 54 },
    seed: { founder: 188, hr: 103, finance: 119, cs: 85 },
    seriesab: { founder: 331, hr: 181, finance: 200, cs: 150 },
    seriesbc: { founder: 431, hr: 250, finance: 275, cs: 213 },
    seriesc: { founder: 563, hr: 325, finance: 375, cs: 288 },
  },
  uk: {
    preseed: { founder: 63, hr: 40, finance: 44, cs: 31 },
    seed: { founder: 110, hr: 63, finance: 70, cs: 55 },
    seriesab: { founder: 181, hr: 98, finance: 110, cs: 85 },
    seriesbc: { founder: 225, hr: 125, finance: 138, cs: 113 },
    seriesc: { founder: 281, hr: 169, finance: 188, cs: 150 },
  },
};

const STAGE_RETAINER = {
  india: { preseed: 60000, seed: 90000, seriesab: 130000, seriesbc: 220000, seriesc: 350000 },
  us: { preseed: 6000, seed: 11000, seriesab: 18000, seriesbc: 35000, seriesc: 60000 },
  singapore: { preseed: 10000, seed: 11000, seriesab: 15000, seriesbc: 28000, seriesc: 50000 },
  uk: { preseed: 4500, seed: 8000, seriesab: 12000, seriesbc: 22000, seriesc: 40000 },
};

// Stage-adjusted baselines for retainer scaling (Approach 2)
const STAKEHOLDER_BASELINES = {
  preseed: 15,
  seed: 37,
  seriesab: 75,
  seriesbc: 148,
  seriesc: 223,
};

const GRANT_BASELINES = {
  preseed: 0,
  seed: 6,
  seriesab: 16,
  seriesbc: 34,
  seriesc: 48,
};

// Redesigned to represent actual time allocation percentages (sum to 1.0 per stage)
// These values represent what % of each role's time is spent on equity work annually
const STAFFING_MATRIX = {
  preseed: { founder: 1.0, hr: 0.0, finance: 0.0, cs: 0.0 },
  seed: { founder: 0.5, hr: 0.25, finance: 0.25, cs: 0.0 },
  seriesab: { founder: 0.15, hr: 0.25, finance: 0.35, cs: 0.25 },
  seriesbc: { founder: 0.05, hr: 0.3, finance: 0.35, cs: 0.3 },
  seriesc: { founder: 0.02, hr: 0.25, finance: 0.35, cs: 0.38 },
};

const COMPLIANCE = { india: 72, us: 68, singapore: 54, uk: 54 };

// Workflow counts for fundraising — each workflow ≈ 2.5 hours
const FUNDRAISING_WORKFLOWS = {
  capTable: 3, // Pre-round modeling, security issuance, post-close reconciliation
  secretarial: 3, // Board approvals, shareholder approvals, documentation coordination
};

const VALUATION_PRICING = {
  "409a": {
    preseed: { USD: 1260, INR: 94500, GBP: 945, SGD: 1680 },
    seed: { USD: 1575, INR: 118125, GBP: 1181, SGD: 2100 },
    seriesab: { USD: 1890, INR: 141750, GBP: 1418, SGD: 2520 },
    seriesbc: { USD: 2205, INR: 165375, GBP: 1653, SGD: 2940 },
    seriesc: { USD: 2520, INR: 189000, GBP: 1890, SGD: 3360 },
  },
  blackscholes: {
    preseed: { USD: 2100, INR: 70000, GBP: 1575, SGD: 2800 },
    seed: { USD: 2625, INR: 87500, GBP: 1969, SGD: 3500 },
    seriesab: { USD: 3150, INR: 105000, GBP: 2363, SGD: 4200 },
    seriesbc: { USD: 3675, INR: 122500, GBP: 2756, SGD: 4900 },
    seriesc: { USD: 4200, INR: 140000, GBP: 3150, SGD: 5600 },
  },
  rv: {
    preseed: { USD: 840, INR: 28000, GBP: 630, SGD: 1120 },
    seed: { USD: 1050, INR: 35000, GBP: 788, SGD: 1400 },
    seriesab: { USD: 1260, INR: 42000, GBP: 945, SGD: 1680 },
    seriesbc: { USD: 1470, INR: 49000, GBP: 1103, SGD: 1960 },
    seriesc: { USD: 1680, INR: 56000, GBP: 1260, SGD: 2240 },
  },
  mb: {
    preseed: { USD: 2100, INR: 70000, GBP: 1575, SGD: 2800 },
    seed: { USD: 2625, INR: 87500, GBP: 1969, SGD: 3500 },
    seriesab: { USD: 3150, INR: 105000, GBP: 2363, SGD: 4200 },
    seriesbc: { USD: 3675, INR: 122500, GBP: 2756, SGD: 4900 },
    seriesc: { USD: 4200, INR: 140000, GBP: 3150, SGD: 5600 },
  },
  hmrc: {
    preseed: { USD: 1120, INR: 84000, GBP: 840, SGD: 1491 },
    seed: { USD: 1400, INR: 105000, GBP: 1050, SGD: 1867 },
    seriesab: { USD: 1680, INR: 126000, GBP: 1260, SGD: 2240 },
    seriesbc: { USD: 1960, INR: 147000, GBP: 1470, SGD: 2613 },
    seriesc: { USD: 2240, INR: 168000, GBP: 1680, SGD: 2987 },
  },
};

const EL_VALUATION_PRICING = {
  "409a": {
    preseed: { USD: 1008, INR: 75600, GBP: 756, SGD: 1344 },
    seed: { USD: 1260, INR: 94500, GBP: 945, SGD: 1680 },
    seriesab: { USD: 1512, INR: 113400, GBP: 1134, SGD: 2016 },
    seriesbc: { USD: 1764, INR: 132300, GBP: 1323, SGD: 2352 },
    seriesc: { USD: 2016, INR: 151200, GBP: 1512, SGD: 2688 },
  },
  blackscholes: {
    preseed: { USD: 1680, INR: 56000, GBP: 1260, SGD: 2240 },
    seed: { USD: 2100, INR: 70000, GBP: 1575, SGD: 2800 },
    seriesab: { USD: 2520, INR: 84000, GBP: 1890, SGD: 3360 },
    seriesbc: { USD: 2940, INR: 98000, GBP: 2205, SGD: 3920 },
    seriesc: { USD: 3360, INR: 112000, GBP: 2520, SGD: 4480 },
  },
  rv: {
    preseed: { USD: 672, INR: 22400, GBP: 504, SGD: 896 },
    seed: { USD: 840, INR: 28000, GBP: 630, SGD: 1120 },
    seriesab: { USD: 1008, INR: 33600, GBP: 756, SGD: 1344 },
    seriesbc: { USD: 1176, INR: 39200, GBP: 882, SGD: 1568 },
    seriesc: { USD: 1344, INR: 44800, GBP: 1008, SGD: 1792 },
  },
  mb: {
    preseed: { USD: 1680, INR: 56000, GBP: 1260, SGD: 2240 },
    seed: { USD: 2100, INR: 70000, GBP: 1575, SGD: 2800 },
    seriesab: { USD: 2520, INR: 84000, GBP: 1890, SGD: 3360 },
    seriesbc: { USD: 2940, INR: 98000, GBP: 2205, SGD: 3920 },
    seriesc: { USD: 3360, INR: 112000, GBP: 2520, SGD: 4480 },
  },
  hmrc: {
    preseed: { USD: 896, INR: 67200, GBP: 672, SGD: 1195 },
    seed: { USD: 1120, INR: 84000, GBP: 840, SGD: 1493 },
    seriesab: { USD: 1344, INR: 100800, GBP: 1008, SGD: 1792 },
    seriesbc: { USD: 1568, INR: 117600, GBP: 1176, SGD: 2090 },
    seriesc: { USD: 1792, INR: 134400, GBP: 1344, SGD: 2389 },
  },
};

const GEO_CURRENCY_MAP = {
  us: { code: "USD", symbol: "$", locale: "en-US" },
  india: { code: "INR", symbol: "₹", locale: "en-IN" },
  uk: { code: "GBP", symbol: "£", locale: "en-GB" },
  singapore: { code: "SGD", symbol: "S$", locale: "en-SG" },
};

const CURRENCY_SYMBOLS = Object.fromEntries(Object.entries(GEO_CURRENCY_MAP).map(([k, v]) => [v.code, v.symbol]));
const GEO_TO_CURRENCY = Object.fromEntries(Object.entries(GEO_CURRENCY_MAP).map(([k, v]) => [k, v.code]));

// ─── Dynamic Compliance Hours (tiered by reports) ────────────────────────────
function getDynamicComplianceHours(stage, shareholders, optionHolders, geoInc, newHireGrants = 0, refreshGrants = 0) {
  const stageScale = { preseed: 0.5, seed: 0.75, seriesab: 1.0, seriesbc: 1.25, seriesc: 1.5 };
  const scale = stageScale[stage] || 1.0;
  const totalGrants = parseInt(newHireGrants, 10) + parseInt(refreshGrants, 10);

  const reportHours = (baseHrs, scalingFactor = 1) => baseHrs * scale * scalingFactor;

  const shareholderScale = shareholders > 0 ? 1 + Math.max(0, shareholders - 10) / 100 : 1;
  const optionHolderScale = optionHolders > 0 ? 1 + Math.max(0, optionHolders - 5) / 50 : 1;
  const grantScale = totalGrants > 0 ? 1 + Math.max(0, totalGrants - 3) / 30 : 1;

  let hours = 0;

  // TIER 1: Always required if you have shareholders
  if (shareholders > 0) {
    hours += reportHours(2, shareholderScale); // Cap table summary
    hours += reportHours(3, shareholderScale); // Transaction-level ownership ledger
  }

  // TIER 2: Required if you have option holders or plan to issue grants
  if (optionHolders > 0 || newHireGrants > 0) {
    hours += reportHours(1, 1); // Equity plan & pool overview
    hours += reportHours(1, grantScale); // Grant summary reports
    hours += reportHours(0.5, optionHolderScale); // Vesting reports

    if (geoInc === "india") {
      hours += reportHours(4, optionHolderScale); // Ind AS 102/15
      hours += reportHours(4, optionHolderScale); // SH-6 (Statutory ESOP Register)
    } else if (geoInc === "us") {
      hours += reportHours(4, optionHolderScale); // ASC 718/820
      hours += reportHours(6, 1); // Rule 701 (annual, fixed)
    } else if (geoInc === "singapore" || geoInc === "uk") {
      hours += reportHours(4, optionHolderScale); // IFRS 2
    }
  }

  // TIER 3: Required if you have equity AND at Series A or later
  const stageOrder = { preseed: 0, seed: 1, seriesab: 2, seriesbc: 3, seriesc: 4 };
  if ((optionHolders > 0 || newHireGrants > 0) && (stageOrder[stage] || 0) >= 2) {
    hours += reportHours(1, optionHolderScale); // Exercise reports
    hours += reportHours(0.5, optionHolderScale); // Surrender summaries
  }

  return Math.round(hours);
}

// ─── Calculation Engine ───────────────────────────────────────────────────────
function computeROI(inputs, overrides = {}) {
  const {
    sh = 30, oh = 15, grNewHire = 5, grRefresh = 5,
    geoInc = "india", geoOp = "india", stage = "seriesab", meth = "in-house",
    planningToFundraise = false, fundraiseRound = "seed",
    newShareholdersFromFundraise = 0,
    valuationFrequency = null, valuationType = null,
  } = inputs;

  let stageKey = stage;
  if (planningToFundraise && fundraiseRound !== "safe" && fundraiseRound !== "bridge") {
    stageKey = fundraiseRound;
  }
  let rate = overrides.rate;

  if (!rate) {
    const matrix = STAFFING_MATRIX[stageKey];
    const roles = ["founder", "hr", "finance", "cs"];
    rate = 0;
    for (const role of roles) {
      if (role === "hr" && oh === 0 && parseInt(grNewHire, 10) === 0) {
        continue;
      }
      const fte = matrix[role] || 0;
      if (fte > 0) {
        const roleRate = STAGE_HOURLY_RATES[geoInc][stageKey][role];
        rate += fte * roleRate;
      }
    }
  }

  const mult = meth === "in-house" ? 1 : 0.2;
  const grHr = overrides.grHr || 1.5;
  const compHr = overrides.compHr || getDynamicComplianceHours(stageKey, sh, oh, geoInc, grNewHire, grRefresh);

  const grNewHireNum = parseInt(grNewHire, 10);
  const grRefreshNum = parseInt(grRefresh, 10);
  const totalGrantAdminWork = oh + grNewHireNum + grRefreshNum;

  // Calculate adjusted hour values (will be set properly after originalHTotal is computed)
  // For now, default to original values
  let adjustedGrHr = grHr;
  let adjustedCompHr = compHr;
  let adjustedCtRaw = 0;  // Will be set after ctRaw is calculated
  let adjustedCtFundraisingHours = 0;  // Will be set after ctFundraisingHours is calculated
  let adjustedSecFundraisingRaw = 0;  // Will be set after secFundraisingRaw is calculated

  const grHrs = totalGrantAdminWork * adjustedGrHr;
  const grCost = grHrs * mult * rate;
  const cpCost = adjustedCompHr * mult * rate;

  // === CAP TABLE MAINTENANCE ===
  // Base: 3 hours/month (reconciliation, board updates, record-keeping)
  // Scaling: +2 hours/month for every 50 shareholders above 20
  // Per PRD lines 210-220: Cap table complexity grows non-linearly with shareholder count
  const CAP_TABLE_BASE_HOURS_PER_MONTH = 3;
  const CAP_TABLE_SCALING_INCREMENT = 2; // hours/month per each 50 shareholders above 20
  const ctShareholderScale = Math.max(0, (sh - 20) / 50);
  const ctMonthlyHours = sh > 0 ? CAP_TABLE_BASE_HOURS_PER_MONTH + (ctShareholderScale * CAP_TABLE_SCALING_INCREMENT) : 0;
  const ctRaw = ctMonthlyHours * 12; // annualize
  adjustedCtRaw = ctRaw;  // Will be overridden if hours are overridden
  const ctHrs = adjustedCtRaw * mult;
  const ctCost = ctHrs * rate;

  const ROUND_COMPLEXITY = { preseed: 0.5, safe: 0.5, bridge: 0.75, seed: 1.0, seriesab: 1.5, seriesbc: 2.0, seriesc: 2.5 };
  const roundMultiplier = planningToFundraise ? (ROUND_COMPLEXITY[fundraiseRound] || 1.0) : 0;

  // === FUNDRAISING: CAP TABLE ===
  // 3 workflows × 2.5 hours/workflow = 7.5 hours baseline
  // Per PRD: "3 for cap table" workflows during fundraising
  // "One workflow" = ~2.5 hours (documentation, approvals, shareholder communication)
  const HOURS_PER_WORKFLOW = 2.5;
  const ctFundraisingBaseHours = FUNDRAISING_WORKFLOWS.capTable * HOURS_PER_WORKFLOW; // 3 × 2.5 = 7.5
  const ctFundraisingHours = planningToFundraise ? (ctFundraisingBaseHours * roundMultiplier) : 0;
  adjustedCtFundraisingHours = ctFundraisingHours;  // Will be overridden if hours are overridden
  const ctFundraisingHrs = adjustedCtFundraisingHours * mult;
  const ctFundraisingCost = ctFundraisingHrs * rate;

  const secRate = STAGE_HOURLY_RATES[geoInc][stageKey].cs;

  // === FUNDRAISING: SECRETARIAL & BOARD ===
  // 3 workflows × 2.5 hours/workflow = 7.5 hours baseline
  // Workflows: (1) Board approvals, (2) Shareholder approvals, (3) Documentation coordination
  // Scaled by shareholder count (more shareholders = more communication/coordination)
  const secFundraisingBaseWorkflows = planningToFundraise ? FUNDRAISING_WORKFLOWS.secretarial : 0;
  const secFundraisingBaseHours = secFundraisingBaseWorkflows * HOURS_PER_WORKFLOW; // 3 × 2.5 = 7.5
  const secFundraisingHours = secFundraisingBaseHours * roundMultiplier;
  const effectiveShareholders = planningToFundraise ? (sh + newShareholdersFromFundraise) : sh;
  // Shareholder scaling: starts at 1.0 for ≤20 shareholders, increases 0.5% for every 100 shareholders above 20
  const secFundraisingScaling = 1 + Math.max(0, (effectiveShareholders - 20) / 100) * 0.5;
  const secFundraisingRaw = secFundraisingHours * secFundraisingScaling;
  adjustedSecFundraisingRaw = secFundraisingRaw;  // Will be overridden if hours are overridden
  const secFundraisingHrs = adjustedSecFundraisingRaw * mult;
  const secFundraisingCost = secFundraisingHrs * secRate;

  let methodExtCost = overrides.methodExtCost || 0;
  if (meth === 'outsourced' && !overrides.methodExtCost) {
    const totalStakeholders = sh + oh + parseInt(grNewHire, 10);
    const grRefreshNum = parseInt(grRefresh, 10);

    if (totalStakeholders === 0 && grRefreshNum === 0) {
      methodExtCost = 0;
    } else {
      const baseRetainer = STAGE_RETAINER[geoInc][stageKey];
      const stakeholderBaseline = STAKEHOLDER_BASELINES[stageKey];
      const grantBaseline = GRANT_BASELINES[stageKey];

      const shDenominator = stageKey === 'seriesc' ? 200 : 144;
      const grDenominator = stageKey === 'seriesc' ? 50 : 37;
      const stakeholderFactor = 1 + Math.max(0, totalStakeholders - stakeholderBaseline) / shDenominator;
      const grantFactor = 1 + Math.max(0, grRefreshNum - grantBaseline) / grDenominator;
      const fundraisingFactor = planningToFundraise ? 1.3 : 1.0;

      methodExtCost = Math.round(baseRetainer * stakeholderFactor * grantFactor * fundraisingFactor);
    }
  }

  let valuationCost = 0;
  let elValuationCost = 0;
  if (valuationFrequency && valuationType) {
    const events = valuationFrequency === 'annually' ? 1 : valuationFrequency === 'quarterly' ? 4 : 0;
    const opCurrency = GEO_TO_CURRENCY[geoInc] || 'INR';

    const marketPricing = VALUATION_PRICING[valuationType]?.[stageKey];
    const elPricing = EL_VALUATION_PRICING[valuationType]?.[stageKey];

    if (marketPricing && elPricing) {
      const marketAmount = marketPricing[opCurrency] || 0;
      const elAmount = elPricing[opCurrency] || 0;
      valuationCost = Math.round(events * marketAmount);
      elValuationCost = Math.round(events * elAmount);
    }
  }

  let annCost = grCost + cpCost + ctCost + ctFundraisingCost + secFundraisingCost + methodExtCost + valuationCost;
  const originalHTotal = totalGrantAdminWork * grHr + compHr + ctRaw + ctFundraisingHours + secFundraisingRaw;
  const manualHTotal = overrides.manualHTotal || originalHTotal;

  // If hours are overridden, recalculate adjusted hour values for each component
  // This ensures fixed costs (like retainer) aren't scaled
  if (overrides.manualHTotal && originalHTotal > 0) {
    const hoursRatio = manualHTotal / originalHTotal;
    adjustedGrHr = grHr * hoursRatio;
    adjustedCompHr = compHr * hoursRatio;
    adjustedCtRaw = ctRaw * hoursRatio;
    adjustedCtFundraisingHours = ctFundraisingHours * hoursRatio;
    adjustedSecFundraisingRaw = secFundraisingRaw * hoursRatio;

    // Recalculate all cost components with adjusted hours
    const newGrHrs = totalGrantAdminWork * adjustedGrHr;
    const newGrCost = newGrHrs * mult * rate;
    const newCpCost = adjustedCompHr * mult * rate;
    const newCtHrs = adjustedCtRaw * mult;
    const newCtCost = newCtHrs * rate;
    const newCtFundraisingHrs = adjustedCtFundraisingHours * mult;
    const newCtFundraisingCost = newCtFundraisingHrs * rate;
    const newSecFundraisingHrs = adjustedSecFundraisingRaw * mult;
    const newSecFundraisingCost = newSecFundraisingHrs * secRate;

    // Recalculate total cost with adjusted components (retainer stays fixed)
    annCost = newGrCost + newCpCost + newCtCost + newCtFundraisingCost + newSecFundraisingCost + methodExtCost + valuationCost;
  }

  const adjustedHTotal = manualHTotal * mult;
  const hoursToday = adjustedHTotal;
  const hoursSaved = hoursToday;
  const timeSavedPct = hoursToday > 0 ? Math.round((hoursSaved / hoursToday) * 100) : 0;
  const stakeholders = Math.min(sh + oh + parseInt(grNewHire, 10), 10000);
  const elAnn = stakeholders * PRICING[geoInc] + elValuationCost;

  const diff = annCost - elAnn;
  const isSpend = diff >= 0;
  const absDiff = Math.abs(diff);
  const roi = elAnn > 0 ? Math.round((absDiff / elAnn) * 10) / 10 : 0;

  return {
    annCost: Math.round(annCost),
    elAnn: Math.round(elAnn),
    diff: Math.round(diff),
    isSpend,
    roi,
    stakeholders,
    rate,
    secRate,
    manualHTotal: Math.round(manualHTotal * 10) / 10,
    hoursSaved: Math.round(hoursSaved),
    timeSavedPct,
    grCost: Math.round(grCost),
    cpCost: Math.round(cpCost),
    ctCost: Math.round(ctCost),
    ctFundraisingCost: Math.round(ctFundraisingCost),
    secFundraisingCost: Math.round(secFundraisingCost),
    methodExtCost: Math.round(methodExtCost),
    valuationCost: Math.round(valuationCost),
    elValuationCost: Math.round(elValuationCost),
    grHr,
    compHr,
    mult,
    planningToFundraise,
    fundraiseRound,
    roundMultiplier,
    ctFundraisingHours,
    secFundraisingRaw,
    newShareholdersFromFundraise,
    meth,
    stage: stageKey,
  };
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function MonoLabel({ children, size = 11, color, style }) {
  return (
    <span style={{
      fontFamily: A.sans, fontSize: size, fontWeight: 500, letterSpacing: 0.4,
      textTransform: "uppercase", color: color || A.mute,
      display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
      verticalAlign: "middle",
      ...style,
    }}>{children}</span>
  );
}

function FormLabel({ children, required, error, style }) {
  return (
    <span style={{
      fontFamily: A.label.fontFamily,
      fontSize: A.label.fontSize,
      fontWeight: A.label.fontWeight,
      lineHeight: A.label.lineHeight,
      letterSpacing: A.label.letterSpacing,
      textTransform: A.label.textTransform,
      color: error ? A.redLight : A.label.color,
      display: "inline-flex",
      alignItems: "center",
      whiteSpace: "nowrap",
      verticalAlign: "middle",
      ...style,
    }}>
      {children}
      {required && <span style={{ color: error ? A.redLight : A.purple, marginLeft: 3 }}>*</span>}
    </span>
  );
}

function SectionHeader({ number, title, subtitle, style }) {
  return (
    <span style={{ display: "block", ...style }}>
      <span style={{ display: "block", marginBottom: 6 }}>
        <span style={{
          fontFamily: A.sectionHeader.title.fontFamily,
          fontSize: A.sectionHeader.title.fontSize,
          fontWeight: A.sectionHeader.title.fontWeight,
          letterSpacing: A.sectionHeader.title.letterSpacing,
          color: A.sectionHeader.title.color,
          lineHeight: A.sectionHeader.title.lineHeight,
          verticalAlign: "middle"
        }}>
          {title}
        </span>
      </span>
      {subtitle && (
        <span style={{
          fontFamily: A.sectionHeader.subtitle.fontFamily,
          fontSize: A.sectionHeader.subtitle.fontSize,
          fontWeight: A.sectionHeader.subtitle.fontWeight,
          color: A.sectionHeader.subtitle.color,
          lineHeight: A.sectionHeader.subtitle.lineHeight,
          letterSpacing: A.sectionHeader.subtitle.letterSpacing,
          verticalAlign: "middle",
          display: "block"
        }}>
          {subtitle}
        </span>
      )}
    </span>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text", required, suffix, error, helperText, onNumericError, disabled }) {
  const borderColor = error ? A.redLight : A.line;
  const handleChange = (e) => {
    let val = e.target.value;
    let hasError = false;
    if (type === "number") {
      val = val.replace(/[^\d]/g, "");
      if (val !== "") {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 0) {
          hasError = true;
        }
      }
    }
    onNumericError && onNumericError(hasError);
    onChange && onChange(val);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <FormLabel error={error} required={required}>
        {label}
      </FormLabel>
      <div style={{ position: "relative", marginTop: 6, flex: 0 }}>
        <input
          type={type === "number" ? "text" : type}
          inputMode={type === "number" ? "numeric" : undefined}
          value={value ?? ""}
          onChange={handleChange}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          disabled={disabled}
          style={{
            width: "100%", boxSizing: "border-box",
            border: "none", borderBottom: `1px solid ${disabled ? A.line : borderColor}`,
            padding: "8px 0", outline: "none",
            background: disabled ? "rgba(232, 230, 240, 0.5)" : "transparent", fontFamily: A.sans, fontSize: 14, lineHeight: 1.4,
            color: disabled ? "rgba(159, 153, 175, 0.6)" : A.ink, fontVariantNumeric: "tabular-nums",
            caretColor: error ? A.redLight : "auto",
            display: "block",
            cursor: disabled ? "not-allowed" : "auto",
            opacity: disabled ? 0.5 : 1,
          }}
          onFocus={(e) => (e.currentTarget.style.borderBottomColor = error ? A.redLight : A.purple)}
          onBlur={(e) => (e.currentTarget.style.borderBottomColor = borderColor)}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 0, top: 8, fontFamily: A.sans, fontSize: 12, color: A.muteSoft, fontWeight: 500 }}>{suffix}</span>
        )}
      </div>
      <div style={{ minHeight: error || helperText ? "auto" : 22, marginTop: 6 }}>
        {error && (
          <div role="alert" style={{
            display: "flex", alignItems: "center", gap: 4,
            fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4,
            textTransform: "uppercase", color: A.redLight,
          }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="5.5" cy="5.5" r="4.5"/><path d="M5.5 3v3M5.5 7.8v.2"/></svg>
            {error}
          </div>
        )}
        {helperText && !error && (
          <span style={{
            ...A.helperText,
            display: "block",
          }}>
            {helperText}
          </span>
        )}
      </div>
    </div>
  );
}

function Dropdown({ label, value, onChange, options, placeholder = "Select…", required, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      if (ref.current && !ref.current.contains(e.target) && !path.includes(ref.current)) {
        setOpen(false);
      }
    };
    const onScroll = (e) => {
      if (ref.current && ref.current.contains(e.target)) {
        return;
      }
      setOpen(false);
    };
    const onTouchMove = (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      if (ref.current && !ref.current.contains(e.target) && !path.includes(ref.current)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDoc, true);
    document.addEventListener("touchstart", onDoc, true);
    window.addEventListener("touchmove", onTouchMove, { passive: true, capture: true });
    window.addEventListener("scroll", onScroll, true);

    return () => {
      document.removeEventListener("mousedown", onDoc, true);
      document.removeEventListener("touchstart", onDoc, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);
  const sel = options.find((o) => (typeof o === "string" ? o : o.value) === value);
  const selLabel = sel ? (typeof sel === "string" ? sel : sel.label) : "";
  const borderColor = error ? A.redLight : open ? A.purple : A.line;
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column" }}>
      {label && <FormLabel error={error} required={required}>{label}</FormLabel>}
      <div style={{ position: "relative", marginTop: label ? 6 : 0 }}>
        <button onClick={() => setOpen((o) => !o)} aria-invalid={error ? "true" : "false"} style={{
          width: "100%", textAlign: "left", padding: "8px 0", background: "transparent",
          border: "none", borderBottom: `1px solid ${borderColor}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
          fontFamily: A.sans, fontSize: 14, lineHeight: 1.4, color: sel ? A.ink : A.muteSoft,
          transition: "border-color .15s",
        }}>
          <span>{selLabel || placeholder}</span>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={A.mute} strokeWidth="1.6" strokeLinecap="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
            <path d="M2 4l3.5 3.5L9 4"/>
          </svg>
        </button>
        {open && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 30,
            background: "#fff", border: `1px solid ${A.line}`, borderRadius: 6,
            boxShadow: "0 8px 24px rgba(30,27,46,0.12)", padding: 4, maxHeight: 240, overflow: "auto",
          }}>
            {options.map((o) => {
              const v = typeof o === "string" ? o : o.value;
              const l = typeof o === "string" ? o : o.label;
              const isSel = v === value;
              return (
                <button key={v}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange && onChange(v);
                    setOpen(false);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "8px 10px", border: "none", cursor: "pointer",
                    background: isSel ? A.purpleTint : "transparent", borderRadius: 6,
                    fontFamily: "inherit", fontSize: 14, color: A.ink, fontWeight: isSel ? 600 : 500,
                  }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "#F7F6FA"; }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                >{l}</button>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ minHeight: error ? "auto" : 22, marginTop: 6 }}>
        {error && (
          <div role="alert" style={{
            display: "flex", alignItems: "center", gap: 4,
            fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4,
            textTransform: "uppercase", color: A.redLight,
          }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="5.5" cy="5.5" r="4.5"/><path d="M5.5 3v3M5.5 7.8v.2"/></svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function Switch({ on, onChange, size = "md" }) {
  const w = size === "sm" ? 34 : 40;
  const h = size === "sm" ? 18 : 22;
  const knob = size === "sm" ? 14 : 18;
  return (
    <button onClick={(e) => { e.preventDefault(); onChange(!on); }} role="switch" aria-checked={on} style={{
      width: w, height: h, borderRadius: h / 2, border: "none", padding: 0, cursor: "pointer", flexShrink: 0,
      background: on ? A.purple : "#D5D2E0", position: "relative", transition: "background .18s",
    }}>
      <span style={{
        position: "absolute", top: 2, left: on ? w - knob - 2 : 2, width: knob, height: knob, borderRadius: knob / 2,
        background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.18)", transition: "left .18s",
      }} />
    </button>
  );
}

function ChipSelect({ value, onChange, options, mono = true }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => {
        const val = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        const disabled = typeof o === "object" && o.disabled;
        const sel = value === val && !disabled;
        return (
          <button
            key={val}
            onClick={() => !disabled && onChange(val)}
            disabled={disabled}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              cursor: disabled ? "not-allowed" : "pointer",
              border: `1px solid ${sel ? A.purple : A.line}`,
              background: sel ? A.purple : "#fff",
              color: sel ? "#fff" : A.inkSoft,
              fontFamily: A.sans,
              fontSize: mono ? 11 : 13,
              fontWeight: 500,
              letterSpacing: mono ? 0.4 : 0,
              textTransform: mono ? "uppercase" : "none",
              transition: "all .15s",
              opacity: disabled ? 0.35 : 1,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function StatusChip({ mode, onEdit }) {
  if (mode === "live") {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        height: 26, borderRadius: 999, padding: "0 12px",
        background: A.greenTint, border: `1px solid rgba(10, 140, 92, 0.25)`,
        fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4,
        textTransform: "uppercase", color: A.green,
      }}>
        <span style={{ position: "relative", width: 7, height: 7 }}>
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: A.green, opacity: 0.3, animation: "roi-pulse 1.6s ease-out infinite" }} />
          <span style={{ position: "absolute", inset: 1.5, borderRadius: "50%", background: A.green }} />
        </span>
        Live
      </div>
    );
  }
  if (mode === "stale") {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        height: 26, borderRadius: 999, padding: "0 12px",
        background: A.amberBg, border: `1px solid ${A.amberBorder}`,
        fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4,
        textTransform: "uppercase", color: A.amber,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Outdated
      </div>
    );
  }
  return (
    <div style={{
      display: "inline-flex", alignItems: "stretch", height: 26, borderRadius: 999,
      background: "#fff", border: `1px solid ${A.purple}`, fontFamily: A.sans,
    }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 10px 0 12px", color: A.purple, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase" }}>
        <span style={{ position: "relative", width: 7, height: 7 }}>
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: A.purple, opacity: 0.3, animation: "roi-pulse 2.2s ease-out infinite" }} />
          <span style={{ position: "absolute", inset: 1.5, borderRadius: "50%", background: A.purple }} />
        </span>
        Sample
      </div>
      <span style={{ width: 1, background: A.purple, margin: "6px 0" }} />
      <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(e); }} style={{
        all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
        padding: "0 12px", color: A.purple, fontSize: 11, fontWeight: 500, letterSpacing: 0.4,
        textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        Edit inputs
      </button>
    </div>
  );
}

function PrimaryBtn({ children, fullWidth, onClick, size = "md", style, disabled, onMouseEnter, onMouseLeave }) {
  const padding = "8px 16px";
  const fontSize = size === "lg" ? 15 : size === "sm" ? 12 : 14;
  const btnRef = useRef(null);
  return (
    <button ref={btnRef} onClick={onClick} disabled={disabled} style={{
      width: fullWidth ? "100%" : "auto",
      background: A.purple, color: "#fff",
      fontFamily: A.sans, fontSize, fontWeight: 600, letterSpacing: -0.1,
      border: "none", padding, borderRadius: 8, cursor: "pointer",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: "0 1px 0 rgba(255,255,255,0.2) inset, 0 2px 8px rgba(109,40,217,0.25)",
      transition: "background .15s",
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = A.purple2;
          const arr = e.currentTarget.querySelector(".btn-arr-icon");
          if (arr) arr.style.transform = "translateX(3px)";
        }
        onMouseEnter && onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = style?.background || A.purple;
          const arr = e.currentTarget.querySelector(".btn-arr-icon");
          if (arr) arr.style.transform = "translateX(0)";
        }
        onMouseLeave && onMouseLeave(e);
      }}
    >{children}</button>
  );
}

function InfoTip({ text, color }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const tooltipRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleDocumentClick = (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      if (ref.current && !ref.current.contains(e.target) && !path.includes(ref.current)) {
        setOpen(false);
      }
    };
    const handleScroll = () => {
      setOpen(false);
    };
    if (open) {
      document.addEventListener("click", handleDocumentClick, true);
      document.addEventListener("touchstart", handleDocumentClick, true);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      document.removeEventListener("touchstart", handleDocumentClick, true);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (open && ref.current && tooltipRef.current) {
      const iconRect = ref.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
      const top = iconRect.top - tooltipRect.height - 6;
      setTooltipPos({ top, left: Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8)) });
    }
  }, [open]);

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex", verticalAlign: "middle", marginLeft: 4 }}>
      <span
        tabIndex={0}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
        role="button"
        aria-label={`Information: ${text}`}
        aria-expanded={open}
        style={{
          width: 13.33, height: 13.33,
          color: color || "rgba(13, 10, 64, 1)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          cursor: "help", userSelect: "none", flexShrink: 0,
        }}
      >
        <svg width="13.33" height="13.33" viewBox="0 0 16 16" fill="none" style={{ display: "block" }}>
          <path d="M7.99992 14.6663C11.6818 14.6663 14.6666 11.6816 14.6666 7.99967C14.6666 4.31778 11.6818 1.33301 7.99992 1.33301C4.31802 1.33301 1.33325 4.31778 1.33325 7.99967C1.33325 11.6816 4.31802 14.6663 7.99992 14.6663Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 5.33301H8.00667" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {open && (
        <span ref={tooltipRef} style={{
          position: "fixed", top: tooltipPos.top, left: tooltipPos.left,
          background: A.ink, color: "#fff",
          fontFamily: A.sans, fontSize: 11.5, fontWeight: 500, lineHeight: 1.45, letterSpacing: 0,
          textTransform: "none",
          padding: "8px 10px", borderRadius: 6, maxWidth: 220, whiteSpace: "normal", wordWrap: "break-word", zIndex: 1000,
          boxShadow: "0 6px 18px rgba(20,18,30,0.22)", pointerEvents: "none",
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function AHero({ width, titlePre, titleHighlight, titlePost, subtitle }) {
  const compact = width < 720;
  return (
    <section style={{
      padding: compact ? "32px 20px 20px" : "64px 40px 36px",
      maxWidth: 1280, margin: "0 auto",
    }}>
      <h1 style={{
        fontFamily: '"Inter", sans-serif',
        fontSize: compact ? 28 : 52,
        fontWeight: 500,
        letterSpacing: compact ? -0.8 : -1.12,
        color: "rgba(13, 10, 64, 1)",
        lineHeight: compact ? 1.15 : "64px",
        verticalAlign: "middle",
        margin: 0,
        maxWidth: 880,
        textWrap: "pretty",
      }}>
        {titlePre}{" "}
        <span style={{
          fontFamily: '"Inter", sans-serif',
          fontStyle: "normal",
          fontWeight: 500,
          color: "#5f46ff",
        }}>{titleHighlight}</span>{" "}
        {titlePost}
      </h1>
      <p style={{
        fontFamily: '"Inter", sans-serif',
        fontSize: compact ? 15 : 18,
        fontWeight: 400,
        letterSpacing: 0.2,
        verticalAlign: "middle",
        color: "rgba(68, 66, 102, 1)",
        lineHeight: compact ? 1.4 : "28px",
        maxWidth: 620,
        marginTop: 20,
        marginBottom: 0,
      }}>
        {subtitle}
      </p>
    </section>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function AForm({
  width,
  onCalculate,
  onInputChange,
  errors,
  mode,
  editedRate,
  editedHours,
  defaultGeoInc = "india",
  defaultGeoOp = "india",
  defaultStage = "seriesab",
  defaultLegalEntity = "",
  defaultShareholders = "30",
  defaultOptionHolders = "15",
  defaultNewHireGrants = "5",
  defaultRefreshGrants = "5",
  defaultFundraise = false,
  defaultFundraiseRound = "seed",
  defaultNewShareholdersFromFundraise = "0",
  defaultValuation = false,
  defaultValFreq = null,
  defaultValType = null,
  defaultAdminMethod = "in-house",
}) {
  const [stage, setStage] = useState(defaultStage);
  const [shareholders, setShareholders] = useState(defaultShareholders);
  const [optionHolders, setOptionHolders] = useState(defaultOptionHolders);
  const [newHireGrants, setNewHireGrants] = useState(defaultNewHireGrants);
  const [refreshGrants, setRefreshGrants] = useState(defaultRefreshGrants);
  const [geoInc, setGeoInc] = useState(defaultGeoInc);
  const [geoOp, setGeoOp] = useState(defaultGeoOp);
  const [legalEntity, setLegalEntity] = useState(defaultLegalEntity);
  const [fundraise, setFundraise] = useState(defaultFundraise);
  const [fundraiseRound, setFundraiseRound] = useState(() => {
    const stageKey = defaultStage;
    const roundKey = defaultFundraiseRound;
    const stageOrd = { preseed: 0, seed: 1, seriesab: 2, seriesbc: 3, seriesc: 4 };
    const rounds = ["preseed", "seed", "seriesab", "seriesbc", "seriesc"];
    if ((stageOrd[roundKey] ?? 99) <= (stageOrd[stageKey] ?? -1)) {
      const nextRound = rounds.find(r => (stageOrd[r] ?? 99) > (stageOrd[stageKey] ?? -1));
      return nextRound || "seriesc";
    }
    return roundKey;
  });
  const [newShareholdersFromFundraise, setNewShareholdersFromFundraise] = useState(defaultNewShareholdersFromFundraise);
  const [valuation, setValuation] = useState(defaultValuation);
  const [valFreq, setValFreq] = useState(defaultValFreq);
  const [valType, setValType] = useState(defaultValType);
  const [adminMethod, setAdminMethod] = useState(defaultAdminMethod);
  const [numericErrors, setNumericErrors] = useState({});

  // Sync form state when Webflow default props change
  useEffect(() => {
    setStage(defaultStage);
    const stageKey = defaultStage;
    const roundKey = fundraiseRound;
    const stageOrd = { preseed: 0, seed: 1, seriesab: 2, seriesbc: 3, seriesc: 4 };
    const rounds = ["preseed", "seed", "seriesab", "seriesbc", "seriesc"];
    if ((stageOrd[roundKey] ?? 99) <= (stageOrd[stageKey] ?? -1)) {
      const nextRound = rounds.find(r => (stageOrd[r] ?? 99) > (stageOrd[stageKey] ?? -1));
      setFundraiseRound(nextRound || "seriesc");
    }
  }, [defaultStage]);

  useEffect(() => {
    const stageKey = stage;
    const roundKey = defaultFundraiseRound;
    const stageOrd = { preseed: 0, seed: 1, seriesab: 2, seriesbc: 3, seriesc: 4 };
    const rounds = ["preseed", "seed", "seriesab", "seriesbc", "seriesc"];
    if ((stageOrd[roundKey] ?? 99) <= (stageOrd[stageKey] ?? -1)) {
      const nextRound = rounds.find(r => (stageOrd[r] ?? 99) > (stageOrd[stageKey] ?? -1));
      setFundraiseRound(nextRound || "seriesc");
    } else {
      setFundraiseRound(defaultFundraiseRound);
    }
  }, [defaultFundraiseRound]);

  useEffect(() => { setShareholders(defaultShareholders); }, [defaultShareholders]);
  useEffect(() => { setOptionHolders(defaultOptionHolders); }, [defaultOptionHolders]);
  useEffect(() => { setNewHireGrants(defaultNewHireGrants); }, [defaultNewHireGrants]);
  useEffect(() => { setRefreshGrants(defaultRefreshGrants); }, [defaultRefreshGrants]);
  useEffect(() => {
    if (parseInt(optionHolders, 10) <= 0 && refreshGrants !== "0") {
      setRefreshGrants("0");
    }
  }, [optionHolders]);
  useEffect(() => { setGeoInc(defaultGeoInc); }, [defaultGeoInc]);
  useEffect(() => { setGeoOp(defaultGeoOp); }, [defaultGeoOp]);
  useEffect(() => { setLegalEntity(defaultLegalEntity); }, [defaultLegalEntity]);
  useEffect(() => { setFundraise(defaultFundraise); }, [defaultFundraise]);
  useEffect(() => { setNewShareholdersFromFundraise(defaultNewShareholdersFromFundraise); }, [defaultNewShareholdersFromFundraise]);
  useEffect(() => { setValuation(defaultValuation); }, [defaultValuation]);
  useEffect(() => { setValFreq(defaultValFreq); }, [defaultValFreq]);
  useEffect(() => { setValType(defaultValType); }, [defaultValType]);
  useEffect(() => { setAdminMethod(defaultAdminMethod); }, [defaultAdminMethod]);

  const oneColumn = width < 720;

  // Update parent's formData with current form values whenever inputs change
  useEffect(() => {
    onInputChange && onInputChange({
      sh: shareholders,
      oh: optionHolders,
      grNewHire: newHireGrants,
      grRefresh: refreshGrants,
      geoInc,
      geoOp,
      stage,
      meth: adminMethod,
      legalEntityName: legalEntity,
      planningToFundraise: fundraise,
      fundraiseRound,
      newShareholdersFromFundraise: parseInt(newShareholdersFromFundraise, 10) || 0,
      valuationFrequency: valuation ? valFreq : null,
      valuationType: valuation ? valType : null,
    });
  }, [shareholders, optionHolders, newHireGrants, refreshGrants, geoInc, geoOp, stage, adminMethod, legalEntity, fundraise, fundraiseRound, newShareholdersFromFundraise, valuation, valFreq, valType]);

  const newHireGrantsNum = parseInt(newHireGrants, 10) || 0;
  const weeksBetweenNewHires = newHireGrantsNum > 0 ? Math.round(52 / newHireGrantsNum) : 0;
  const newHireGrantsHelper = newHireGrantsNum > 0 ? `about 1 new hire with options every ~${weeksBetweenNewHires} weeks` : "";

  const refreshGrantsNum = parseInt(refreshGrants, 10) || 0;
  const weeksBetweenRefresh = refreshGrantsNum > 0 ? Math.round(52 / refreshGrantsNum) : 0;
  const refreshGrantsHelper = refreshGrantsNum > 0 ? `about 1 refresh every ~${weeksBetweenRefresh} weeks` : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <FormSection number={1} title="Company profile" subtitle="Geography determines compliance requirements and salary benchmarks.">
        <div className="form-grid-2">
          <Dropdown label="Country of Incorporation" value={geoInc} required error={errors?.geoInc} options={[{ value: "india", label: "India" }, { value: "us", label: "United States" }, { value: "singapore", label: "Singapore" }, { value: "uk", label: "United Kingdom" }]} onChange={(v) => { setGeoInc(v); onInputChange && onInputChange(); }} />
          <Dropdown label="Country of Operation" value={geoOp} required error={errors?.geoOp} options={[{ value: "india", label: "India" }, { value: "us", label: "United States" }, { value: "singapore", label: "Singapore" }, { value: "uk", label: "United Kingdom" }]} onChange={(v) => { setGeoOp(v); onInputChange && onInputChange(); }} />
          <Dropdown label="Current Stage" value={stage} required error={errors?.stage} options={[{ value: "preseed", label: "Pre-seed" }, { value: "seed", label: "Seed" }, { value: "seriesab", label: "Series A/B" }, { value: "seriesbc", label: "Series B/C" }, { value: "seriesc", label: "Series C+" }]} onChange={(v) => {
            setStage(v);
            const stageOrd = { preseed: 0, seed: 1, seriesab: 2, seriesbc: 3, seriesc: 4 };
            const rounds = ["preseed", "seed", "seriesab", "seriesbc", "seriesc"];
            const nextRound = rounds.find(r => (stageOrd[r] ?? 99) > (stageOrd[v] ?? -1));
            setFundraiseRound(nextRound || "seriesc");
            onInputChange && onInputChange();
          }} />
          <FormField label="Legal Entity Name" placeholder="e.g. Acme Corp Ltd." required value={legalEntity} onChange={(v) => { setLegalEntity(v); onInputChange && onInputChange(); }} error={errors?.legalEntityName} />
        </div>
      </FormSection>

      <FormSection number={2} title="Equity structure" subtitle="Stakeholder volume scales your cap table reconciliation and grant overhead.">
        <div className="form-grid-4">
          <FormField label={<>Shareholders <InfoTip text="Founders, investors, and any other equity holders on your cap table." /></>} required value={shareholders} onChange={(v) => { setShareholders(v); onInputChange && onInputChange(); }} type="number" error={numericErrors.shareholders ? "Only numbers allowed" : errors?.shareholders} onNumericError={(hasError) => setNumericErrors({ ...numericErrors, shareholders: hasError })} />
          <FormField label={<>Option holders <InfoTip text="Employees with stock options." /></>} required value={optionHolders} onChange={(v) => { setOptionHolders(v); onInputChange && onInputChange(); }} type="number" error={numericErrors.optionHolders ? "Only numbers allowed" : errors?.optionHolders} onNumericError={(hasError) => setNumericErrors({ ...numericErrors, optionHolders: hasError })} />
          <FormField label={<>Refresh grants/yr <InfoTip text="Projected equity refresh grants for existing option holders each year." /></>} required value={refreshGrants} onChange={(v) => { setRefreshGrants(v); onInputChange && onInputChange(); }} type="number" error={numericErrors.refreshGrants ? "Only numbers allowed" : errors?.refreshGrants} helperText={refreshGrantsHelper} onNumericError={(hasError) => setNumericErrors({ ...numericErrors, refreshGrants: hasError })} disabled={parseInt(optionHolders, 10) <= 0} />
          <FormField label={<>New hire grants/yr <InfoTip text="Projected new hires receiving stock options each year." /></>} required value={newHireGrants} onChange={(v) => { setNewHireGrants(v); onInputChange && onInputChange(); }} type="number" error={numericErrors.newHireGrants ? "Only numbers allowed" : errors?.newHireGrants} helperText={newHireGrantsHelper} onNumericError={(hasError) => setNumericErrors({ ...numericErrors, newHireGrants: hasError })} />
        </div>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <SwitchCard on={fundraise} onChange={(v) => { setFundraise(v); onInputChange && onInputChange(); }} title="Planning to fundraise in the next 12 months?" subtitle="Helps us model upcoming governance & onboarding workflows.">
            <FundraiseExpanded oneColumn={oneColumn} round={fundraiseRound} setRound={setFundraiseRound} currentStage={stage} shareholders={newShareholdersFromFundraise} setShareholders={setNewShareholdersFromFundraise} errors={errors} />
          </SwitchCard>
          <SwitchCard on={valuation} onChange={(v) => { setValuation(v); onInputChange && onInputChange(); }} title="Do you need valuation reports?" subtitle="Required for Options grant pricing, fundraising, and exit events.">
            <ValuationExpanded oneColumn={oneColumn} stage={stage} geoInc={geoInc} freq={valFreq} setFreq={(f) => { setValFreq(f); onInputChange && onInputChange(); }} type={valType} setType={(t) => { setValType(t); onInputChange && onInputChange(); }} errors={errors} />
          </SwitchCard>
        </div>
      </FormSection>

      <FormSection number={3} title="Current operations" subtitle="How you currently manage equity administration.">
        <Dropdown label="Administrative Method" value={adminMethod} required error={errors?.meth} options={[{ value: "in-house", label: "In-house (Spreadsheets)" }, { value: "outsourced", label: "Outsourced (CA/Law Firm)" }]} onChange={(v) => { setAdminMethod(v); onInputChange && onInputChange(); }} />
      </FormSection>

      <PrimaryBtn size="lg" fullWidth style={{ padding: "16px 28px" }} onClick={() => {
        const overrides = {};
        if (editedRate !== null && editedRate !== "") {
          if (adminMethod === "outsourced") {
            overrides.methodExtCost = parseInt(editedRate, 10);
          } else {
            overrides.rate = parseInt(editedRate, 10);
          }
        }
        if (editedHours !== null && editedHours !== "") {
          overrides.manualHTotal = parseInt(editedHours, 10);
        }
        onCalculate && onCalculate({ sh: shareholders, oh: optionHolders, grNewHire: newHireGrants, grRefresh: refreshGrants, geoInc, geoOp, stage, meth: adminMethod, legalEntityName: legalEntity, planningToFundraise: fundraise, fundraiseRound, newShareholdersFromFundraise: parseInt(newShareholdersFromFundraise, 10) || 0, valuation, valuationFrequency: valuation ? valFreq : null, valuationType: valuation ? valType : null }, overrides);
      }}>
        Calculate ROI
        <svg className="btn-arr-icon" width="16" height="16" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", transition: "transform 0.15s" }}><g opacity="0.6"><path d="M13.5333 9.33379L7 5.13379V13.5338L13.5333 9.33379Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></g></svg>
      </PrimaryBtn>
    </div>
  );
}

function FormSection({ number, title, subtitle, children }) {
  return (
    <section className="form-card">
      <SectionHeader number={number} title={title} subtitle={subtitle} style={{ marginBottom: 20 }} />
      <div>{children}</div>
    </section>
  );
}

function SwitchCard({ on, onChange, title, subtitle, children }) {
  const [animating, setAnimating] = useState(false);
  const prevOn = useRef(on);
  useEffect(() => {
    if (prevOn.current !== on) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 320);
      prevOn.current = on;
      return () => clearTimeout(t);
    }
  }, [on]);
  const clipped = !on || animating;
  return (
    <div style={{
      border: `1px solid ${on ? A.purpleBorder : A.line}`,
      background: on ? A.purpleTint : "#fff",
      borderRadius: 8, transition: "all .2s",
    }}>
      <label style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer" }}>
        <Switch on={on} onChange={onChange} />
        <span style={{ flex: 1, minWidth: 0, display: "block" }}>
          <span style={{
            fontFamily: A.sectionHeader.title.fontFamily,
            fontSize: A.sectionHeader.title.fontSize,
            fontWeight: A.sectionHeader.title.fontWeight,
            lineHeight: A.sectionHeader.title.lineHeight,
            color: A.sectionHeader.title.color,
            display: "block",
            letterSpacing: A.sectionHeader.title.letterSpacing,
          }}>{title}</span>
          <span style={{
            fontFamily: A.sectionHeader.subtitle.fontFamily,
            fontSize: A.sectionHeader.subtitle.fontSize,
            fontWeight: A.sectionHeader.subtitle.fontWeight,
            color: A.sectionHeader.subtitle.color,
            lineHeight: A.sectionHeader.subtitle.lineHeight,
            display: "block",
            marginTop: 2,
            letterSpacing: A.sectionHeader.subtitle.letterSpacing,
          }}>{subtitle}</span>
        </span>
        <span style={{
          fontFamily: A.sans, fontSize: 12, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase",
          color: on ? A.purple2 : A.muteSoft, display: "inline-flex", alignItems: "center",
        }}>{on ? "Yes" : "No"}</span>
      </label>
      <div style={{
        maxHeight: on ? 600 : 0,
        overflow: clipped ? "hidden" : "visible",
        transition: "max-height .3s ease",
      }}>
        <div style={{ padding: "4px 16px 16px", borderTop: `1px solid ${A.purpleBorder}` }}>
          <div style={{ paddingTop: 16 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function FundraiseExpanded({ oneColumn, round, setRound, currentStage, shareholders, setShareholders, errors }) {
  const [timing, setTiming] = useState("3–6 mo");
  const stageOrder = { preseed: 0, seed: 1, seriesab: 2, seriesbc: 3, seriesc: 4 };
  const currentStageIdx = stageOrder[currentStage] ?? -1;
  const allRounds = [
    { value: "preseed", label: "Pre-seed" },
    { value: "seed", label: "Seed" },
    { value: "seriesab", label: "Series A/B" },
    { value: "seriesbc", label: "Series B/C" },
    { value: "seriesc", label: "Series C+" },
  ];
  const roundOptions = allRounds.map((r) => ({
    ...r,
    disabled: (stageOrder[r.value] ?? 99) <= currentStageIdx && !(currentStage === "seriesc" && r.value === "seriesc"),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="form-grid-2">
        <div>
          <FormLabel>Round type</FormLabel>
          <div style={{ marginTop: 8 }}>
            <ChipSelect value={round} onChange={setRound} options={roundOptions} />
          </div>
        </div>
        <div>
          <FormLabel>Expected timing</FormLabel>
          <div style={{ marginTop: 8 }}>
            <ChipSelect value={timing} onChange={setTiming} options={["<3 mo", "3–6 mo", "6–12 mo"]} />
          </div>
        </div>
      </div>
      <div className="form-grid-shareholders">
        <FormField label="New shareholders" placeholder="e.g. 8" value={shareholders} onChange={setShareholders} type="number" required error={errors?.newShareholdersFromFundraise} onNumericError={() => {}} />
      </div>
    </div>
  );
}

function ValuationExpanded({ oneColumn, stage, geoInc, freq, setFreq, type, setType, errors }) {
  const opCurrency = GEO_TO_CURRENCY[geoInc] || "INR";
  const opSymbol = CURRENCY_SYMBOLS[opCurrency] || "₹";

  const allValuationTypes = [
    { value: "409a", label: "409A Valuation" },
    { value: "blackscholes", label: "Black Scholes Valuation" },
    { value: "rv", label: "Registered Valuer Assessment" },
    { value: "mb", label: "Merchant Banker Assessment" },
    { value: "hmrc", label: "HMRC Valuation" },
  ];

  const opts = allValuationTypes.map((v) => {
    return { value: v.value, label: v.label };
  });

  const events = freq === "annually" ? 1 : freq === "quarterly" ? 4 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="form-grid-2">
        <Dropdown label="How often?" required value={freq} onChange={setFreq} error={errors?.valuationFrequency} options={[
          { value: "annually", label: "Annually (1× per year)" },
          { value: "quarterly", label: "Quarterly (4× per year)" },
        ]} placeholder="Select frequency" />
        <Dropdown label="Report type" required value={type} onChange={setType} error={errors?.valuationType} options={opts} placeholder="Select report type" />
      </div>
      {freq && type && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px",
          background: "#fff", border: `1px dashed ${A.purpleBorder}`, borderRadius: 6,
          fontSize: 12, color: A.inkSoft,
        }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={A.purple} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M2 12L6 8l3 3 5-6"/><path d="M10 5h4v4"/>
          </svg>
          Estimate will include <strong style={{ color: A.purple2, fontWeight: 600 }}>&nbsp;{events} event{events === 1 ? "" : "s"}/yr</strong>.
        </div>
      )}
    </div>
  );
}

function StaleAlert({ dirtyCount, onRecalculate }) {
  return (
    <div className="stale-alert" style={{
      background: A.amberBg, border: `1px solid ${A.amberBorder}`, borderRadius: 8, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      margin: "12px 0 24px",
    }} role="status" aria-live="polite">
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="amber-spin" style={{ flexShrink: 0 }}>
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
        <span style={{ display: "block" }}>
          <span style={{ fontFamily: A.sans, fontSize: 14, fontWeight: 600, color: A.amber, display: "block" }}>
            Showing previous results.
          </span>
          <span style={{ fontFamily: A.sans, fontSize: 14, fontWeight: 400, color: A.amber, marginTop: 2, display: "block" }}>
            {dirtyCount} input{dirtyCount === 1 ? "" : "s"} ha{dirtyCount === 1 ? "s" : "ve"} changed.
          </span>
        </span>
      </div>
      <PrimaryBtn size="sm" onClick={onRecalculate} style={{ background: A.amber, whiteSpace: "nowrap" }} onMouseEnter={(e) => (e.currentTarget.style.background = A.amberLight)} onMouseLeave={(e) => (e.currentTarget.style.background = A.amber)}>
        Recalculate ▸
      </PrimaryBtn>
    </div>
  );
}

// ─── Live Estimate Panel ──────────────────────────────────────────────────────
function ALiveEstimate({ width, mode, results, onRecalculate, dirtyCount, formData, currentFormValues, sticky = true, editedRate, setEditedRate, editedHours, setEditedHours, ctaText = "Book a demo", ctaUrl = "https://www.equitylist.co/contact", isMobileLayout = false, showSticky = true }) {
  const compact = width < 460;
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [leavingStale, setLeavingStale] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const recalcFormValues = currentFormValues || formData;

  const formatStage = (stage) => {
    const stageMap = {
      preseed: "PRE-SEED",
      seed: "SEED",
      seriesab: "SERIES A/B",
      seriesbc: "SERIES B/C",
      seriesc: "SERIES C+",
    };
    return stageMap[stage?.toLowerCase()] || "SERIESAB";
  };

  const v = results || {};
  const savingsPct = v.timeSavedPct || 0;

  useEffect(() => {
    if (leavingStale && mode !== "stale") {
      setLeavingStale(false);
    }
  }, [mode, leavingStale]);

  const grantPct = v.annCost > 0 ? Math.round((v.grCost / v.annCost) * 100) : 0;
  const compliancePct = v.annCost > 0 ? Math.round((v.cpCost / v.annCost) * 100) : 0;
  const capTablePct = v.annCost > 0 ? Math.round((v.ctCost / v.annCost) * 100) : 0;
  const valuationPct = v.annCost > 0 ? Math.round((v.valuationCost / v.annCost) * 100) : 0;

  const opCurrencyInfo = GEO_CURRENCY_MAP[formData?.geoInc] || GEO_CURRENCY_MAP.india;
  const opCurrencySymbol = opCurrencyInfo.symbol;
  const opLocale = opCurrencyInfo.locale;

  const items = [
    {
      key: "grant",
      label: "Grant Admin",
      formula: "Administration of equity grants for new hires and refreshes.",
      value: `${opCurrencySymbol}${(v.grCost || 0).toLocaleString(opLocale)}`,
      pct: `${grantPct}%`,
      tip: null,
    },
    {
      key: "compliance",
      label: "Compliance",
      formula: (() => {
        const geo = formData?.geoInc?.toLowerCase() || "india";
        const stage = (formData?.stage || "seriesab").toLowerCase();
        const geoReports = {
          india: "Ind AS 102/15, SH-6 register",
          us: "ASC 718/820, Rule 701",
          singapore: "IFRS 2",
          uk: "IFRS 2",
        };
        const specific = geoReports[geo] || geoReports.india;
        const sh = parseInt(formData?.sh, 10) || 0;
        const oh = parseInt(formData?.oh, 10) || 0;
        const grNewHire = parseInt(formData?.grNewHire, 10) || 0;

        let reports = [];
        if (oh > 0 || grNewHire > 0) {
          reports.push(specific);
        }
        if (sh > 0) {
          reports.push("Cap table summary, transaction-level ownership ledger");
        }
        if (oh > 0 || grNewHire > 0) {
          const stageOrder = { preseed: 0, seed: 1, seriesab: 2, seriesbc: 3, seriesc: 4 };
          const moreReports = (stageOrder[stage] || 2) >= 2 ? 4 : 2;
          reports.push(`vesting reports, grant summary, and ${moreReports} more reports`);
        }
        return reports.length > 0 ? reports.join(", ") : "No compliance reports required";
      })(),
      value: `${opCurrencySymbol}${(v.cpCost || 0).toLocaleString(opLocale)}`,
      pct: `${compliancePct}%`,
      tip: null,
    },
    {
      key: "captable",
      label: "Cap Table",
      formula: "Maintenance of your current and fully diluted cap table, securities tracking, and transfer processing.",
      value: `${opCurrencySymbol}${(v.ctCost || 0).toLocaleString(opLocale)}`,
      pct: `${capTablePct}%`,
      tip: null,
    },
    ...(v.ctFundraisingCost > 0 ? [{
      key: "fundraising-captable",
      label: "Fundraising — Cap Table",
      formula: "Time spent on scenario modeling, creating and updating securities, and option pool adjustments.",
      value: `${opCurrencySymbol}${(v.ctFundraisingCost || 0).toLocaleString(opLocale)}`,
      pct: `${v.annCost > 0 ? Math.round((v.ctFundraisingCost / v.annCost) * 100) : 0}%`,
      tip: null,
    }] : []),
    ...(v.secFundraisingCost > 0 ? [{
      key: "fundraising-secretarial",
      label: "Fundraising — Secretarial & Board",
      formula: "Time spent on board and shareholder resolutions, documentation, and signature tracking.",
      value: `${opCurrencySymbol}${(v.secFundraisingCost || 0).toLocaleString(opLocale)}`,
      pct: `${v.annCost > 0 ? Math.round((v.secFundraisingCost / v.annCost) * 100) : 0}%`,
      tip: null,
    }] : []),
    ...(v.methodExtCost > 0 ? [{
      key: "retainer",
      label: "Outsourced Administration Retainer",
      formula: "Fixed annual fee to external law firm or CA for ongoing equity administration.",
      value: `${opCurrencySymbol}${(v.methodExtCost || 0).toLocaleString(opLocale)}`,
      pct: `${v.annCost > 0 ? Math.round((v.methodExtCost / v.annCost) * 100) : 0}%`,
      tip: null,
    }] : []),
    ...(v.valuationCost > 0 ? [{
      key: "valuation",
      label: "Valuation Reports",
      formula: "Independent valuation reports for equity accounting.",
      value: (() => {
        const opCurrency = GEO_TO_CURRENCY[formData?.geoInc] || "INR";
        const currencySymbol = CURRENCY_SYMBOLS[opCurrency] || "₹";
        const locale = { USD: "en-US", INR: "en-IN", GBP: "en-GB", SGD: "en-SG" }[opCurrency] || "en-IN";
        const cost = v.valuationCost || 0;
        return `${currencySymbol}${cost.toLocaleString(locale)}`;
      })(),
      pct: `${valuationPct}%`,
      tip: null,
    }] : []),
  ];

  if (isMobileLayout) {
    return (
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "#fff",
        boxShadow: "0 -8px 32px rgba(13, 20, 37, 0.12)",
        borderTop: `1px solid ${A.line}`,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: "16px 20px 24px",
        maxHeight: "85vh",
        overflowY: "auto" as const,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxSizing: "border-box",
        transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: showSticky ? "translateY(0)" : "translateY(100%)",
      }}>
        {/* Collapsed / Expandable Header Tab */}
        <div 
          onClick={() => setMobileExpanded(!mobileExpanded)}
          style={{ cursor: "pointer", paddingBottom: 4 }}
        >
          {/* Grey drag-pill handle */}
          <span style={{ width: 36, height: 4, background: A.line, borderRadius: 2, display: "block", margin: "0 auto 10px auto" }} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12 }}>
            {/* Left Side: Labels & Price */}
            <div>
              <span style={{ fontFamily: A.sans, fontSize: 10, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase", color: A.mute, display: "block" }}>
                {v.diff < 0 ? "Estimated cost increase" : "Potential savings"}
              </span>
              <span style={{
                fontFamily: A.sans,
                fontSize: 22,
                fontWeight: 600,
                color: v.diff < 0 ? A.red : A.green,
                fontVariantNumeric: "tabular-nums",
                display: "block",
                marginTop: 2,
                letterSpacing: "-0.4px",
              }}>
                {opCurrencySymbol}{(v.diff < 0 ? Math.abs(v.diff) : v.diff || 0).toLocaleString(opLocale)}
                <span style={{ fontSize: 13, color: A.mute, fontWeight: 400, letterSpacing: 0 }}> / yr</span>
              </span>
            </div>

            {/* Right Side: Status Chip & View Details Action */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <StatusChip mode={mode} onEdit={() => {
                onRecalculate && onRecalculate({ sh: formData?.sh, oh: formData?.oh, grNewHire: formData?.grNewHire, grRefresh: formData?.grRefresh, geoInc: formData?.geoInc, geoOp: formData?.geoOp, stage: formData?.stage, meth: formData?.meth, planningToFundraise: formData?.planningToFundraise, fundraiseRound: formData?.fundraiseRound, newShareholdersFromFundraise: formData?.newShareholdersFromFundraise, valuationFrequency: formData?.valuationFrequency, valuationType: formData?.valuationType });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} />
              <span style={{
                fontFamily: A.sans, fontSize: 11, fontWeight: 600, color: A.purple,
                display: "inline-flex", alignItems: "center", gap: 4,
                textTransform: "uppercase", letterSpacing: 0.2
              }}>
                {mobileExpanded ? "Collapse Details ▾" : "View Details ▴"}
              </span>
            </div>
          </div>
        </div>

        {/* Expanded Sheet Content */}
        {mobileExpanded && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4, borderTop: `1px solid ${A.lineSoft}`, paddingTop: 14 }}>
            <span style={{
              fontFamily: A.sectionHeader.subtitle.fontFamily,
              fontSize: A.sectionHeader.subtitle.fontSize,
              fontWeight: A.sectionHeader.subtitle.fontWeight,
              color: A.sectionHeader.subtitle.color,
              lineHeight: A.sectionHeader.subtitle.lineHeight,
              letterSpacing: A.sectionHeader.subtitle.letterSpacing,
              display: "block",
            }}>
              {mode === "live" ? "Tailored to your inputs. Recalculate any time." : mode === "stale" ? "Previous results. Update and recalculate." : "Illustrative, based on a typical mid-market scenario."}
            </span>

            {mode === "stale" && <StaleAlert dirtyCount={dirtyCount} onRecalculate={() => onRecalculate && onRecalculate(recalcFormValues)} />}

            {/* Price comparisons block */}
            <div className={mode === "stale" ? "panel-body--stale" : ""} style={{
              background: "#fff", border: `1px solid ${A.line}`, borderRadius: 8,
              padding: "16px 20px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: A.sans, fontSize: 13, fontWeight: 500, color: A.ink }}>Current spend</span>
                  <span style={{ fontFamily: A.sans, fontSize: 13, fontWeight: 500, color: A.inkSoft, fontVariantNumeric: "tabular-nums" }}>{opCurrencySymbol}{(v.annCost || 0).toLocaleString(opLocale)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: A.sans, fontSize: 13, fontWeight: 500, color: A.ink }}>With EquityList</span>
                  <span style={{ fontFamily: A.sans, fontSize: 13, fontWeight: 500, color: A.purple, fontVariantNumeric: "tabular-nums" }}>{opCurrencySymbol}{(v.elAnn || 0).toLocaleString(opLocale)}</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className={mode === "stale" ? "panel-body--stale" : ""} style={{ background: "#fff", border: `1px solid ${A.line}`, borderRadius: 8 }}>
              <button
                onClick={() => setBreakdownOpen((o) => !o)}
                aria-expanded={breakdownOpen}
                style={{
                  width: "100%", background: "transparent", border: "none", cursor: "pointer",
                  padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderBottom: breakdownOpen ? `1px solid ${A.lineSoft}` : "none",
                }}
              >
                <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "24px", letterSpacing: 0.4, textTransform: "uppercase", color: A.ink, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", verticalAlign: "middle" }}>Cost breakdown</span>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={A.mute} strokeWidth="1.6" strokeLinecap="round" style={{ transform: breakdownOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
                  <path d="M2 4l3.5 3.5L9 4"/>
                </svg>
              </button>
              {breakdownOpen && (
                <div style={{ padding: "4px 18px 18px" }}>
                  {items.map((it, i) => (
                    <div key={it.key} style={{
                      padding: "10px 0",
                      borderBottom: i < items.length - 1 ? `1px solid ${A.lineSoft}` : "none",
                    }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                        <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.4, textTransform: "uppercase", color: A.ink }}>{it.label}</span>
                        {it.tip && <InfoTip text={it.tip} />}
                      </span>
                      <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 400, lineHeight: "16px", color: A.mute, marginBottom: 6, wordBreak: "break-word", display: "block" }}>{it.formula}</span>
                      <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontFamily: A.sans, fontSize: 13, fontWeight: 500, color: A.ink, fontVariantNumeric: "tabular-nums" }}>{it.value}</span>
                        <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 600, color: A.ink, fontVariantNumeric: "tabular-nums" }}>{it.pct}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {breakdownOpen && (
                <span style={{ display: "block", padding: "12px 18px 18px", borderTop: `1px solid ${A.lineSoft}`, marginTop: 12 }}>
                  <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.4, textTransform: "uppercase", color: A.ink, display: "block", marginBottom: 12 }}>Assumptions</span>
                  
                  {v.meth === "in-house" && (
                    <>
                      <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                        <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0, textTransform: "uppercase", color: A.ink, flex: "1 1 0%", marginRight: 8 }}>Blended hourly rate</span>
                        <span style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
                          <span style={{ width: 12, display: "inline-block", textAlign: "right", fontFamily: A.sans, fontSize: 14, fontWeight: 500, color: A.mute }}>{opCurrencySymbol}</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editedRate !== null ? editedRate : Math.round(v.rate)}
                            onChange={(e) => setEditedRate(e.target.value.replace(/[^\d]/g, ""))}
                            style={{
                              width: 60, textAlign: "right",
                              border: "none", borderBottom: `1px solid ${A.line}`,
                              padding: "4px 0", outline: "none", background: "transparent",
                              fontFamily: A.sans, fontSize: 14, fontWeight: 600, color: A.ink, fontVariantNumeric: "tabular-nums",
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderBottomColor = A.purple)}
                            onBlur={(e) => (e.currentTarget.style.borderBottomColor = A.line)}
                          />
                          <span style={{ width: 72, display: "inline-block", fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase", color: A.muteSoft, whiteSpace: "nowrap" }}>{formatStage(v.stage)}</span>
                        </span>
                      </span>
                      <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                        <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0, textTransform: "uppercase", color: A.ink, flex: "1 1 0%", marginRight: 8 }}>Total equity management hours</span>
                        <span style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
                          <span style={{ width: 12, display: "inline-block" }} />
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editedHours !== null ? editedHours : Math.round(v.manualHTotal)}
                            onChange={(e) => setEditedHours(e.target.value.replace(/[^\d]/g, ""))}
                            style={{
                              width: 60, textAlign: "right",
                              border: "none", borderBottom: `1px solid ${A.line}`,
                              padding: "4px 0", outline: "none", background: "transparent",
                              fontFamily: A.sans, fontSize: 14, fontWeight: 600, color: A.ink, fontVariantNumeric: "tabular-nums",
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderBottomColor = A.purple)}
                            onBlur={(e) => (e.currentTarget.style.borderBottomColor = A.line)}
                          />
                          <span style={{ width: 72, display: "inline-block", fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase", color: A.muteSoft, whiteSpace: "nowrap" }}>HRS/YR</span>
                        </span>
                      </span>
                    </>
                  )}

                  {v.meth === "outsourced" && (
                    <>
                      <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                        <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0, textTransform: "uppercase", color: A.ink, flex: "1 1 0%", marginRight: 8 }}>Retainer cost</span>
                        <span style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
                          <span style={{ width: 12, display: "inline-block", textAlign: "right", fontFamily: A.sans, fontSize: 14, fontWeight: 500, color: A.mute }}>{opCurrencySymbol}</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editedRate !== null ? editedRate : Math.round(v.methodExtCost)}
                            onChange={(e) => setEditedRate(e.target.value.replace(/[^\d]/g, ""))}
                            style={{
                              width: 60, textAlign: "right",
                              border: "none", borderBottom: `1px solid ${A.line}`,
                              padding: "4px 0", outline: "none", background: "transparent",
                              fontFamily: A.sans, fontSize: 14, fontWeight: 600, color: A.ink, fontVariantNumeric: "tabular-nums",
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderBottomColor = A.purple)}
                            onBlur={(e) => (e.currentTarget.style.borderBottomColor = A.line)}
                          />
                          <span style={{ width: 72, display: "inline-block", fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase", color: A.muteSoft, whiteSpace: "nowrap" }}>/YR</span>
                        </span>
                      </span>
                      <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                        <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0, textTransform: "uppercase", color: A.ink, flex: "1 1 0%", marginRight: 8 }}>Internal effort hours</span>
                        <span style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
                          <span style={{ width: 12, display: "inline-block" }} />
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editedHours !== null ? editedHours : Math.round(v.manualHTotal * v.mult)}
                            onChange={(e) => setEditedHours(e.target.value.replace(/[^\d]/g, ""))}
                            style={{
                              width: 60, textAlign: "right",
                              border: "none", borderBottom: `1px solid ${A.line}`,
                              padding: "4px 0", outline: "none", background: "transparent",
                              fontFamily: A.sans, fontSize: 14, fontWeight: 600, color: A.ink, fontVariantNumeric: "tabular-nums",
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderBottomColor = A.purple)}
                            onBlur={(e) => (e.currentTarget.style.borderBottomColor = A.line)}
                          />
                          <span style={{ width: 72, display: "inline-block", fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase", color: A.muteSoft, whiteSpace: "nowrap" }}>HRS/YR</span>
                        </span>
                      </span>
                    </>
                  )}

                  <span style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button
                      onClick={() => {
                        setEditedRate(null);
                        setEditedHours(null);
                        setLeavingStale(true);
                        onRecalculate && onRecalculate(recalcFormValues, {});
                      }}
                      style={{ flex: 1, padding: "8px 16px", background: A.lineSoft, color: A.ink, border: `1px solid ${A.line}`, borderRadius: 8, fontFamily: A.sans, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}
                    >
                      Reset
                    </button>
                    <button
                      disabled={editedRate === "" || editedHours === ""}
                      onClick={() => {
                        if (editedRate === "" || editedHours === "") return;
                        const overrides = {};
                        let hasChanges = false;
                        if (editedRate !== null && editedRate !== "") {
                          const rateVal = parseInt(editedRate, 10);
                          if (v.meth === "outsourced") {
                            if (rateVal !== Math.round(v.methodExtCost)) { overrides.methodExtCost = rateVal; hasChanges = true; }
                          } else {
                            if (rateVal !== Math.round(v.rate)) { overrides.rate = rateVal; hasChanges = true; }
                          }
                        }
                        if (editedHours !== null && editedHours !== "") {
                          const hoursVal = parseInt(editedHours, 10);
                          const compareHours = v.meth === "outsourced" ? Math.round(v.manualHTotal * v.mult) : Math.round(v.manualHTotal);
                          if (hoursVal !== compareHours) { overrides.manualHTotal = hoursVal; hasChanges = true; }
                        }
                        if (hasChanges) {
                          setLeavingStale(true);
                          onRecalculate && onRecalculate(recalcFormValues, overrides);
                        }
                      }}
                      style={{ flex: 1, padding: "8px 16px", background: (editedRate === "" || editedHours === "") ? A.line : A.purple, color: (editedRate === "" || editedHours === "") ? A.muteSoft : "#fff", border: "none", borderRadius: 8, fontFamily: A.sans, fontSize: 14, fontWeight: 600, cursor: (editedRate === "" || editedHours === "") ? "not-allowed" : "pointer" }}
                    >
                      Apply
                    </button>
                  </span>
                  {(editedRate === "" || editedHours === "") && (
                    <span style={{ display: "block", fontSize: 11, color: A.redLight, marginTop: 8, fontFamily: A.sans }}>
                      Enter a value in each field to apply.
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Payback Info */}
            {(() => {
              const _paybackMonths = v.elAnn > 0 && v.diff > 0 ? v.elAnn / (v.diff / 12) : 0;
              return _paybackMonths > 0 && _paybackMonths <= 12;
            })() && (
              <div style={{ background: "#fff", border: `1px solid ${A.line}`, borderRadius: 8, padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 4, background: A.green, borderRadius: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: A.serif, fontSize: 18, color: A.mute, marginBottom: 2, display: "block" }}>Pays for itself in</span>
                    <span style={{ fontFamily: A.sans, fontSize: 24, fontWeight: 600, color: A.ink, fontVariantNumeric: "tabular-nums", display: "block" }}>
                      {(v.elAnn > 0 && Math.abs(v.diff) > 0 ? v.elAnn / (Math.abs(v.diff) / 12) : 0).toFixed(1)} months
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Takeaway & CTA button */}
            <div style={{ background: "#f6f5fe", border: `1px solid ${A.purpleBorder}`, borderRadius: 8, padding: "16px 20px" }}>
              <span style={{ fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase", color: A.purple2, display: "block", marginBottom: 6 }}>The takeaway</span>
              <span style={{ fontFamily: A.sans, fontSize: 13, lineHeight: 1.4, color: A.inkSoft, display: "block", marginBottom: 12 }}>
                {v.diff > 100 ? (
                  <>You're currently overspending on equity operations. You could save <strong style={{ color: A.ink, fontWeight: 600 }}>{opCurrencySymbol}{Math.abs(v.diff || 0).toLocaleString(opLocale)}/year</strong> while eliminating most manual work.</>
                ) : (
                  <>Cost isn't the deciding factor. EquityList ensures your cap table stays accurate, audit-ready, and compliant as you scale.</>
                )}
              </span>
              <PrimaryBtn size="md" fullWidth style={{ padding: "16px 28px" }} onClick={() => window.open(ctaUrl, "_blank")}>
                {ctaText}
                <svg className="btn-arr-icon" width="16" height="16" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block" }}><path d="M13.5333 9.33379L7 5.13379V13.5338L13.5333 9.33379Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </PrimaryBtn>
            </div>
            
            <span style={{
              fontFamily: A.sans,
              fontSize: 11,
              color: "rgba(112, 109, 161, 0.8)",
              textAlign: "center" as const,
              display: "block",
              marginTop: 4,
            }}>
              Pricing is indicative. Final pricing is tailored.
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <aside style={{
      display: "flex", flexDirection: "column", gap: 14,
      position: sticky ? "sticky" : "static", top: sticky ? 24 : undefined,
      width: "100%",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <MonoLabel size={11} color={A.ink}>Live Estimate</MonoLabel>
            <span style={{ width: 1, height: 14, background: A.line }} />
            <StatusChip mode={mode} onEdit={() => onRecalculate && onRecalculate({ sh: formData?.sh, oh: formData?.oh, grNewHire: formData?.grNewHire, grRefresh: formData?.grRefresh, geoInc: formData?.geoInc, geoOp: formData?.geoOp, stage: formData?.stage, meth: formData?.meth, planningToFundraise: formData?.planningToFundraise, fundraiseRound: formData?.fundraiseRound, newShareholdersFromFundraise: formData?.newShareholdersFromFundraise, valuationFrequency: formData?.valuationFrequency, valuationType: formData?.valuationType })} />
          </div>
        </div>
        <span style={{
          fontFamily: A.sectionHeader.subtitle.fontFamily,
          fontSize: A.sectionHeader.subtitle.fontSize,
          fontWeight: A.sectionHeader.subtitle.fontWeight,
          color: A.sectionHeader.subtitle.color,
          lineHeight: A.sectionHeader.subtitle.lineHeight,
          letterSpacing: A.sectionHeader.subtitle.letterSpacing,
          display: "block",
          marginTop: 6
        }}>
          {mode === "live" ? "Tailored to your inputs. Recalculate any time." : mode === "stale" ? "Previous results. Update and recalculate." : "Illustrative, based on a typical mid-market scenario."}
        </span>
      </div>

      {mode === "stale" && <StaleAlert dirtyCount={dirtyCount} onRecalculate={() => { setLeavingStale(true); onRecalculate && onRecalculate(recalcFormValues); }} />}

      <div className={mode === "stale" ? "panel-body--stale" : ""} style={{
        background: "#fff", border: `1px solid ${A.line}`, borderRadius: 8,
        padding: "20px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 130, height: 130, background: `radial-gradient(circle at top right, ${v.diff < 0 ? "rgba(192, 48, 33, 0.08)" : A.greenTint}, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "14px", letterSpacing: 0.4, textTransform: "uppercase" as const, color: A.mute, display: "block", marginBottom: 6 }}>{v.diff < 0 ? "Estimated cost increase" : "Your potential savings"}</span>
          <span style={{
            fontFamily: A.sans,
            fontSize: compact ? 32 : 40,
            fontWeight: 500,
            letterSpacing: -1.12,
            color: v.diff < 0 ? A.red : A.green,
            fontVariantNumeric: "tabular-nums",
            lineHeight: compact ? "38px" : "48px",
            display: "block",
          }}>{opCurrencySymbol}{(v.diff < 0 ? Math.abs(v.diff) : v.diff || 0).toLocaleString(opLocale)}</span>
          <span style={{
            fontFamily: A.sectionHeader.subtitle.fontFamily,
            fontSize: A.sectionHeader.subtitle.fontSize,
            fontWeight: A.sectionHeader.subtitle.fontWeight,
            color: A.sectionHeader.subtitle.color,
            lineHeight: A.sectionHeader.subtitle.lineHeight,
            letterSpacing: A.sectionHeader.subtitle.letterSpacing,
            display: "block",
            marginTop: 8
          }}>per year · {savingsPct}% reduction in equity-admin overhead</span>

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${A.lineSoft}`, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: A.sans, fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0, color: A.ink }}>Current spend</span>
              <span style={{ fontFamily: A.sans, fontSize: 14, fontWeight: 500, color: A.inkSoft, fontVariantNumeric: "tabular-nums", letterSpacing: 0, minWidth: 0 }}>{opCurrencySymbol}{(v.annCost || 0).toLocaleString(opLocale)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: A.sans, fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0, color: A.ink }}>With EquityList</span>
              <span style={{ fontFamily: A.sans, fontSize: 14, fontWeight: 500, color: A.purple, fontVariantNumeric: "tabular-nums", letterSpacing: 0, minWidth: 0 }}>{opCurrencySymbol}{(v.elAnn || 0).toLocaleString(opLocale)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={mode === "stale" ? "panel-body--stale" : ""} style={{ background: "#fff", border: `1px solid ${A.line}`, borderRadius: 8 }}>
        <button
          onClick={() => setBreakdownOpen((o) => !o)}
          aria-expanded={breakdownOpen}
          style={{
            width: "100%", background: "transparent", border: "none", cursor: "pointer",
            padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: breakdownOpen ? `1px solid ${A.lineSoft}` : "none",
          }}
        >
          <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "24px", letterSpacing: 0.4, textTransform: "uppercase" as const, color: A.ink, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", verticalAlign: "middle" }}>Cost breakdown</span>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={A.mute} strokeWidth="1.6" strokeLinecap="round" style={{ transform: breakdownOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
            <path d="M2 4l3.5 3.5L9 4"/>
          </svg>
        </button>
        {breakdownOpen && (
          <div style={{ padding: "4px 18px 18px" }}>
            {items.map((it, i) => (
              <div key={it.key} style={{
                padding: "14px 0",
                borderBottom: i < items.length - 1 ? `1px solid ${A.lineSoft}` : "none",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.4, textTransform: "uppercase" as const, color: A.ink }}>{it.label}</span>
                  {it.tip && <InfoTip text={it.tip} />}
                </span>
                <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 400, lineHeight: "16px", letterSpacing: 0, color: A.mute, marginBottom: 6, wordBreak: "break-word", display: "block" }}>{it.formula}</span>
                <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontFamily: A.sans, fontSize: 14, fontWeight: 500, color: A.ink, fontVariantNumeric: "tabular-nums", letterSpacing: 0 }}>{it.value}</span>
                  <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 600, lineHeight: "16px", letterSpacing: 0, color: "rgb(13, 10, 64)", fontVariantNumeric: "tabular-nums" }}>{it.pct}</span>
                </span>
              </div>
            ))}
          </div>
        )}
        {breakdownOpen && (
          <span style={{ display: "block", padding: "12px 18px 18px", borderTop: `1px solid ${A.lineSoft}`, marginTop: 12 }}>
            <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.4, textTransform: "uppercase" as const, color: A.ink, display: "block", marginBottom: 12 }}>Assumptions</span>
            
            {/* IN-HOUSE METHOD */}
            {v.meth === "in-house" && (
              <>
                <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0, textTransform: "uppercase" as const, color: A.ink, flex: "1 1 0%", marginRight: 8 }}>Blended hourly rate</span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
                    <span style={{ width: 12, display: "inline-block", textAlign: "right", fontFamily: A.sans, fontSize: 14, fontWeight: 500, color: A.mute }}>{opCurrencySymbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editedRate !== null ? editedRate : Math.round(v.rate)}
                      onChange={(e) => setEditedRate(e.target.value.replace(/[^\d]/g, ""))}
                      style={{
                        width: 60, textAlign: "right",
                        border: "none", borderBottom: `1px solid ${A.line}`,
                        padding: "4px 0", outline: "none", background: "transparent",
                        fontFamily: A.sans, fontSize: 14, fontWeight: 600, color: A.ink, fontVariantNumeric: "tabular-nums",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderBottomColor = A.purple)}
                      onBlur={(e) => (e.currentTarget.style.borderBottomColor = A.line)}
                    />
                    <span style={{ width: 72, display: "inline-block", fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase", color: A.muteSoft, whiteSpace: "nowrap" }}>{formatStage(v.stage)}</span>
                  </span>
                </span>
                <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0, textTransform: "uppercase" as const, color: A.ink, flex: "1 1 0%", marginRight: 8 }}>Total equity management hours</span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
                    <span style={{ width: 12, display: "inline-block" }} />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editedHours !== null ? editedHours : Math.round(v.manualHTotal)}
                      onChange={(e) => setEditedHours(e.target.value.replace(/[^\d]/g, ""))}
                      style={{
                        width: 60, textAlign: "right",
                        border: "none", borderBottom: `1px solid ${A.line}`,
                        padding: "4px 0", outline: "none", background: "transparent",
                        fontFamily: A.sans, fontSize: 14, fontWeight: 600, color: A.ink, fontVariantNumeric: "tabular-nums",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderBottomColor = A.purple)}
                      onBlur={(e) => (e.currentTarget.style.borderBottomColor = A.line)}
                    />
                    <span style={{ width: 72, display: "inline-block", fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase", color: A.muteSoft, whiteSpace: "nowrap" }}>HRS/YR</span>
                  </span>
                </span>
              </>
            )}

            {/* OUTSOURCED RETAINER METHOD */}
            {v.meth === "outsourced" && (
              <>
                <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0, textTransform: "uppercase" as const, color: A.ink, flex: "1 1 0%", marginRight: 8 }}>Retainer cost</span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
                    <span style={{ width: 12, display: "inline-block", textAlign: "right", fontFamily: A.sans, fontSize: 14, fontWeight: 500, color: A.mute }}>{opCurrencySymbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editedRate !== null ? editedRate : Math.round(v.methodExtCost)}
                      onChange={(e) => setEditedRate(e.target.value.replace(/[^\d]/g, ""))}
                      style={{
                        width: 60, textAlign: "right",
                        border: "none", borderBottom: `1px solid ${A.line}`,
                        padding: "4px 0", outline: "none", background: "transparent",
                        fontFamily: A.sans, fontSize: 14, fontWeight: 600, color: A.ink, fontVariantNumeric: "tabular-nums",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderBottomColor = A.purple)}
                      onBlur={(e) => (e.currentTarget.style.borderBottomColor = A.line)}
                    />
                    <span style={{ width: 72, display: "inline-block", fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase", color: A.muteSoft, whiteSpace: "nowrap" }}>/YR</span>
                  </span>
                </span>
                <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontFamily: A.sans, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: 0, textTransform: "uppercase" as const, color: A.ink, flex: "1 1 0%", marginRight: 8 }}>Internal effort hours</span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
                    <span style={{ width: 12, display: "inline-block" }} />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editedHours !== null ? editedHours : Math.round(v.manualHTotal * v.mult)}
                      onChange={(e) => setEditedHours(e.target.value.replace(/[^\d]/g, ""))}
                      style={{
                        width: 60, textAlign: "right",
                        border: "none", borderBottom: `1px solid ${A.line}`,
                        padding: "4px 0", outline: "none", background: "transparent",
                        fontFamily: A.sans, fontSize: 14, fontWeight: 600, color: A.ink, fontVariantNumeric: "tabular-nums",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderBottomColor = A.purple)}
                      onBlur={(e) => (e.currentTarget.style.borderBottomColor = A.line)}
                    />
                    <span style={{ width: 72, display: "inline-block", fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase", color: A.muteSoft, whiteSpace: "nowrap" }}>HRS/YR</span>
                  </span>
                </span>
              </>
            )}

            <span style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                onClick={() => {
                  setEditedRate(null);
                  setEditedHours(null);
                  setLeavingStale(true);
                  onRecalculate && onRecalculate(recalcFormValues, {});
                }}
                style={{ flex: 1, padding: "8px 16px", background: A.lineSoft, color: A.ink, border: `1px solid ${A.line}`, borderRadius: 8, fontFamily: A.sans, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = A.line; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = A.lineSoft; }}
              >
                Reset
              </button>
              <button
                disabled={editedRate === "" || editedHours === ""}
                onClick={() => {
                  if (editedRate === "" || editedHours === "") return;
                  const overrides = {};
                  let hasChanges = false;
                  
                  if (editedRate !== null && editedRate !== "") {
                    const rateVal = parseInt(editedRate, 10);
                    if (v.meth === "outsourced") {
                      if (rateVal !== Math.round(v.methodExtCost)) {
                        overrides.methodExtCost = rateVal;
                        hasChanges = true;
                      }
                    } else {
                      if (rateVal !== Math.round(v.rate)) {
                        overrides.rate = rateVal;
                        hasChanges = true;
                      }
                    }
                  }
                  
                  if (editedHours !== null && editedHours !== "") {
                    const hoursVal = parseInt(editedHours, 10);
                    const compareHours = v.meth === "outsourced" ? Math.round(v.manualHTotal * v.mult) : Math.round(v.manualHTotal);
                    if (hoursVal !== compareHours) {
                      overrides.manualHTotal = hoursVal;
                      hasChanges = true;
                    }
                  }
                  
                  if (hasChanges) {
                    setLeavingStale(true);
                    onRecalculate && onRecalculate(recalcFormValues, overrides);
                  }
                }}
                style={{ flex: 1, padding: "8px 16px", background: (editedRate === "" || editedHours === "") ? A.line : A.purple, color: (editedRate === "" || editedHours === "") ? A.muteSoft : "#fff", border: "none", borderRadius: 8, fontFamily: A.sans, fontSize: 14, fontWeight: 600, cursor: (editedRate === "" || editedHours === "") ? "not-allowed" : "pointer", transition: "background .15s" }}
                onMouseEnter={(e) => { if (!(editedRate === "" || editedHours === "")) e.currentTarget.style.background = A.purple2; }}
                onMouseLeave={(e) => { if (!(editedRate === "" || editedHours === "")) e.currentTarget.style.background = A.purple; }}
              >
                Apply
              </button>
            </span>
            {(editedRate === "" || editedHours === "") && (
              <span style={{ display: "block", fontSize: 11, color: A.redLight, marginTop: 8, fontFamily: A.sans }}>
                Enter a value in each field to apply.
              </span>
            )}
          </span>
        )}
      </div>

      {(() => {
        const _paybackMonths = v.elAnn > 0 && v.diff > 0 ? v.elAnn / (v.diff / 12) : 0;
        return _paybackMonths > 0 && _paybackMonths <= 12;
      })() && (
        <div className={mode === "stale" ? "panel-body--stale" : ""} style={{ background: "#fff", border: `1px solid ${A.line}`, borderRadius: 8, padding: "20px", position: "relative", overflow: "hidden" }}>
          
          {/* Header row */}
          <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${A.lineSoft}` }}>
            <MonoLabel size={11} color={A.ink}>RETURN ON INVESTMENT</MonoLabel>
          </div>

          {/* Content with left accent bar */}
          <div style={{ display: "flex", gap: 12 }}>
            {(() => {
              const hasSavings = v.diff > 0;
              const paybackMonths = v.elAnn > 0 && Math.abs(v.diff) > 0 ? v.elAnn / (Math.abs(v.diff) / 12) : 0;

              return (
                <>
                  <div style={{ width: 4, background: hasSavings ? A.green : A.red, borderRadius: 2, flexShrink: 0 }} />

                  <div style={{ flex: 1, marginBottom: 20 }}>
                    {hasSavings ? (
                      <>
                        <span style={{
                          fontFamily: A.serif, fontSize: 22, fontWeight: 400, fontStyle: "normal",
                          color: A.mute, lineHeight: 1.2, letterSpacing: -0.2,
                          marginBottom: 4, display: "block",
                        }}>
                          Pays for itself in
                        </span>
                        <span style={{
                          fontFamily: A.sans, fontSize: 32, fontWeight: 600,
                          color: A.ink, lineHeight: 1.2, letterSpacing: -0.6,
                          marginBottom: 12,
                          fontVariantNumeric: "tabular-nums", display: "block",
                        }}>
                          {paybackMonths.toFixed(1)} months
                        </span>

                        <span style={{
                          fontFamily: A.bodyText.fontFamily,
                          fontSize: A.bodyText.fontSize,
                          fontWeight: A.bodyText.fontWeight,
                          color: A.bodyText.color,
                          lineHeight: A.bodyText.lineHeight,
                          display: "block",
                          margin: 0,
                        }}>
                          EquityList recovers ~{v.elAnn > 0 ? Math.round((Math.abs(v.diff) / v.elAnn) * 100) : 0}% of its annual cost through admin savings alone.
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={{
                          fontFamily: A.serif, fontSize: 22, fontWeight: 400, fontStyle: "normal",
                          color: A.mute, lineHeight: 1.2, letterSpacing: -0.2,
                          marginBottom: 4, display: "block",
                        }}>
                          Your current setup is cheaper today.
                        </span>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>

        </div>
      )}

      <div className={mode === "stale" ? "panel-body--stale" : ""} style={{
        background: "#f6f5fe", border: `1px solid ${A.purpleBorder}`, borderRadius: 8,
        padding: "20px",
      }}>
        <span style={{ fontFamily: A.sans, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase" as const, color: A.purple2, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", verticalAlign: "middle", marginBottom: 8 }}>The takeaway</span>
        <span style={{
          fontFamily: A.bodyText.fontFamily,
          fontSize: A.bodyText.fontSize,
          fontWeight: A.bodyText.fontWeight,
          color: A.bodyText.color,
          lineHeight: A.bodyText.lineHeight,
          display: "block",
          margin: 0,
          marginBottom: 14,
        }}>
          {v.diff > 100 ? (
            <>You're currently overspending on equity operations. You could save <strong style={{ color: A.ink, fontWeight: 600 }}>{opCurrencySymbol}{Math.abs(v.diff || 0).toLocaleString(opLocale)}/year</strong> while eliminating most manual work. EquityList ensures your cap table stays accurate, audit-ready, and compliant as you scale.</>
          ) : v.diff < -100 ? (
            <>Your current setup is cost-efficient for now. As you scale, risks increase. EquityList removes manual work, mitigates compliance gaps, and prevents costly errors that grow with complexity.</>
          ) : (
            <>Cost isn't the deciding factor. The real difference is reliability as complexity increases. EquityList ensures your cap table stays accurate, audit-ready, and compliant as you scale.</>
          )}
        </span>
        <PrimaryBtn size="md" fullWidth style={{ padding: "16px 28px" }} onClick={() => window.open(ctaUrl, "_blank")}>
          {ctaText}
          <svg className="btn-arr-icon" width="16" height="16" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", transition: "transform 0.15s" }}><g opacity="0.6"><path d="M13.5333 9.33379L7 5.13379V13.5338L13.5333 9.33379Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></g></svg>
        </PrimaryBtn>
      </div>

      <span style={{
        fontFamily: A.sans,
        fontSize: 12,
        fontWeight: 400,
        color: "rgba(112, 109, 161, 1)",
        lineHeight: "16px",
        display: "block",
        letterSpacing: 0,
        textAlign: "center" as const,
        marginTop: 14,
      }}>
        Pricing is indicative, based on benchmarks for companies of your size. Final pricing is tailored.
      </span>
    </aside>
  );
}

// ─── Root Component (Webflow entry point) ────────────────────────────────────
export default function ROICalculator({
  showHero = true,
  heroTitlePre = "How much is managing equity on",
  heroTitleHighlight = "spreadsheets",
  heroTitlePost = "costing you?",
  heroSubtitle = "Based on industry benchmarks and real company data. See precisely how much time and capital is wasted on manual administration.",
  ctaText = "Book a demo",
  ctaUrl = "https://www.equitylist.co/contact",
  defaultGeoInc = "India",
  defaultGeoOp = "India",
  defaultStage = "Series A/B",
  defaultLegalEntity = "",
  defaultShareholders = 30,
  defaultOptionHolders = 15,
  defaultNewHireGrants = 5,
  defaultRefreshGrants = 5,
  defaultFundraise = false,
  defaultFundraiseRound = "Seed",
  defaultNewShareholdersFromFundraise = 0,
  defaultValuation = false,
  defaultValFreq = "Annually",
  defaultValType = "409A",
  defaultAdminMethod = "In-house (Spreadsheets)",
}) {
  // Helper to map UI values to internal keys
  const mapCountry = (val) => {
    if (val === "United States") return "us";
    if (val === "Singapore") return "singapore";
    if (val === "United Kingdom") return "uk";
    return "india";
  };
  const mapStage = (val) => {
    if (val === "Pre-seed") return "preseed";
    if (val === "Seed") return "seed";
    if (val === "Series B/C") return "seriesbc";
    if (val === "Series C+") return "seriesc";
    return "seriesab";
  };
  const mapAdminMethod = (val) => {
    if (val === "Outsourced (CA/Law Firm)") return "outsourced";
    return "in-house";
  };
  const mapValFreq = (val) => {
    if (val === "Quarterly") return "quarterly";
    return "annually";
  };
  const mapValType = (val) => {
    if (val === "Black-Scholes") return "blackscholes";
    if (val === "Reddy Valuation (RV)") return "rv";
    if (val === "Market Benchmark (MB)") return "mb";
    if (val === "HMRC") return "hmrc";
    return "409a";
  };
  // Mirror AForm's initial fundraiseRound snap (round must be a stage after the current one)
  const snapFundraiseRound = (stageKey, roundKey) => {
    const stageOrd = { preseed: 0, seed: 1, seriesab: 2, seriesbc: 3, seriesc: 4 };
    const rounds = ["preseed", "seed", "seriesab", "seriesbc", "seriesc"];
    if ((stageOrd[roundKey] ?? 99) <= (stageOrd[stageKey] ?? -1)) {
      return rounds.find((r) => (stageOrd[r] ?? 99) > (stageOrd[stageKey] ?? -1)) || "seriesc";
    }
    return roundKey;
  };
  const defaultInputs = {
    sh: Number(defaultShareholders),
    oh: Number(defaultOptionHolders),
    grNewHire: Number(defaultNewHireGrants),
    grRefresh: Number(defaultRefreshGrants),
    geoInc: mapCountry(defaultGeoInc),
    geoOp: mapCountry(defaultGeoOp),
    stage: mapStage(defaultStage),
    meth: mapAdminMethod(defaultAdminMethod),
    legalEntityName: defaultLegalEntity,
    planningToFundraise: defaultFundraise,
    fundraiseRound: snapFundraiseRound(mapStage(defaultStage), mapStage(defaultFundraiseRound)),
    newShareholdersFromFundraise: Number(defaultNewShareholdersFromFundraise),
    valuationFrequency: defaultValuation ? mapValFreq(defaultValFreq) : null,
    valuationType: defaultValuation ? mapValType(defaultValType) : null,
  };

  const [width, setWidth] = useState(1280);
  const [formData, setFormData] = useState(defaultInputs);
  const [results, setResults] = useState(() => computeROI(defaultInputs));
  const [mode, setMode] = useState("sample");
  const [errors, setErrors] = useState({});
  const [dirtyInputs, setDirtyInputs] = useState({});
  const [currentFormValues, setCurrentFormValues] = useState({});
  const [editedRate, setEditedRate] = useState(null);
  const [editedHours, setEditedHours] = useState(null);
  const staticResultsRef = useRef(null);
  const rootRef = useRef(null);

  // Sync results state when Webflow properties are updated
  useEffect(() => {
    setResults(computeROI(defaultInputs));
    setFormData(defaultInputs);
    setMode("sample");
    setDirtyInputs({});
    setErrors({});
  }, [
    defaultGeoInc, defaultGeoOp, defaultStage, defaultLegalEntity,
    defaultShareholders, defaultOptionHolders, defaultNewHireGrants, defaultRefreshGrants,
    defaultFundraise, defaultFundraiseRound, defaultNewShareholdersFromFundraise,
    defaultValuation, defaultValFreq, defaultValType, defaultAdminMethod
  ]);

  useEffect(() => {
    setWidth(window.innerWidth);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width < 720;
  const isTablet = width >= 720 && width < 1100;
  const isDesktop = width >= 1100;

  const [staticVisible, setStaticVisible] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    const el = staticResultsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setStaticVisible(entry.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, results]);

  const validateField = (field, value) => {
    const num = parseInt(value, 10);
    if (!value || value.trim() === "") return "Field required";
    if (isNaN(num)) return "Must be a number";
    if (field === "shareholders" && (num < 0 || num > 100000)) return "Must be 0–100,000";
    if (field === "optionHolders" && (num < 0 || num > 100000)) return "Must be 0–100,000";
    if (field === "grants" && (num < 0 || num > 10000)) return "Must be 0–10,000";
    return null;
  };

  const handleCalculate = (inputs, overrides = {}) => {
    setCurrentFormValues(inputs);
    const newErrors = {};

    // Validate dropdown and text fields
    if (!inputs?.geoInc || inputs.geoInc.trim() === "") newErrors.geoInc = "Field required";
    if (!inputs?.geoOp || inputs.geoOp.trim() === "") newErrors.geoOp = "Field required";
    if (!inputs?.stage || inputs.stage.trim() === "") newErrors.stage = "Field required";
    if (!inputs?.meth || inputs.meth.trim() === "") newErrors.meth = "Field required";
    if (!inputs?.legalEntityName || inputs.legalEntityName.trim() === "") newErrors.legalEntityName = "Field required";

    // Validate numeric fields
    const sharesErr = validateField("shareholders", String(inputs?.sh ?? ""));
    const holdersErr = validateField("optionHolders", String(inputs?.oh ?? ""));
    const newHireGrantsErr = validateField("grants", String(inputs?.grNewHire ?? ""));
    const refreshGrantsErr = validateField("grants", String(inputs?.grRefresh ?? ""));

    if (sharesErr) newErrors.shareholders = sharesErr;
    if (holdersErr) newErrors.optionHolders = holdersErr;
    if (newHireGrantsErr) newErrors.newHireGrants = newHireGrantsErr;
    if (refreshGrantsErr) newErrors.refreshGrants = refreshGrantsErr;

    // Validate fundraise fields if fundraising is enabled
    if (inputs?.planningToFundraise) {
      if (!inputs?.fundraiseRound) newErrors.fundraiseRound = "Field required";
      const newShareholdersStr = String(inputs?.newShareholdersFromFundraise ?? "").trim();
      const newShareholdersNum = parseInt(newShareholdersStr, 10);
      if (isNaN(newShareholdersNum) || newShareholdersNum <= 0) newErrors.newShareholdersFromFundraise = "Field required";
    }

    // Validate valuation fields if valuation toggle is on
    if (inputs?.valuation) {
      if (!inputs?.valuationFrequency) newErrors.valuationFrequency = "Field required";
      if (!inputs?.valuationType) newErrors.valuationType = "Field required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const validatedInputs = {
        ...inputs,
        sh: parseInt(inputs.sh, 10),
        oh: parseInt(inputs.oh, 10),
        grNewHire: parseInt(inputs.grNewHire, 10),
        grRefresh: parseInt(inputs.grRefresh, 10),
      };
      const calcs = computeROI(validatedInputs, overrides);
      setResults(calcs);
      setFormData(validatedInputs);
      setMode("live");
      setDirtyInputs({});
    } else {
      setTimeout(() => {
        if (rootRef.current) {
          const firstErrorEl = rootRef.current.querySelector('[aria-invalid="true"]');
          if (firstErrorEl) {
            firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
            if (firstErrorEl.focus) {
              firstErrorEl.focus();
            }
          }
        }
      }, 50);
    }
  };

  const handleInputChange = (currentFormData) => {
    if (currentFormData) {
      // Clear active validation error for any field that the user starts changing
      const updatedErrors = { ...errors };
      let errorsChanged = false;

      const fieldToErrorKey = {
        sh: "shareholders",
        oh: "optionHolders",
        grNewHire: "newHireGrants",
        grRefresh: "refreshGrants",
        geoInc: "geoInc",
        geoOp: "geoOp",
        stage: "stage",
        meth: "meth",
        legalEntityName: "legalEntityName",
        fundraiseRound: "fundraiseRound",
        newShareholdersFromFundraise: "newShareholdersFromFundraise",
        valuationFrequency: "valuationFrequency",
        valuationType: "valuationType",
      };

      Object.keys(fieldToErrorKey).forEach((field) => {
        const errorKey = fieldToErrorKey[field];
        if (currentFormData[field] !== currentFormValues[field]) {
          if (updatedErrors[errorKey]) {
            delete updatedErrors[errorKey];
            errorsChanged = true;
          }
        }
      });

      if (errorsChanged) {
        setErrors(updatedErrors);
      }

      setCurrentFormValues(currentFormData);

      if (formData) {
        // Track which specific fields have changed from last calculated values
        const newDirty = {};
        const fields = ["sh", "oh", "grNewHire", "grRefresh", "geoInc", "geoOp", "stage", "meth", "planningToFundraise", "fundraiseRound", "newShareholdersFromFundraise", "valuationFrequency", "valuationType"];
        fields.forEach((field) => {
          let currentVal = currentFormData[field];
          let previousVal = formData[field];

          if (["sh", "oh", "grNewHire", "grRefresh", "newShareholdersFromFundraise"].includes(field)) {
            currentVal = parseInt(currentVal, 10) || 0;
            previousVal = parseInt(previousVal, 10) || 0;
          }

          if (currentVal !== previousVal) {
            newDirty[field] = true;
          }
        });
        setDirtyInputs(newDirty);

        // Only blur/go stale if something actually changed (avoids blurring on mount)
        if (Object.keys(newDirty).length > 0 && (mode === "live" || mode === "sample")) {
          setMode("stale");
        }

        // Clear edited rate/hours if method changed (they don't carry across methods)
        if (currentFormData.meth !== formData.meth) {
          setEditedRate(null);
          setEditedHours(null);
        }
      }
    }
  };

  return (
    <div ref={rootRef} className="roi-calculator-root" style={{
      width: "100%",
      fontFamily: A.sans, color: A.ink, background: "#F6F5FE",
      WebkitFontSmoothing: "antialiased",
      position: "relative",
    }}>
      {showHero && <AHero width={width} titlePre={heroTitlePre} titleHighlight={heroTitleHighlight} titlePost={heroTitlePost} subtitle={heroSubtitle} />}

      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: isMobile ? "16px 20px 60px" : "24px 40px 80px",
      }} className="roi-grid">
        <AForm
          width={width}
          onCalculate={handleCalculate}
          onInputChange={handleInputChange}
          errors={errors}
          mode={mode}
          editedRate={editedRate}
          editedHours={editedHours}
          defaultGeoInc={mapCountry(defaultGeoInc)}
          defaultGeoOp={mapCountry(defaultGeoOp)}
          defaultStage={mapStage(defaultStage)}
          defaultLegalEntity={defaultLegalEntity}
          defaultShareholders={String(defaultShareholders)}
          defaultOptionHolders={String(defaultOptionHolders)}
          defaultNewHireGrants={String(defaultNewHireGrants)}
          defaultRefreshGrants={String(defaultRefreshGrants)}
          defaultFundraise={defaultFundraise}
          defaultFundraiseRound={mapStage(defaultFundraiseRound)}
          defaultNewShareholdersFromFundraise={String(defaultNewShareholdersFromFundraise)}
          defaultValuation={defaultValuation}
          defaultValFreq={mapValFreq(defaultValFreq)}
          defaultValType={mapValType(defaultValType)}
          defaultAdminMethod={mapAdminMethod(defaultAdminMethod)}
        />
        {!isMobile && <ALiveEstimate width={isDesktop ? Math.min(380, width - 80) : width - 80} mode={mode} results={results} onRecalculate={handleCalculate} dirtyCount={Object.keys(dirtyInputs).length} formData={formData} currentFormValues={currentFormValues} sticky={isDesktop} editedRate={editedRate} setEditedRate={setEditedRate} editedHours={editedHours} setEditedHours={setEditedHours} ctaText={ctaText} ctaUrl={ctaUrl} />}
      </div>

      {isMobile && (
        <div ref={staticResultsRef} id="roi-mobile-static-results" style={{ padding: "0 20px 140px", maxWidth: 1280, margin: "0 auto" }}>
          <ALiveEstimate width={width - 40} mode={mode} results={results} onRecalculate={handleCalculate} dirtyCount={Object.keys(dirtyInputs).length} formData={formData} currentFormValues={currentFormValues} sticky={false} editedRate={editedRate} setEditedRate={setEditedRate} editedHours={editedHours} setEditedHours={setEditedHours} ctaText={ctaText} ctaUrl={ctaUrl} />
        </div>
      )}

      {isMobile && (
        <ALiveEstimate isMobileLayout showSticky={!staticVisible} width={width} mode={mode} results={results} onRecalculate={handleCalculate} dirtyCount={Object.keys(dirtyInputs).length} formData={formData} currentFormValues={currentFormValues} sticky={false} editedRate={editedRate} setEditedRate={setEditedRate} editedHours={editedHours} setEditedHours={setEditedHours} ctaText={ctaText} ctaUrl={ctaUrl} />
      )}
    </div>
  );
}
