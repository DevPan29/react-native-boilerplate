import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useIsAdmin } from '../../src/store/authStore';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function AppLayout() {
  const isAdmin = useIsAdmin();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.secondary[400],
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerRight: () =>
          isAdmin ? (
            <TouchableOpacity
              onPress={() => router.push('/(admin)')}
              style={styles.adminButton}
            >
              <View style={styles.adminButtonInner}>
                <Ionicons name="shield" size={20} color={colors.purple[700]} />
              </View>
            </TouchableOpacity>
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'I miei Todo',
          tabBarLabel: 'Todo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="todo/create"
        options={{
          title: 'Nuovo Todo',
          tabBarLabel: 'Aggiungi',
          tabBarIcon: ({ size }) => (
            <View style={styles.addButton}>
              <Ionicons name="add" size={size} color={colors.white} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilo',
          tabBarLabel: 'Profilo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="todo/[id]"
        options={{
          href: null,
          title: 'Dettaglio Todo',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.secondary[100],
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    backgroundColor: colors.white,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[100],
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.secondary[800],
  },
  adminButton: {
    marginRight: 16,
  },
  adminButtonInner: {
    backgroundColor: colors.purple[100],
    padding: 8,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 20,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -32
    
  },
});
