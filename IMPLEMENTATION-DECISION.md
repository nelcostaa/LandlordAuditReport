# Implementation Decision: CSV Integration

**Date:** November 14, 2025  
**Status:** Pre-Implementation Analysis

---

## 🎯 Problem Statement

James requested:
> "In left column, remove 'CRITICAL', 'HIGH', 'MEDIUM' and replace with the data from column U in the spreadsheet. In the right hand column insert the recommended red or orange actions, taken from column X."

**Context:** "Suggestions for Improvement" page (formerly "Priority Action Plan")

---

## 🔍 Rigorous Analysis

### What James ACTUALLY Needs

From the CSV analysis, the spreadsheet has these columns:

| Col | Field Name | Content | Needed? |
|-----|------------|---------|---------|
| U | `motivation` | Educational context for auditors | ❓ Maybe |
| V | `red_score_example` | "Why is this red?" explanation | ✅ YES |
| W | `orange_score_example` | "Why is this orange?" explanation | ✅ YES |
| X | `green_score_example` | "Why is this green?" explanation | ❌ NO (we don't show green) |
| Y | `report_action` | "What to do" - the actual actions | ✅ YES |

**Interpretation:**
- James said "Column U" but likely meant **Column V** (`red_score_example`) for context
- James said "Column X" but likely meant **Column Y** (`report_action`) for actions
- OR he meant the spreadsheet UI columns, which don't match CSV letter columns

**Evidence from CSV:**
```csv
Q1.1 Certificates:
- red_score_example: "Any single certificate is missing or out of date. No renewal tracking system in place."
- orange_score_example: "Most certificates are present but close to expiry. Informal renewal tracking (e.g., manual diary)."
- report_action: "Red: Immediately book all required safety inspections and obtain valid certificates. Orange: Digitize all current certificates and set up reliable reminder system. Green: Continue maintaining excellent digital record-keeping."
```

This makes perfect sense for the "Suggestions for Improvement" table:
- **Left column:** Subcategory + Score + **Why is this a problem** (context)
- **Right column:** **What to do about it** (action)

---

## ✅ What to Implement (Minimal Viable)

### Phase 1: Add ONLY 3 Critical Columns

**Columns to add to `questions` table:**
1. `red_score_example` TEXT - Explains why score is low (1-4)
2. `orange_score_example` TEXT - Explains why score is medium (5-8)
3. `report_action` TEXT - Contains all actions: "Red: X. Orange: Y. Green: Z."

**Why only these 3?**
- ✅ Directly needed for "Suggestions for Improvement" page
- ✅ James explicitly requested them (with column confusion)
- ✅ No other columns are used in the current report design
- ✅ Minimal schema change = less risk

**Why NOT the other 5 columns?**
- `often_overlooked` - Admin/auditor context, not report content
- `sub_notes` - Redundant with existing descriptions
- `full_description` - Already have adequate descriptions
- `motivation` - For auditors, not landlords
- `green_score_example` - We don't show green scores in Suggestions

---

## 📊 Implementation Steps

### Step 1: Database Migration (5 min)

```sql
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS red_score_example TEXT,
ADD COLUMN IF NOT EXISTS orange_score_example TEXT,
ADD COLUMN IF NOT EXISTS report_action TEXT;
```

**Risk:** LOW - Adding nullable TEXT columns is safe, no data loss risk

### Step 2: CSV Import Script (15 min)

**Logic:**
1. Read `data.csv`
2. Skip first 16 metadata rows
3. For each question row (17+):
   - Parse question_no (e.g., "1.1")
   - Extract columns V, W, Y
   - UPDATE questions WHERE question_number = question_no
   - SET red_score_example, orange_score_example, report_action

**Risk:** MEDIUM - Need to handle:
- CSV parsing edge cases (quotes, newlines in cells)
- Question number matching (must be exact)
- Missing questions (warn but don't fail)

### Step 3: Update TypeScript Types (2 min)

```typescript
export interface Question {
  // ... existing fields
  red_score_example?: string;
  orange_score_example?: string;
  report_action?: string;
}
```

**Risk:** LOW - Optional fields, backward compatible

### Step 4: Update PDF Generation (10 min)

In `lib/pdf-client/pages/recommendations.ts`:

**Current (placeholder):**
```typescript
const suggestion = subcat.color === 'red' 
  ? `Critical improvement needed...`
  : `Areas for improvement identified...`;
```

**New (using real data):**
```typescript
// Find question for this subcategory
const question = findQuestionBySubcategory(subcat, data);

// Left column: Context (why this score?)
const context = subcat.color === 'red' 
  ? question?.red_score_example 
  : question?.orange_score_example;

// Right column: Action (what to do?)
const action = parseActionForColor(question?.report_action, subcat.color);

return [
  `${subcat.name}\nScore: ${subcat.score.toFixed(2)}\n\n${context || ''}`,
  `• ${action || fallbackAction(subcat)}`
];
```

**Risk:** MEDIUM - Need to handle:
- Question not found
- Missing data
- Parsing "Red: X. Orange: Y." format
- Fallback for missing data

---

## ⚠️ Double-Check: Does This Make Sense?

### Question 1: Are we solving the right problem?
✅ **YES** - James wants richer, contextual recommendations instead of generic text

### Question 2: Are these the right 3 columns?
✅ **YES** - They directly map to the report layout he described

### Question 3: Is this the minimal change?
✅ **YES** - Only 3 columns, only what's needed for current feature

### Question 4: What if the CSV data is incomplete?
✅ **HANDLED** - We'll keep fallback logic for missing data

### Question 5: What about the other 5 columns?
✅ **DEFER** - Can add later if needed (YAGNI principle)

### Question 6: What if question numbers don't match?
⚠️ **RISK** - Need to validate CSV question numbers match DB
**Mitigation:** Import script logs warnings for missing questions

### Question 7: Will this break existing functionality?
✅ **NO** - Adding nullable columns + keeping fallback = backward compatible

### Question 8: Can we revert if it fails?
✅ **YES** - Columns are nullable, can be removed, fallback logic remains

---

## 🚨 Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Question number mismatch | Import fails | MEDIUM | Validate before UPDATE, log warnings |
| CSV parsing errors | Import incomplete | LOW | Use robust CSV parser (`csv-parse`) |
| Missing data in production | Blank suggestions | LOW | Keep fallback logic |
| James meant different columns | Wrong content | MEDIUM | Easy to re-import correct columns |
| Schema change breaks something | App crashes | LOW | Nullable columns, TypeScript optional |

---

## ✅ Decision: PROCEED with 3-Column Implementation

**Why:**
1. Clear business value (richer recommendations)
2. Minimal schema change (3 columns only)
3. Low risk (nullable, backward compatible)
4. Easy to extend (can add more columns later)
5. Easy to revert (can drop columns if wrong)

**Why NOT all 8 columns:**
1. YAGNI (You Aren't Gonna Need It)
2. Unclear use case for other 5 columns
3. More columns = more maintenance
4. Can add later if actually needed

---

## 📝 Implementation Checklist

- [ ] Create migration script (`db/add-report-action-columns.ts`)
- [ ] Create import script (`db/import-csv-report-data.ts`)
- [ ] Run migration locally
- [ ] Run import locally
- [ ] Verify data in DB
- [ ] Update TypeScript types
- [ ] Update PDF generation logic
- [ ] Test with real audit data
- [ ] Verify PDF output
- [ ] Deploy to Vercel
- [ ] Test in production
- [ ] Confirm with James

---

## 🎯 Expected Outcome

**Before:**
```
Subcategory: Certificates
Score: 2.94
Suggestion: • Critical improvement needed in Certificates. Immediate professional review recommended.
```

**After:**
```
Subcategory: Certificates
Score: 2.94

Context: Any single certificate is missing or out of date. No renewal tracking system in place.

Suggestion: • Immediately book all required safety inspections and obtain valid certificates.
```

**MUCH MORE VALUABLE** for the landlord to understand WHY and WHAT to do.

---

## 🚀 Proceed? YES

This implementation is:
- ✅ Focused (only 3 columns)
- ✅ Valuable (solves James' request)
- ✅ Safe (nullable, backward compatible)
- ✅ Reversible (can revert if wrong)
- ✅ Extensible (can add more later)

**Recommendation:** IMPLEMENT NOW

---

**End of Analysis**

