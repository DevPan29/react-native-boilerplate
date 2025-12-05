import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useAdminDashboardStats } from '../../src/hooks/useUsers';
import { colors } from '../../src/theme/colors';

export default function AdminDashboardScreen() {
  const { data: stats, isLoading, error } = useAdminDashboardStats();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Caricamento dashboard..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.danger[500]} />
        <Text style={styles.errorText}>Errore nel caricamento dei dati</Text>
      </SafeAreaView>
    );
  }

  const statCards = [
    { title: 'Utenti Totali', value: stats?.totalUsers ?? 0, icon: 'people', color: colors.primary[500], bgColor: colors.primary[50] },
    { title: 'Amministratori', value: stats?.totalAdmins ?? 0, icon: 'shield', color: colors.purple[500], bgColor: colors.purple[50] },
    { title: 'Todo Totali', value: stats?.totalTodos ?? 0, icon: 'checkbox', color: colors.success[500], bgColor: colors.success[50] },
    { title: 'In Attesa', value: stats?.pendingTodos ?? 0, icon: 'time', color: colors.warning[500], bgColor: colors.warning[50] },
    { title: 'In Corso', value: stats?.inProgressTodos ?? 0, icon: 'play', color: '#f97316', bgColor: '#fff7ed' },
    { title: 'Completati', value: stats?.completedTodos ?? 0, icon: 'checkmark-done', color: '#10b981', bgColor: '#ecfdf5' },
  ];

  const menuItems = [
    {
      title: 'Gestione Utenti',
      description: 'Visualizza e gestisci gli utenti',
      icon: 'people-outline',
      onPress: () => router.push('/(admin)/users'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Pannello Amministrazione</Text>
          <Text style={styles.welcomeSubtitle}>Gestisci utenti e monitora l'attività</Text>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Statistiche</Text>
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
                <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.white} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <Text style={styles.sectionTitle}>Azioni Rapide</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={24} color={colors.purple[700]} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondary[400]} />
          </TouchableOpacity>
        ))}

        {/* Completion Rate */}
        {stats && stats.totalTodos > 0 && (
          <View style={styles.completionSection}>
            <Text style={styles.completionTitle}>Tasso di Completamento Globale</Text>
            <View style={styles.completionRow}>
              <View style={styles.completionBarBg}>
                <View
                  style={[
                    styles.completionBarFill,
                    { width: `${Math.round((stats.completedTodos / stats.totalTodos) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.completionValue}>
                {Math.round((stats.completedTodos / stats.totalTodos) * 100)}%
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary[50],
  },
  scrollContent: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.secondary[600],
    marginTop: 16,
  },
  welcomeSection: {
    backgroundColor: colors.purple[600],
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  welcomeTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    color: colors.purple[100],
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.secondary[700],
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary[900],
  },
  statLabel: {
    color: colors.secondary[500],
    fontSize: 12,
  },
  menuItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    backgroundColor: colors.purple[100],
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemTitle: {
    color: colors.secondary[900],
    fontWeight: '600',
  },
  menuItemDescription: {
    color: colors.secondary[500],
    fontSize: 14,
  },
  completionSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  completionTitle: {
    color: colors.secondary[700],
    fontWeight: '600',
    marginBottom: 12,
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionBarBg: {
    flex: 1,
    height: 16,
    backgroundColor: colors.secondary[100],
    borderRadius: 8,
    overflow: 'hidden',
  },
  completionBarFill: {
    height: '100%',
    backgroundColor: colors.success[500],
    borderRadius: 8,
  },
  completionValue: {
    marginLeft: 12,
    color: colors.secondary[700],
    fontWeight: '700',
  },
});
