import { StyleSheet } from 'react-native';

import { colors } from '../../constants/colors';

export const styles = StyleSheet.create({
  container: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  activeContainer: {
    backgroundColor: colors.text,
  },

  text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondaryText,
  },

  activeText: {
    color: colors.white,
  },
});