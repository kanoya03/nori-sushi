import type {
  AppLanguage,
} from '../i18n';

const KZT_PER_USD = 460;

export const formatPrice = (
  priceKzt: number,
  language: AppLanguage
): string => {
  if (language === 'ru') {
    return `${priceKzt.toLocaleString(
      'ru-RU'
    )} ₸`;
  }

  const priceUsd =
    priceKzt /
    KZT_PER_USD;

  return `$${priceUsd.toLocaleString(
    'en-US',
    {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }
  )}`;
};

export const formatWeight = (
  weight: string,
  language: AppLanguage
): string => {
  if (language === 'ru') {
    return weight;
  }

  return weight
    .replace(
      /\s*г$/i,
      ' g'
    )
    .replace(
      /\s*мл$/i,
      ' ml'
    );
};