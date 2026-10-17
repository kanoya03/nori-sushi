import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Keyboard,
  Pressable,
  Text,
  View,
} from 'react-native';

import Mapbox
  from '@rnmapbox/maps';

import * as Location
  from 'expo-location';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useTranslation,
} from 'react-i18next';

import {
  createAddress,
  getAddresses,
  updateAddress,
} from '../../api/addressesApi';

import type {
  CreateAddressData,
} from '../../api/addressesApi';

import {
  reverseGeocode,
} from '../../api/mapboxGeocoding';

import {
  DeliveryAddressForm,
} from '../../components/DeliveryAddressForm/DeliveryAddressForm';

import {
  PickupPointsList,
} from '../../components/PickupPointsList/PickupPointsList';

import {
  PICKUP_POINTS,
} from '../../constants/pickupPoints';

import type {
  RootStackParamList,
} from '../../navigation/types';

import {
  useAuthStore,
} from '../../store/authStore';

import {
  useAddressStore,
} from '../../store/addressStore';

import type {
  DeliveryType,
  PickupPoint,
} from '../../store/addressStore';

import {
  styles,
} from './styles';

Mapbox.setAccessToken(
  process.env
    .EXPO_PUBLIC_MAPBOX_TOKEN ??
    ''
);

const DEFAULT_COORDINATE:
  [number, number] = [
    9.19,
    45.4642,
  ];

const DEFAULT_ZOOM = 16;

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'DeliveryMap'
  >;

const formatAddressLine = (
  city: string,
  street: string,
  house: string
): string => {
  return [
    city,
    street,
    house,
  ]
    .filter(Boolean)
    .join(', ');
};

