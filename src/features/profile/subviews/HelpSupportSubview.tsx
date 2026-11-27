import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KudiIcon } from '../../../components/KudiIcon';
import { colors } from '../../../theme/colors';
import { useDriverStore } from '../../../store/useDriverStore';
import { uploadSupportAttachment, UploadedSupportAttachment } from '../../../api/mediaApi';
import { supportApi, SupportTicketRecord } from '../../../api/supportApi';
import { captureCameraFile, pickSupportMedia } from '../../../utils/filePicker';
import { getFriendlyErrorMessage } from '../../../utils/errorHandling';
import { subviewStyles as styles } from './profileSubviews.styles';

const SUPPORT_CATEGORIES = [
  { id: 'DELIVERY', label: 'Delivery Issue' },
  { id: 'ORDER_ISSUE', label: 'Order / Hub' },
  { id: 'PAYMENT_REFUND', label: 'Payouts' },
  { id: 'ACCOUNT', label: 'Account & App' },
];

export const HelpSupportSubview: React.FC = () => {
  const supportConfig = useDriverStore((s) => s.supportConfig);
  const supportPhone = supportConfig?.phone || null;
  const supportEmail = supportConfig?.email || null;

  const [showTicketForm, setShowTicketForm] = useState(true);
  const [category, setCategory] = useState<string>('DELIVERY');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<
    Array<UploadedSupportAttachment & { previewUri?: string }>
  >([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [helplineNotice, setHelplineNotice] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const list = await supportApi.getTickets();
      if (Array.isArray(list)) {
        setTickets(list);
      }
    } catch {
      // Keep quiet on initial ticket history load if server offline
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const handleCallSupport = async () => {
    setHelplineNotice(null);
    if (!supportPhone) {
      setHelplineNotice('Direct helpline is unavailable right now. Please raise a support ticket below.');
      setShowTicketForm(true);
      return;
    }
    const telUrl = `tel:${supportPhone.replace(/[^+\d]/g, '')}`;
    try {
      const canOpen = await Linking.canOpenURL(telUrl);
      if (!canOpen) {
        setHelplineNotice(`Call support directly at ${supportPhone}.`);
        return;
      }
      await Linking.openURL(telUrl);
    } catch {
      setHelplineNotice(`Call support directly at ${supportPhone}.`);
    }
  };

  const handleAttachFile = async (kind: 'image' | 'video' | 'camera') => {
    setAttachmentError(null);
    if (attachments.length >= 6) {
      setAttachmentError('You can attach up to 6 files per ticket.');
      return;
    }

    try {
      const picked =
        kind === 'camera'
          ? await captureCameraFile('environment')
          : await pickSupportMedia(kind);

      if (!picked) {
        return;
      }

      setIsUploadingMedia(true);
      const uploaded = await uploadSupportAttachment(
        picked.uri,
        picked.name,
        picked.type,
        (picked as any).sizeBytes,
      );
      setAttachments((prev) => [
        ...prev,
        {
          ...uploaded,
          previewUri: uploaded.mediaType === 'image' ? picked.uri : undefined,
        },
      ]);
    } catch (err: any) {
      setAttachmentError(
        getFriendlyErrorMessage(err, 'Failed to attach media file. Please check file size/type.'),
      );
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachmentError(null);
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitTicket = async () => {
    if (submitLockRef.current || isSubmitting || isUploadingMedia) return;
    setFormError(null);
    setFormSuccess(null);

    const trimmedDesc = description.trim();
    const trimmedTitle =
      subject.trim() ||
      (SUPPORT_CATEGORIES.find((c) => c.id === category)?.label || 'Partner Support Request');

    if (!trimmedDesc) {
      setFormError('Please describe your issue before submitting.');
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      const created = await supportApi.createTicket({
        title: trimmedTitle,
        category,
        description: trimmedDesc,
        priority: 'HIGH',
        attachments: attachments.map(({ previewUri: _p, ...rest }) => rest),
      });
      setSubject('');
      setDescription('');
      setAttachments([]);
      setAttachmentError(null);
      setTickets((prev) => [created, ...prev]);
      setFormSuccess('Ticket submitted. Operations team will review it shortly.');
    } catch (err: any) {
      setFormError(getFriendlyErrorMessage(err, 'Unable to submit support ticket right now.'));
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Two Clear Primary Support Options */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>How can we help?</Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 12,
              alignItems: 'center',
              gap: 6,
            }}
            onPress={handleCallSupport}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Call Support"
          >
            <KudiIcon name="phone" size={20} color={colors.primary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#171716' }}>Call Support</Text>
            <Text style={{ fontSize: 11, color: '#65635F' }} numberOfLines={1}>
              {supportPhone || 'Partner Desk'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: showTicketForm ? '#171716' : '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#171716',
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 12,
              alignItems: 'center',
              gap: 6,
            }}
            onPress={() => setShowTicketForm(true)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Raise a Support Ticket"
          >
            <KudiIcon
              name="help"
              size={20}
              color={showTicketForm ? '#FFFFFF' : '#171716'}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: showTicketForm ? '#FFFFFF' : '#171716',
              }}
            >
              Raise a Ticket
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: showTicketForm ? '#D1CCC4' : '#65635F',
              }}
              numberOfLines={1}
            >
              Images & videos supported
            </Text>
          </TouchableOpacity>
        </View>

        {helplineNotice ? (
          <View
            style={{
              marginTop: 12,
              backgroundColor: '#FAF9F6',
              borderWidth: 1,
              borderColor: '#E2DED7',
              borderRadius: 10,
              padding: 10,
            }}
          >
            <Text style={{ fontSize: 12.5, fontWeight: '600', color: '#45433F' }}>
              {helplineNotice}
            </Text>
          </View>
        ) : null}

        {supportEmail ? (
          <View style={[styles.row, styles.rowLast, { marginTop: 12 }]}>
            <Text style={styles.rowLabel}>Support Email</Text>
            <Text style={styles.rowValue}>{supportEmail}</Text>
          </View>
        ) : null}
      </View>

      {/* Raise a Support Ticket Flow */}
      {showTicketForm ? (
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Raise a Support Ticket</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {SUPPORT_CATEGORIES.map((cat) => {
              const selected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: selected ? '#171716' : '#F3F1EC',
                    borderWidth: 1,
                    borderColor: selected ? '#171716' : '#E2DED7',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: selected ? '#FFFFFF' : '#65635F',
                    }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Issue summary (optional)"
            style={{
              borderWidth: 1,
              borderColor: '#E4E0DB',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 10,
              color: '#171716',
              backgroundColor: '#FAF9F6',
            }}
          />

          <TextInput
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (formError) setFormError(null);
              if (formSuccess) setFormSuccess(null);
            }}
            placeholder="Describe order, hub, navigation, or payout issue..."
            multiline
            style={{
              borderWidth: 1,
              borderColor: formError ? '#DC2626' : '#E4E0DB',
              borderRadius: 10,
              padding: 12,
              minHeight: 90,
              textAlignVertical: 'top',
              marginBottom: 12,
              color: '#171716',
              backgroundColor: '#FAF9F6',
            }}
          />

          {attachmentError ? (
            <View
              accessibilityRole="alert"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#FEF2F2',
                borderWidth: 1,
                borderColor: '#FECACA',
                borderRadius: 8,
                padding: 8,
                marginBottom: 10,
              }}
            >
              <KudiIcon name="alert-circle" size={14} color="#DC2626" />
              <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: '#991B1B' }}>
                {attachmentError}
              </Text>
            </View>
          ) : null}

          {/* Attachments Row */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#65635F', marginBottom: 8 }}>
            Attachments (Screenshots, Photos & Videos)
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => void handleAttachFile('image')}
              disabled={isUploadingMedia}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#E2DED7',
                backgroundColor: '#FAF9F6',
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                gap: 4,
              }}
            >
              <KudiIcon name="document" size={16} color={colors.primary} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#171716' }}>Photo / Shot</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => void handleAttachFile('camera')}
              disabled={isUploadingMedia}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#E2DED7',
                backgroundColor: '#FAF9F6',
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                gap: 4,
              }}
            >
              <KudiIcon name="camera" size={16} color={colors.primary} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#171716' }}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => void handleAttachFile('video')}
              disabled={isUploadingMedia}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#E2DED7',
                backgroundColor: '#FAF9F6',
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                gap: 4,
              }}
            >
              <KudiIcon name="zap" size={16} color={colors.primary} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#171716' }}>Video</Text>
            </TouchableOpacity>
          </View>

          {isUploadingMedia ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ fontSize: 12, color: '#65635F', fontWeight: '600' }}>
                Uploading attachment...
              </Text>
            </View>
          ) : null}

          {attachments.length > 0 ? (
            <View style={{ gap: 8, marginBottom: 14 }}>
              {attachments.map((att, idx) => (
                <View
                  key={`${att.url}-${idx}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: '#F8F7F4',
                    borderRadius: 10,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: '#E2DED7',
                  }}
                >
                  {att.previewUri ? (
                    <Image
                      source={{ uri: att.previewUri }}
                      style={{ width: 42, height: 42, borderRadius: 8 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        backgroundColor: '#FFF0E8',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <KudiIcon
                        name={att.mediaType === 'video' ? 'zap' : 'document'}
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#171716' }} numberOfLines={1}>
                      {att.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#65635F' }}>
                      {att.mediaType === 'video' ? 'Video' : 'Image'}
                      {att.sizeBytes ? ` · ${(att.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveAttachment(idx)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#FEE2E2',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    accessibilityLabel={`Remove ${att.name}`}
                  >
                    <KudiIcon name="close" size={14} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}

          {formError ? (
            <View
              accessibilityRole="alert"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#FEF2F2',
                borderWidth: 1,
                borderColor: '#FECACA',
                borderRadius: 10,
                padding: 10,
                marginBottom: 12,
              }}
            >
              <KudiIcon name="alert-circle" size={15} color="#DC2626" />
              <Text style={{ flex: 1, fontSize: 12.5, fontWeight: '600', color: '#991B1B' }}>
                {formError}
              </Text>
            </View>
          ) : null}

          {formSuccess ? (
            <View
              accessibilityLiveRegion="polite"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#EDFDF5',
                borderWidth: 1,
                borderColor: '#A7F3D0',
                borderRadius: 10,
                padding: 10,
                marginBottom: 12,
              }}
            >
              <KudiIcon name="check-circle" size={15} color="#16805A" />
              <Text style={{ flex: 1, fontSize: 12.5, fontWeight: '600', color: '#065F46' }}>
                {formSuccess}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.primaryActionButton,
              (isSubmitting || isUploadingMedia) && { opacity: 0.7 },
            ]}
            onPress={() => void handleSubmitTicket()}
            disabled={isSubmitting || isUploadingMedia}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryActionButtonText}>Submit Support Ticket</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Recent Support Tickets */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Your Support Tickets</Text>
        {loadingTickets ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : tickets.length === 0 ? (
          <Text style={styles.smallSubtext}>No support tickets raised yet.</Text>
        ) : (
          tickets.slice(0, 5).map((t, idx) => (
            <View
              key={t.id}
              style={[styles.row, idx === Math.min(tickets.length, 5) - 1 && styles.rowLast]}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.rowLabelBold} numberOfLines={1}>
                  {t.title}
                </Text>
                <Text style={styles.smallSubtext} numberOfLines={2}>
                  {t.description}
                </Text>
                {Array.isArray(t.attachments) && t.attachments.length > 0 ? (
                  <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '600', marginTop: 2 }}>
                    {t.attachments.length} attachment{t.attachments.length > 1 ? 's' : ''}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.rowValue, { color: '#16805A', fontSize: 12 }]}>
                {t.status}
              </Text>
            </View>
          ))
        )}
      </View>
    </>
  );
};
