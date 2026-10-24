import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import { useOrderStore } from '../../store/useOrderStore';
import { KudiIcon } from '../../components/KudiIcon';
import { subviewStyles as styles } from './subviews/profileSubviews.styles';
import { StoreSubview } from './subviews/StoreSubview';
import { RateCardsSubview } from './subviews/RateCardsSubview';
import { SlotHistorySubview } from './subviews/SlotHistorySubview';
import { OrderHistorySubview } from './subviews/OrderHistorySubview';
import {
  DocumentsSubview,
  DocItem,
  maskDl,
  maskAadhaar,
  maskPan,
} from './subviews/DocumentsSubview';
import {
  StarSubview,
  AssetsSubview,
  EvMarketplaceSubview,
} from './subviews/EquipmentAndPerksSubviews';
import {
  HelpSubview,
  CashSubview,
  InsuranceSubview,
  LoanSubview,
  AcademySubview,
  CardSubview,
  AboutSubview,
  LanguageSubview,
  DefaultFallbackSubview,
} from './subviews/FinanceAndLegalSubviews';

export const ProfileDetailSubScreen = ({ navigation, route }: any) => {
  const screenId = route?.params?.id || 'store';
  const customTitle = route?.params?.title;

  const { profile, vehicle, kyc, assignedStore } = useDriverStore();
  const { historicalOrders } = useOrderStore();

  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const driverFullName = profile.fullName || profile.name || 'Rahul Sharma';
  const nameParts = driverFullName.trim().split(' ');
  const firstName = nameParts[0] || 'Rahul';
  const lastName = nameParts.slice(1).join(' ') || 'Sharma';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const documentsList: DocItem[] = [
    {
      id: 'dl',
      title: 'Driving Licence',
      rawNumber: profile.licenseNumber,
      maskedNumber: maskDl(profile.licenseNumber),
      status: kyc?.licenseStatus || 'Under review',
      description: 'Official driving permit required for operating commercial and delivery vehicles.',
    },
    {
      id: 'aadhaar',
      title: 'Aadhaar Card',
      rawNumber: profile.aadhaarNumber,
      maskedNumber: maskAadhaar(profile.aadhaarNumber),
      status: kyc?.aadhaarStatus || 'Verified',
      description: 'Government identification used for background verification and compliance.',
    },
    {
      id: 'pan',
      title: 'PAN Card',
      rawNumber: profile.panNumber,
      maskedNumber: maskPan(profile.panNumber),
      status: kyc?.panStatus || 'Verified',
      description: 'Permanent Account Number required for tax deduction and weekly payouts.',
    },
    {
      id: 'rc',
      title: 'Vehicle RC',
      rawNumber: vehicle.registrationNumber || vehicle.rcNumber || '',
      maskedNumber: vehicle.registrationNumber || vehicle.rcNumber || 'KA 05 MJ 4821',
      status: vehicle.rcStatus || 'Verified',
      description: 'Vehicle registration certificate matching your active delivery vehicle.',
    },
  ];

  const getScreenTitle = () => {
    if (customTitle) return customTitle;
    switch (screenId) {
      case 'store':
        return 'Your Store';
      case 'rateCards':
        return 'My Rate Cards';
      case 'star':
        return 'KudiCart Star';
      case 'assets':
        return 'Rider Assets';
      case 'slotHistory':
        return 'Slot History';
      case 'orderHistory':
        return 'Order History';
      case 'ev':
        return 'EV Marketplace';
      case 'help':
        return 'Help & Support';
      case 'cash':
        return 'Cash Balance';
      case 'insurance':
        return 'Insurance Card';
      case 'loan':
        return 'Partner Loans';
      case 'academy':
        return 'KudiCart Academy';
      case 'language':
        return 'Change App Language';
      case 'card':
        return 'KudiCart Card';
      case 'documents':
        return 'Documents & Verification';
      case 'about':
        return 'About KudiCart';
      default:
        return 'Details';
    }
  };

  const handleBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('MainApp');
    }
  };

  const renderContent = () => {
    switch (screenId) {
      case 'store':
        return <StoreSubview assignedStore={assignedStore} />;
      case 'rateCards':
        return <RateCardsSubview />;
      case 'star':
        return <StarSubview />;
      case 'assets':
        return <AssetsSubview />;
      case 'slotHistory':
        return <SlotHistorySubview />;
      case 'orderHistory':
        return <OrderHistorySubview historicalOrders={historicalOrders} navigation={navigation} />;
      case 'ev':
        return <EvMarketplaceSubview />;
      case 'help':
        return <HelpSubview />;
      case 'cash':
        return <CashSubview />;
      case 'insurance':
        return <InsuranceSubview />;
      case 'loan':
        return <LoanSubview />;
      case 'academy':
        return <AcademySubview />;
      case 'language':
        return (
          <LanguageSubview
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        );
      case 'card':
        return (
          <CardSubview
            driverFullName={driverFullName}
            driverId={profile.id}
            initials={initials}
          />
        );
      case 'documents':
        return <DocumentsSubview documentsList={documentsList} />;
      case 'about':
        return <AboutSubview />;
      default:
        return <DefaultFallbackSubview />;
    }
  };

  return (
    <ScreenContainer>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <KudiIcon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </ScreenContainer>
  );
};
