import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Todo } from '../types';
import {
  formatRelativeTime,
  getStatusColors,
  getStatusLabel,
  getPriorityColors,
  getPriorityLabel,
  isOverdue,
  isDueSoon,
  formatDate,
} from '../utils/helpers';
import { useToggleTodoStatus, useDeleteTodo } from '../hooks/useTodos';
import { colors } from '../theme/colors';

interface TodoCardProps {
  todo: Todo;
  onPress?: () => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({ todo, onPress }) => {
  const toggleStatus = useToggleTodoStatus();
  const deleteTodo = useDeleteTodo();

  const isCompleted = todo.status === 'completed';
  const overdue = !isCompleted && isOverdue(todo.due_date);
  const dueSoon = !isCompleted && !overdue && isDueSoon(todo.due_date);

  const statusColors = getStatusColors(todo.status);
  const priorityColors = getPriorityColors(todo.priority);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(app)/todo/${todo.id}`);
    }
  };

  const handleToggleStatus = () => {
    toggleStatus.mutate({
      id: todo.id,
      currentStatus: todo.status,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Elimina Todo',
      'Sei sicuro di voler eliminare questo todo?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Elimina', style: 'destructive', onPress: () => deleteTodo.mutate(todo.id) },
      ]
    );
  };

  const getDueDateColors = () => {
    if (overdue) return { bg: colors.danger[100], text: colors.danger[700] };
    if (dueSoon) return { bg: colors.warning[100], text: colors.warning[700] };
    return { bg: colors.secondary[100], text: colors.secondary[600] };
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.card, isCompleted && styles.cardCompleted]}
    >
      <View style={styles.cardContent}>
        {/* Checkbox */}
        {/* <TouchableOpacity
          onPress={handleToggleStatus}
          disabled={toggleStatus.isPending}
          style={styles.checkbox}
        >
          <View
            style={[
              styles.checkboxCircle,
              isCompleted && styles.checkboxCircleCompleted,
            ]}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            )}
          </View>
        </TouchableOpacity> */}

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {todo.title}
          </Text>

          {/* Description */}
          {todo.description && (
            <Text style={styles.description} numberOfLines={2}>
              {todo.description}
            </Text>
          )}

          {/* Image Preview */}
          {todo.image_url && (
            <Image
              source={{ uri: todo.image_url }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          )}

          {/* Tags row */}
          <View style={styles.tagsRow}>
            {/* Status Badge */}
            <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.badgeText, { color: statusColors.text }]}>
                {getStatusLabel(todo.status)}
              </Text>
            </View>

            {/* Priority Badge */}
            <View style={[styles.badge, { backgroundColor: priorityColors.bg }]}>
              <Text style={[styles.badgeText, { color: priorityColors.text }]}>
                {getPriorityLabel(todo.priority)}
              </Text>
            </View>

            {/* Due Date */}
            {todo.due_date && (
              <View style={[styles.badge, styles.dueDateBadge, { backgroundColor: getDueDateColors().bg }]}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={getDueDateColors().text}
                />
                <Text style={[styles.dueDateText, { color: getDueDateColors().text }]}>
                  {formatDate(todo.due_date)}
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.timestamp}>
              {formatRelativeTime(todo.created_at)}
            </Text>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleteTodo.isPending}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger[500]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.secondary[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 4,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.secondary[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleCompleted: {
    backgroundColor: colors.success[500],
    borderColor: colors.success[500],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary[900],
  },
  titleCompleted: {
    color: colors.secondary[400],
    textDecorationLine: 'line-through',
  },
  description: {
    color: colors.secondary[500],
    fontSize: 14,
    marginTop: 4,
  },
  imagePreview: {
    width: '100%',
    height: 128,
    borderRadius: 8,
    marginTop: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  timestamp: {
    color: colors.secondary[400],
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
});
