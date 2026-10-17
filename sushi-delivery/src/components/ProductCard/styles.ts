import { StyleSheet } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

export const styles =
  StyleSheet.create({
    container: {
      width: '48%',
      marginBottom: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },

    image: {
      width: '100%',
      height: 140,
      backgroundColor:
        colors.surface,
    },

    favoriteButton: {
      position: 'absolute',
      top: 10,
      right: 10,

      width: 36,
      height: 36,
      borderRadius: 18,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        'rgba(255, 255, 255, 0.94)',

      borderWidth: 1,
      borderColor:
        'rgba(0, 0, 0, 0.04)',
    },

    favoriteButtonActive: {
      backgroundColor:
        'rgba(255, 240, 242, 0.96)',
    },

    content: {
      padding: spacing.md,
    },

    name: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },

    description: {
      minHeight: 36,
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color:
        colors.secondaryText,
    },

    weight: {
      marginTop: 6,
      fontSize: 12,
      color:
        colors.secondaryText,
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginTop: spacing.md,
    },

    price: {
      flexShrink: 1,
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },

    addButton: {
      width: 34,
      height: 34,
      borderRadius: 17,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        colors.accent,
    },

    addedButton: {
      opacity: 0.75,
    },

    addButtonText: {
      fontSize: 24,
      lineHeight: 27,
      color: colors.white,
    },
  });