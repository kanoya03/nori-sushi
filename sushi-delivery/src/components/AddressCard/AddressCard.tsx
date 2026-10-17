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
  DeliveryAddress,
} from '../../store/addressStore';

import {
  styles,
} from './styles';

type AddressCardProps = {
  onPress?: () => void;
};

const formatDeliveryAddress = (
  address:
    DeliveryAddress | null
): string | null => {
  if (!address) {
    return null;
  }

  return [
    address.city,
    address.street,
    address.house,
  ]
    .filter(Boolean)
    .join(', ');
};

export const AddressCard = ({
  onPress,
}: AddressCardProps) => {
  const { t } =
    useTranslation();

  const currentAddress =
    useAddressStore(
      (state) =>
        state.currentAddress
    );

  const deliveryType =
    useAddressStore(
      (state) =>
        state.deliveryType
    );

  const selectedPickupPoint =
    useAddressStore(
      (state) =>
        state.selectedPickupPoint
    );

  const isPickup =
    deliveryType === 'pickup';

  const deliveryAddress =
    formatDeliveryAddress(
      currentAddress
    );

  return (
    <Pressable
      style={
        styles.container
      }
      onPress={
        onPress
      }
    >
      <View
        style={
          styles.locationIcon
        }
      >
        <Text
          style={
            styles.locationIconText
          }
        >
          ●
        </Text>
      </View>

      <View
        style={
          styles.content
        }
      >
        <Text
          style={
            styles.label
          }
        >
          {isPickup
            ? t(
                'address.pickupPoint'
              )
            : t(
                'address.deliveryAddress'
              )}
        </Text>

        {isPickup ? (
          selectedPickupPoint ? (
            <>
              <Text
                style={
                  styles.address
                }
              >
                {
                  selectedPickupPoint.name
                }
              </Text>

              <Text
                style={
                  styles.address
                }
              >
                {
                  selectedPickupPoint.address
                }
              </Text>
            </>
          ) : (
            <Text
              style={
                styles.address
              }
            >
              {t(
                'address.choosePickupPoint'
              )}
            </Text>
          )
        ) : (
          <Text
            style={
              styles.address
            }
          >
            {deliveryAddress ??
              t(
                'address.specifyAddress'
              )}
          </Text>
        )}
      </View>

      <Text
        style={
          styles.arrow
        }
      >
        ›
      </Text>
    </Pressable>
  );
};