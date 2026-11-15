import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from './theme';

export const Background: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LinearGradient colors={[colors.bgTop, colors.bg, colors.bg]} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
    {children}
  </LinearGradient>
);

type ButtonProps = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export const Button: React.FC<ButtonProps> = ({ label, onPress, icon, variant = 'primary', loading, disabled, style }) => {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        primary ? styles.btnPrimary : styles.btnGhost,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.white : colors.text} />
      ) : (
        <View style={styles.btnRow}>
          {icon && <Ionicons name={icon} size={20} color={primary ? colors.white : colors.text} />}
          <Text style={[styles.btnText, !primary && { color: colors.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
};

export const Card: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const IconBubble: React.FC<{
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  size?: number;
}> = ({ name, color, bg, size = 44 }) => (
  <View style={[styles.bubble, { backgroundColor: bg, width: size, height: size, borderRadius: size / 2 }]}>
    <Ionicons name={name} size={size * 0.48} color={color} />
  </View>
);

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  btnPrimary: {
    backgroundColor: colors.sos,
    boxShadow: '0px 8px 24px rgba(255, 77, 79, 0.35)',
  },
  btnGhost: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  bubble: { alignItems: 'center', justifyContent: 'center' },
});
