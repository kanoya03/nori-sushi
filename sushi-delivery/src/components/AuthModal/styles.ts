import { StyleSheet } from 'react-native';

import { colors } from '../../constants/colors';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor:
      'rgba(0, 0, 0, 0.45)',
  },

  sheet: {
    minHeight: 570,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 36,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.white,
  },

  handle: {
    width: 48,
    height: 5,
    alignSelf: 'center',
    marginBottom: 28,
    borderRadius: 3,
    backgroundColor: '#BDBDBD',
  },

  icon: {
    textAlign: 'center',
    fontSize: 70,
  },

  title: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },

  subtitle: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 24,
    color: colors.secondaryText,
  },

  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 28,
  },

  checkbox: {
    width: 26,
    height: 26,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#A0A0A0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxActive: {
    backgroundColor: '#3390EC',
    borderColor: '#3390EC',
  },

  checkboxMark: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
  },

  consentText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  googleButton: {
    height: 56,
    marginTop: 26,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  googleButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
  },

  telegramButton: {
    height: 56,
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#3390EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  telegramButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },

  disabledButton: {
    opacity: 0.45,
  },

  backButton: {
    position: 'absolute',
    top: 28,
    left: 24,
    zIndex: 1,
  },

  backText: {
    fontSize: 42,
    color: colors.text,
  },

  codeInput: {
    height: 60,
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 10,
    color: colors.text,
  },

  verifyButton: {
    height: 56,
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  verifyButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },

  error: {
    marginTop: 14,
    textAlign: 'center',
    color: '#C62828',
  },

  privacy: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: colors.secondaryText,
  },
});