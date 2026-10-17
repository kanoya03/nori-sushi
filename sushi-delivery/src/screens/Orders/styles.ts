import { StyleSheet } from 'react-native';

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

    title: {
      fontSize: 22,
      fontWeight: '800',
      color: '#111111',
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 40,
      gap: 14,
    },

    orderCard: {
      borderRadius: 22,
      padding: 18,
      backgroundColor: '#F6F6F6',
    },

    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    orderNumber: {
      fontSize: 19,
      fontWeight: '800',
      color: '#111111',
    },

    orderDate: {
      marginTop: 4,
      fontSize: 13,
      color: '#929292',
    },

    statusBadge: {
      alignSelf: 'flex-start',
      marginTop: 14,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 999,
    },

    statusActive: {
      backgroundColor: '#ECECEC',
    },

    statusCompleted: {
      backgroundColor: '#E5F3EC',
    },

    statusCancelled: {
      backgroundColor: '#F8E7E7',
    },

    statusText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#555555',
    },

    statusTextCompleted: {
      color: '#2F8F6B',
    },

    statusTextCancelled: {
      color: '#B94A4A',
    },

    items: {
      marginTop: 18,
      gap: 10,
    },

    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
    },

    itemName: {
      flex: 1,
      fontSize: 15,
      color: '#2A2A2A',
    },

    itemPrice: {
      fontSize: 15,
      fontWeight: '700',
      color: '#111111',
    },

    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 7,
      marginTop: 18,
    },

    address: {
      flex: 1,
      fontSize: 14,
      lineHeight: 19,
      color: '#7C7C7C',
    },

    totalRow: {
      marginTop: 18,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#E2E2E2',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    totalLabel: {
      fontSize: 17,
      fontWeight: '700',
      color: '#111111',
    },

    totalPrice: {
      fontSize: 19,
      fontWeight: '800',
      color: '#111111',
    },

    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
    },

    emptyTitle: {
      marginTop: 12,
      fontSize: 21,
      fontWeight: '800',
      textAlign: 'center',
      color: '#111111',
    },

    emptyText: {
      marginTop: 8,
      color: '#777777',
      lineHeight: 21,
      textAlign: 'center',
    },
  });