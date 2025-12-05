import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Input, TextArea } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { ImagePickerComponent } from '../../../src/components/ui/ImagePicker';
import { useTodo, useUpdateTodo, useDeleteTodo } from '../../../src/hooks/useTodos';
import { useImageUpload } from '../../../src/hooks/useImageUpload';
import { TodoPriority, TodoStatus } from '../../../src/types';
import { getErrorMessage, getStatusLabel, getPriorityLabel } from '../../../src/utils/helpers';
import { colors } from '../../../src/theme/colors';

export default function TodoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: todo, isLoading, error } = useTodo(id);
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const { pickImage, takePhoto, uploadImage, deleteImage, isUploading, error: uploadError } =
    useImageUpload({ bucket: 'todo-images' });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TodoStatus>('pending');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setStatus(todo.status);
      setPriority(todo.priority);
      setDueDate(todo.due_date ? new Date(todo.due_date) : null);
      setImageUri(todo.image_url);
      setOriginalImageUrl(todo.image_url);
    }
  }, [todo]);

  const statuses: { key: TodoStatus; label: string; bgColor: string }[] = [
    { key: 'pending', label: 'In attesa', bgColor: colors.warning[100] },
    { key: 'in_progress', label: 'In corso', bgColor: colors.primary[100] },
    { key: 'completed', label: 'Completato', bgColor: colors.success[100] },
  ];

  const priorities: { key: TodoPriority; label: string; bgColor: string }[] = [
    { key: 'low', label: 'Bassa', bgColor: colors.secondary[100] },
    { key: 'medium', label: 'Media', bgColor: colors.warning[100] },
    { key: 'high', label: 'Alta', bgColor: colors.danger[100] },
  ];

  const handlePickImage = async () => {
    const result = await pickImage();
    if (result) setImageUri(result.uri);
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result) setImageUri(result.uri);
  };

  const handleRemoveImage = () => setImageUri(null);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Errore', 'Il titolo è obbligatorio');
      return;
    }

    try {
      let uploadedImageUrl = imageUri;

      if (imageUri !== originalImageUrl) {
        if (originalImageUrl) {
          try {
            await deleteImage(originalImageUrl);
          } catch (e) {
            console.error('Error deleting old image:', e);
          }
        }

        if (imageUri && !imageUri.startsWith('http')) {
          uploadedImageUrl = await uploadImage(imageUri);
        }
      }

      await updateTodo.mutateAsync({
        id,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        due_date: dueDate?.toISOString() ?? null,
        image_url: uploadedImageUrl,
      });

      setIsEditing(false);
      Alert.alert('Successo', 'Todo aggiornato con successo!');
    } catch (err) {
      Alert.alert('Errore', getErrorMessage(err));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Elimina Todo',
      'Sei sicuro di voler eliminare questo todo? L\'azione è irreversibile.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              if (originalImageUrl) {
                try {
                  await deleteImage(originalImageUrl);
                } catch (e) {
                  console.error('Error deleting image:', e);
                }
              }

              await deleteTodo.mutateAsync(id);
              router.back();
            } catch (err) {
              Alert.alert('Errore', getErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setStatus(todo.status);
      setPriority(todo.priority);
      setDueDate(todo.due_date ? new Date(todo.due_date) : null);
      setImageUri(todo.image_url);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Caricamento..." />;
  }

  if (error || !todo) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.danger[500]} />
        <Text style={styles.errorText}>Todo non trovato</Text>
        <Button title="Torna indietro" onPress={() => router.back()} variant="outline" />
      </SafeAreaView>
    );
  }

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
          {/* Edit/View Toggle */}
          <View style={styles.actionRow}>
            {!isEditing ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={styles.editButton}
                >
                  <Ionicons name="pencil" size={18} color={colors.primary[600]} />
                  <Text style={styles.editButtonText}>Modifica</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <Ionicons name="trash" size={18} color={colors.danger[500]} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <Input
            label="Titolo"
            value={title}
            onChangeText={setTitle}
            editable={isEditing}
            leftIcon="create-outline"
          />

          {/* Description */}
          <TextArea
            label="Descrizione"
            value={description}
            onChangeText={setDescription}
            editable={isEditing}
            numberOfLines={4}
          />

          {/* Status */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Stato</Text>
            {isEditing ? (
              <View style={styles.optionRow}>
                {statuses.map((s) => (
                  <TouchableOpacity
                    key={s.key}
                    onPress={() => setStatus(s.key)}
                    style={[
                      styles.optionButton,
                      { backgroundColor: s.bgColor },
                      status === s.key && styles.optionButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        status === s.key && styles.optionButtonTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{getStatusLabel(status)}</Text>
              </View>
            )}
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Priorità</Text>
            {isEditing ? (
              <View style={styles.optionRow}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => setPriority(p.key)}
                    style={[
                      styles.optionButton,
                      { backgroundColor: p.bgColor },
                      priority === p.key && styles.optionButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        priority === p.key && styles.optionButtonTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{getPriorityLabel(priority)}</Text>
              </View>
            )}
          </View>

          {/* Due Date */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Scadenza</Text>
            {isEditing ? (
              <>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.secondary[500]} />
                  <Text style={styles.dateButtonText}>
                    {dueDate
                      ? dueDate.toLocaleDateString('it-IT', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Nessuna scadenza'}
                  </Text>
                  {dueDate && (
                    <TouchableOpacity onPress={() => setDueDate(null)}>
                      <Ionicons name="close-circle" size={20} color={colors.secondary[400]} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_event, date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (date) setDueDate(date);
                    }}
                  />
                )}
              </>
            ) : (
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>
                  {dueDate
                    ? dueDate.toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Nessuna scadenza'}
                </Text>
              </View>
            )}
          </View>

          {/* Image */}
          {isEditing ? (
            <ImagePickerComponent
              label="Immagine"
              imageUri={imageUri}
              onPickImage={handlePickImage}
              onTakePhoto={handleTakePhoto}
              onRemoveImage={handleRemoveImage}
              isLoading={isUploading}
              error={uploadError}
            />
          ) : imageUri ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Immagine</Text>
              <ImagePickerComponent
                imageUri={imageUri}
                onPickImage={async () => {}}
                onTakePhoto={async () => {}}
              />
            </View>
          ) : null}

          {/* Save Button */}
          {isEditing && (
            <View style={styles.submitContainer}>
              <Button
                title="Salva modifiche"
                onPress={handleSave}
                isLoading={updateTodo.isPending || isUploading}
                fullWidth
                size="lg"
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.secondary[600],
    marginTop: 16,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.primary[600],
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: colors.danger[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: colors.secondary[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: colors.secondary[600],
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: colors.secondary[700],
    fontWeight: '500',
    marginBottom: 6,
    fontSize: 14,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    borderColor: colors.primary[500],
  },
  optionButtonText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
    color: colors.secondary[600],
  },
  optionButtonTextActive: {
    color: colors.primary[700],
  },
  readOnlyField: {
    backgroundColor: colors.secondary[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  readOnlyText: {
    color: colors.secondary[700],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.secondary[200],
  },
  dateButtonText: {
    flex: 1,
    marginLeft: 12,
    color: colors.secondary[600],
  },
  submitContainer: {
    marginTop: 24,
  },
});
