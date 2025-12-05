import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { AvatarPicker } from '../../src/components/ui/ImagePicker';
import { useProfile } from '../../src/store/authStore';
import { useUpdateProfile, useSignOut } from '../../src/hooks/useAuth';
import { useTodoStats } from '../../src/hooks/useTodos';
import { useImageUpload } from '../../src/hooks/useImageUpload';
import { formatDate, getErrorMessage } from '../../src/utils/helpers';
import { colors } from '../../src/theme/colors';

export default function ProfileScreen() {
  const profile = useProfile();
  const { data: stats } = useTodoStats();
  const updateProfile = useUpdateProfile();
  const signOut = useSignOut();
  const { pickImage, takePhoto, uploadImage, isUploading } = useImageUpload({
    bucket: 'avatars',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');

  const handlePickImage = async () => {
    const result = await pickImage();
    if (result) {
      try {
        const uploadedUrl = await uploadImage(result.uri);
        await updateProfile.mutateAsync({ avatar_url: uploadedUrl });
      } catch (error) {
        Alert.alert('Errore', getErrorMessage(error));
      }
    }
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result) {
      try {
        const uploadedUrl = await uploadImage(result.uri);
        await updateProfile.mutateAsync({ avatar_url: uploadedUrl });
      } catch (error) {
        Alert.alert('Errore', getErrorMessage(error));
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ full_name: fullName.trim() });
      setIsEditing(false);
      Alert.alert('Successo', 'Profilo aggiornato!');
    } catch (error) {
      Alert.alert('Errore', getErrorMessage(error));
    }
  };

  const handleSignOut = () => {
    Alert.alert('Esci', 'Sei sicuro di voler uscire?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Esci', style: 'destructive', onPress: () => signOut.mutate() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <AvatarPicker
              avatarUrl={profile?.avatar_url}
              name={profile?.full_name}
              onPickImage={handlePickImage}
              onTakePhoto={handleTakePhoto}
              isLoading={isUploading}
              size="lg"
            />

            <Text style={styles.userName}>{profile?.full_name || 'Utente'}</Text>
            <Text style={styles.userEmail}>{profile?.email}</Text>

            {profile?.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Amministratore</Text>
              </View>
            )}
          </View>

          {/* Stats Section */}
          {stats && (
            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>Le tue statistiche</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Totali</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, styles.statValueGreen]}>
                    {stats.completed}
                  </Text>
                  <Text style={styles.statLabel}>Completati</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, styles.statValueBlue]}>
                    {stats.total > 0
                      ? Math.round((stats.completed / stats.total) * 100)
                      : 0}
                    %
                  </Text>
                  <Text style={styles.statLabel}>Completamento</Text>
                </View>
              </View>
            </View>
          )}

          {/* Edit Profile Section */}
          <View style={styles.editSection}>
            <View style={styles.editSectionHeader}>
              <Text style={styles.editSectionTitle}>Informazioni personali</Text>
              {!isEditing && (
                <Button
                  title="Modifica"
                  variant="ghost"
                  size="sm"
                  onPress={() => setIsEditing(true)}
                />
              )}
            </View>

            <Input
              label="Nome completo"
              value={fullName}
              onChangeText={setFullName}
              editable={isEditing}
              placeholder="Il tuo nome"
            />

            <Input
              label="Email"
              value={profile?.email || ''}
              editable={false}
              hint="L'email non può essere modificata"
            />

            <View style={styles.memberSince}>
              <Text style={styles.memberSinceLabel}>Membro dal</Text>
              <Text style={styles.memberSinceValue}>
                {profile?.created_at ? formatDate(profile.created_at) : '-'}
              </Text>
            </View>

            {isEditing && (
              <View style={styles.editActions}>
                <Button
                  title="Annulla"
                  variant="outline"
                  onPress={() => {
                    setFullName(profile?.full_name || '');
                    setIsEditing(false);
                  }}
                  style={styles.editActionButton}
                />
                <Button
                  title="Salva"
                  onPress={handleSave}
                  isLoading={updateProfile.isPending}
                  style={styles.editActionButton}
                />
              </View>
            )}
          </View>

          {/* Sign Out */}
          <Button
            title="Esci"
            variant="danger"
            onPress={handleSignOut}
            isLoading={signOut.isPending}
            fullWidth
          />

          {/* App Version */}
          <Text style={styles.appVersion}>Todo App v1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary[50],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  avatarSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary[900],
    marginTop: 16,
  },
  userEmail: {
    color: colors.secondary[500],
  },
  adminBadge: {
    marginTop: 8,
    backgroundColor: colors.purple[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: colors.purple[700],
    fontWeight: '500',
    fontSize: 14,
  },
  statsSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statsSectionTitle: {
    color: colors.secondary[700],
    fontWeight: '600',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary[900],
  },
  statValueGreen: {
    color: colors.success[600],
  },
  statValueBlue: {
    color: colors.primary[600],
  },
  statLabel: {
    color: colors.secondary[500],
    fontSize: 12,
  },
  editSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  editSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editSectionTitle: {
    color: colors.secondary[700],
    fontWeight: '600',
  },
  memberSince: {
    marginBottom: 8,
  },
  memberSinceLabel: {
    color: colors.secondary[700],
    fontWeight: '500',
    marginBottom: 6,
    fontSize: 14,
  },
  memberSinceValue: {
    color: colors.secondary[500],
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  editActionButton: {
    flex: 1,
  },
  appVersion: {
    color: colors.secondary[400],
    textAlign: 'center',
    fontSize: 14,
    marginTop: 24,
  },
});
