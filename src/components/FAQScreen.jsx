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
      'Billix is a bill-swapping marketplace where users help pay each other’s bills through structured mutual support instead of loans or donations.',
  },
  {
    question: 'How does Billix work?',
    answer:
      'You upload a bill and confirm that you’ve helped someone else first. Others can then contribute toward your bill through the Billix system.',
  },
  {
    question: 'Do I need to pay to use Billix?',
    answer:
      'No monthly fees. Just a small service fee is taken per successful transaction.',
  },
  {
    question: 'What is a Starter Swap?',
    answer:
      'It’s your first action in Billix — you help cover a small part of someone else’s bill to unlock the ability to upload your own.',
  },
  {
    question: 'What types of bills are allowed?',
    answer:
      'Any bill with a provider that allows one-time payments on behalf of someone else. This includes utilities, rent, phone, internet, and more.',
  },
  {
    question: 'How does Billix ensure trust?',
    answer:
      'We use a Billix Trust Score, identity verification, chat safety tools, and a transparent review system.',
  },
  {
    question: 'How do I pay someone’s bill?',
    answer:
      'Tap a bill card, view the details, and drag it into the Pay Now area. Billix handles the rest.',
  },
  {
    question: 'Where does the payment go?',
    answer:
      'Billix sends the payment directly to the bill provider using their one-time payment system. We never hold your money.',
  },
  {
    question: 'Can I cancel my payment?',
    answer:
      'Once a bill is paid, it’s final because the money goes directly to the bill provider.',
  },
  {
    question: 'What happens if my bill doesn’t get fully funded?',
    answer:
      'You can try again or apply Billix Credits toward your next attempt.',
  },
  {
    question: 'What are Billix Credits?',
    answer:
      'They are reward credits you earn through actions like Starter Swaps, voting, and streaks, which can be used toward future bills.',
  },
  {
    question: 'What is a Bill Cap?',
    answer:
      'It’s a financial reward where Billix agrees to cap one of your future bills up to a specific amount.',
  },
  {
    question: 'What is a Deferred Bill?',
    answer:
      'A reward that lets you skip one bill and delay it for up to 30 days without consequences.',
  },
  {
    question: 'How can I earn rewards?',
    answer:
      'Help others, win bids, build your Trust Score, complete tasks, and maintain a good streak.',
  },
  {
    question: 'What is a streak in Billix?',
    answer:
      'Helping or voting daily builds a streak. Longer streaks unlock better rewards.',
  },
  {
    question: 'How do I verify my identity?',
    answer:
      'Billix uses Stripe Identity to quickly and securely verify who you are.',
  },
  {
    question: 'Is Billix safe?',
    answer:
      'Yes. We use Stripe, encrypted data, and direct payments to ensure safety and transparency.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'No. Because your payment goes directly to the bill provider, all transactions are final.',
  },
  {
    question: 'What if a user scams me?',
    answer:
      'Use the Report and Block tools. Billix investigates each case and bans repeat offenders.',
  },
  {
    question: 'How do I know a bill is real?',
    answer:
      'We manually verify bill uploads and provider info before listing them for others.',
  },
  {
    question: 'Why do I need to help someone before uploading?',
    answer:
      'This builds trust, fairness, and keeps the system moving forward.',
  },
  {
    question: 'Can I help more than one person?',
    answer:
      'Absolutely. You can support as many bills as you’d like and earn more credits and rewards.',
  },
  {
    question: 'Is Billix available nationwide?',
    answer:
      'Yes, as long as the bill provider allows one-time payments.',
  },
  {
    question: 'What if my provider doesn’t accept one-time payments?',
    answer:
      'Unfortunately, that bill can’t be uploaded to Billix right now.',
  },
  {
    question: 'What is the Bill Marketplace?',
    answer:
      'It’s a live feed of bills you can browse, vote on, or contribute to.',
  },
  {
    question: 'Can I message someone before helping them?',
    answer:
      'Yes. Each bill has an integrated chat so you can ask questions or confirm details.',
  },
  {
    question: 'Do I need a bank account?',
    answer:
      'No. You can pay directly with a card or other available payment methods.',
  },
  {
    question: 'What payment methods are supported?',
    answer:
      'Stripe supports credit, debit, ACH, and digital wallets in most cases.',
  },
  {
    question: 'Is Billix a charity?',
    answer:
      'No. Billix is a structured mutual-support marketplace, not a nonprofit or donation platform.',
  },
  {
    question: 'Can companies use Billix?',
    answer:
      'Right now, Billix is built for individuals, but company use cases are being explored.',
  },
  {
    question: 'What are Bill Shares?',
    answer:
      'In the future, users may invest in Bill Shares to reduce costs or earn future credits.',
  },
  {
    question: 'What happens if I stop using the app?',
    answer:
      'Nothing bad — but you’ll miss out on streaks, rewards, and support.',
  },
  {
    question: 'How do I invite friends?',
    answer:
      'Use the Invite Friends option on the Home screen and earn referral bonuses.',
  },
  {
    question: 'Can I choose who helps me?',
    answer:
      'Not directly, but you can chat with contributors once your bill is live.',
  },
  {
    question: 'What does Billix do with my bill info?',
    answer:
      'Only verified staff see full info. It’s used only to ensure accuracy and process payment securely.',
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
