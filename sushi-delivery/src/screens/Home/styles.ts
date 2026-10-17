import { StyleSheet } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingBottom: 32,
  },

  categoriesSection: {
    marginTop: spacing.lg,
  },

  sectionTitle: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },

  categoriesContent: {
    paddingHorizontal: spacing.md,
  },

  productsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },

  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },

  noResultsText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#777777',
  },

  loadingCategoryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.md,
  },

  loadingCategoryLarge: {
    width: 72,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ECECEC',
  },

  loadingCategory: {
    width: 92,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F0F0F0',
  },

  loadingProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',

    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },

  loadingProductCard: {
    width: '48%',
    marginBottom: 18,

    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    overflow: 'hidden',

    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  loadingImage: {
    width: '100%',
    height: 140,

    backgroundColor: '#ECECEC',
  },

  loadingCardContent: {
    padding: 12,
  },

  loadingLineLarge: {
    width: '78%',
    height: 17,

    borderRadius: 9,

    backgroundColor: '#EDEDED',
  },

  loadingLineMedium: {
    width: '92%',
    height: 13,

    marginTop: 11,

    borderRadius: 7,

    backgroundColor: '#F0F0F0',
  },

  loadingLineSmall: {
    width: '45%',
    height: 13,

    marginTop: 8,

    borderRadius: 7,

    backgroundColor: '#F0F0F0',
  },

  loadingBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginTop: 20,
  },

  loadingPrice: {
    width: 66,
    height: 19,

    borderRadius: 10,

    backgroundColor: '#EDEDED',
  },

  loadingAddButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: '#E8E8E8',
  },
});