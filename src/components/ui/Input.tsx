import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: object;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      style,
      editable = true,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const isDisabled = !editable;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View
          style={[
            styles.inputContainer,
            hasError && styles.inputContainerError,
            isDisabled && styles.inputContainerDisabled,
          ]}
        >
          {leftIcon && (
            <View style={styles.iconLeft}>
              <Ionicons
                name={leftIcon}
                size={20}
                color={hasError ? colors.danger[500] : colors.secondary[500]}
              />
            </View>
          )}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              rightIcon && styles.inputWithRightIcon,
              isDisabled && styles.inputDisabled,
              style,
            ]}
            placeholderTextColor={colors.secondary[400]}
            editable={editable}
            {...props}
          />

          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              style={styles.iconRight}
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={hasError ? colors.danger[500] : colors.secondary[500]}
              />
            </TouchableOpacity>
          )}
        </View>

        {(error || hint) && (
          <Text style={[styles.helperText, hasError && styles.errorText]}>
            {error || hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

// Textarea variant
interface TextAreaProps extends InputProps {
  numberOfLines?: number;
}

export const TextArea = forwardRef<TextInput, TextAreaProps>(
  ({ numberOfLines = 4, style, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        style={[styles.textArea, style]}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.secondary[200],
    borderRadius: 12,
  },
  inputContainerError: {
    borderColor: colors.danger[500],
  },
  inputContainerDisabled: {
    backgroundColor: colors.secondary[50],
  },
  iconLeft: {
    paddingLeft: 12,
  },
  iconRight: {
    paddingRight: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.secondary[900],
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  inputDisabled: {
    color: colors.secondary[400],
  },
  helperText: {
    marginTop: 6,
    fontSize: 14,
    color: colors.secondary[500],
  },
  errorText: {
    color: colors.danger[500],
  },
  textArea: {
    minHeight: 100,
  },
});
