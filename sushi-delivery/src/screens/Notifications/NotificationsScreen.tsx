import {
  useCallback,
  useState,
} from 'react';

import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import type {
  CompositeNavigationProp,
} from '@react-navigation/native';

import type {
  DrawerNavigationProp,
} from '@react-navigation/drawer';

import type {
  NativeStackNavigationProp,
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
  getGuestOrderById,
  getOrders,
} from '../../api/ordersApi';

import type {
  Order,
} from '../../api/ordersApi';

import type {
  DrawerParamList,
} from '../../navigation/DrawerNavigator';

import type {
  RootStackParamList,
} from '../../navigation/types';

import {
  useAuthStore,
} from '../../store/authStore';

import {
  useGuestOrdersStore,
} from '../../store/guestOrdersStore';

import {
  useLanguageStore,
} from '../../store/languageStore';

import {
  styles,
} from './styles';

type NotificationsNavigationProp =
  CompositeNavigationProp<
    DrawerNavigationProp<
      DrawerParamList,
      'Notifications'
    >,
    NativeStackNavigationProp<
      RootStackParamList
    >
  >;

const MAX_NOTIFICATIONS = 5;

const getRecentOrders = (
  orders: Order[]
): Order[] => {
  return orders
    .slice()
    .sort(
      (a, b) =>
        new Date(
          b.updatedAt
        ).getTime() -
        new Date(
          a.updatedAt
        ).getTime()
    )
    .slice(
      0,
      MAX_NOTIFICATIONS
    );
};

