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

    brandCard: {
      alignItems: 'center',

      paddingVertical: 32,
      paddingHorizontal: 20,

      borderRadius: 26,
      backgroundColor: '#111111',

      marginBottom: 16,
    },

    logo: {
      width: 78,
      height: 78,

      borderRadius: 24,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: '#2F8F6B',
    },

    brandName: {
      marginTop: 18,

      fontSize: 28,
      fontWeight: '800',
      letterSpacing: 2.5,

      color: '#FFFFFF',
    },

    brandSubtitle: {
      marginTop: 5,

      fontSize: 14,
      letterSpacing: 1,

      color: '#AAAAAA',
    },

    aboutCard: {
      padding: 18,

      borderRadius: 22,
      backgroundColor: '#FFFFFF',

      marginBottom: 24,
    },

    sectionTitle: {
      marginBottom: 12,

      fontSize: 18,
      fontWeight: '800',

      color: '#111111',
    },

    paragraph: {
      marginBottom: 10,

      fontSize: 15,
      lineHeight: 22,

      color: '#666666',
    },

    navigationTitle: {
      marginLeft: 4,
      marginBottom: 12,

      fontSize: 19,
      fontWeight: '800',

      color: '#111111',
    },

    menuCard: {
      borderRadius: 22,
      backgroundColor: '#FFFFFF',

      overflow: 'hidden',

      marginBottom: 18,
    },

    menuRow: {
      minHeight: 78,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',

      paddingHorizontal: 16,
    },

    menuLeft: {
      flex: 1,

      flexDirection: 'row',
      alignItems: 'center',

      marginRight: 10,
    },

    featureIcon: {
      width: 48,
      height: 48,

      borderRadius: 15,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: '#F3F3F3',
    },

    featureContent: {
      flex: 1,
      marginLeft: 14,
    },

    featureTitle: {
      fontSize: 16,
      fontWeight: '700',

      color: '#111111',
    },

    featureText: {
      marginTop: 3,

      fontSize: 13,
      lineHeight: 18,

      color: '#777777',
    },

    divider: {
      height: 1,

      marginLeft: 78,

      backgroundColor: '#EEEEEE',
    },

    menuButton: {
      minHeight: 56,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      gap: 8,

      borderRadius: 18,
      backgroundColor: '#111111',

      marginBottom: 16,
    },

    menuButtonText: {
      fontSize: 16,
      fontWeight: '800',

      color: '#FFFFFF',
    },

    versionCard: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 12,

      padding: 18,

      borderRadius: 20,
      backgroundColor: '#FFFFFF',
    },

    versionTitle: {
      fontSize: 14,
      fontWeight: '700',

      color: '#555555',
    },

    versionText: {
      marginTop: 2,

      fontSize: 12,

      color: '#999999',
    },
  });