import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useTranslation,
} from 'react-i18next';

import type {
  PickupPoint,
} from '../../store/addressStore';

type PickupPointsListProps = {
  points: PickupPoint[];
  selectedPoint:
    PickupPoint | null;

  onSelect: (
    point: PickupPoint
  ) => void;
};

export const PickupPointsList = ({
  points,
  selectedPoint,
  onSelect,
}: PickupPointsListProps) => {
  const { t } =
    useTranslation();

  return (
    <View
      style={
        styles.pickupSection
      }
    >
      <Text
        style={
          styles.pickupTitle
        }
      >
        {t(
          'address.pickupPoints'
        )}
      </Text>

      {points.map(
        (point) => {
          const selected =
            selectedPoint?.id ===
            point.id;

          return (
            <Pressable
              key={point.id}
              style={[
                styles.pickupCard,

                selected &&
                  styles.pickupCardActive,
              ]}
              onPress={() =>
                onSelect(
                  point
                )
              }
            >
              <View
                style={[
                  styles.pickupCardIcon,

                  selected &&
                    styles.pickupCardIconActive,
                ]}
              >
                <Ionicons
                  name="restaurant-outline"
                  size={20}
                  color={
                    selected
                      ? '#FFFFFF'
                      : '#111111'
                  }
                />
              </View>

              <View
                style={
                  styles.pickupCardInfo
                }
              >
                <Text
                  style={
                    styles.pickupCardName
                  }
                >
                  {point.name}
                </Text>

                <Text
                  style={
                    styles.pickupCardAddress
                  }
                >
                  {point.address}
                </Text>
              </View>

              {selected && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#27BE6B"
                />
              )}
            </Pressable>
          );
        }
      )}
    </View>
  );
};

const styles =
  StyleSheet.create({
    pickupSection: {
      marginTop: 9,
      gap: 7,
    },

    pickupTitle: {
      marginLeft: 4,
      marginBottom: 2,
      fontSize: 13,
      fontWeight: '600',
      color:
        'rgba(255,255,255,0.55)',
    },

    pickupCard: {
      minHeight: 60,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        'transparent',
      backgroundColor:
        'rgba(55,62,60,0.88)',
    },

    pickupCardActive: {
      borderColor:
        'rgba(39,190,107,0.65)',
      backgroundColor:
        'rgba(50,68,59,0.94)',
    },

    pickupCardIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 10,
      backgroundColor:
        '#FFFFFF',
    },

    pickupCardIconActive: {
      backgroundColor:
        '#27BE6B',
    },

    pickupCardInfo: {
      flex: 1,
    },

    pickupCardName: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },

    pickupCardAddress: {
      marginTop: 2,
      color:
        'rgba(255,255,255,0.52)',
      fontSize: 12,
      lineHeight: 16,
    },
  });