import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, Check } from 'lucide-react-native';
import { colors, spacing, radius, typography } from '../../theme';
import { fetchBuildings } from '../../redux/slices/buildingsSlice';
import ListItem from './ListItem';
import EmptyState from './EmptyState';

// Full-screen searchable picker for the building/society directory. Buildings
// are added only by the admin (see admin/buildings) — customers pick from
// this list and can't type an arbitrary name; the backend enforces the same
// rule on PUT /customers/me in case the app is bypassed.
export default function BuildingPicker({ visible, onClose, onSelect, value }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { buildings, status } = useSelector((state) => state.buildings);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => {
      dispatch(fetchBuildings({ search: query }));
    }, 350);
    return () => clearTimeout(timer);
  }, [query, visible, dispatch]);

  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  const handleSelect = (name) => {
    onSelect(name);
    onClose();
  };

  const trimmedQuery = query.trim();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Select building / society</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your building or society"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          data={buildings}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            status === 'loading' ? (
              <ActivityIndicator style={styles.loader} color={colors.primary} />
            ) : (
              <EmptyState
                title="No buildings found"
                message={
                  trimmedQuery
                    ? 'Nothing matches your search. Ask your society admin to get it added.'
                    : 'No societies have been added yet. Please check back soon.'
                }
              />
            )
          }
          renderItem={({ item }) => (
            <ListItem
              title={item.name}
              subtitle={item.area || undefined}
              onPress={() => handleSelect(item.name)}
              right={value === item.name ? <Check size={18} color={colors.primary} /> : null}
            />
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { ...typography.h3 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    padding: 0,
  },
  listContent: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },
});
