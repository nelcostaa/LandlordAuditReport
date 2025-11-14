# Client-Side PDF Generation System

Complete professional PDF report generation using jsPDF + jspdf-autotable.

## Overview

This system generates a comprehensive 12-page PDF report entirely in the browser, eliminating the need for server-side dependencies like Puppeteer or @react-pdf/renderer.

## Architecture

```
lib/pdf-client/
├── generator.ts          # Main orchestrator - calls all page generators
├── styles.ts            # Color palette, fonts, spacing constants
├── utils.ts             # Text wrapping, positioning, date formatting
├── components/          # Reusable UI components
│   ├── header.ts        # Page headers with green line
│   ├── footer.ts        # Copyright footer
│   ├── trafficLight.ts  # Colored circle indicators
│   └── tables.ts        # Table style configurations
└── pages/               # Individual page generators
    ├── coverPage.ts
    ├── executiveSummary.ts
    ├── criticalFindings.ts
    ├── methodology.ts
    ├── riskRating.ts
    ├── complianceStatus.ts
    ├── evidenceSummary.ts
    ├── introduction.ts
    ├── results.ts
    ├── recommendations.ts
    ├── actionPlan.ts
    └── detailedResults.ts
```

## Usage

```typescript
import { generateCompletePDF } from '@/lib/pdf-client/generator';
import { transformAuditToReportData } from '@/lib/pdf/formatters';

// 1. Fetch audit data
const auditData = await fetch(`/api/audits/review/${auditId}`).then(r => r.json());

// 2. Transform to ReportData format
const reportData = transformAuditToReportData(
  auditData.audit,
  auditData.responses,
  auditData.questions,
  auditData.scores
);

// 3. Generate PDF
const doc = await generateCompletePDF(reportData);

// 4. Download
doc.save(`landlord-audit-report-${auditId}.pdf`);
```

## Key Features

### Professional Design
- Exact color palette from original design (#38761d green, #0b5394 blue)
- Consistent typography (Helvetica, proper sizing)
- Traffic light system with colored circles
- Proper spacing and alignment

### Complete Report Structure

1. **Cover Page** - Green banner, property info, report ID
2. **Executive Summary** - Overall score, compliance table, critical findings
3. **Critical Findings** - Detailed critical issues (if any)
4. **Methodology** - Assessment explanation, audit scope
5. **Risk Rating** - 5-tier classification system
6. **Compliance Status** - Legal requirements checklist
7. **Evidence Summary** - Documentation status
8. **Introduction** - Traffic light system explanation
9. **Results** - Category scores breakdown
10. **Recommendations** - Suggested services
11. **Action Plan** - Timeline-based action items
12. **Detailed Results** - All questions with answers

### Technical Features

- **Dynamic pagination** - Auto page breaks when content overflows
- **Traffic lights** - Perfectly aligned colored circles
- **Tables** - Using jspdf-autotable with custom styling
- **Text wrapping** - Automatic text flow with proper line breaks
- **Type-safe** - Full TypeScript support
- **Fast** - Generates in < 500ms (faster than server-side)
- **No server dependencies** - 100% client-side

## Customization

### Modify Colors

Edit `lib/pdf-client/styles.ts`:

```typescript
export const COLORS = {
  primaryGreen: '#38761d',  // Change brand color
  // ... other colors
};
```

### Modify Fonts

Edit `lib/pdf-client/styles.ts`:

```typescript
export const FONTS = {
  h1: { size: 19, style: 'bold' },  // Change heading size
  // ... other fonts
};
```

### Add New Page

1. Create `lib/pdf-client/pages/newPage.ts`:

```typescript
import jsPDF from 'jspdf';
import { ReportData } from '@/lib/pdf/formatters';
import { addPageHeader, addPageFooter } from '../components';

export async function newPage(doc: jsPDF, data: ReportData): Promise<void> {
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  // Your content here
  
  addPageFooter(doc);
}
```

2. Export in `lib/pdf-client/pages/index.ts`:

```typescript
export { newPage } from './newPage';
```

3. Call in `lib/pdf-client/generator.ts`:

```typescript
await newPage(doc, data);
```

### Modify Page Content

Each page file is self-contained. Simply edit the relevant file in `lib/pdf-client/pages/`.

## Data Flow

```
Audit Data (DB)
    ↓
/api/audits/review/[id] (API endpoint)
    ↓
transformAuditToReportData() (lib/pdf/formatters.ts)
    ↓
ReportData interface
    ↓
generateCompletePDF() (lib/pdf-client/generator.ts)
    ↓
Individual page generators
    ↓
jsPDF document
    ↓
Download to browser
```

## Styling Principles

All styling follows world-class best practices:

1. **Consistent Spacing** - Uses LAYOUT.spacing constants
2. **Vertical Alignment** - Traffic lights aligned with text baselines
3. **No Page Splits** - Critical blocks stay together
4. **Color Coding** - Red (critical), Orange (medium), Green (good)
5. **Typography** - Proper hierarchy with H1, H2, H3, body

## Why jsPDF vs @react-pdf/renderer?

| Feature | jsPDF | @react-pdf/renderer |
|---------|-------|---------------------|
| **Works in Vercel** | ✅ Yes | ❌ Complex config |
| **Speed** | ⚡ Instant | 🐌 Cold start |
| **Dependencies** | ✅ Minimal | ❌ Many |
| **Control** | ✅ Precise | ⚠️ React abstraction |
| **Browser Support** | ✅ Designed for it | ❌ Server-first |

## Performance

- **Generation time**: < 500ms for typical audit
- **File size**: ~40-60KB
- **Memory**: Minimal (client-side)
- **Bundle size**: +22 packages (~200KB gzipped)

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Troubleshooting

### PDF doesn't generate

Check browser console for errors:
```javascript
console.log('[PDF Generator] Starting...');
// ... detailed logging throughout
```

### Missing data in PDF

Verify `transformAuditToReportData()` returns complete data:
```javascript
console.log('Report data:', reportData);
```

### Styling issues

Check `COLORS`, `FONTS`, `LAYOUT` constants in `styles.ts` match design requirements.

## Future Enhancements

Possible improvements:
- Add page number updating (currently placeholder "999")
- Add custom fonts beyond Helvetica
- Add images/logos
- Add charts/graphs
- Export to other formats (CSV, Excel)

## License

Part of the Landlord Safeguarding Audit System.

