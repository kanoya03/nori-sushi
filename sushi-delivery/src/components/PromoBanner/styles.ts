import { StyleSheet } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

export const styles = StyleSheet.create({
  container: {
    minHeight: 170,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.accent,
    overflow: 'hidden',
  },

  content: {
    flex: 1,
  },

  badge: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.white,
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 16,
    color: colors.white,
  },

  button: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.white,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },

  emoji: {
    marginLeft: spacing.sm,
    fontSize: 80,
  },
});