import { StyleSheet } from 'react-native';

import {
  colors,
} from '../../constants/colors';

import {
  spacing,
} from '../../constants/spacing';

export const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    header: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 16,
      backgroundColor:
        colors.background,
    },

    headerButton: {
      width: 44,
      height: 44,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },

    headerSpacer: {
      width: 44,
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#111111',
    },

    productsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'space-between',

      paddingHorizontal:
        spacing.md,

      paddingTop: 8,
      paddingBottom: 40,
    },

    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal:
        spacing.lg,
    },

    emptyIcon: {
      width: 88,
      height: 88,
      borderRadius: 44,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: '#F1F1F1',

      marginBottom: 18,
    },

    emptyTitle: {
      fontSize: 23,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },

    emptyText: {
      marginTop: spacing.sm,
      maxWidth: 280,

      textAlign: 'center',
      fontSize: 15,
      lineHeight: 21,

      color:
        colors.secondaryText,
    },
  });