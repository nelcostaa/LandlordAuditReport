// Critical Findings Summary Page Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { styles as globalStyles, COLORS } from '@/lib/pdf/styles';
import { QuestionResponseData } from '@/lib/pdf/formatters';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  alertBox: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff5f5',
    borderWidth: 2,
    borderColor: COLORS.red,
  },
  alertTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.red,
    marginBottom: 8,
  },
  alertText: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  findingCard: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.red,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  findingNumber: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.red,
  },
  findingCategory: {
    fontSize: 9,
    color: COLORS.mediumGray,
  },
  findingQuestion: {
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  consequenceBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fef2f2',
  },
  consequenceTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.red,
    marginBottom: 4,
  },
  consequenceText: {
    fontSize: 9,
    lineHeight: 1.3,
  },
});

interface CriticalFindingsPageProps {
  criticalQuestions: QuestionResponseData[];
}

export const CriticalFindingsPage = ({ criticalQuestions }: CriticalFindingsPageProps) => {
  // Map questions to their legal consequences
  const getConsequence = (questionNumber: string): string => {
    // Map based on question category/type
    if (questionNumber.startsWith('1.1') || questionNumber.startsWith('1.2')) {
      return 'Fines exceeding £5,000 per certificate violation. Personal liability for tenant injuries. Prosecution for non-compliance with safety regulations.';
    }
    if (questionNumber.startsWith('3.1')) {
      return 'Fines up to £30,000 per property. Rent repayment orders covering 12 months. Property prohibition preventing legal letting.';
    }
    if (questionNumber.startsWith('1.5')) {
      return 'Unlimited fines for HMO fire safety violations. Potential imprisonment if fire incident occurs. Prohibition orders preventing occupation.';
    }
    if (questionNumber.startsWith('19.')) {
      return 'Compensation claims of 1-3x deposit amount. Automatic tribunal ruling against landlord. Cannot enforce any deposit deductions.';
    }
    if (questionNumber.startsWith('9.')) {
      return 'Eviction proceedings invalidated entirely. Legal fees wasted. Must restart process from beginning with 6+ month delays.';
    }
    
    // Default for other critical items
    return 'Tribunal claims and potential financial penalties. Enforcement action possible. Licensing authority sanctions may apply.';
  };
  
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h1}>Critical Findings Summary</Text>
      
      {criticalQuestions.length > 0 ? (
        <View>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>
              ⚠ URGENT: {criticalQuestions.length} Critical Non-Compliance Issue{criticalQuestions.length > 1 ? 's' : ''} Identified
            </Text>
            <Text style={styles.alertText}>
              The following findings expose you to immediate legal action, prosecution, and substantial financial 
              penalties. These items require urgent remediation within 7 days. Professional legal consultation 
              is strongly recommended for items involving statutory violations.
            </Text>
          </View>
          
          <Text style={[globalStyles.h2, { color: COLORS.red }]}>
            Items Requiring Immediate Action
          </Text>
          
          {criticalQuestions.map((question, idx) => (
            <View key={idx} style={styles.findingCard} wrap={false}>
              <View style={styles.findingHeader}>
                <Text style={styles.findingNumber}>Q{question.number}</Text>
                <Text style={styles.findingCategory}>{question.category} / {question.subcategory}</Text>
              </View>
              
              <Text style={styles.findingQuestion}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Issue: </Text>
                {question.questionText}
              </Text>
              
              <Text style={{ fontSize: 10, marginBottom: 8 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Current Status: </Text>
                {question.answer}
              </Text>
              
              <View style={styles.consequenceBox}>
                <Text style={styles.consequenceTitle}>Legal Consequences:</Text>
                <Text style={styles.consequenceText}>{getConsequence(question.number)}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ marginTop: 30, padding: 20, backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: COLORS.darkGreen }}>
          <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', color: COLORS.darkGreen, marginBottom: 8 }}>
            ✓ No Critical Non-Compliance Issues Identified
          </Text>
          <Text style={{ fontSize: 10, lineHeight: 1.4 }}>
            This audit identified no critical statutory violations. You are not currently exposed to 
            immediate prosecution or prohibition orders. Continue maintaining current compliance standards 
            and address medium-priority items within recommended timeframes.
          </Text>
        </View>
      )}
      
      <PageFooter />
    </Page>
  );
};

