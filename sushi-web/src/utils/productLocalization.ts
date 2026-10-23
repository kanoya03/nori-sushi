import type { AppLanguage } from '../i18n';

import type { Product } from '../types/product';

import type { Category } from '../api/categoriesApi';

export const getProductName = (product: Product, language: AppLanguage): string => {
  if (language === 'en' && product.nameEn) {
    return product.nameEn;
  }

  return product.name;
};

export const getProductDescription = (product: Product, language: AppLanguage): string => {
  if (language === 'en' && product.descriptionEn) {
    return product.descriptionEn;
  }

  return product.description;
};

export const getProductCategoryName = (product: Product, language: AppLanguage): string => {
  if (language === 'en' && product.categoryEn) {
    return product.categoryEn;
  }

  return product.category;
};

export const getCategoryName = (category: Category, language: AppLanguage): string => {
  if (language === 'en' && category.nameEn) {
    return category.nameEn;
  }

  return category.name;
};
