import {
  StyleSheet,
} from 'react-native';

export const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#F5F5F5',
    },

    header: {
      height: 64,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      paddingHorizontal: 16,

      backgroundColor:
        '#F5F5F5',
    },

    headerButton: {
      width: 52,
      height: 44,

      alignItems:
        'flex-start',

      justifyContent:
        'center',
    },

    headerButtonRight: {
      alignItems:
        'flex-end',
    },

    headerSpacer: {
      width: 52,
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#111111',
    },

    languageHeaderBadge: {
      minWidth: 44,
      height: 34,

      paddingHorizontal: 10,

      borderRadius: 12,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        '#FFFFFF',
    },

    languageHeaderBadgeText: {
      fontSize: 13,
      fontWeight: '800',

      color: '#111111',
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 36,
    },

    profileCard: {
      minHeight: 132,

      flexDirection: 'row',
      alignItems: 'center',

      padding: 16,
      marginBottom: 18,

      borderRadius: 24,

      backgroundColor:
        '#FFFFFF',
    },

    avatarContainer: {
      width: 96,
      height: 96,

      borderRadius: 22,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        '#F3F3F3',
    },

    profileInfo: {
      flex: 1,

      marginLeft: 16,
      marginRight: 8,
    },

    name: {
      fontSize: 21,
      fontWeight: '800',
      color: '#111111',
    },

    profileDescription: {
      marginTop: 6,

      fontSize: 14,
      lineHeight: 19,

      color: '#777777',
    },

    telegramStatus: {
      marginTop: 7,

      fontSize: 13,
      fontWeight: '600',

      color: '#4F9D7B',
    },

    editIconButton: {
      width: 38,
      height: 38,

      borderRadius: 19,

      alignItems: 'center',
      justifyContent: 'center',

      alignSelf:
        'flex-start',

      backgroundColor:
        '#F4F4F4',
    },

    menuCard: {
      marginBottom: 18,

      borderRadius: 24,

      backgroundColor:
        '#FFFFFF',

      overflow: 'hidden',
    },

    menuRow: {
      minHeight: 72,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      paddingHorizontal: 20,
    },

    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 15,
    },

    menuText: {
      fontSize: 17,
      fontWeight: '500',

      color: '#161616',
    },

    logoutText: {
      fontSize: 17,
      fontWeight: '600',

      color: '#C64040',
    },

    divider: {
      height: 1,
      marginLeft: 59,

      backgroundColor:
        '#EEEEEE',
    },

    guestContainer: {
      flex: 1,

      alignItems: 'center',
      justifyContent: 'center',

      paddingHorizontal: 30,
    },

    guestAvatar: {
      width: 110,
      height: 110,

      borderRadius: 55,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        '#EEEEEE',
    },

    guestTitle: {
      marginTop: 24,

      fontSize: 28,
      fontWeight: '800',

      color: '#111111',
    },

    guestDescription: {
      maxWidth: 300,

      marginTop: 10,

      textAlign: 'center',

      fontSize: 15,
      lineHeight: 22,

      color: '#777777',
    },

    loginButton: {
      minWidth: 180,

      marginTop: 26,

      paddingHorizontal: 30,
      paddingVertical: 16,

      borderRadius: 16,

      backgroundColor:
        '#111111',

      alignItems: 'center',
    },

    loginButtonText: {
      color: '#FFFFFF',

      fontSize: 16,
      fontWeight: '700',
    },

    languageOverlay: {
      flex: 1,

      justifyContent:
        'flex-end',
    },

    languageBackdrop: {
      ...StyleSheet.absoluteFill,

      backgroundColor:
        'rgba(0,0,0,0.35)',
    },

    languageSheet: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 28,

      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,

      backgroundColor:
        '#FFFFFF',
    },

    languageHandle: {
      width: 42,
      height: 5,

      alignSelf: 'center',

      marginBottom: 16,

      borderRadius: 3,

      backgroundColor:
        '#DDDDDD',
    },

    languageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      marginBottom: 18,
    },

    languageTitle: {
      fontSize: 21,
      fontWeight: '800',

      color: '#111111',
    },

    languageCloseButton: {
      width: 36,
      height: 36,

      borderRadius: 18,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        '#F3F3F3',
    },

    languageOptions: {
      flexDirection: 'row',

      gap: 12,
    },

    languageOption: {
      flex: 1,

      height: 62,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      gap: 8,

      borderRadius: 18,

      borderWidth: 1,
      borderColor:
        '#E7E7E7',

      backgroundColor:
        '#F7F7F7',
    },

    languageOptionActive: {
      borderColor:
        '#27BE6B',

      backgroundColor:
        '#27BE6B',
    },

    languageOptionText: {
      fontSize: 17,
      fontWeight: '800',

      letterSpacing: 0.5,

      color: '#333333',
    },

    languageOptionTextActive: {
      color: '#FFFFFF',
    },

    languageCheck: {
      width: 22,
      height: 22,

      borderRadius: 11,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        'rgba(255,255,255,0.22)',
    },
  });