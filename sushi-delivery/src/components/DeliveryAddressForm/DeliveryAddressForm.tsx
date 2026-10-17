import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useRef,
} from 'react';

import {
  useTranslation,
} from 'react-i18next';

type DeliveryAddressFormProps = {
  addressLine: string;
  apartment: string;
  entrance: string;
  floor: string;
  comment: string;

  onAddressLineChange: (
    value: string
  ) => void;

  onApartmentChange: (
    value: string
  ) => void;

  onEntranceChange: (
    value: string
  ) => void;

  onFloorChange: (
    value: string
  ) => void;

  onCommentChange: (
    value: string
  ) => void;
};

export const DeliveryAddressForm = ({
  addressLine,
  apartment,
  entrance,
  floor,
  comment,
  onAddressLineChange,
  onApartmentChange,
  onEntranceChange,
  onFloorChange,
  onCommentChange,
}: DeliveryAddressFormProps) => {
  const { t } =
    useTranslation();

  const addressInputRef =
    useRef<TextInput | null>(
      null
    );

  const apartmentInputRef =
    useRef<TextInput | null>(
      null
    );

  const entranceInputRef =
    useRef<TextInput | null>(
      null
    );

  const floorInputRef =
    useRef<TextInput | null>(
      null
    );

  const commentInputRef =
    useRef<TextInput | null>(
      null
    );

  return (
    <>
      <View
        style={
          styles.addressSection
        }
      >
        <Pressable
          style={
            styles.addressMainArea
          }
          onPress={() =>
            addressInputRef.current
              ?.focus()
          }
        >
          <View
            style={
              styles.addressHeader
            }
          >
            <Text
              style={
                styles.fieldLabel
              }
            >
              {t(
                'address.deliveryAddress'
              )}
            </Text>
          </View>

          <TextInput
            ref={
              addressInputRef
            }
            style={
              styles.fullAddressInput
            }
            placeholder={
              t(
                'address.cityStreetHouse'
              )
            }
            placeholderTextColor="#8E8E8E"
            value={
              addressLine
            }
            onChangeText={
              onAddressLineChange
            }
            returnKeyType="done"
          />
        </Pressable>

        <View
          style={
            styles.detailsRow
          }
        >
          <Pressable
            style={
              styles.detailCell
            }
            onPress={() =>
              apartmentInputRef.current
                ?.focus()
            }
          >
            <Text
              style={
                styles.detailLabel
              }
            >
              {t(
                'address.apartment'
              )}
            </Text>

            <TextInput
              ref={
                apartmentInputRef
              }
              style={
                styles.detailInput
              }
              value={
                apartment
              }
              onChangeText={
                onApartmentChange
              }
              keyboardType="numeric"
            />
          </Pressable>

          <Pressable
            style={
              styles.detailCell
            }
            onPress={() =>
              entranceInputRef.current
                ?.focus()
            }
          >
            <Text
              style={
                styles.detailLabel
              }
            >
              {t(
                'address.entrance'
              )}
            </Text>

            <TextInput
              ref={
                entranceInputRef
              }
              style={
                styles.detailInput
              }
              value={
                entrance
              }
              onChangeText={
                onEntranceChange
              }
              keyboardType="numeric"
            />
          </Pressable>

          <Pressable
            style={[
              styles.detailCell,
              styles.detailCellLast,
            ]}
            onPress={() =>
              floorInputRef.current
                ?.focus()
            }
          >
            <Text
              style={
                styles.detailLabel
              }
            >
              {t(
                'address.floor'
              )}
            </Text>

            <TextInput
              ref={
                floorInputRef
              }
              style={
                styles.detailInput
              }
              value={
                floor
              }
              onChangeText={
                onFloorChange
              }
              keyboardType="numeric"
            />
          </Pressable>
        </View>
      </View>

      <Pressable
        style={
          styles.commentBox
        }
        onPress={() =>
          commentInputRef.current
            ?.focus()
        }
      >
        <Text
          style={
            styles.commentLabel
          }
        >
          {t(
            'address.courierComment'
          )}
        </Text>

        <TextInput
          ref={
            commentInputRef
          }
          style={
            styles.commentInput
          }
          value={
            comment
          }
          onChangeText={
            onCommentChange
          }
          multiline
          textAlignVertical="top"
        />
      </Pressable>
    </>
  );
};

const styles =
  StyleSheet.create({
    addressSection: {
      marginTop: 9,
      borderRadius: 17,
      overflow: 'hidden',
      backgroundColor:
        'rgba(55,62,60,0.88)',
    },

    addressMainArea: {
      minHeight: 65,
    },

    addressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingTop: 9,
    },

    fieldLabel: {
      color:
        'rgba(255,255,255,0.52)',
      fontSize: 12,
      fontWeight: '500',
    },

    fullAddressInput: {
      flex: 1,
      minHeight: 43,
      paddingHorizontal: 15,
      paddingTop: 3,
      paddingBottom: 8,
      color: '#FFFFFF',
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '700',
    },

    detailsRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor:
        'rgba(255,255,255,0.13)',
    },

    detailCell: {
      flex: 1,
      minHeight: 58,
      paddingHorizontal: 13,
      paddingTop: 7,
      paddingBottom: 6,
      borderRightWidth: 1,
      borderRightColor:
        'rgba(255,255,255,0.13)',
    },

    detailCellLast: {
      borderRightWidth: 0,
    },

    detailLabel: {
      minHeight: 15,
      fontSize: 12,
      color:
        'rgba(255,255,255,0.48)',
    },

    detailInput: {
      flex: 1,
      padding: 0,
      marginTop: 1,
      fontSize: 16,
      fontWeight: '500',
      color: '#FFFFFF',
    },

    commentBox: {
      minHeight: 58,
      marginTop: 9,
      paddingHorizontal: 15,
      paddingTop: 9,
      paddingBottom: 7,
      borderRadius: 17,
      backgroundColor:
        'rgba(55,62,60,0.88)',
    },

    commentLabel: {
      fontSize: 12,
      color:
        'rgba(255,255,255,0.48)',
    },

    commentInput: {
      flex: 1,
      minHeight: 28,
      marginTop: 2,
      padding: 0,
      color: '#FFFFFF',
      fontSize: 15,
      lineHeight: 18,
    },
  });