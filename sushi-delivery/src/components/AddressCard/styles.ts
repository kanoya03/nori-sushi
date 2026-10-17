import { StyleSheet } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

export const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },

  locationIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderRadius: 19,
    backgroundColor: colors.background,
  },

  locationIconText: {
    fontSize: 15,
    color: colors.accent,
  },

  content: {
    flex: 1,
  },

  label: {
    marginBottom: 3,
    fontSize: 12,
    color: colors.secondaryText,
  },

  address: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },

  arrow: {
    fontSize: 28,
    color: colors.secondaryText,
  },
});