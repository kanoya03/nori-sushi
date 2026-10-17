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

    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#111111',
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 40,
    },

    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    message: {
      fontSize: 18,
      fontWeight: '600',
    },

    date: {
      marginHorizontal: 4,
      marginBottom: 4,
      color: '#8B8B8B',
      fontSize: 14,
    },

    card: {
      marginTop: 16,
      padding: 18,
      borderRadius: 22,
      backgroundColor: '#F6F6F6',
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#111111',
      marginBottom: 16,
    },

    timeline: {
      marginTop: 2,
    },

    timelineRow: {
      flexDirection: 'row',
      minHeight: 48,
    },

    timelineIndicator: {
      width: 26,
      alignItems: 'center',
    },

    timelineDot: {
      width: 13,
      height: 13,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: '#C7C7C7',
      backgroundColor: '#FFFFFF',
    },

    timelineDotActive: {
      backgroundColor: '#111111',
      borderColor: '#111111',
    },

    timelineLine: {
      width: 2,
      flex: 1,
      marginVertical: 4,
      backgroundColor: '#D8D8D8',
    },

    timelineLineActive: {
      backgroundColor: '#111111',
    },

    timelineText: {
      flex: 1,
      paddingLeft: 10,
      paddingBottom: 20,
      color: '#A0A0A0',
      fontSize: 15,
      fontWeight: '600',
    },

    timelineTextActive: {
      color: '#111111',
    },

    cancelledBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: '#F8E7E7',
    },

    cancelledText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#B94A4A',
    },

    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      paddingVertical: 9,
    },

    itemInfo: {
      flex: 1,
    },

    itemName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#111111',
    },

    itemQuantity: {
      marginTop: 3,
      color: '#8A8A8A',
      fontSize: 14,
    },

    itemPrice: {
      fontSize: 16,
      fontWeight: '800',
      color: '#111111',
    },

    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },

    infoContent: {
      flex: 1,
    },

    infoLabel: {
      fontSize: 13,
      color: '#8A8A8A',
    },

    infoValue: {
      marginTop: 3,
      fontSize: 16,
      fontWeight: '700',
      color: '#111111',
    },

    address: {
      marginTop: 6,
      color: '#6F6F6F',
      lineHeight: 20,
    },

    infoDivider: {
      height: 1,
      marginVertical: 16,
      backgroundColor: '#E4E4E4',
    },

    comment: {
      fontSize: 15,
      lineHeight: 22,
      color: '#555555',
    },

    priceCard: {
      marginTop: 16,
      padding: 18,
      borderRadius: 22,
      backgroundColor: '#111111',
    },

    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    priceLabel: {
      fontSize: 15,
      color: '#B8B8B8',
    },

    priceValue: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    priceDivider: {
      height: 1,
      backgroundColor: '#333333',
      marginVertical: 5,
    },

    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },

    totalLabel: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    totalPrice: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    repeatButton: {
      marginTop: 18,
      minHeight: 56,
      borderRadius: 18,
      backgroundColor: '#111111',
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },

    repeatButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },

    cancelButton: {
      marginTop: 12,
      minHeight: 54,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#D9A7A7',
      alignItems: 'center',
      justifyContent: 'center',
    },

    cancelButtonText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#B94A4A',
    },
  });