import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo, TodoStatus, TodoPriority } from '../types';
import { TodoCard } from './TodoCard';
import { SkeletonList } from './ui/LoadingSpinner';
import { colors } from '../theme/colors';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  emptyMessage?: string;
  showFilters?: boolean;
}

type FilterTab = 'all' | TodoStatus;

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  isLoading,
  isRefetching,
  onRefresh,
  emptyMessage = 'Nessun todo trovato',
  showFilters = true,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortByPriority, setSortByPriority] = useState(false);

  const filterTabs: { key: FilterTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'Tutti', icon: 'list' },
    { key: 'pending', label: 'In attesa', icon: 'time-outline' },
    { key: 'in_progress', label: 'In corso', icon: 'play-outline' },
    { key: 'completed', label: 'Completati', icon: 'checkmark-done-outline' },
  ];

  const filteredTodos = useMemo(() => {
    let result = [...todos];

    if (activeFilter !== 'all') {
      result = result.filter((todo) => todo.status === activeFilter);
    }

    if (sortByPriority) {
      const priorityOrder: Record<TodoPriority, number> = {
        high: 0,
        medium: 1,
        low: 2,
      };
      result.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    }

    return result;
  }, [todos, activeFilter, sortByPriority]);

  const stats = useMemo(() => {
    return {
      all: todos.length,
      pending: todos.filter((t) => t.status === 'pending').length,
      in_progress: todos.filter((t) => t.status === 'in_progress').length,
      completed: todos.filter((t) => t.status === 'completed').length,
    };
  }, [todos]);

  if (isLoading) {
    return <SkeletonList count={5} />;
  }

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {filterTabs.map((item) => {
          const isActive = activeFilter === item.key;
          const count = stats[item.key];

          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setActiveFilter(item.key)}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={isActive ? colors.white : colors.secondary[500]}
              />
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {item.label}
              </Text>
              <View style={[styles.filterTabBadge, isActive && styles.filterTabBadgeActive]}>
                <Text style={[styles.filterTabBadgeText, isActive && styles.filterTabBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          onPress={() => setSortByPriority(!sortByPriority)}
          style={[styles.sortButton, sortByPriority && styles.sortButtonActive]}
        >
          <Ionicons
            name="funnel-outline"
            size={14}
            color={sortByPriority ? colors.primary[600] : colors.secondary[500]}
          />
          <Text style={[styles.sortButtonText, sortByPriority && styles.sortButtonTextActive]}>
            Priorità
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="clipboard-outline" size={64} color={colors.secondary[300]} />
      <Text style={styles.emptyStateTitle}>{emptyMessage}</Text>
      <Text style={styles.emptyStateSubtitle}>
        {activeFilter !== 'all'
          ? 'Prova a cambiare filtro'
          : 'Aggiungi il tuo primo todo'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {showFilters && todos.length > 0 && renderFilterTabs()}

      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TodoCard todo={item} />}
        contentContainerStyle={[
          styles.listContent,
          filteredTodos.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={[colors.primary[600]]}
            tintColor={colors.primary[600]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.secondary[100],
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: colors.primary[600],
  },
  filterTabText: {
    marginLeft: 8,
    fontWeight: '500',
    color: colors.secondary[600],
  },
  filterTabTextActive: {
    color: colors.white,
  },
  filterTabBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.secondary[200],
  },
  filterTabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterTabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary[600],
  },
  filterTabBadgeTextActive: {
    color: colors.white,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.secondary[50],
  },
  sortButtonActive: {
    backgroundColor: colors.primary[100],
  },
  sortButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.secondary[600],
  },
  sortButtonTextActive: {
    color: colors.primary[600],
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
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
  emptyStateTitle: {
    color: colors.secondary[400],
    fontSize: 18,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    color: colors.secondary[300],
    fontSize: 14,
    marginTop: 4,
  },
});
