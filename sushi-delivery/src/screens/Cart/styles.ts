import { StyleSheet } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.background,
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
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 40,
  },

  item: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: 12,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  image: {
    width: 104,
    height: 104,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },

  itemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },

  name: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },

  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F1F1F1',
  },

  counterButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterText: {
    fontSize: 22,
    color: colors.text,
  },

  quantity: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },

  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  remove: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C64040',
  },

  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#E7E7E7',
  },

  summaryLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },

  summaryPrice: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.text,
  },

  checkoutButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,

    marginTop: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.accent,
  },

  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },

  emptyText: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});