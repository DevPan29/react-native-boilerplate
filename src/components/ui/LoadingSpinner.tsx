import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = colors.primary[600],
  text,
  fullScreen = false,
}) => {
  const content = (
    <View style={styles.content}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return content;
};

// Skeleton loader for cards
export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonHeaderText}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
      </View>
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLineShort} />
    </View>
  );
};

// Skeleton list
export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  text: {
    marginTop: 12,
    color: colors.secondary[600],
    fontSize: 16,
  },
  skeletonList: {
    paddingHorizontal: 16,
  },
  skeletonCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.secondary[100],
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary[200],
  },
  skeletonHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: colors.secondary[200],
    borderRadius: 4,
    width: '75%',
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: colors.secondary[200],
    borderRadius: 4,
    width: '50%',
  },
  skeletonLine: {
    height: 12,
    backgroundColor: colors.secondary[200],
    borderRadius: 4,
    width: '100%',
    marginBottom: 8,
  },
  skeletonLineShort: {
    height: 12,
    backgroundColor: colors.secondary[200],
    borderRadius: 4,
    width: '66%',
  },
});
