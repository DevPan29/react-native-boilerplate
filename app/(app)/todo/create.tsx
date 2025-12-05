import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Input, TextArea } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { ImagePickerComponent } from '../../../src/components/ui/ImagePicker';
import { useCreateTodo } from '../../../src/hooks/useTodos';
import { useImageUpload } from '../../../src/hooks/useImageUpload';
import { TodoPriority } from '../../../src/types';
import { getErrorMessage } from '../../../src/utils/helpers';
import { colors } from '../../../src/theme/colors';

interface FormErrors {
  title?: string;
}

export default function CreateTodoScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const createTodo = useCreateTodo();
  const { pickImage, takePhoto, uploadImage, isUploading, error: uploadError } =
    useImageUpload({ bucket: 'todo-images' });

  const priorities: { key: TodoPriority; label: string; bgColor: string; borderColor: string }[] = [
    { key: 'low', label: 'Bassa', bgColor: colors.secondary[100], borderColor: colors.secondary[300] },
    { key: 'medium', label: 'Media', bgColor: colors.warning[100], borderColor: colors.warning[300] },
    { key: 'high', label: 'Alta', bgColor: colors.danger[100], borderColor: colors.danger[300] },
  ];

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Titolo obbligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
    const result = await pickImage();
    if (result) {
      setImageUri(result.uri);
    }
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result) {
      setImageUri(result.uri);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      let uploadedImageUrl: string | undefined;

      if (imageUri) {
        uploadedImageUrl = await uploadImage(imageUri);
      }

      await createTodo.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate?.toISOString(),
        image_url: uploadedImageUrl,
      });

      Alert.alert('Successo', 'Todo creato con successo!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Errore', getErrorMessage(error));
    }
  };

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
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
          {/* Title */}
          <Input
            label="Titolo *"
            placeholder="Cosa devi fare?"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
            leftIcon="create-outline"
          />

          {/* Description */}
          <TextArea
            label="Descrizione"
            placeholder="Aggiungi dettagli..."
            value={description}
            onChangeText={setDescription}
            numberOfLines={4}
          />

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Priorità</Text>
            <View style={styles.priorityRow}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => setPriority(p.key)}
                  style={[
                    styles.priorityButton,
                    { backgroundColor: p.bgColor },
                    priority === p.key && styles.priorityButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      priority === p.key && styles.priorityButtonTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Scadenza</Text>
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
                  : 'Seleziona data'}
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
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Image */}
          <ImagePickerComponent
            label="Immagine"
            imageUri={imageUri}
            onPickImage={handlePickImage}
            onTakePhoto={handleTakePhoto}
            onRemoveImage={handleRemoveImage}
            isLoading={isUploading}
            error={uploadError}
            placeholder="Aggiungi un'immagine"
          />

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Button
              title="Crea Todo"
              onPress={handleCreate}
              isLoading={createTodo.isPending || isUploading}
              fullWidth
              size="lg"
              leftIcon={<Ionicons name="add-circle" size={20} color={colors.white} />}
            />
          </View>
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
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: colors.secondary[700],
    fontWeight: '500',
    marginBottom: 6,
    fontSize: 14,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityButtonActive: {
    borderColor: colors.primary[500],
  },
  priorityButtonText: {
    textAlign: 'center',
    fontWeight: '500',
    color: colors.secondary[600],
  },
  priorityButtonTextActive: {
    color: colors.primary[700],
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
