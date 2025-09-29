import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { useNavigation } from '@react-navigation/native';

const faqData = [
  {
    question: 'What is Billix?',
    answer:
      'Billix is a peer-to-peer bill support platform where users help cover each other’s bills through structured swaps and earn Billix Credits—offering an alternative to loans, donations, or crowdfunding.',
  },
  {
    question: 'How does Billix work?',
    answer:
      'You upload a bill, and Billix automatically matches you with another user based on factors like your bill amount, due date, trust score, and other relevant details. If a match accepts, they can contribute toward your bill—and may earn Billix Credits or other rewards in return.',
  },
  {
    question: 'Do I need to pay to use Billix?',
    answer:
      'Billix is free to use with no monthly fees. You only pay if you choose to purchase optional add-ons like Priority Matching, Bill Insurance, or Public Posting.',
  },
  {
    question: 'What types of bills are allowed?',
    answer:
      'Billix supports a wide range of bills—like rent, utilities, phone, internet, insurance, subscriptions, and more—as long as the provider accepts one-time or guest payments. If it’s a real bill with a verifiable company, you can likely upload it.',
  },
  {
    question: 'How do I get matched after uploading a bill?',
    answer:
      'Once you upload a bill, Billix automatically searches for a compatible match based on your bill details, trust score, and availability in the system.',
  },
  {
    question: 'Where does my payment go?',
    answer:
      'Billix doesn’t handle or route any money. Once you’re matched, it’s up to you and your partner to agree on how the bill will be paid—usually through the bill provider’s guest payment portal or another verified method.',
  },
  {
    question: 'How do I pay someone’s bill?',
    answer:
      'Once matched, you’ll chat with the other user and agree on how to pay their bill—typically by using the provider’s guest payment portal or another method you both trust. Billix helps you coordinate but doesn’t process payments.',
  },
  {
    question: 'Can I cancel my payment?',
    answer:
      'Once you agree to a swap and send payment, it’s considered final since Billix does not process or control the funds. If you haven’t paid yet but want to cancel, contact us directly. If you have Bill Insurance, you may be protected in cases where your match fails to follow through.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'No. Since Billix does not handle payments, all transactions are final and managed directly between users. For the best protection, we recommend purchasing Bill Insurance, which offers limited coverage if your match fails to follow through.',
  },
  {
    question: 'What if there’s an issue with my match?',
    answer:
      'If you encounter a problem, use the in-app Report or Block tools. Our team reviews all reports and may take action if a user violates our guidelines. Bill Insurance is also available for added peace of mind in case a swap falls through.',
  },
  {
    question: 'How does Billix ensure trust?',
    answer:
      'Billix helps build trust through verified profiles, Trust Scores, user reviews, and secure chat tools. While we don’t handle payments, we give you the tools to assess and communicate with your match confidently.',
  },
  {
    question: 'Is Billix safe?',
    answer:
      'Yes. Billix uses encrypted infrastructure, verified user profiles, trust scoring, and in-app reporting tools to help keep the community secure. While we don’t handle payments, we give you the tools to communicate, verify, and manage swaps safely.',
  },
  {
    question: 'What are Billix Credits?',
    answer:
      'Billix Credits are rewards you earn by helping others, staying active, voting, and completing tasks. You can apply them toward future bills or use them to unlock add-ons like Priority Matching or Public Posting.',
  },
  {
    question: 'What is a Bill Cap?',
    answer:
      'A Bill Cap is a special reward that reduces the amount you owe on a future bill, up to a set limit. It’s unlocked through sustained contribution or specific platform milestones.',
  },
  {
    question: 'What is a Deferred Bill?',
    answer:
      'A Deferred Bill is a reward that allows you to delay the due date of a future bill, giving you up to 30 extra days to get help before action is required. It’s only available through Billix Credits or limited-time events.',
  },
  {
    question: 'How can I earn rewards?',
    answer:
      'You earn rewards by helping others, getting matched successfully, completing challenges, building your Trust Score, and keeping up a daily activity streak. The more consistent you are, the more you unlock—like Credits, boosts, or even bill-reduction perks.',
  },
  {
    question: 'What is a streak in Billix?',
    answer:
      'A streak is built by taking daily actions—like helping, voting, or chatting with matches. The longer your streak, the better your chances at unlocking exclusive rewards and higher-tier benefits.',
  },
  {
    question: 'What happens if my bill doesn’t get fully funded?',
    answer:
      'If your bill isn’t matched or fully funded, you can try again, apply Billix Credits, or use the Public Posting add-on to boost visibility and attract more contributors.',
  },
  {
    question: 'What is Priority Matching?',
    answer:
      'It’s an optional add-on that moves your bill higher in the match queue, helping you get connected with contributors faster.',
  },
  {
    question: 'What is Bill Insurance?',
    answer:
      'This add-on offers limited coverage in case your matched contributor doesn’t follow through—helping reduce your risk.',
  },
  {
    question: 'What is Public Posting?',
    answer:
      'Public Posting makes your bill visible in the Bill Marketplace, giving it more exposure and increasing your chances of getting help.',
  },
  {
    question: 'What is the Bill Marketplace?',
    answer:
      'The Bill Marketplace is where you can browse live bills from other users. Just tap “Start by Helping One” and pick a bill to support. You can view details, chat with the user, and decide if you want to help.',
  },
  {
    question: 'Can I message someone before helping them?',
    answer:
      'Yes. Once you’re matched, you can use the in-app chat to ask questions, confirm bill details, or coordinate how payment will be made.',
  },
  {
    question: 'Can I choose who helps me?',
    answer:
      'Matches are made automatically based on your bill details and Trust Score, but once matched, you can chat with your partner to coordinate and ask questions.',
  },
  {
    question: 'Can I help more than one person?',
    answer:
      'Absolutely. You can support as many bills as you’d like and earn more credits and rewards.',
  },
  {
    question: 'How do I know a bill is real?',
    answer:
      'Billix uses provider checks, upload requirements, and trust signals to help verify bills before they’re listed. While we do our best to prevent fraud, users are encouraged to review bill details and communicate with their match directly.',
  },
  {
    question: 'Do I need a bank account?',
    answer:
      'No. Since Billix doesn’t process payments, you and your match can agree on any method that works—such as using a card on the bill provider’s website, a payment app, or another trusted option.',
  },
  {
    question: 'Is Billix a charity?',
    answer:
      'No. Billix is not a nonprofit or donation platform. It’s a structured peer-to-peer marketplace where users coordinate to help each other with bills through optional contributions and reward-based incentives.',
  },
  {
    question: 'Can companies use Billix?',
    answer:
      'Billix is currently designed for individual users looking to get or give help with personal bills. However, we’re exploring future features that may support nonprofits, local businesses, or employee assistance programs.',
  },
  {
    question: 'Can I post on behalf of someone else?',
    answer:
      'Right now, each Billix account is tied to an individual. If you want to help someone else, consider coordinating with them or contacting our team about group support.',
  },
  {
    question: 'Is Billix available nationwide?',
    answer:
      'Yes. Billix is available across the U.S. for most users, as long as the bill you upload is from a provider that accepts third-party or guest payments.',
  },
  {
    question: 'Can I use Billix outside the U.S.?',
    answer:
      'Currently, Billix is designed for users with U.S.-based bills and providers. International support may be considered in the future as we grow.',
  },
  {
    question: 'What happens if I stop using the app?',
    answer:
      'You won’t lose your account, but your streaks will reset and you may miss out on time-sensitive rewards, matching opportunities, or support requests. Staying active keeps your Trust Score and visibility strong.',
  },
  {
    question: 'How do I invite friends?',
    answer:
      'Just tap “Invite Friends” on the Home screen to share your unique link. When your friend signs up and participates, you both earn referral rewards.',
  },
  {
    question: 'What does Billix do with my bill info?',
    answer:
      'Your bill info is used to match you with contributors and ensure the listing is accurate. We may also use anonymized data to improve the platform and generate insights—but we never sell your personal information.',
  },
];

export const FAQScreen = () => {
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleIndex = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Billix FAQ</Text>

        {faqData.map((item, index) => {
          const isOpen = activeIndex === index;
          return (
            <View key={index} style={styles.cardContainer}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleIndex(index)}
              >
                <Text style={styles.question}>{item.question}</Text>
                <Text style={styles.arrow}>{isOpen ? '↑' : '↓'}</Text>
              </TouchableOpacity>
              <Collapsible collapsed={!isOpen}>
                <View style={styles.cardBody}>
                  <Text style={styles.answer}>{item.answer}</Text>
                </View>
              </Collapsible>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8EC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  backContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 6,
  },
  backText: {
    fontSize: 15,
    color: '#4A7C59',
    fontWeight: '600',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    color: '#4A7C59',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#DFF5E1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    color: '#2F5D4A',
    fontWeight: '600',
    flexShrink: 1,
    paddingRight: 10,
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
    color: '#3b3b3b',
    lineHeight: 22,
  },
});

export default FAQScreen;
