import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  StyleSheet,
} from 'react-native';
import { colors } from '../../theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const getButtonStyle = () => {
    const baseStyle = [styles.base, styles[`size_${size}`]];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    if (isDisabled) {
      baseStyle.push(styles[`${variant}_disabled`]);
    } else {
      baseStyle.push(styles[variant]);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const textStyle = [styles.text, styles[`text_${size}`]];
    
    if (isDisabled) {
      textStyle.push(styles[`text_${variant}_disabled`]);
    } else {
      textStyle.push(styles[`text_${variant}`]);
    }

    return textStyle;
  };

  const getLoaderColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return colors.primary[600];
    }
    return colors.white;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getLoaderColor()} size="small" />
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  fullWidth: {
    width: '100%',
  },
  // Sizes
  size_sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  size_md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  size_lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  // Variants
  primary: {
    backgroundColor: colors.primary[600],
  },
  primary_disabled: {
    backgroundColor: colors.primary[300],
  },
  secondary: {
    backgroundColor: colors.secondary[600],
  },
  secondary_disabled: {
    backgroundColor: colors.secondary[300],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[600],
  },
  outline_disabled: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.secondary[300],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghost_disabled: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.danger[600],
  },
  danger_disabled: {
    backgroundColor: colors.danger[100],
  },
  // Text
  text: {
    fontWeight: '600',
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 18,
  },
  // Text variants
  text_primary: {
    color: colors.white,
  },
  text_primary_disabled: {
    color: colors.white,
  },
  text_secondary: {
    color: colors.white,
  },
  text_secondary_disabled: {
    color: colors.white,
  },
  text_outline: {
    color: colors.primary[600],
  },
  text_outline_disabled: {
    color: colors.secondary[400],
  },
  text_ghost: {
    color: colors.primary[600],
  },
  text_ghost_disabled: {
    color: colors.secondary[400],
  },
  text_danger: {
    color: colors.white,
  },
  text_danger_disabled: {
    color: colors.white,
  },
  // Icons
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
