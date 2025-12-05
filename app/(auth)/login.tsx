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
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useSignIn, useRequestPasswordReset } from '../../src/hooks/useAuth';
import { isValidEmail, getErrorMessage } from '../../src/utils/helpers';
import { colors } from '../../src/theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const signIn = useSignIn();
  const requestPasswordReset = useRequestPasswordReset();

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email obbligatoria';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email non valida';
    }

    if (!password) {
      newErrors.password = 'Password obbligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await signIn.mutateAsync({
        email: email.trim(),
        password,
      });
    } catch (error) {
      Alert.alert('Errore', getErrorMessage(error));
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Attenzione', 'Inserisci la tua email prima');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Attenzione', 'Inserisci un\'email valida');
      return;
    }

    try {
      await requestPasswordReset.mutateAsync(email.trim());
      Alert.alert(
        'Email inviata',
        'Controlla la tua email per reimpostare la password'
      );
    } catch (error) {
      Alert.alert('Errore', getErrorMessage(error));
    }
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-done" size={48} color={colors.primary[600]} />
            </View>
            <Text style={styles.title}>Bentornato!</Text>
            <Text style={styles.subtitle}>Accedi per gestire i tuoi todo</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="La tua password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={requestPasswordReset.isPending}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Password dimenticata?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title="Accedi"
              onPress={handleLogin}
              isLoading={signIn.isPending}
              fullWidth
              size="lg"
            />
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Non hai un account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Registrati</Text>
              </TouchableOpacity>
            </Link>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primary[600],
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: colors.secondary[500],
  },
  registerLink: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});
