import { StyleSheet } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

export const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    scrollContent: {
      paddingBottom: 32,
    },

    imageContainer: {
      position: 'relative',
    },

    image: {
      width: '100%',
      height: 390,
      backgroundColor:
        colors.surface,
    },

    navigationButton: {
      position: 'absolute',

      top: 18,
      left: 18,

      width: 48,
      height: 48,

      borderRadius: 24,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        'rgba(255,255,255,0.94)',
    },

    favoriteButtonWrapper: {
      position: 'absolute',

      top: 18,
      right: 18,
    },

    favoriteButton: {
      width: 48,
      height: 48,

      borderRadius: 24,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        'rgba(255,255,255,0.94)',
    },

    favoriteButtonActive: {
      backgroundColor:
        'rgba(255,240,242,0.96)',
    },

    content: {
      marginTop: -22,

      paddingHorizontal:
        spacing.lg,

      paddingTop: 28,
      paddingBottom: 22,

      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,

      backgroundColor:
        colors.background,
    },

    topInfoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent:
        'space-between',
      gap: 16,
    },

    name: {
      flex: 1,

      fontSize: 29,
      lineHeight: 34,

      fontWeight: '800',

      color: colors.text,
    },

    weightBadge: {
      paddingHorizontal: 11,
      paddingVertical: 7,

      borderRadius: 999,

      backgroundColor: '#F2F2F2',
    },

    weightText: {
      fontSize: 13,
      fontWeight: '700',

      color: '#707070',
    },

    description: {
      marginTop: 14,

      fontSize: 16,
      lineHeight: 24,

      color:
        colors.secondaryText,
    },

    divider: {
      height: 1,

      marginVertical: 22,

      backgroundColor:
        colors.border,
    },

    priceRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent:
        'space-between',

      marginBottom: 20,
    },

    priceLabel: {
      marginBottom: 3,

      fontSize: 13,
      fontWeight: '600',

      color:
        colors.secondaryText,
    },

    price: {
      fontSize: 28,
      fontWeight: '800',

      color: colors.text,
    },

    quantityHint: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 6,

      paddingHorizontal: 11,
      paddingVertical: 8,

      borderRadius: 14,

      backgroundColor: '#F4F4F4',
    },

    quantityHintText: {
      fontSize: 13,
      fontWeight: '600',

      color: '#777777',
    },

    cartButton: {
      minHeight: 58,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      gap: 9,

      borderRadius: 18,

      backgroundColor:
        colors.accent,
    },

    cartButtonAdded: {
      opacity: 0.78,
    },

    cartButtonText: {
      fontSize: 16,
      fontWeight: '800',

      color: colors.white,
    },

    notFound: {
      flex: 1,

      alignItems: 'center',
      justifyContent: 'center',

      padding:
        spacing.lg,
    },

    notFoundText: {
      marginTop: 12,

      fontSize: 20,
      fontWeight: '800',

      color: colors.text,
    },

    notFoundButton: {
      marginTop: 20,

      minHeight: 50,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      gap: 5,

      paddingHorizontal: 22,

      borderRadius: 16,

      backgroundColor: '#111111',
    },

    notFoundButtonText: {
      fontSize: 15,
      fontWeight: '700',

      color: '#FFFFFF',
    },
  });