export const DeliveryMapScreen = ({
  navigation,
}: Props) => {
  const { t } =
    useTranslation();

  const mapRef =
    useRef<any>(null);

  const cameraRef =
    useRef<any>(null);

  const isMountedRef =
    useRef(true);

  const reverseGeocodeRequestIdRef =
    useRef(0);

  const skipNextMapIdleRef =
    useRef(false);

  const accessToken =
    useAuthStore(
      (state) =>
        state.accessToken
    );

  const currentAddress =
    useAddressStore(
      (state) =>
        state.currentAddress
    );

  const globalDeliveryType =
    useAddressStore(
      (state) =>
        state.deliveryType
    );

  const globalPickupPoint =
    useAddressStore(
      (state) =>
        state.selectedPickupPoint
    );

  const setCurrentAddress =
    useAddressStore(
      (state) =>
        state.setCurrentAddress
    );

  const setDeliveryType =
    useAddressStore(
      (state) =>
        state.setDeliveryType
    );

  const setGlobalPickupPoint =
    useAddressStore(
      (state) =>
        state.setSelectedPickupPoint
    );

  const [
    mode,
    setMode,
  ] = useState<DeliveryType>(
    globalDeliveryType
  );

  const [
    addressLine,
    setAddressLine,
  ] = useState('');

  const [
    apartment,
    setApartment,
  ] = useState('');

  const [
    entrance,
    setEntrance,
  ] = useState('');

  const [
    floor,
    setFloor,
  ] = useState('');

  const [
    comment,
    setComment,
  ] = useState('');

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    keyboardHeight,
    setKeyboardHeight,
  ] = useState(0);

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState<
    number | null
  >(null);

  const [
    selectedCoordinate,
    setSelectedCoordinate,
  ] = useState<
    [number, number] | null
  >(null);

  const [
    selectedPickupPoint,
    setSelectedPickupPoint,
  ] = useState<
    PickupPoint | null
  >(
    globalPickupPoint
  );

  useEffect(() => {
    isMountedRef.current =
      true;

    return () => {
      isMountedRef.current =
        false;

      reverseGeocodeRequestIdRef.current +=
        1;
    };
  }, []);

  useEffect(() => {
    const requestLocationPermission =
      async () => {
        try {
          const permission =
            await Location
              .requestForegroundPermissionsAsync();

          if (
            !isMountedRef.current
          ) {
            return;
          }

          if (
            permission.status !==
            'granted'
          ) {
            Alert.alert(
              t(
                'deliveryMap.locationTitle'
              ),
              t(
                'deliveryMap.locationPermission'
              )
            );
          }
        } catch (error) {
          if (
            !isMountedRef.current
          ) {
            return;
          }

          console.error(
            'Location permission error:',
            error
          );
        }
      };

    void requestLocationPermission();
  }, [
    t,
  ]);

  useEffect(() => {
    const showSubscription =
      Keyboard.addListener(
        'keyboardDidShow',
        (event) => {
          setKeyboardHeight(
            event.endCoordinates
              .height
          );
        }
      );

    const hideSubscription =
      Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardHeight(
            0
          );
        }
      );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (
      accessToken ||
      !currentAddress ||
      globalDeliveryType !==
        'delivery'
    ) {
      return;
    }

    setAddressLine(
      formatAddressLine(
        currentAddress.city,
        currentAddress.street,
        currentAddress.house
      )
    );

    setApartment(
      currentAddress.apartment ??
        ''
    );

    setEntrance(
      currentAddress.entrance ??
        ''
    );

    setFloor(
      currentAddress.floor ??
        ''
    );

    setComment(
      currentAddress.comment ??
        ''
    );

    if (
      currentAddress.latitude !=
        null &&
      currentAddress.longitude !=
        null
    ) {
      setSelectedCoordinate([
        currentAddress.longitude,
        currentAddress.latitude,
      ]);
    } else {
      setSelectedCoordinate(
        null
      );
    }
  }, [
    accessToken,
    currentAddress,
    globalDeliveryType,
  ]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isActive =
      true;

    const loadAddresses =
      async () => {
        try {
          const data =
            await getAddresses(
              accessToken
            );

          if (!isActive) {
            return;
          }

          const defaultAddress =
            data.find(
              (item) =>
                item.isDefault
            );

          if (
            !defaultAddress
          ) {
            return;
          }

          setCurrentAddress(
            defaultAddress
          );

          setSelectedAddressId(
            defaultAddress.id
          );

          setAddressLine(
            formatAddressLine(
              defaultAddress.city,
              defaultAddress.street,
              defaultAddress.house
            )
          );

          setApartment(
            defaultAddress.apartment ??
              ''
          );

          setEntrance(
            defaultAddress.entrance ??
              ''
          );

          setFloor(
            defaultAddress.floor ??
              ''
          );

          setComment(
            defaultAddress.comment ??
              ''
          );

          if (
            defaultAddress.latitude !=
              null &&
            defaultAddress.longitude !=
              null
          ) {
            setSelectedCoordinate([
              defaultAddress.longitude,
              defaultAddress.latitude,
            ]);

            const camera =
              cameraRef.current;

            if (camera) {
              skipNextMapIdleRef.current =
                true;

              camera.setCamera({
                centerCoordinate: [
                  defaultAddress.longitude,
                  defaultAddress.latitude,
                ],

                zoomLevel:
                  DEFAULT_ZOOM,

                animationMode:
                  'flyTo',

                animationDuration:
                  700,
              });
            }
          } else {
            setSelectedCoordinate(
              null
            );
          }
        } catch (error) {
          if (!isActive) {
            return;
          }

          console.error(
            'Failed to load addresses:',
            error
          );
        }
      };

    void loadAddresses();

    return () => {
      isActive =
        false;
    };
  }, [
    accessToken,
    setCurrentAddress,
  ]);

  useEffect(() => {
    if (
      globalDeliveryType !==
        'pickup' ||
      !globalPickupPoint
    ) {
      return;
    }

    setMode(
      'pickup'
    );

    setSelectedPickupPoint(
      globalPickupPoint
    );

    const timeout =
      setTimeout(() => {
        cameraRef.current
          ?.setCamera({
            centerCoordinate:
              globalPickupPoint.coordinate,

            zoomLevel:
              16.5,

            animationMode:
              'flyTo',

            animationDuration:
              500,
          });
      }, 300);

    return () => {
      clearTimeout(
        timeout
      );
    };
  }, [
    globalDeliveryType,
    globalPickupPoint,
  ]);

  const resolveAddress =
    async (
      latitude: number,
      longitude: number
    ) => {
      const requestId =
        ++reverseGeocodeRequestIdRef.current;

      try {
        const resolvedAddress =
          await reverseGeocode(
            latitude,
            longitude
          );

        if (
          !isMountedRef.current ||
          requestId !==
            reverseGeocodeRequestIdRef.current
        ) {
          return;
        }

        if (
          !resolvedAddress
        ) {
          setAddressLine('');

          return;
        }

        setAddressLine(
          formatAddressLine(
            resolvedAddress.city,
            resolvedAddress.street,
            resolvedAddress.house
          )
        );
      } catch (error) {
        if (
          !isMountedRef.current ||
          requestId !==
            reverseGeocodeRequestIdRef.current
        ) {
          return;
        }

        console.error(
          'Mapbox reverse geocoding error:',
          error
        );
      }
    };

  const handleMapIdle =
    async () => {
      if (
        skipNextMapIdleRef.current
      ) {
        skipNextMapIdleRef.current =
          false;

        return;
      }

      if (
        mode !==
        'delivery'
      ) {
        return;
      }

      try {
        const center =
          await mapRef.current
            ?.getCenter();

        if (
          !isMountedRef.current
        ) {
          return;
        }

        if (
          !center ||
          center.length < 2
        ) {
          return;
        }

        const [
          longitude,
          latitude,
        ] = center;

        setSelectedCoordinate([
          longitude,
          latitude,
        ]);

        await resolveAddress(
          latitude,
          longitude
        );
      } catch (error) {
        if (
          !isMountedRef.current
        ) {
          return;
        }

        console.error(
          'Failed to get map center:',
          error
        );
      }
    };

  const goToCurrentLocation =
    async () => {
      try {
        const permission =
          await Location
            .requestForegroundPermissionsAsync();

        if (
          !isMountedRef.current
        ) {
          return;
        }

        if (
          permission.status !==
          'granted'
        ) {
          Alert.alert(
            t(
              'deliveryMap.locationTitle'
            ),
            t(
              'deliveryMap.locationDenied'
            )
          );

          return;
        }

        const location =
          await Location
            .getCurrentPositionAsync({
              accuracy:
                Location
                  .Accuracy
                  .Balanced,
            });

        if (
          !isMountedRef.current
        ) {
          return;
        }

        const longitude =
          location.coords.longitude;

        const latitude =
          location.coords.latitude;

        setSelectedCoordinate([
          longitude,
          latitude,
        ]);

        const camera =
          cameraRef.current;

        if (camera) {
          if (
            mode ===
            'delivery'
          ) {
            skipNextMapIdleRef.current =
              true;
          }

          camera.setCamera({
            centerCoordinate: [
              longitude,
              latitude,
            ],

            zoomLevel:
              DEFAULT_ZOOM,

            animationMode:
              'flyTo',

            animationDuration:
              700,
          });
        }

        if (
          mode ===
          'delivery'
        ) {
          await resolveAddress(
            latitude,
            longitude
          );
        }
      } catch (error) {
        if (
          !isMountedRef.current
        ) {
          return;
        }

        console.error(
          'Location error:',
          error
        );
      }
    };

  const handleAddressLineChange = (
    value: string
  ) => {
    reverseGeocodeRequestIdRef.current +=
      1;

    setAddressLine(
      value
    );

    setSelectedCoordinate(
      null
    );
  };

  const selectPickupPoint = (
    point: PickupPoint
  ) => {
    setSelectedPickupPoint(
      point
    );

    cameraRef.current
      ?.setCamera({
        centerCoordinate:
          point.coordinate,

        zoomLevel:
          16.5,

        animationMode:
          'flyTo',

        animationDuration:
          600,
      });
  };

  const handleContinue =
    async () => {
      if (
        mode === 'pickup'
      ) {
        if (
          !selectedPickupPoint
        ) {
          Alert.alert(
            t(
              'deliveryMap.pickupTitle'
            ),
            t(
              'deliveryMap.choosePickup'
            )
          );

          return;
        }

        setDeliveryType(
          'pickup'
        );

        setGlobalPickupPoint(
          selectedPickupPoint
        );

        navigation.goBack();

        return;
      }

      const addressParts =
        addressLine
          .split(',')
          .map(
            (part) =>
              part.trim()
          )
          .filter(Boolean);

      const parsedCity =
        addressParts[0] ??
        '';

      const parsedStreet =
        addressParts[1] ??
        '';

      const parsedHouse =
        addressParts
          .slice(2)
          .join(', ');

      if (
        !parsedCity ||
        !parsedStreet ||
        !parsedHouse
      ) {
        Alert.alert(
          t(
            'deliveryMap.addressTitle'
          ),
          t(
            'deliveryMap.addressFormat'
          )
        );

        return;
      }

      const addressData:
        CreateAddressData = {
        city:
          parsedCity,

        street:
          parsedStreet,

        house:
          parsedHouse,

        apartment:
          apartment.trim() ||
          undefined,

        entrance:
          entrance.trim() ||
          undefined,

        floor:
          floor.trim() ||
          undefined,

        comment:
          comment.trim() ||
          undefined,

        latitude:
          selectedCoordinate?.[1],

        longitude:
          selectedCoordinate?.[0],

        isDefault:
          true,
      };

      if (
        !accessToken
      ) {
        setCurrentAddress({
          city:
            parsedCity,

          street:
            parsedStreet,

          house:
            parsedHouse,

          apartment:
            apartment.trim() ||
            undefined,

          entrance:
            entrance.trim() ||
            undefined,

          floor:
            floor.trim() ||
            undefined,

          comment:
            comment.trim() ||
            undefined,

          latitude:
            selectedCoordinate?.[1],

          longitude:
            selectedCoordinate?.[0],
        });

        setDeliveryType(
          'delivery'
        );

        setGlobalPickupPoint(
          null
        );

        navigation.goBack();

        return;
      }

      if (
        selectedAddressId
      ) {
        try {
          setIsSaving(
            true
          );

          const updatedAddress =
            await updateAddress(
              accessToken,
              selectedAddressId,
              addressData
            );

          if (
            !isMountedRef.current
          ) {
            return;
          }

          setCurrentAddress(
            updatedAddress
          );

          setDeliveryType(
            'delivery'
          );

          setGlobalPickupPoint(
            null
          );

          navigation.goBack();

          return;
        } catch (error) {
          if (
            !isMountedRef.current
          ) {
            return;
          }

          console.error(
            'Failed to update address:',
            error
          );

          Alert.alert(
            t(
              'common.error'
            ),
            t(
              'deliveryMap.updateError'
            )
          );

          return;
        } finally {
          if (
            isMountedRef.current
          ) {
            setIsSaving(
              false
            );
          }
        }
      }

      try {
        setIsSaving(
          true
        );

        const newAddress =
          await createAddress(
            accessToken,
            addressData
          );

        if (
          !isMountedRef.current
        ) {
          return;
        }

        setCurrentAddress(
          newAddress
        );

        setDeliveryType(
          'delivery'
        );

        setGlobalPickupPoint(
          null
        );

        navigation.goBack();
      } catch (error) {
        if (
          !isMountedRef.current
        ) {
          return;
        }

        console.error(
          'Failed to save address:',
          error
        );

        Alert.alert(
          t(
            'common.error'
          ),
          t(
            'deliveryMap.saveError'
          )
        );
      } finally {
        if (
          isMountedRef.current
        ) {
          setIsSaving(
            false
          );
        }
      }
    };

  return (
    <SafeAreaView
      style={
        styles.container
      }
      edges={[]}
    >
      <Mapbox.MapView
        ref={
          mapRef
        }
        style={
          styles.map
        }
        styleURL={
          Mapbox.StyleURL
            .Street
        }
        projection="mercator"
        scaleBarEnabled={
          false
        }
        attributionEnabled={
          false
        }
        logoEnabled={
          false
        }
        compassEnabled={
          false
        }
        onMapIdle={
          handleMapIdle
        }
      >
        <Mapbox.Camera
          ref={
            cameraRef
          }
          defaultSettings={{
            centerCoordinate:
              globalDeliveryType ===
                'pickup' &&
              globalPickupPoint
                ? globalPickupPoint.coordinate
                : DEFAULT_COORDINATE,

            zoomLevel:
              globalDeliveryType ===
                'pickup'
                ? 16.5
                : DEFAULT_ZOOM,
          }}
        />

        {mode ===
          'pickup' &&
          PICKUP_POINTS.map(
            (point) => (
              <Mapbox.PointAnnotation
                key={`pickup-${point.id}`}
                id={`pickup-${point.id}`}
                coordinate={
                  point.coordinate
                }
                onSelected={() =>
                  selectPickupPoint(
                    point
                  )
                }
              >
                <View
                  style={[
                    styles.pickupMarker,

                    selectedPickupPoint
                      ?.id ===
                      point.id &&
                      styles.pickupMarkerActive,
                  ]}
                >
                  <Ionicons
                    name="restaurant"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
              </Mapbox.PointAnnotation>
            )
          )}
      </Mapbox.MapView>

      {mode ===
        'delivery' && (
        <View
          pointerEvents="none"
          style={
            styles.centerMarker
          }
        >
          <View
            style={
              styles.markerCircle
            }
          />

          <View
            style={
              styles.markerLine
            }
          />
        </View>
      )}

      <View
        style={
          styles.mapControls
        }
      >
        <Pressable
          style={
            styles.locationButton
          }
          onPress={
            goToCurrentLocation
          }
        >
          <Ionicons
            name="navigate"
            size={26}
            color="#111111"
          />
        </Pressable>
      </View>

      <View
        style={[
          styles.sheet,

          {
            bottom:
              keyboardHeight,
          },
        ]}
      >
        <View
          style={
            styles.handle
          }
        />

        <View
          style={
            styles.toggle
          }
        >
          <Pressable
            style={[
              styles.toggleButton,

              mode ===
                'delivery' &&
                styles.toggleButtonActive,
            ]}
            onPress={() =>
              setMode(
                'delivery'
              )
            }
          >
            <Text
              style={[
                styles.toggleText,

                mode ===
                  'delivery' &&
                  styles.toggleTextActive,
              ]}
            >
              {t(
                'common.delivery'
              )}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.toggleButton,

              mode ===
                'pickup' &&
                styles.toggleButtonActive,
            ]}
            onPress={() =>
              setMode(
                'pickup'
              )
            }
          >
            <Text
              style={[
                styles.toggleText,

                mode ===
                  'pickup' &&
                  styles.toggleTextActive,
              ]}
            >
              {t(
                'common.pickup'
              )}
            </Text>
          </Pressable>
        </View>

        {mode ===
        'delivery' ? (
          <DeliveryAddressForm
            addressLine={
              addressLine
            }
            apartment={
              apartment
            }
            entrance={
              entrance
            }
            floor={
              floor
            }
            comment={
              comment
            }
            onAddressLineChange={
              handleAddressLineChange
            }
            onApartmentChange={
              setApartment
            }
            onEntranceChange={
              setEntrance
            }
            onFloorChange={
              setFloor
            }
            onCommentChange={
              setComment
            }
          />
        ) : (
          <PickupPointsList
            points={
              PICKUP_POINTS
            }
            selectedPoint={
              selectedPickupPoint
            }
            onSelect={
              selectPickupPoint
            }
          />
        )}

        <Pressable
          style={
            styles.continueButton
          }
          onPress={
            handleContinue
          }
          disabled={
            isSaving
          }
        >
          <Text
            style={
              styles.continueText
            }
          >
            {isSaving
              ? t(
                  'deliveryMap.saving'
                )
              : mode ===
                  'pickup'
                ? t(
                    'deliveryMap.choosePoint'
                  )
                : t(
                    'deliveryMap.continue'
                  )}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};