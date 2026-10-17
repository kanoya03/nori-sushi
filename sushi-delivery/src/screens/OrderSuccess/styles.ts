import { StyleSheet } from 'react-native';

export const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },

    content: {
      flex: 1,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },

    successCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: '#111',

      alignItems: 'center',
      justifyContent: 'center',

      marginBottom: 28,
    },

    successIcon: {
      color: '#fff',
      fontSize: 46,
      fontWeight: '700',
    },

    title: {
      fontSize: 30,
      fontWeight: '800',
      textAlign: 'center',
    },

    orderNumber: {
      marginTop: 10,
      fontSize: 18,
      fontWeight: '700',
    },

    description: {
      marginTop: 14,
      color: '#777',
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      maxWidth: 300,
    },

    primaryButton: {
      width: '100%',
      minHeight: 56,
      borderRadius: 18,
      backgroundColor: '#111',

      alignItems: 'center',
      justifyContent: 'center',

      marginTop: 36,
    },

    primaryButtonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '800',
    },

    secondaryButton: {
      width: '100%',
      minHeight: 54,

      alignItems: 'center',
      justifyContent: 'center',

      marginTop: 8,
    },

    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
    },
  });