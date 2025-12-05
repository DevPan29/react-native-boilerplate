import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TodoList } from '../../src/components/TodoList';
import { useTodos, useTodoStats } from '../../src/hooks/useTodos';
import { useProfile } from '../../src/store/authStore';
import { colors } from '../../src/theme/colors';

export default function HomeScreen() {
  const profile = useProfile();
  const { data: todos, isLoading, refetch, isRefetching } = useTodos();
  const { data: stats } = useTodoStats();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Stats */}
      <View style={styles.headerStats}>
        <Text style={styles.greeting}>
          {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Utente'}!
        </Text>

        {stats && (
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardYellow]}>
              <Text style={styles.statCardValue}>{stats.pending}</Text>
              <Text style={styles.statCardLabel}>In attesa</Text>
            </View>
            <View style={[styles.statCard, styles.statCardBlue]}>
              <Text style={[styles.statCardValue, styles.statCardValueBlue]}>
                {stats.in_progress}
              </Text>
              <Text style={[styles.statCardLabel, styles.statCardLabelBlue]}>
                In corso
              </Text>
            </View>
            <View style={[styles.statCard, styles.statCardGreen]}>
              <Text style={[styles.statCardValue, styles.statCardValueGreen]}>
                {stats.completed}
              </Text>
              <Text style={[styles.statCardLabel, styles.statCardLabelGreen]}>
                Completati
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Todo List */}
      <TodoList
        todos={todos ?? []}
        isLoading={isLoading}
        isRefetching={isRefetching}
        onRefresh={refetch}
        showFilters={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary[50],
  },
  headerStats: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[100],
  },
  greeting: {
    color: colors.secondary[500],
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: -4,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    padding: 12,
  },
  statCardYellow: {
    backgroundColor: colors.warning[50],
  },
  statCardBlue: {
    backgroundColor: colors.primary[50],
  },
  statCardGreen: {
    backgroundColor: colors.success[50],
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.warning[600],
  },
  statCardValueBlue: {
    color: colors.primary[600],
  },
  statCardValueGreen: {
    color: colors.success[600],
  },
  statCardLabel: {
    fontSize: 12,
    color: colors.warning[700],
  },
  statCardLabelBlue: {
    color: colors.primary[700],
  },
  statCardLabelGreen: {
    color: colors.success[700],
  },
});
