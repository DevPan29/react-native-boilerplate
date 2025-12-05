import { Stack } from 'expo-router';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: colors.white,
        headerTitleStyle: styles.headerTitle,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="users" options={{ title: 'Gestione Utenti' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.purple[700],
  },
  headerTitle: {
    fontWeight: '700',
  },
  backButton: {
    marginRight: 16,
  },
});
