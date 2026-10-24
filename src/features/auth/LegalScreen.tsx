import React from 'react';
import { TermsAndConditionsScreen } from './TermsAndConditionsScreen';
import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';

/**
 * Backward-compatible wrapper for the 'Legal' route.
 * Redirects to PrivacyPolicyScreen if initialTab === 'privacy', otherwise TermsAndConditionsScreen.
 */
export const LegalScreen = (props: any) => {
  if (props?.route?.params?.initialTab === 'privacy') {
    return <PrivacyPolicyScreen {...props} />;
  }
  return <TermsAndConditionsScreen {...props} />;
};
