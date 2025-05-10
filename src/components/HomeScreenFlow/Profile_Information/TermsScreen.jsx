
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import Collapsible from 'react-native-collapsible';

const TermsScreen = ({ onAgree }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleSection = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content:
        `By accessing or using the Billix platform ("Billix," "we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the platform.`
    },
    {
      title: '2. Overview of Services',
      content:
        `Billix allows users to upload bills, receive or provide assistance through a bill-swapping feature, earn platform credits, and participate in promotional rewards. Billix does not process payments between users or act as a financial intermediary. We reserve the right to modify, suspend, or discontinue any part of the platform, including features, pricing, functionalities, or available services, at any time and for any reason.`
    },
    {
      title: '3. User Accounts',
      content:
        `3.1 Registration: You must provide accurate, up-to-date information.\n3.2 Security: You're responsible for account activity.\n3.3 Eligibility: Must be 18+.`
    },
    {
      title: '4. Bill Swapping',
      content:
        `Billix offers a voluntary bill-swapping feature. Key points:\n- No Money Transmission\n- No Repayment Obligations\n- Limited Platform Mediation`
    },
    {
      title: '5. Proof of Payment',
      content:
        `Users may upload screenshots or receipts. Billix does not verify accuracy.`
    },
    {
      title: '6. User Data',
      content:
        `We may anonymize and use your data to improve the platform. PII is never sold without your consent.`
    },
    {
      title: '7. Billix Credits',
      content:
        `Credits are non-transferable, in-app rewards. They cannot be cashed out.`
    },
    {
      title: '8. Add-On Services',
      content:
        `Optional services like Priority Matching or Public Posting are subject to change.`
    },
    {
      title: '9. Promotional Rewards',
      content:
        `Billix may offer things like a spinning rewards wheel. Perks are non-cash.`
    },
    {
      title: '10. Chat Policy',
      content:
        `Don’t use chat for harassment or fraud. Messages may be monitored for safety.`
    },
    {
      title: '11. Referrals',
      content:
        `Earn points by inviting others. Abuse of the system may void rewards.`
    },
    {
      title: '12. Third Parties',
      content:
        `We use services like Stripe and Twilio. You agree to their terms.`
    },
    {
      title: '13. Termination',
      content:
        `Billix may suspend or terminate users for violations or fraud.`
    },
    {
      title: '14. Limitation of Liability',
      content:
        `We’re not liable for indirect damages or losses.`
    },
    {
      title: '15. Privacy',
      content:
        `You agree to our Privacy Policy.`
    },
    {
      title: '16. Prohibited Uses',
      content:
        `No scraping, impersonation, or disruption allowed.`
    },
    {
      title: '17. IP & Ownership',
      content:
        `You may not reuse our branding or platform code.`
    },
    {
      title: '18. No Warranties',
      content:
        `Billix is provided "as is" with no guarantees.`
    },
    {
      title: '19. Governing Law',
      content:
        `Michigan law governs. Disputes are resolved in Wayne County, MI.`
    },
    {
      title: '20. Changes',
      content:
        `We may modify these terms. Continued use = acceptance.`
    },
    {
      title: '21. Survivability',
      content:
        `Some terms continue after account deletion (e.g., privacy, liability).`
    },
    {
      title: '22. Contact',
      content:
        `Reach us at info@billixapp.com for questions.`
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Billix Terms of Service</Text>

        {sections.map((section, index) => {
          const isOpen = openIndex === index;
          return (
            <View key={index} style={styles.cardContainer}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleSection(index)}
              >
                <Text style={styles.question}>{section.title}</Text>
                <Text style={styles.arrow}>{isOpen ? '↑' : '↓'}</Text>
              </TouchableOpacity>
              <Collapsible collapsed={!isOpen}>
                <View style={styles.cardBody}>
                  <Text style={styles.answer}>{section.content}</Text>
                </View>
              </Collapsible>
            </View>
          );
        })}

        <Text style={styles.header}>Billix Privacy Policy</Text>
        <View style={styles.cardBody}>
        <View style={styles.policySection}>
  <Text style={styles.policyTitle}>Billix Privacy Policy</Text>
  <Text style={styles.policySubheading}>Effective Date: May 2025</Text>

  <Text style={styles.policyHeading}>1. Overview</Text>
  <Text style={styles.policyText}>
    At Billix, we prioritize your privacy. This Privacy Policy outlines how we collect, use, and share your information when you use our services. By accessing or using the Billix platform, you agree to the terms of this Privacy Policy.
  </Text>

  <Text style={styles.policyHeading}>2. Information We Collect</Text>
  <Text style={styles.policySubheading}>2.1 Information You Provide</Text>
  <Text style={styles.policyText}>- Account Information: Name, email, phone number, and other details{"\n"}- Bill Data: Uploaded bill info like amounts and due dates{"\n"}- Communications: Messages and support chats</Text>

  <Text style={styles.policySubheading}>2.2 Information We Collect Automatically</Text>
  <Text style={styles.policyText}>- Usage Data: Navigation and feature usage{"\n"}- Device Info: IP, OS, browser, etc.{"\n"}- Cookies & Tracking: For analytics and personalization</Text>

  <Text style={styles.policyHeading}>3. How We Use Your Information</Text>
  <Text style={styles.policyText}>To provide, improve, secure, and personalize the platform; communicate with users; and offer promotions.</Text>

  <Text style={styles.policyHeading}>4. Sharing of Information</Text>
  <Text style={styles.policyText}>We do not sell your data. Info may be shared with service providers, authorities (if required), or during business transfers.</Text>

  <Text style={styles.policyHeading}>5. Your Rights</Text>
  <Text style={styles.policyText}>Request access, correction, deletion, or processing restrictions by contacting info@billixapp.com.</Text>

  <Text style={styles.policyHeading}>6–11</Text>
  <Text style={styles.policyText}>
    6. Data is retained as long as needed.{"\n"}
    7. Users must be 18+.{"\n"}
    8. We use standard security protections.{"\n"}
    9. Changes will be posted. Continued use = acceptance.{"\n"}
    10. Contact: info@billixapp.com.{"\n"}
    11. Governed by Michigan law; disputes in Wayne County.
  </Text>
</View>
        </View>

        <TouchableOpacity style={styles.agreeButton} onPress={onAgree}>
          <Text style={styles.agreeButtonText}>I Agree</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsScreen;


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2FBF9',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
    color: '#00796B',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#E1F5F2',
  },
  question: {
    fontSize: 16,
    color: '#2F5D4A',
    fontWeight: '600',
    flexShrink: 1,
    paddingRight: 8,
  },
  arrow: {
    fontSize: 18,
    color: '#4A7C59',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  answer: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  agreeButton: {
    marginTop: 30,
    backgroundColor: '#00695C',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  agreeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  policySection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderColor: '#DFF5E1',
    borderWidth: 1,
  },
  policyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 8,
    textAlign: 'center',
  },
  policySubheading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00796B',
    marginTop: 12,
    marginBottom: 4,
  },
  policyHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F5D4A',
    marginTop: 14,
  },
  policyText: {
    fontSize: 14,
    color: '#3B3B3B',
    lineHeight: 22,
    marginTop: 4,
  },
  
});
