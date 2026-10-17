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

    promotionCard: {
      minHeight: 88,
      flexDirection: 'row',
      alignItems: 'center',

      padding: 16,

      borderRadius: 22,
      backgroundColor: '#FFFFFF',

      marginBottom: 26,
    },

    promotionIcon: {
      width: 52,
      height: 52,

      borderRadius: 17,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: '#E8F3EE',
    },

    sectionTitle: {
      marginLeft: 4,
      marginBottom: 12,

      fontSize: 19,
      fontWeight: '800',
      color: '#111111',
    },

    notificationsCard: {
      borderRadius: 22,
      backgroundColor: '#FFFFFF',
      overflow: 'hidden',
    },

    notificationRow: {
      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 18,
      paddingVertical: 17,
    },

    notificationIcon: {
      width: 48,
      height: 48,

      borderRadius: 15,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: '#F1F1F1',
    },

    completedIcon: {
      backgroundColor: '#E7F3ED',
    },

    cancelledIcon: {
      backgroundColor: '#F8E7E7',
    },

    notificationContent: {
      flex: 1,
      marginLeft: 14,
      marginRight: 10,
    },

    notificationTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#111111',
    },

    notificationText: {
      marginTop: 4,

      fontSize: 14,
      lineHeight: 19,

      color: '#666666',
    },

    notificationTime: {
      marginTop: 7,

      fontSize: 12,
      color: '#A0A0A0',
    },

    divider: {
      height: 1,
      marginLeft: 80,
      backgroundColor: '#EEEEEE',
    },

    emptyCard: {
      minHeight: 210,

      alignItems: 'center',
      justifyContent: 'center',

      paddingHorizontal: 24,

      borderRadius: 22,
      backgroundColor: '#FFFFFF',
    },

    emptyTitle: {
      marginTop: 12,

      fontSize: 18,
      fontWeight: '800',

      textAlign: 'center',

      color: '#111111',
    },

    emptyText: {
      marginTop: 7,

      maxWidth: 270,

      textAlign: 'center',

      fontSize: 14,
      lineHeight: 20,

      color: '#777777',
    },
  });