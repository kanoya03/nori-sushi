import { StyleSheet } from 'react-native';

export const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },

    header: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
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

    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 40,
    },

    hero: {
      padding: 22,
      borderRadius: 24,
      backgroundColor: '#111111',
      marginBottom: 26,
    },

    heroIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: '#2F8F6B',

      marginBottom: 20,
    },

    heroTitle: {
      fontSize: 25,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    heroText: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 21,
      color: '#BBBBBB',
    },

    heroButton: {
      marginTop: 22,
      minHeight: 52,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,

      borderRadius: 16,
      backgroundColor: '#FFFFFF',
    },

    heroButtonText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#111111',
    },

    sectionTitle: {
      marginLeft: 4,
      marginBottom: 12,

      fontSize: 19,
      fontWeight: '800',
      color: '#111111',
    },

    promotionCard: {
      padding: 18,
      marginBottom: 14,

      borderRadius: 22,
      backgroundColor: '#FFFFFF',
    },

    promotionTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    promotionIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,

      backgroundColor: '#F2F2F2',

      alignItems: 'center',
      justifyContent: 'center',
    },

    badge: {
      paddingHorizontal: 12,
      paddingVertical: 7,

      borderRadius: 999,
      backgroundColor: '#E5F3EC',
    },

    badgeText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#2F8F6B',
    },

    promotionTitle: {
      marginTop: 18,

      fontSize: 19,
      fontWeight: '800',
      color: '#111111',
    },

    promotionDescription: {
      marginTop: 7,

      fontSize: 14,
      lineHeight: 20,
      color: '#707070',
    },

    promotionButton: {
      minHeight: 50,

      marginTop: 18,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,

      borderRadius: 16,
      backgroundColor: '#111111',
    },

    promotionButtonText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    notice: {
      marginTop: 8,
      paddingHorizontal: 10,

      textAlign: 'center',

      fontSize: 12,
      lineHeight: 17,

      color: '#999999',
    },
  });