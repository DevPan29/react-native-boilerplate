import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useSignUp } from '../../src/hooks/useAuth';
import { isValidEmail, isValidPassword, getErrorMessage } from '../../src/utils/helpers';
import { colors } from '../../src/theme/colors';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const signUp = useSignUp();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Nome obbligatorio';
    }

    if (!email.trim()) {
      newErrors.email = 'Email obbligatoria';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email non valida';
    }

    if (!password) {
      newErrors.password = 'Password obbligatoria';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'La password deve essere di almeno 6 caratteri';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Conferma la password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      const result = await signUp.mutateAsync({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
      });

      if (result.user && !result.session) {
        Alert.alert(
          'Verifica email',
          'Ti abbiamo inviato un\'email di conferma. Clicca sul link per completare la registrazione.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (error) {
      Alert.alert('Errore', getErrorMessage(error));
    }
  };

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.secondary[800]} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={48} color={colors.primary[600]} />
            </View>
            <Text style={styles.title}>Crea Account</Text>
            <Text style={styles.subtitle}>Inizia a organizzare la tua vita</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Nome completo"
              placeholder="Il tuo nome"
              autoCapitalize="words"
              autoComplete="name"
              leftIcon="person-outline"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                clearError('fullName');
              }}
              error={errors.fullName}
            />

            <Input
              label="Email"
              placeholder="La tua email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail-outline"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError('email');
              }}
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Crea una password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError('password');
              }}
              error={errors.password}
              hint="Minimo 6 caratteri"
            />

            <Input
              label="Conferma Password"
              placeholder="Ripeti la password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              leftIcon="lock-closed-outline"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError('confirmPassword');
              }}
              error={errors.confirmPassword}
            />

            {/* Register Button */}
            <Button
              title="Registrati"
              onPress={handleRegister}
              isLoading={signUp.isPending}
              fullWidth
              size="lg"
            />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Hai già un account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Accedi</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            Registrandoti accetti i nostri{' '}
            <Text style={styles.termsLink}>Termini di Servizio</Text> e la{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 0,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary[100],
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.secondary[900],
  },
  subtitle: {
    color: colors.secondary[500],
    marginTop: 8,
  },
  form: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  loginText: {
    color: colors.secondary[500],
  },
  loginLink: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  terms: {
    color: colors.secondary[400],
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  termsLink: {
    color: colors.primary[600],
  },
});
