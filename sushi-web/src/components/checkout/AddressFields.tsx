import { useTranslation } from 'react-i18next';
import type { AddressInput } from '../../types/commerce';

type AddressField = 'city' | 'street' | 'house' | 'apartment' | 'entrance' | 'floor';

type Props = {
  value: Pick<AddressInput, AddressField>;
  onChange: (field: AddressField, value: string) => void;
};

export function AddressFields({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <label>
        {t('address.city')}
        <input
          required
          autoComplete="address-level2"
          value={value.city}
          onChange={(event) => onChange('city', event.target.value)}
        />
      </label>
      <label>
        {t('address.street')}
        <input
          required
          autoComplete="address-line1"
          value={value.street}
          onChange={(event) => onChange('street', event.target.value)}
        />
      </label>
      <label>
        {t('address.house')}
        <input
          required
          value={value.house}
          onChange={(event) => onChange('house', event.target.value)}
        />
      </label>
      <label>
        {t('address.apartment')}
        <input
          value={value.apartment ?? ''}
          onChange={(event) => onChange('apartment', event.target.value)}
        />
      </label>
      <label>
        {t('address.entrance')}
        <input
          value={value.entrance ?? ''}
          onChange={(event) => onChange('entrance', event.target.value)}
        />
      </label>
      <label>
        {t('address.floor')}
        <input
          value={value.floor ?? ''}
          onChange={(event) => onChange('floor', event.target.value)}
        />
      </label>
    </>
  );
}
