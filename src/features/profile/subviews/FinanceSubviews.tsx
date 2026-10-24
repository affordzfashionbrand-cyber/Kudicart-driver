import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { toast } from '../../../store/useToastStore';
import { subviewStyles as styles } from './profileSubviews.styles';

export const HelpSubview: React.FC = () => {
  return (
    <>
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => toast.error('Emergency Safety SOS triggered. Support team alerted.')}
        activeOpacity={0.8}
      >
        <Text style={styles.sosButtonText}>🚨 Emergency Safety SOS</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>24/7 Partner Helpline</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Toll-Free Helpline</Text>
          <Text style={styles.rowValue}>1800-419-5834</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>WhatsApp Hub Help</Text>
          <Text style={styles.rowValue}>+91 98451 22890</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Support Availability</Text>
          <Text style={[styles.rowValue, { color: '#16805A' }]}>24 Hours / 7 Days</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={() => Linking.openURL('tel:18004195834').catch(() => {})}
        activeOpacity={0.8}
      >
        <KudiIcon name="phone" size={18} color="#FFFFFF" />
        <Text style={styles.primaryActionButtonText}>Call Partner Support</Text>
      </TouchableOpacity>
    </>
  );
};

export const CashSubview: React.FC = () => {
  return (
    <>
      <View style={styles.cashHeroCard}>
        <Text style={styles.cashHeroLabel}>Cash in Hand (COD)</Text>
        <Text style={styles.cashHeroAmount}>₹0.00</Text>
        <Text style={styles.cashHeroStatus}>All collected COD has been deposited</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Deposit Limits & Guidelines</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Floating Cash Limit</Text>
          <Text style={styles.rowValue}>₹2,500.00</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Daily Cutoff Time</Text>
          <Text style={styles.rowValue}>11:00 PM</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Deposit Drop Location</Text>
          <Text style={styles.rowValue}>HSR Darkstore Smart Kiosk</Text>
        </View>
      </View>
    </>
  );
};

export const InsuranceSubview: React.FC = () => {
  return (
    <>
      <View style={styles.insuranceBanner}>
        <KudiIcon name="shield" size={28} color="#0043CE" />
        <View style={{ flex: 1 }}>
          <Text style={styles.insuranceTitle}>Group Accidental & Health Cover</Text>
          <Text style={styles.insuranceSubtitle}>Policy ID: KUDI-HLT-2026-9842</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Coverage Details</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Accidental Death & Disability</Text>
          <Text style={styles.highlightValue}>₹5,00,000</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Hospital Daily Cash</Text>
          <Text style={styles.highlightValue}>₹1,000 / day (30 days)</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>24x7 Claims Assistance</Text>
          <Text style={styles.rowValue}>1800-102-INSURE</Text>
        </View>
      </View>
    </>
  );
};

export const LoanSubview: React.FC = () => {
  return (
    <>
      <View style={styles.loanBanner}>
        <Text style={styles.loanBannerLabel}>Pre-Approved Partner Loan</Text>
        <Text style={styles.loanBannerAmount}>₹25,000.00</Text>
        <Text style={styles.loanBannerSub}>0% interest for first 30 days</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Loan Terms</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Repayment Model</Text>
          <Text style={styles.rowValue}>₹150 daily deduction from payout</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Disbursal Time</Text>
          <Text style={styles.rowValue}>Direct to bank in 2 hours</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={() => toast.success('Loan application submitted. Agent will call you shortly.')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryActionButtonText}>Apply Instantly</Text>
      </TouchableOpacity>
    </>
  );
};
