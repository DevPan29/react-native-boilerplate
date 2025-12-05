import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile, deleteFile } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { ImagePickerResult } from '../types';

interface UseImageUploadOptions {
  bucket: 'todo-images' | 'avatars';
  maxSizeMB?: number;
}

interface UseImageUploadReturn {
  pickImage: () => Promise<ImagePickerResult | null>;
  takePhoto: () => Promise<ImagePickerResult | null>;
  uploadImage: (uri: string) => Promise<string>;
  deleteImage: (url: string) => Promise<void>;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useImageUpload = ({
  bucket,
  maxSizeMB = 5,
}: UseImageUploadOptions): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const requestPermissions = async (
    type: 'camera' | 'library'
  ): Promise<boolean> => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('È necessario il permesso per accedere alla fotocamera');
        return false;
      }
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('È necessario il permesso per accedere alla galleria');
        return false;
      }
    }
    return true;
  };

  const pickImage = useCallback(async (): Promise<ImagePickerResult | null> => {
    clearError();

    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: bucket === 'avatars' ? [1, 1] : [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];

      // Check file size (approximate from base64)
      if (asset.base64) {
        const sizeInBytes = (asset.base64.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        if (sizeInMB > maxSizeMB) {
          setError(`L'immagine è troppo grande. Massimo ${maxSizeMB}MB`);
          return null;
        }
      }

      return {
        uri: asset.uri,
        base64: asset.base64 ?? undefined,
        type: asset.mimeType,
        fileName: asset.fileName ?? undefined,
      };
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Errore nella selezione dell\'immagine');
      return null;
    }
  }, [bucket, maxSizeMB, clearError]);

  const takePhoto = useCallback(async (): Promise<ImagePickerResult | null> => {
    clearError();

    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: bucket === 'avatars' ? [1, 1] : [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];

      // Check file size
      if (asset.base64) {
        const sizeInBytes = (asset.base64.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        if (sizeInMB > maxSizeMB) {
          setError(`L'immagine è troppo grande. Massimo ${maxSizeMB}MB`);
          return null;
        }
      }

      return {
        uri: asset.uri,
        base64: asset.base64 ?? undefined,
        type: asset.mimeType,
        fileName: asset.fileName ?? undefined,
      };
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Errore nello scatto della foto');
      return null;
    }
  }, [bucket, maxSizeMB, clearError]);

  const uploadImage = useCallback(
    async (uri: string): Promise<string> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      setIsUploading(true);
      clearError();

      try {
        // Fetch the image and convert to blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Generate unique filename
        const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Determine content type
        const contentType =
          fileExt === 'png'
            ? 'image/png'
            : fileExt === 'gif'
              ? 'image/gif'
              : fileExt === 'webp'
                ? 'image/webp'
                : 'image/jpeg';

        // Convert blob to ArrayBuffer
        const arrayBuffer = await blob.arrayBuffer();

        // Upload to Supabase Storage
        const publicUrl = await uploadFile(
          bucket,
          fileName,
          arrayBuffer,
          contentType
        );

        return publicUrl;
      } catch (err) {
        console.error('Error uploading image:', err);
        const message =
          err instanceof Error ? err.message : 'Errore nel caricamento';
        setError(message);
        throw new Error(message);
      } finally {
        setIsUploading(false);
      }
    },
    [user, bucket, clearError]
  );

  const deleteImage = useCallback(
    async (url: string): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      clearError();

      try {
        // Extract path from URL
        const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
        if (urlParts.length !== 2) {
          throw new Error('Invalid image URL');
        }

        const path = urlParts[1];
        await deleteFile(bucket, path);
      } catch (err) {
        console.error('Error deleting image:', err);
        const message =
          err instanceof Error ? err.message : 'Errore nell\'eliminazione';
        setError(message);
        throw new Error(message);
      }
    },
    [user, bucket, clearError]
  );

  return {
    pickImage,
    takePhoto,
    uploadImage,
    deleteImage,
    isUploading,
    error,
    clearError,
  };
};
