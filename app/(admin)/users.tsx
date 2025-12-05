import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { UserCard } from '../../src/components/UserCard';
import { SkeletonList } from '../../src/components/ui/LoadingSpinner';
import { useUsersWithStats } from '../../src/hooks/useUsers';
import { colors } from '../../src/theme/colors';

export default function AdminUsersScreen() {
  const { data: users, isLoading, refetch, isRefetching } = useUsersWithStats();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users?.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <SkeletonList count={5} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.secondary[500]} />
          <TextInput
            placeholder="Cerca utenti..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor={colors.secondary[400]}
          />
          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.secondary[400]}
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>

      {/* Users Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredUsers?.length ?? 0} utenti trovati
        </Text>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserCard user={item} showActions={true} />}
        contentContainerStyle={[
          styles.listContent,
          (filteredUsers?.length ?? 0) === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.secondary[300]} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Nessun utente trovato' : 'Nessun utente'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.purple[700]]}
            tintColor={colors.purple[700]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary[50],
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[100],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.secondary[900],
    fontSize: 16,
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[100],
  },
  countText: {
    color: colors.secondary[500],
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    color: colors.secondary[400],
    fontSize: 18,
    marginTop: 16,
  },
});
