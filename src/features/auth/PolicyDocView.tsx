import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { KudiIcon } from '../../components/KudiIcon';
import { LegalDocument, LegalSection } from './legalContent';

interface PolicyDocViewProps {
  document: LegalDocument;
}

export const PolicyDocView: React.FC<PolicyDocViewProps> = ({ document }) => {
  const renderTable = (table: NonNullable<LegalSection['table']>) => (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeaderRow}>
        {table.headers.map((h, i) => (
          <Text
            key={i}
            style={[
              styles.tableHeaderCell,
              i === table.headers.length - 1 && styles.tableCellRight,
            ]}
          >
            {h}
          </Text>
        ))}
      </View>
      {table.rows.map((row, rIdx) => (
        <View
          key={rIdx}
          style={[
            styles.tableRow,
            rIdx % 2 === 1 && styles.tableRowAlt,
            rIdx === table.rows.length - 1 && styles.tableRowLast,
          ]}
        >
          {row.map((cell, cIdx) => (
            <Text
              key={cIdx}
              style={[
                styles.tableCell,
                cIdx === row.length - 1 && styles.tableCellRight,
                cIdx === row.length - 1 && styles.tableCellHighlight,
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Policy Sections */}
      {document.sections.map((sec, idx) => (
        <View key={idx} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{sec.title}</Text>

          {sec.content.map((p, pIdx) => (
            <Text key={pIdx} style={styles.paragraph}>
              {p}
            </Text>
          ))}

          {sec.subsections?.map((sub, sIdx) => (
            <View key={sIdx} style={styles.subSectionBlock}>
              <Text style={styles.subSectionTitle}>{sub.subtitle}</Text>
              {sub.items.map((it, itIdx) => (
                <View key={itIdx} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{it}</Text>
                </View>
              ))}
            </View>
          ))}

          {sec.callout && (
            <View style={styles.calloutBox}>
              <KudiIcon name="info-circle" size={16} color={colors.primary} />
              <Text style={styles.calloutText}>{sec.callout}</Text>
            </View>
          )}

          {sec.table && renderTable(sec.table)}
        </View>
      ))}

      {/* Footer Acknowledgement */}
      <View style={styles.footerCard}>
        <Text style={styles.footerHeading}>Partner Acknowledgement</Text>
        <Text style={styles.footerNote}>
          By registering and accepting orders on Affordz, the partner acknowledges
          that they have reviewed and agree to the operational rules, safety
          requirements, and policies contained herein.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xl * 2,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1EC',
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.secondary,
    marginBottom: spacing.s,
  },
  subSectionBlock: {
    marginTop: spacing.xs,
    marginBottom: spacing.s,
    backgroundColor: '#F9F8F5',
    padding: spacing.m,
    borderRadius: 10,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletDot: {
    fontSize: 13,
    color: colors.primary,
    marginRight: 6,
    marginTop: -1,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.secondary,
  },
  calloutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F2',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.m,
    borderRadius: 8,
    marginTop: spacing.xs,
    marginBottom: spacing.s,
    gap: 8,
  },
  calloutText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    lineHeight: 16,
  },
  tableContainer: {
    marginTop: spacing.s,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#ECEAE4',
    paddingVertical: 8,
    paddingHorizontal: spacing.m,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    backgroundColor: colors.white,
  },
  tableRowAlt: {
    backgroundColor: '#FAFAF8',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: colors.secondary,
  },
  tableCellRight: {
    textAlign: 'right',
  },
  tableCellHighlight: {
    fontWeight: '700',
    color: colors.text,
  },
  footerCard: {
    backgroundColor: '#F3F1EC',
    borderRadius: 12,
    padding: spacing.m,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  footerHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  footerNote: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
