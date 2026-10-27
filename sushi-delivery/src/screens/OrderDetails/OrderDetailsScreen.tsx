import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

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
  cancelGuestOrder,
  cancelOrder,
  getGuestOrderById,
  getOrderById,
} from '../../api/ordersApi';

import type {
  Order,
  OrderItem,
} from '../../api/ordersApi';

import {
  getProductById,
} from '../../api/productsApi';

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
  useCartStore,
} from '../../store/cartStore';

import {
  useLanguageStore,
} from '../../store/languageStore';

import {
  formatPrice,
} from '../../utils/formatters';

import {
  styles,
} from './styles';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'OrderDetails'
  >;

const ORDER_REFRESH_INTERVAL =
  10_000;

const STATUS_STEPS:
  Order['status'][] = [
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'DELIVERING',
    'COMPLETED',
  ];

export const OrderDetailsScreen = ({
  route,
  navigation,
}: Props) => {
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

  const { orderId } =
    route.params;

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

  const addProductWithQuantity =
    useCartStore(
      (state) =>
        state.addProductWithQuantity
    );

  const [
    order,
    setOrder,
  ] = useState<Order | null>(
    null
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    hasError,
    setHasError,
  ] = useState(false);

  const [
    isCancelling,
    setIsCancelling,
  ] = useState(false);

  const [
    isRepeating,
    setIsRepeating,
  ] = useState(false);

  const getGuestToken =
    useCallback(
      async (): Promise<
        string | null
      > => {
        const findToken = () =>
          useGuestOrdersStore
            .getState()
            .orders
            .find(
              (item) =>
                item.orderId ===
                orderId
            )
            ?.guestToken ??
          null;

        const existingToken =
          findToken();

        if (existingToken) {
          return existingToken;
        }

        await restoreGuestOrders();

        return findToken();
      },
      [
        orderId,
        restoreGuestOrders,
      ]
    );

  const fetchOrder =
    useCallback(
      async (): Promise<Order> => {
        if (accessToken) {
          return getOrderById(
            accessToken,
            orderId
          );
        }

        const guestToken =
          await getGuestToken();

        if (!guestToken) {
          throw new Error(
            'Guest order token not found'
          );
        }

        return getGuestOrderById(
          orderId,
          guestToken
        );
      },
      [
        accessToken,
        getGuestToken,
        orderId,
      ]
    );

  useEffect(() => {
    let isActive = true;

    const loadOrder =
      async () => {
        try {
          setIsLoading(
            true
          );

          setHasError(
            false
          );

          const data =
            await fetchOrder();

          if (!isActive) {
            return;
          }

          setOrder(
            data
          );
        } catch (error) {
          if (!isActive) {
            return;
          }

          console.error(
            'Failed to load order:',
            error
          );

          setHasError(
            true
          );
        } finally {
          if (isActive) {
            setIsLoading(
              false
            );
          }
        }
      };

    void loadOrder();

    return () => {
      isActive = false;
    };
  }, [
    fetchOrder,
  ]);

  useEffect(() => {
    if (
      !order ||
      order.status ===
        'COMPLETED' ||
      order.status ===
        'CANCELLED'
    ) {
      return;
    }

    let isActive = true;

    const refreshOrder =
      async () => {
        try {
          const updatedOrder =
            await fetchOrder();

          if (!isActive) {
            return;
          }

          setOrder(
            updatedOrder
          );
        } catch (error) {
          if (!isActive) {
            return;
          }

          console.error(
            'Failed to refresh order:',
            error
          );
        }
      };

    const interval =
      setInterval(
        () => {
          void refreshOrder();
        },
        ORDER_REFRESH_INTERVAL
      );

    return () => {
      isActive = false;

      clearInterval(
        interval
      );
    };
  }, [
    order?.status,
    fetchOrder,
  ]);

  const handleCancelOrder =
    () => {
      if (!order) {
        return;
      }

      Alert.alert(
        t(
          'orderDetails.cancelTitle'
        ),
        t(
          'orderDetails.cancelMessage'
        ),
        [
          {
            text:
              t(
                'orderDetails.no'
              ),

            style: 'cancel',
          },

          {
            text:
              t(
                'orderDetails.yesCancel'
              ),

            style:
              'destructive',

            onPress:
              async () => {
                try {
                  setIsCancelling(
                    true
                  );

                  let updatedOrder:
                    Order;

                  if (accessToken) {
                    updatedOrder =
                      await cancelOrder(
                        accessToken,
                        order.id
                      );
                  } else {
                    const guestToken =
                      await getGuestToken();

                    if (!guestToken) {
                      throw new Error(
                        'Guest order token not found'
                      );
                    }

                    updatedOrder =
                      await cancelGuestOrder(
                        order.id,
                        guestToken
                      );
                  }

                  setOrder(
                    updatedOrder
                  );
                } catch (error) {
                  console.error(
                    'Failed to cancel order:',
                    error
                  );

                  Alert.alert(
                    t(
                      'common.error'
                    ),
                    t(
                      'orderDetails.cancelError'
                    )
                  );
                } finally {
                  setIsCancelling(
                    false
                  );
                }
              },
          },
        ]
      );
    };

  const handleRepeatOrder =
    async () => {
      if (!order) {
        return;
      }

      try {
        setIsRepeating(
          true
        );

        const products =
          await Promise.all(
            order.items.map(
              async (item) => {
                const product =
                  await getProductById(
                    item.productId
                  );

                return {
                  product,
                  quantity:
                    item.quantity,
                };
              }
            )
          );

        products.forEach(
          ({
            product,
            quantity,
          }) => {
            addProductWithQuantity(
              product,
              quantity
            );
          }
        );

        Alert.alert(
          t(
            'orderDetails.repeatSuccessTitle'
          ),
          t(
            'orderDetails.repeatSuccess'
          )
        );
      } catch (error) {
        console.error(
          'Failed to repeat order:',
          error
        );

        Alert.alert(
          t(
            'common.error'
          ),
          t(
            'orderDetails.repeatError'
          )
        );
      } finally {
        setIsRepeating(
          false
        );
      }
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

  if (isLoading) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.center
          }
        >
          <Text
            style={
              styles.message
            }
          >
            {t(
              'common.loading'
            )}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    hasError ||
    !order
  ) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.center
          }
        >
          <Text
            style={
              styles.message
            }
          >
            {t(
              'orderDetails.loadError'
            )}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const createdAt =
    new Date(
      order.createdAt
    ).toLocaleString(
      locale
    );

  const canCancel =
    order.status ===
      'PENDING' ||
    order.status ===
      'CONFIRMED';

  const currentStatusIndex =
    STATUS_STEPS.findIndex(
      (status) =>
        status ===
        order.status
    );

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
          onPress={() =>
            navigation.goBack()
          }
          hitSlop={10}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color="#111"
          />
        </Pressable>

        <Text
          style={
            styles.headerTitle
          }
        >
          {t(
            'orderDetails.orderNumber',
            {
              id:
                order.id,
            }
          )}
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={
            styles.date
          }
        >
          {createdAt}
        </Text>

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'orderDetails.statusTitle'
            )}
          </Text>

          {order.status ===
          'CANCELLED' ? (
            <View
              style={
                styles.cancelledBadge
              }
            >
              <Ionicons
                name="close-circle-outline"
                size={20}
                color="#B94A4A"
              />

              <Text
                style={
                  styles.cancelledText
                }
              >
                {t(
                  'orderDetails.cancelled'
                )}
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.timeline
              }
            >
              {STATUS_STEPS.map(
                (
                  status,
                  index
                ) => {
                  const isCompleted =
                    index <=
                    currentStatusIndex;

                  const isLast =
                    index ===
                    STATUS_STEPS.length -
                      1;

                  return (
                    <View
                      key={
                        status
                      }
                      style={
                        styles.timelineRow
                      }
                    >
                      <View
                        style={
                          styles.timelineIndicator
                        }
                      >
                        <View
                          style={[
                            styles.timelineDot,

                            isCompleted &&
                              styles.timelineDotActive,
                          ]}
                        />

                        {!isLast && (
                          <View
                            style={[
                              styles.timelineLine,

                              index <
                                currentStatusIndex &&
                                styles.timelineLineActive,
                            ]}
                          />
                        )}
                      </View>

                      <Text
                        style={[
                          styles.timelineText,

                          isCompleted &&
                            styles.timelineTextActive,
                        ]}
                      >
                        {t(
                          `orderDetails.statusSteps.${status}`
                        )}
                      </Text>
                    </View>
                  );
                }
              )}
            </View>
          )}
        </View>

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'orderDetails.composition'
            )}
          </Text>

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
                <View
                  style={
                    styles.itemInfo
                  }
                >
                  <Text
                    style={
                      styles.itemName
                    }
                  >
                    {getOrderItemName(
                      item
                    )}
                  </Text>

                  <Text
                    style={
                      styles.itemQuantity
                    }
                  >
                    {item.quantity}{' '}
                    {t(
                      'common.quantityShort'
                    )}
                  </Text>
                </View>

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

        <View
          style={
            styles.card
          }
        >
          <View
            style={
              styles.infoRow
            }
          >
            <Ionicons
              name="location-outline"
              size={22}
              color="#777"
            />

            <View
              style={
                styles.infoContent
              }
            >
              <Text
                style={
                  styles.infoLabel
                }
              >
                {t(
                  'orderDetails.receiving'
                )}
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {order.deliveryType ===
                'DELIVERY'
                  ? t(
                      'common.delivery'
                    )
                  : t(
                      'common.pickup'
                    )}
              </Text>

              {order.address && (
                <Text
                  style={
                    styles.address
                  }
                >
                  {order.address}
                </Text>
              )}
              {order.recipientPhone && (
                <Text style={styles.address}>
                  {t('checkout.phone')}: {order.recipientPhone}
                </Text>
              )}
            </View>
          </View>

          <View
            style={
              styles.infoDivider
            }
          />

          <View
            style={
              styles.infoRow
            }
          >
            <Ionicons
              name="card-outline"
              size={22}
              color="#777"
            />

            <View
              style={
                styles.infoContent
              }
            >
              <Text
                style={
                  styles.infoLabel
                }
              >
                {t(
                  'orderDetails.payment'
                )}
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {order.paymentMethod ===
                'CASH'
                  ? t(
                      'orderDetails.cash'
                    )
                  : t(
                      'orderDetails.cardOnDelivery'
                    )}
              </Text>
            </View>
          </View>
        </View>

        {order.comment && (
          <View
            style={
              styles.card
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              {t(
                'orderDetails.comment'
              )}
            </Text>

            <Text
              style={
                styles.comment
              }
            >
              {order.comment}
            </Text>
          </View>
        )}

        <View
          style={
            styles.priceCard
          }
        >
          <View
            style={
              styles.priceRow
            }
          >
            <Text
              style={
                styles.priceLabel
              }
            >
              {t(
                'common.products'
              )}
            </Text>

            <Text
              style={
                styles.priceValue
              }
            >
              {formatPrice(
                order.subtotal,
                language
              )}
            </Text>
          </View>

          <View
            style={
              styles.priceRow
            }
          >
            <Text
              style={
                styles.priceLabel
              }
            >
              {order.deliveryType ===
              'PICKUP'
                ? t(
                    'common.pickup'
                  )
                : t(
                    'common.delivery'
                  )}
            </Text>

            <Text
              style={
                styles.priceValue
              }
            >
              {order.deliveryFee ===
              0
                ? t(
                    'common.free'
                  )
                : formatPrice(
                    order.deliveryFee,
                    language
                  )}
            </Text>
          </View>

          <View
            style={
              styles.priceDivider
            }
          />

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
        </View>

        <Pressable
          style={
            styles.repeatButton
          }
          onPress={
            handleRepeatOrder
          }
          disabled={
            isRepeating
          }
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.repeatButtonText
            }
          >
            {isRepeating
              ? t(
                  'orderDetails.repeating'
                )
              : t(
                  'orderDetails.repeat'
                )}
          </Text>
        </Pressable>

        {canCancel && (
          <Pressable
            style={
              styles.cancelButton
            }
            onPress={
              handleCancelOrder
            }
            disabled={
              isCancelling
            }
          >
            <Text
              style={
                styles.cancelButtonText
              }
            >
              {isCancelling
                ? t(
                    'orderDetails.cancelling'
                  )
                : t(
                    'orderDetails.cancelOrder'
                  )}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