export const NotificationsScreen =
  () => {
    const navigation =
      useNavigation<NotificationsNavigationProp>();

    const { t } =
      useTranslation();

    const language =
      useLanguageStore(
        (state) =>
          state.language
      );

    const locale =
      language === 'ru'
        ? 'ru-RU'
        : 'en-US';

    const accessToken =
      useAuthStore(
        (state) =>
          state.accessToken
      );

    const restoreGuestOrders =
      useGuestOrdersStore(
        (state) =>
          state.restoreGuestOrders
      );

    const [
      orders,
      setOrders,
    ] = useState<Order[]>([]);

    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const openDrawer = () => {
      navigation.openDrawer();
    };

    useFocusEffect(
      useCallback(() => {
        let isActive = true;

        const loadNotifications =
          async () => {
            try {
              setIsLoading(
                true
              );

              if (
                accessToken
              ) {
                const data =
                  await getOrders(
                    accessToken
                  );

                if (!isActive) {
                  return;
                }

                setOrders(
                  getRecentOrders(
                    data
                  )
                );

                return;
              }

              await restoreGuestOrders();

              if (!isActive) {
                return;
              }

              const guestReferences =
                useGuestOrdersStore
                  .getState()
                  .orders;

              if (
                guestReferences.length ===
                0
              ) {
                setOrders([]);

                return;
              }

              const results =
                await Promise.allSettled(
                  guestReferences.map(
                    (reference) =>
                      getGuestOrderById(
                        reference.orderId,
                        reference.guestToken
                      )
                  )
                );

              if (!isActive) {
                return;
              }

              const guestOrders =
                results
                  .filter(
                    (
                      result
                    ): result is PromiseFulfilledResult<Order> =>
                      result.status ===
                      'fulfilled'
                  )
                  .map(
                    (result) =>
                      result.value
                  );

              setOrders(
                getRecentOrders(
                  guestOrders
                )
              );
            } catch (error) {
              if (!isActive) {
                return;
              }

              console.error(
                'Failed to load notifications:',
                error
              );
            } finally {
              if (isActive) {
                setIsLoading(
                  false
                );
              }
            }
          };

        void loadNotifications();

        return () => {
          isActive =
            false;
        };
      }, [
        accessToken,
        restoreGuestOrders,
      ])
    );

    const openOrder = (
      orderId: number
    ) => {
      navigation.navigate(
        'OrderDetails',
        {
          orderId,
        }
      );
    };

    const openPromotions =
      () => {
        navigation.navigate(
          'Promotions'
        );
      };

    const formatNotificationTime =
      (
        date: string
      ): string => {
        return new Date(
          date
        ).toLocaleString(
          locale,
          {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }
        );
      };

    const getStatusText = (
      status:
        Order['status']
    ): string => {
      const key =
        `notifications.status.${status}`;

      return t(
        key,
        {
          defaultValue:
            t(
              'notifications.status.DEFAULT'
            ),
        }
      );
    };

    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.header
          }
        >
          <Pressable
            style={
              styles.headerButton
            }
            onPress={
              openDrawer
            }
            hitSlop={10}
          >
            <Ionicons
              name="menu-outline"
              size={30}
              color="#111"
            />
          </Pressable>

          <Text
            style={
              styles.headerTitle
            }
          >
            {t(
              'notifications.title'
            )}
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <Pressable
            style={
              styles.promotionCard
            }
            onPress={
              openPromotions
            }
          >
            <View
              style={
                styles.promotionIcon
              }
            >
              <Ionicons
                name="pricetag-outline"
                size={25}
                color="#2F8F6B"
              />
            </View>

            <View
              style={
                styles.notificationContent
              }
            >
              <Text
                style={
                  styles.notificationTitle
                }
              >
                {t(
                  'notifications.specialOffers'
                )}
              </Text>

              <Text
                style={
                  styles.notificationText
                }
              >
                {t(
                  'notifications.specialOffersText'
                )}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#BBBBBB"
            />
          </Pressable>

          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'notifications.orders'
            )}
          </Text>

          {isLoading ? (
            <View
              style={
                styles.emptyCard
              }
            >
              <Text
                style={
                  styles.emptyTitle
                }
              >
                {t(
                  'common.loading'
                )}
              </Text>
            </View>
          ) : orders.length ===
            0 ? (
            <View
              style={
                styles.emptyCard
              }
            >
              <Ionicons
                name="receipt-outline"
                size={38}
                color="#AAAAAA"
              />

              <Text
                style={
                  styles.emptyTitle
                }
              >
                {t(
                  'notifications.emptyTitle'
                )}
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                {t(
                  'notifications.emptyText'
                )}
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.notificationsCard
              }
            >
              {orders.map(
                (
                  order,
                  index
                ) => (
                  <View
                    key={
                      order.id
                    }
                  >
                    <Pressable
                      style={
                        styles.notificationRow
                      }
                      onPress={() =>
                        openOrder(
                          order.id
                        )
                      }
                    >
                      <View
                        style={[
                          styles.notificationIcon,

                          order.status ===
                            'COMPLETED' &&
                            styles.completedIcon,

                          order.status ===
                            'CANCELLED' &&
                            styles.cancelledIcon,
                        ]}
                      >
                        <Ionicons
                          name={
                            getStatusIcon(
                              order.status
                            )
                          }
                          size={24}
                          color={
                            getStatusColor(
                              order.status
                            )
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.notificationContent
                        }
                      >
                        <Text
                          style={
                            styles.notificationTitle
                          }
                        >
                          {t(
                            'notifications.orderNumber',
                            {
                              id:
                                order.id,
                            }
                          )}
                        </Text>

                        <Text
                          style={
                            styles.notificationText
                          }
                        >
                          {getStatusText(
                            order.status
                          )}
                        </Text>

                        <Text
                          style={
                            styles.notificationTime
                          }
                        >
                          {formatNotificationTime(
                            order.updatedAt
                          )}
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#BBBBBB"
                      />
                    </Pressable>

                    {index !==
                      orders.length -
                        1 && (
                      <View
                        style={
                          styles.divider
                        }
                      />
                    )}
                  </View>
                )
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  };

const getStatusIcon = (
  status: Order['status']
):
  | 'time-outline'
  | 'checkmark-outline'
  | 'restaurant-outline'
  | 'car-outline'
  | 'checkmark-circle-outline'
  | 'close-circle-outline' => {
  switch (status) {
    case 'PENDING':
      return 'time-outline';

    case 'CONFIRMED':
      return 'checkmark-outline';

    case 'PREPARING':
      return 'restaurant-outline';

    case 'DELIVERING':
      return 'car-outline';

    case 'COMPLETED':
      return 'checkmark-circle-outline';

    case 'CANCELLED':
      return 'close-circle-outline';

    default:
      return 'time-outline';
  }
};

const getStatusColor = (
  status: Order['status']
): string => {
  if (
    status === 'COMPLETED'
  ) {
    return '#2F8F6B';
  }

  if (
    status === 'CANCELLED'
  ) {
    return '#B94A4A';
  }

  return '#666666';
};