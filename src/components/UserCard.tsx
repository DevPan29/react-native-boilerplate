import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Profile, UserRole } from '../types';
import { formatDate, getInitials } from '../utils/helpers';
import { useUpdateUserRole } from '../hooks/useUsers';
import { colors } from '../theme/colors';

interface UserCardProps {
  user: Profile & {
    todoStats?: {
      total: number;
      completed: number;
    };
  };
  onPress?: () => void;
  showActions?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onPress,
  showActions = true,
}) => {
  const updateRole = useUpdateUserRole();

  const handleRoleChange = () => {
    const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';

    Alert.alert(
      'Cambia ruolo',
      `Vuoi cambiare il ruolo di ${user.full_name || user.email} a ${newRole === 'admin' ? 'Amministratore' : 'Utente'}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Conferma',
          onPress: () => {
            updateRole.mutate({
              userId: user.id,
              role: newRole,
            });
          },
        },
      ]
    );
  };

  const completionRate =
    user.todoStats && user.todoStats.total > 0
      ? Math.round((user.todoStats.completed / user.todoStats.total) * 100)
      : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.card}
    >
      <View style={styles.header}>
        {/* Avatar */}
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {getInitials(user.full_name)}
            </Text>
          </View>
        )}

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>
              {user.full_name || 'Utente'}
            </Text>
            {user.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Role Toggle Button */}
        {showActions && (
          <TouchableOpacity
            onPress={handleRoleChange}
            disabled={updateRole.isPending}
            style={[
              styles.roleButton,
              user.role === 'admin' && styles.roleButtonAdmin,
            ]}
          >
            <Ionicons
              name={user.role === 'admin' ? 'shield' : 'shield-outline'}
              size={20}
              color={user.role === 'admin' ? colors.purple[700] : colors.secondary[500]}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      {user.todoStats && (
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Todo Totali</Text>
            <Text style={styles.statValue}>{user.todoStats.total}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Completati</Text>
            <Text style={[styles.statValue, styles.statValueGreen]}>
              {user.todoStats.completed}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Completamento</Text>
            <Text style={[styles.statValue, styles.statValueBlue]}>
              {completionRate}%
            </Text>
          </View>
        </View>
      )}

      {/* Join Date */}
      <View style={styles.footer}>
        <Ionicons name="calendar-outline" size={14} color={colors.secondary[400]} />
        <Text style={styles.footerText}>
          Iscritto il {formatDate(user.created_at)}
        </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[600],
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary[900],
  },
  adminBadge: {
    marginLeft: 8,
    backgroundColor: colors.purple[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.purple[700],
  },
  userEmail: {
    color: colors.secondary[500],
    fontSize: 14,
  },
  roleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.secondary[100],
  },
  roleButtonAdmin: {
    backgroundColor: colors.purple[100],
  },
  stats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.secondary[100],
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: colors.secondary[400],
    fontSize: 12,
  },
  statValue: {
    color: colors.secondary[900],
    fontWeight: '600',
  },
  statValueGreen: {
    color: colors.success[600],
  },
  statValueBlue: {
    color: colors.primary[600],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    color: colors.secondary[400],
    fontSize: 12,
    marginLeft: 4,
  },
});
