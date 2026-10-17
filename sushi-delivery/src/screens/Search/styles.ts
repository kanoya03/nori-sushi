import {
  StyleSheet,
} from 'react-native';

export const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },

    header: {
      height: 64,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',

      paddingHorizontal: 20,
    },

    backButton: {
      width: 44,
      height: 44,

      alignItems: 'flex-start',
      justifyContent: 'center',
    },

    headerSpacer: {
      width: 44,
    },

    title: {
      fontSize: 24,
      fontWeight: '800',
      color: '#111111',
    },

    searchContainer: {
      minHeight: 58,

      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 12,

      paddingHorizontal: 16,

      flexDirection: 'row',
      alignItems: 'center',

      gap: 12,

      borderRadius: 18,

      backgroundColor: '#F4F4F4',
    },

    input: {
      flex: 1,

      paddingVertical: 12,

      fontSize: 18,
      color: '#111111',
    },

    clearButton: {
      width: 28,
      height: 28,

      borderRadius: 14,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: '#B3B3B3',
    },

    resultsContent: {
      paddingTop: 10,
      paddingBottom: 40,
    },

    categorySection: {
      marginBottom: 28,
    },

    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 18,
      marginBottom: 14,
    },

    categoryTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#111111',
    },

    categoryCount: {
      marginLeft: 8,

      minWidth: 24,
      height: 24,

      paddingHorizontal: 7,

      borderRadius: 12,

      textAlign: 'center',
      textAlignVertical: 'center',

      fontSize: 12,
      fontWeight: '700',

      color: '#777777',
      backgroundColor: '#F0F0F0',
    },

    productsSection: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',

      paddingHorizontal: 16,
    },

    messageContainer: {
      flex: 1,

      alignItems: 'center',
      justifyContent: 'center',

      paddingHorizontal: 30,
    },

    messageIcon: {
      width: 78,
      height: 78,

      borderRadius: 39,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: '#F4F4F4',

      marginBottom: 16,
    },

    message: {
      fontSize: 18,
      fontWeight: '700',

      color: '#666666',

      textAlign: 'center',
    },

    hint: {
      fontSize: 16,

      color: '#999999',

      textAlign: 'center',
    },

    emptyHint: {
      marginTop: 7,

      fontSize: 14,

      color: '#A0A0A0',

      textAlign: 'center',
    },
  });