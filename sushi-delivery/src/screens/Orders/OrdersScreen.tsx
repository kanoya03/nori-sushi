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
  OrderItem,
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
  formatPrice,
} from '../../utils/formatters';

import {
  styles,
} from './styles';

type OrdersNavigationProp =
  CompositeNavigationProp<
    DrawerNavigationProp<
      DrawerParamList,
      'Orders'
    >,
    NativeStackNavigationProp<
      RootStackParamList
    >
  >;

const renderStatus = (
  status:
    Order['status'],
  text: string
) => {
  const isActive =
    status === 'PENDING' ||
    status === 'CONFIRMED' ||
    status === 'PREPARING' ||
    status === 'DELIVERING';

  return (
    <View
      style={[
        styles.statusBadge,

        status ===
          'COMPLETED' &&
          styles.statusCompleted,

        status ===
          'CANCELLED' &&
          styles.statusCancelled,

        isActive &&
          styles.statusActive,
      ]}
    >
      <Text
        style={[
          styles.statusText,

          status ===
            'COMPLETED' &&
            styles.statusTextCompleted,

          status ===
            'CANCELLED' &&
            styles.statusTextCancelled,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

export const OrdersScreen =
  () => {
    const navigation =
      useNavigation<OrdersNavigationProp>();

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
    ] = useState(true);

    const [
      loadError,
      setLoadError,
    ] = useState(false);

    useFocusEffect(
      useCallback(() => {
        let isActive = true;

        const loadOrders =
          async () => {
            try {
              setIsLoading(
                true
              );

              setLoadError(
                false
              );

              if (
                accessToken
              ) {
                const data =
                  await getOrders(
                    accessToken
                  );

                if (
                  !isActive
                ) {
                  return;
                }

                setOrders(
                  data
                );

                return;
              }

              await restoreGuestOrders();

              if (
                !isActive
              ) {
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

              if (
                !isActive
              ) {
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
                  )
                  .sort(
                    (a, b) =>
                      new Date(
                        b.createdAt
                      ).getTime() -
                      new Date(
                        a.createdAt
                      ).getTime()
                  );

              setOrders(
                guestOrders
              );
            } catch (error) {
              if (
                !isActive
              ) {
                return;
              }

              console.error(
                'Failed to load orders:',
                error
              );

              setLoadError(
                true
              );
            } finally {
              if (
                isActive
              ) {
                setIsLoading(
                  false
                );
              }
            }
          };

        void loadOrders();

        return () => {
          isActive =
            false;
        };
      }, [
        accessToken,
        restoreGuestOrders,
      ])
    );

    const openDrawer =
      () => {
        navigation.openDrawer();
      };

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

    const getOrderItemName = (
      item: OrderItem
    ) => {
      if (!item.product) {
        return item.productName;
      }

      if (
        language === 'en' &&
        item.product.nameEn?.trim()
      ) {
        return item.product.nameEn;
      }

      return item.product.name;
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
              styles.title
            }
          >
            {t(
              'orders.title'
            )}
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {isLoading ? (
          <View
            style={
              styles.emptyContainer
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
        ) : loadError ? (
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={
                styles.emptyTitle
              }
            >
              {t(
                'orders.loadError'
              )}
            </Text>
          </View>
        ) : orders.length ===
          0 ? (
          <View
            style={
              styles.emptyContainer
            }
          >
            <Ionicons
              name="receipt-outline"
              size={46}
              color="#B0B0B0"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              {t(
                'orders.emptyTitle'
              )}
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              {t(
                'orders.emptyText'
              )}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.content
            }
          >
            {orders.map(
              (order) => (
                <Pressable
                  key={
                    order.id
                  }
                  style={
                    styles.orderCard
                  }
                  onPress={() =>
                    openOrder(
                      order.id
                    )
                  }
                >
                  <View
                    style={
                      styles.orderHeader
                    }
                  >
                    <View>
                      <Text
                        style={
                          styles.orderNumber
                        }
                      >
                        {t(
                          'orders.orderNumber',
                          {
                            id:
                              order.id,
                          }
                        )}
                      </Text>

                      <Text
                        style={
                          styles.orderDate
                        }
                      >
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString(
                          locale
                        )}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color="#B3B3B3"
                    />
                  </View>

                  {renderStatus(
                    order.status,
                    t(
                      `orders.status.${order.status}`
                    )
                  )}

                  <View
                    style={
                      styles.items
                    }
                  >
                    {order.items.map(
                      (item) => (
                        <View
                          key={
                            item.id
                          }
                          style={
                            styles.itemRow
                          }
                        >
                          <Text
                            style={
                              styles.itemName
                            }
                          >
                            {getOrderItemName(
                              item
                            )}{' '}
                            × {item.quantity}
                          </Text>

                          <Text
                            style={
                              styles.itemPrice
                            }
                          >
                            {formatPrice(
                              item.unitPrice *
                                item.quantity,
                              language
                            )}
                          </Text>
                        </View>
                      )
                    )}
                  </View>

                  {order.address && (
                    <View
                      style={
                        styles.addressRow
                      }
                    >
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#888"
                      />

                      <Text
                        style={
                          styles.address
                        }
                        numberOfLines={
                          2
                        }
                      >
                        {order.address}
                      </Text>
                    </View>
                  )}

                  <View
                    style={
                      styles.totalRow
                    }
                  >
                    <Text
                      style={
                        styles.totalLabel
                      }
                    >
                      {t(
                        'common.total'
                      )}
                    </Text>

                    <Text
                      style={
                        styles.totalPrice
                      }
                    >
                      {formatPrice(
                        order.totalPrice,
                        language
                      )}
                    </Text>
                  </View>
                </Pressable>
              )
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  };