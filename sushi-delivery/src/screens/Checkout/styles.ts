import { StyleSheet } from 'react-native';

export const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },

    content: {
      padding: 20,
      paddingBottom: 40,
    },

    title: {
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 20,
    },

    section: {
      padding: 18,
      backgroundColor: '#f4f4f4',
      borderRadius: 18,
      marginBottom: 16,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
    },

    changeText: {
      fontSize: 14,
      fontWeight: '700',
    },

    addressText: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 21,
    },

    addAddressButton: {
      marginTop: 12,
      paddingVertical: 10,
    },

    addAddressText: {
      fontSize: 15,
      fontWeight: '700',
    },

    deliveryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
      gap: 10,
    },

    radioActive: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#111',
    },

    deliveryText: {
      fontSize: 16,
      fontWeight: '600',
    },

    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      gap: 16,
    },

    itemInfo: {
      flex: 1,
    },

    itemName: {
      fontSize: 15,
      fontWeight: '600',
    },

    itemQuantity: {
      marginTop: 4,
      color: '#777',
    },

    itemPrice: {
      fontSize: 15,
      fontWeight: '700',
    },

    totalSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',

      marginTop: 4,
      marginBottom: 20,
    },

    totalLabel: {
      fontSize: 20,
      fontWeight: '800',
    },

    totalPrice: {
      fontSize: 22,
      fontWeight: '800',
    },

    confirmButton: {
      minHeight: 56,
      borderRadius: 18,
      backgroundColor: '#111',
      alignItems: 'center',
      justifyContent: 'center',
    },

    confirmButtonDisabled: {
      opacity: 0.6,
    },

    confirmButtonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '800',
    },

    radioInactive: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#aaa',
    },
    commentInput: {
    marginTop: 14,
    minHeight: 90,
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    },
    phoneInput: {
      marginTop: 10,
      minHeight: 48,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 14,
      paddingHorizontal: 14,
      backgroundColor: '#fff',
      fontSize: 16,
    },
    phoneInputError: { borderColor: '#b42318' },
    phoneError: { marginTop: 6, color: '#b42318', fontSize: 13 },

    disabledOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
    paddingVertical: 4,
    opacity: 0.45,
    },

    disabledText: {
    fontSize: 16,
    fontWeight: '600',
    },

    disabledHint: {
    marginTop: 2,
    color: '#777',
    fontSize: 12,
    },

    minimumWarning: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#f4f4f4',
    },

    minimumWarningText: {
    fontSize: 14,
    fontWeight: '600',
    },

    priceBlock: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#f4f4f4',
    marginBottom: 20,
    },

    priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    },

    priceLabel: {
    fontSize: 15,
    color: '#666',
    },

    priceValue: {
    fontSize: 15,
    fontWeight: '600',
    },

    totalDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
    },
  });
