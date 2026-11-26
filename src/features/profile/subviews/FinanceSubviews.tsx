import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, TextInput } from 'react-native';
import { KudiIcon } from '../../../components/KudiIcon';
import { toast } from '../../../store/useToastStore';
import { request } from '../../../api/client';
import { subviewStyles as styles } from './profileSubviews.styles';

export const HelpSubview: React.FC = () => {
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitTicket = async () => {
    const trimmed = ticketMessage.trim();
    if (!trimmed) {
      toast.info('Please describe your issue before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await request('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: 'Delivery Partner Support Request',
          category: 'DELIVERY',
          priority: 'HIGH',
          message: trimmed,
        }),
      });
      setTicketMessage('');
      toast.success('Support ticket raised. Operations team will respond shortly.');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to submit support ticket right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Raise a Support Ticket</Text>
        <TextInput
          value={ticketMessage}
          onChangeText={setTicketMessage}
          placeholder="Describe order, hub, or payout issue..."
          multiline
          style={{
            borderWidth: 1,
            borderColor: '#E4E0DB',
            borderRadius: 10,
            padding: 12,
            minHeight: 80,
            textAlignVertical: 'top',
            marginBottom: 12,
            color: '#171716',
          }}
        />
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={handleSubmitTicket}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryActionButtonText}>
            {submitting ? 'Submitting...' : 'Submit Support Ticket'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>24/7 Partner Helpline</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Toll-Free Helpline</Text>
          <Text style={styles.rowValue}>1800-419-5834</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Concierge Email</Text>
          <Text style={styles.rowValue}>concierge@affordz.in</Text>
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

interface CashSubviewProps {
  cashInHandCod?: number;
  floatingCashLimit?: number;
  hubName?: string;
}

export const CashSubview: React.FC<CashSubviewProps> = ({
  cashInHandCod = 0,
  floatingCashLimit = 2500,
  hubName,
}) => {
  const formattedCod = cashInHandCod.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedLimit = floatingCashLimit.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <>
      <View style={styles.cashHeroCard}>
        <Text style={styles.cashHeroLabel}>Cash in Hand (COD)</Text>
        <Text style={styles.cashHeroAmount}>₹{formattedCod}</Text>
        <Text style={styles.cashHeroStatus}>
          {cashInHandCod > 0
            ? 'Pending deposit at assigned Darkstore Hub'
            : 'All collected COD has been settled'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Deposit Limits &amp; Guidelines</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Floating Cash Limit</Text>
          <Text style={styles.rowValue}>₹{formattedLimit}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Daily Cutoff Time</Text>
          <Text style={styles.rowValue}>11:00 PM</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Deposit Drop Location</Text>
          <Text style={styles.rowValue}>{hubName || 'Assigned Darkstore Hub'}</Text>
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
