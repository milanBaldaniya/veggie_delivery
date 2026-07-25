import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Phone, MessageCircle, Mail, Clock, ChevronDown } from 'lucide-react-native';
import { Header, ListItem, Loader, EmptyState } from '../../components/common';
import { colors, spacing, radius, typography } from '../../theme';
import { fetchSupport } from '../../redux/slices/supportSlice';

function IconBadge({ Icon, color }) {
  return (
    <View style={[styles.iconBadge, { backgroundColor: `${color}18` }]}>
      <Icon size={20} color={color} />
    </View>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable style={styles.faqItem} onPress={() => setOpen((v) => !v)}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <ChevronDown
          size={18}
          color={colors.textSecondary}
          style={open ? styles.faqChevronOpen : undefined}
        />
      </View>
      {open ? <Text style={styles.faqAnswer}>{answer}</Text> : null}
    </Pressable>
  );
}

// Every field here is optional (admin-managed via Settings > Support) — the
// screen renders only the sections that have content, rather than assuming
// call/WhatsApp/email/FAQs are all always filled in.
export default function SupportScreen({ navigation }) {
  const dispatch = useDispatch();
  const { settings, status } = useSelector((state) => state.support);

  useEffect(() => {
    dispatch(fetchSupport());
  }, [dispatch]);

  if (status === 'loading' && !settings) {
    return (
      <View style={styles.container}>
        <Header title="Help & Support" onBack={() => navigation.goBack()} />
        <Loader />
      </View>
    );
  }

  const whatsappUrl = settings?.whatsappLink
    ? settings.whatsappLink
    : settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`
    : null;

  const faqs = settings?.faqs || [];
  const hasContact = !!(settings?.callNumber || whatsappUrl || settings?.email);
  const hasAnything = hasContact || faqs.length > 0;

  return (
    <View style={styles.container}>
      <Header title="Help & Support" onBack={() => navigation.goBack()} />

      {!hasAnything ? (
        <EmptyState
          title="Support info coming soon"
          message="Contact details and FAQs haven't been set up yet."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {hasContact ? (
            <>
              <Text style={styles.sectionLabel}>Contact us</Text>
              <View style={styles.card}>
                {settings.callNumber ? (
                  <>
                    <ListItem
                      title="Call support"
                      subtitle={settings.callNumber}
                      left={<IconBadge Icon={Phone} color={colors.primary} />}
                      onPress={() => Linking.openURL(`tel:${settings.callNumber}`)}
                    />
                    {whatsappUrl || settings.email ? <View style={styles.divider} /> : null}
                  </>
                ) : null}
                {whatsappUrl ? (
                  <>
                    <ListItem
                      title="WhatsApp us"
                      subtitle="Chat with our support team"
                      left={<IconBadge Icon={MessageCircle} color="#25D366" />}
                      onPress={() => Linking.openURL(whatsappUrl)}
                    />
                    {settings.email ? <View style={styles.divider} /> : null}
                  </>
                ) : null}
                {settings.email ? (
                  <ListItem
                    title="Email us"
                    subtitle={settings.email}
                    left={<IconBadge Icon={Mail} color={colors.info} />}
                    onPress={() => Linking.openURL(`mailto:${settings.email}`)}
                  />
                ) : null}
              </View>

              {settings.hours ? (
                <View style={styles.hoursRow}>
                  <Clock size={14} color={colors.textSecondary} />
                  <Text style={styles.hoursText}>{settings.hours}</Text>
                </View>
              ) : null}
            </>
          ) : null}

          {faqs.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>Frequently asked questions</Text>
              <View style={styles.card}>
                {faqs.map((item, idx) => (
                  <React.Fragment key={item.id || item.question}>
                    {idx > 0 ? <View style={styles.divider} /> : null}
                    <FaqItem question={item.question} answer={item.answer} />
                  </React.Fragment>
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  sectionLabel: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.md + 40 + spacing.sm,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  hoursText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  faqItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  faqQuestion: {
    ...typography.bodyBold,
    flex: 1,
  },
  faqChevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  faqAnswer: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
