// Minimal Test PDF Document - Ultra simple to test Vercel compatibility
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'Helvetica-Bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
});

interface MinimalTestDocumentProps {
  propertyAddress: string;
  landlordName: string;
  overallScore: number;
}

const MinimalTestDocument = ({ propertyAddress, landlordName, overallScore }: MinimalTestDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Landlord Risk Audit Report</Text>
      <Text style={styles.text}>Property: {propertyAddress}</Text>
      <Text style={styles.text}>Landlord: {landlordName}</Text>
      <Text style={styles.text}>Overall Score: {overallScore}/10</Text>
      <Text style={styles.text}>
        This is a minimal test PDF to verify Vercel compatibility.
      </Text>
    </Page>
  </Document>
);

export default MinimalTestDocument;
export { MinimalTestDocument };

