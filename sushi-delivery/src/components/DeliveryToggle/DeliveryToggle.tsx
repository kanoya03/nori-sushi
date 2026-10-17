import {
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  useTranslation,
} from 'react-i18next';

import {
  useAddressStore,
} from '../../store/addressStore';

import type {
  DeliveryType,
} from '../../store/addressStore';

import {
  styles,
} from './styles';

type DeliveryToggleProps = {
  onChange?: (
    value: DeliveryType
  ) => void;
};

export const DeliveryToggle = ({
  onChange,
}: DeliveryToggleProps) => {
  const { t } =
    useTranslation();

  const deliveryType =
    useAddressStore(
      (state) =>
        state.deliveryType
    );

  const setDeliveryType =
    useAddressStore(
      (state) =>
        state.setDeliveryType
    );

  const handleChange = (
    value: DeliveryType
  ) => {
    setDeliveryType(value);
    onChange?.(value);
  };

  return (
    <View
      style={
        styles.container
      }
    >
      <Pressable
        style={[
          styles.button,

          deliveryType ===
            'delivery' &&
            styles.activeButton,
        ]}
        onPress={() =>
          handleChange(
            'delivery'
          )
        }
      >
        <Text
          style={[
            styles.text,

            deliveryType ===
              'delivery' &&
              styles.activeText,
          ]}
        >
          {t(
            'delivery.delivery'
          )}
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.button,

          deliveryType ===
            'pickup' &&
            styles.activeButton,
        ]}
        onPress={() =>
          handleChange(
            'pickup'
          )
        }
      >
        <Text
          style={[
            styles.text,

            deliveryType ===
              'pickup' &&
              styles.activeText,
          ]}
        >
          {t(
            'delivery.pickup'
          )}
        </Text>
      </Pressable>
    </View>
  );
};