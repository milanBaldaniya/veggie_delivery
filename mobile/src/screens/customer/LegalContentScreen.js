import React, { useEffect } from 'react';
import { View, ScrollView, useWindowDimensions, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import RenderHtml from 'react-native-render-html';
import { Header, Loader, EmptyState } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { fetchLegalContent } from '../../redux/slices/legalSlice';

const HTML_TAG_STYLES = {
  body: { color: colors.textPrimary, fontSize: 14, lineHeight: 21 },
  p: { marginBottom: spacing.md },
  h1: { ...typography.h2, marginBottom: spacing.sm },
  h2: { ...typography.h3, marginBottom: spacing.sm },
  h3: { ...typography.bodyBold, fontSize: 15, marginBottom: spacing.sm },
  h4: { ...typography.bodyBold, marginBottom: spacing.sm },
  a: { color: colors.primary },
  li: { marginBottom: spacing.xs },
};

// Generic screen for any of the 4 admin-managed legal documents — content is
// fetched live so edits in the admin panel show up without an app release.
// route.params: { type: 'PRIVACY_POLICY' | 'TERMS_CONDITIONS' | 'RETURN_REFUND_POLICY' | 'ABOUT_US', title }
export default function LegalContentScreen({ navigation, route }) {
  const { type, title } = route.params;
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const entry = useSelector((state) => state.legal.byType[type]);
  const status = entry?.status || 'idle';
  const content = entry?.content;

  useEffect(() => {
    dispatch(fetchLegalContent(type));
  }, [dispatch, type]);

  return (
    <View style={styles.container}>
      <Header title={title} onBack={() => navigation.goBack()} />

      {status === 'loading' && !content ? (
        <Loader />
      ) : !content?.contentHtml ? (
        <EmptyState title={`${title} coming soon`} message="This page hasn't been published yet." />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <RenderHtml
            contentWidth={width - spacing.lg * 2}
            source={{ html: content.contentHtml }}
            tagsStyles={HTML_TAG_STYLES}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
});
