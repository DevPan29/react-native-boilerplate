import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ImagePickerComponentProps {
  imageUri?: string | null;
  onPickImage: () => Promise<void>;
  onTakePhoto: () => Promise<void>;
  onRemoveImage?: () => void;
  isLoading?: boolean;
  error?: string | null;
  label?: string;
  aspectRatio?: 'square' | 'landscape';
  placeholder?: string;
}

export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  imageUri,
  onPickImage,
  onTakePhoto,
  onRemoveImage,
  isLoading = false,
  error,
  label,
  aspectRatio = 'landscape',
  placeholder = 'Aggiungi immagine',
}) => {
  const handleImageOptions = () => {
    Alert.alert(
      'Seleziona immagine',
      'Come vuoi aggiungere l\'immagine?',
      [
        { text: 'Fotocamera', onPress: onTakePhoto },
        { text: 'Galleria', onPress: onPickImage },
        { text: 'Annulla', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleRemoveConfirm = () => {
    Alert.alert(
      'Rimuovi immagine',
      'Sei sicuro di voler rimuovere questa immagine?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Rimuovi', style: 'destructive', onPress: onRemoveImage },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.image,
              aspectRatio === 'square' ? styles.imageSquare : styles.imageLandscape,
            ]}
            resizeMode="cover"
          />

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.white} size="large" />
              <Text style={styles.loadingText}>Caricamento...</Text>
            </View>
          )}

          {!isLoading && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={handleImageOptions}
                style={styles.actionButton}
              >
                <Ionicons name="pencil" size={18} color={colors.primary[600]} />
              </TouchableOpacity>

              {onRemoveImage && (
                <TouchableOpacity
                  onPress={handleRemoveConfirm}
                  style={[styles.actionButton, styles.actionButtonDanger]}
                >
                  <Ionicons name="trash" size={18} color={colors.danger[500]} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleImageOptions}
          disabled={isLoading}
          style={[
            styles.placeholder,
            aspectRatio === 'square' ? styles.placeholderSquare : styles.placeholderLandscape,
          ]}
        >
          {isLoading ? (
            <>
              <ActivityIndicator color={colors.secondary[500]} size="large" />
              <Text style={styles.placeholderText}>Caricamento...</Text>
            </>
          ) : (
            <>
              <Ionicons name="image-outline" size={48} color={colors.secondary[400]} />
              <Text style={styles.placeholderText}>{placeholder}</Text>
              <Text style={styles.placeholderHint}>Tocca per selezionare</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Avatar picker variant
interface AvatarPickerProps {
  avatarUrl?: string | null;
  name?: string | null;
  onPickImage: () => Promise<void>;
  onTakePhoto: () => Promise<void>;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  avatarUrl,
  name,
  onPickImage,
  onTakePhoto,
  isLoading = false,
  size = 'lg',
}) => {
  const sizeValue = size === 'sm' ? 64 : size === 'md' ? 96 : 128;
  const fontSize = size === 'sm' ? 18 : size === 'md' ? 24 : 36;

  const handleImageOptions = () => {
    Alert.alert(
      'Cambia foto profilo',
      'Come vuoi aggiungere la foto?',
      [
        { text: 'Fotocamera', onPress: onTakePhoto },
        { text: 'Galleria', onPress: onPickImage },
        { text: 'Annulla', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const getInitials = (): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.avatarContainer}>
      <TouchableOpacity
        onPress={handleImageOptions}
        disabled={isLoading}
        style={styles.avatarTouchable}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={[styles.avatar, { width: sizeValue, height: sizeValue }]}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { width: sizeValue, height: sizeValue },
            ]}
          >
            <Text style={[styles.avatarInitials, { fontSize }]}>
              {getInitials()}
            </Text>
          </View>
        )}

        {isLoading ? (
          <View
            style={[
              styles.avatarLoadingOverlay,
              { width: sizeValue, height: sizeValue },
            ]}
          >
            <ActivityIndicator color={colors.white} />
          </View>
        ) : (
          <View style={styles.avatarCameraIcon}>
            <Ionicons name="camera" size={16} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.avatarHint}>Tocca per cambiare</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: colors.secondary[700],
    fontWeight: '500',
    marginBottom: 6,
    fontSize: 14,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    borderRadius: 12,
  },
  imageSquare: {
    aspectRatio: 1,
  },
  imageLandscape: {
    aspectRatio: 16 / 9,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.white,
    marginTop: 8,
  },
  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  actionButtonDanger: {},
  placeholder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.secondary[300],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary[50],
  },
  placeholderSquare: {
    aspectRatio: 1,
  },
  placeholderLandscape: {
    aspectRatio: 16 / 9,
  },
  placeholderText: {
    color: colors.secondary[500],
    marginTop: 8,
  },
  placeholderHint: {
    color: colors.secondary[400],
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    color: colors.danger[500],
    fontSize: 14,
    marginTop: 6,
  },
  // Avatar styles
  avatarContainer: {
    alignItems: 'center',
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    borderRadius: 9999,
  },
  avatarPlaceholder: {
    borderRadius: 9999,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontWeight: '700',
    color: colors.primary[600],
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary[600],
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarHint: {
    color: colors.secondary[500],
    fontSize: 12,
    marginTop: 8,
  },
});
