import { StyleSheet } from 'react-native';

import { colors } from '../../constants/colors';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },

  button: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },

  activeButton: {
    backgroundColor: colors.text,
  },

  text: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondaryText,
  },

  activeText: {
    color: colors.white,
  },
});