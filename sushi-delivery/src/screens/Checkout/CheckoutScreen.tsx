import {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useTranslation,
} from 'react-i18next';

import {
  useCartStore,
} from '../../store/cartStore';

import {
  useAuthStore,
} from '../../store/authStore';

import {
  useAddressStore,
} from '../../store/addressStore';

import type {
  DeliveryAddress,
} from '../../store/addressStore';

import {
  useGuestOrdersStore,
} from '../../store/guestOrdersStore';

import {
  useLanguageStore,
} from '../../store/languageStore';

import {
  createGuestOrder,
  createOrder,
} from '../../api/ordersApi';
import { ApiError } from '../../api/client';

import type {
  CreateOrderData,
  PaymentMethod,
} from '../../api/ordersApi';

import type {
  RootStackParamList,
} from '../../navigation/types';

import {
  formatPrice,
} from '../../utils/formatters';

import {
  getProductName,
} from '../../utils/productLocalization';

import {
  clearOrderAttemptKey,
  getOrderAttemptKey,
  hasPendingOrderAttempt,
} from '../../utils/orderAttempt';
import { normalizePhoneNumber } from '../../utils/phone';
import { readGuestPhone, saveGuestPhone } from '../../utils/guestPhone';
import { getProducts } from '../../api/productsApi';
import { cartSelection } from '../../utils/refreshCart';

import {
  styles,
} from './styles';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'Checkout'
  >;

const DELIVERY_FEE = 700;

const MINIMUM_ORDER_AMOUNT =
  5000;

type AddressLabels = {
  apartment: string;
  entrance: string;
  floor: string;
};

const formatDeliveryAddress = (
  address:
    DeliveryAddress | null,
  labels:
    AddressLabels
): string => {
  if (!address) {
    return '';
  }

  return [
    address.city,
    address.street,
    address.house,

    address.apartment
      ? `${labels.apartment} ${address.apartment}`
      : null,

    address.entrance
      ? `${labels.entrance} ${address.entrance}`
      : null,

    address.floor
      ? `${labels.floor} ${address.floor}`
      : null,
  ]
    .filter(Boolean)
    .join(', ');
};

export const CheckoutScreen = ({
  navigation,
}: Props) => {
  const { t } =
    useTranslation();

  const language =
    useLanguageStore(
      (state) =>
        state.language
    );

  const [
    isOrdering,
    setIsOrdering,
  ] = useState(false);

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>(
    'CARD_ON_DELIVERY'
  );

  const [
    comment,
    setComment,
  ] = useState('');

  const items =
    useCartStore(
      (state) =>
        state.items
    );

  const getTotalPrice =
    useCartStore(
      (state) =>
        state.getTotalPrice
    );

  const clearCart =
    useCartStore(
      (state) =>
        state.clearCart
    );

  const accessToken =
    useAuthStore(
      (state) =>
        state.accessToken
    );
  const userId = useAuthStore((state) => state.user?.id);
  const userPhone = useAuthStore((state) => state.user?.phone);
  const phoneScope = accessToken ? `user:${userId}` : 'guest';
  const [guestPhone, setGuestPhone] = useState('');
  const [phoneEntry, setPhoneEntry] = useState({ scope: '', value: '' });
  const savedPhone = accessToken ? normalizePhoneNumber(userPhone) ?? '' : guestPhone;
  const phone = phoneEntry.scope === phoneScope ? phoneEntry.value : savedPhone;
  const [phoneError, setPhoneError] = useState(false);
  const submitRequest = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const [cartNotice, setCartNotice] = useState<'cartUpdated' | 'cartUnavailable' | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; submitRequest.current?.abort(); };
  }, []);
  useEffect(() => navigation.addListener('blur', () => submitRequest.current?.abort()), [navigation]);

  useEffect(() => {
    let active = true;
    void readGuestPhone().then((saved) => { if (active) setGuestPhone(saved); });
    return () => { active = false; };
  }, []);

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

  const setDeliveryType =
    useAddressStore(
      (state) =>
        state.setDeliveryType
    );

  const addGuestOrder =
    useGuestOrdersStore(
      (state) =>
        state.addGuestOrder
    );

  const subtotal =
    getTotalPrice();

  const deliveryFee =
    deliveryType ===
    'delivery'
      ? DELIVERY_FEE
      : 0;

  const totalPrice =
    subtotal +
    deliveryFee;

  const isMinimumReached =
    subtotal >=
    MINIMUM_ORDER_AMOUNT;

  const addressText =
    formatDeliveryAddress(
      currentAddress,
      {
        apartment:
          t(
            'address.apartmentShort'
          ),

        entrance:
          t(
            'address.entranceShort'
          ),

        floor:
          t(
            'address.floorShort'
          ),
      }
    );

  const pickupAddressText =
    selectedPickupPoint
      ? `${selectedPickupPoint.name}, ${selectedPickupPoint.address}`
      : '';

  const openDeliveryMap = () => {
    navigation.navigate(
      'DeliveryMap'
    );
  };

  const handleConfirmOrder =
    async () => {
      if (isOrdering || submitRequest.current) return;
      const session = useAuthStore.getState();
      if (session.isRestoring || session.restoreError) {
        Alert.alert(t('common.error'), t('auth.restoreError'), [{ text: t('auth.retrySession'), onPress: () => void session.restoreSession() }]);
        return;
      }
      const recipientPhone = normalizePhoneNumber(phone);
      if (!recipientPhone) {
        setPhoneError(true);
        Alert.alert(t('common.error'), t('checkout.phoneInvalid'));
        return;
      }
      if (
        deliveryType ===
          'delivery' &&
        !currentAddress
      ) {
        Alert.alert(
          t(
            'checkout.deliveryAlertTitle'
          ),
          t(
            'checkout.deliveryAlertMessage'
          )
        );

        return;
      }

      if (
        deliveryType ===
          'pickup' &&
        !selectedPickupPoint
      ) {
        Alert.alert(
          t(
            'checkout.pickupAlertTitle'
          ),
          t(
            'checkout.pickupAlertMessage'
          )
        );

        return;
      }

      if (
        items.length === 0
      ) {
        Alert.alert(
          t(
            'checkout.emptyCartTitle'
          ),
          t(
            'checkout.emptyCartMessage'
          )
        );

        navigation.goBack();

        return;
      }

      if (
        !isMinimumReached && !hasPendingOrderAttempt(phoneScope)
      ) {
        Alert.alert(
          t(
            'checkout.minimumTitle'
          ),
          t(
            'checkout.minimumMessage',
            {
              amount:
                formatPrice(
                  MINIMUM_ORDER_AMOUNT,
                  language
                ),
            }
          )
        );

        return;
      }

      const payload:
        Omit<CreateOrderData, 'idempotencyKey'> = {
        recipientPhone,
        deliveryType:
          deliveryType ===
          'delivery'
            ? 'DELIVERY'
            : 'PICKUP',

        paymentMethod,

        address:
          deliveryType ===
          'delivery'
            ? addressText
            : pickupAddressText,

        comment:
          comment.trim() ||
          undefined,

        items:
          items.map(
            (item) => ({
              productId:
                item.product.id,

              quantity:
                item.quantity,
              expectedUnitPrice: item.product.price,
            })
          ),
      };

      const controller = new AbortController();
      submitRequest.current = controller;
      let posting = false;
      try {
        setIsOrdering(
          true
        );

        if (!hasPendingOrderAttempt(phoneScope, payload)) {
          const fresh = await getProducts(controller.signal);
          if (controller.signal.aborted) return;
          if (cartSelection(useCartStore.getState().items) !== cartSelection(items)) {
            setCartNotice('cartUpdated');
            Alert.alert(t('checkout.reviewCart'), t('checkout.cartUpdated'));
            return;
          }
          const result = useCartStore.getState().refreshProducts(fresh);
          if (result.unavailable.length || result.changed) {
            const notice = result.unavailable.length ? 'cartUnavailable' : 'cartUpdated';
            setCartNotice(notice);
            Alert.alert(t('checkout.reviewCart'), t(`checkout.${notice}`));
            return;
          }
          if (useCartStore.getState().getTotalPrice() < MINIMUM_ORDER_AMOUNT) {
            setCartNotice('cartUpdated');
            return;
          }
        }
        if (controller.signal.aborted || useAuthStore.getState().accessToken !== accessToken ||
            cartSelection(useCartStore.getState().items) !== cartSelection(items)) return;
        const idempotencyKey = getOrderAttemptKey(phoneScope, payload);
        const orderData: CreateOrderData = { ...payload, idempotencyKey };
        posting = true;

        const order =
          accessToken
            ? await createOrder(
                accessToken,
                orderData,
                controller.signal
              )
            : await createGuestOrder(
                orderData,
                controller.signal
              );
        if (controller.signal.aborted) return;

        if (!accessToken) {
          if (
            !order.guestToken
          ) {
            throw new Error(
              'Guest token was not returned by server'
            );
          }

          await addGuestOrder(
            order.id,
            order.guestToken
          );
        }

        if (!accessToken) {
          await saveGuestPhone(recipientPhone);
        } else {
          const current = useAuthStore.getState();
          if (current.user && current.user.id === userId && current.accessToken === accessToken) {
            current.setUser({ ...current.user, phone: recipientPhone });
          }
        }
        if (controller.signal.aborted || cartSelection(useCartStore.getState().items) !== cartSelection(items)) return;
        clearCart();
        clearOrderAttemptKey(idempotencyKey);

        navigation.replace(
          'OrderSuccess',
          {
            orderId:
              order.id,
          }
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 409 && error.code === 'CART_CHANGED') {
          try {
            const fresh = await getProducts(controller.signal);
            if (controller.signal.aborted) return;
            const result = useCartStore.getState().refreshProducts(fresh);
            const notice = result.unavailable.length ? 'cartUnavailable' : 'cartUpdated';
            setCartNotice(notice);
            Alert.alert(t('checkout.reviewCart'), t(`checkout.${notice}`));
          } catch {
            if (!controller.signal.aborted) Alert.alert(t('common.error'), t('checkout.catalogRefreshError'));
          }
          return;
        }
        console.error(
          'Failed to create order:',
          error
        );

        Alert.alert(
          t(
            'common.error'
          ),
          t(
            !posting ? 'checkout.catalogRefreshError' : error instanceof ApiError && error.status === 429 ? 'checkout.rateLimited' : 'checkout.orderError'
          )
        );
      } finally {
        if (submitRequest.current === controller) submitRequest.current = null;
        if (mounted.current) setIsOrdering(false);
      }
    };

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <ScrollView
        pointerEvents={isOrdering ? 'none' : 'auto'}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        <Text
          style={
            styles.title
          }
        >
          {t(
            'checkout.title'
          )}
        </Text>

        {cartNotice && <Text accessibilityRole="alert" style={styles.minimumWarningText}>{t(`checkout.${cartNotice}`)}</Text>}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('checkout.contactTitle')}</Text>
          <Text nativeID="recipient-phone-label">{t('checkout.phone')}</Text>
          <TextInput
            style={[styles.phoneInput, phoneError && styles.phoneInputError]}
            accessibilityLabel={t('checkout.phone')}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={32}
            placeholder="+7 (701) 123-45-67"
            value={phone}
            onChangeText={(value) => {
              setPhoneEntry({ scope: phoneScope, value });
              setPhoneError(false);
            }}
            onBlur={() => setPhoneError(Boolean(phone) && !normalizePhoneNumber(phone))}
          />
          <Text style={phoneError ? styles.phoneError : styles.disabledHint}>
            {t(phoneError ? 'checkout.phoneInvalid' : 'checkout.phoneHint')}
          </Text>
        </View>

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'checkout.receivingMethod'
            )}
          </Text>

          <Pressable
            style={
              styles.deliveryOption
            }
            onPress={() =>
              setDeliveryType(
                'delivery'
              )
            }
          >
            <View
              style={
                deliveryType ===
                'delivery'
                  ? styles.radioActive
                  : styles.radioInactive
              }
            />

            <Text
              style={
                styles.deliveryText
              }
            >
              {t(
                'common.delivery'
              )}
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.deliveryOption
            }
            onPress={() =>
              setDeliveryType(
                'pickup'
              )
            }
          >
            <View
              style={
                deliveryType ===
                'pickup'
                  ? styles.radioActive
                  : styles.radioInactive
              }
            />

            <Text
              style={
                styles.deliveryText
              }
            >
              {t(
                'common.pickup'
              )}
            </Text>
          </Pressable>
        </View>

        {deliveryType ===
          'delivery' && (
          <View
            style={
              styles.section
            }
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                {t(
                  'checkout.deliveryAddress'
                )}
              </Text>

              <Pressable
                onPress={
                  openDeliveryMap
                }
              >
                <Text
                  style={
                    styles.changeText
                  }
                >
                  {currentAddress
                    ? t(
                        'common.change'
                      )
                    : t(
                        'common.choose'
                      )}
                </Text>
              </Pressable>
            </View>

            {currentAddress ? (
              <Text
                style={
                  styles.addressText
                }
              >
                {addressText}
              </Text>
            ) : (
              <Pressable
                style={
                  styles.addAddressButton
                }
                onPress={
                  openDeliveryMap
                }
              >
                <Text
                  style={
                    styles.addAddressText
                  }
                >
                  {t(
                    'checkout.addAddress'
                  )}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {deliveryType ===
          'pickup' && (
          <View
            style={
              styles.section
            }
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                {t(
                  'checkout.pickupPoint'
                )}
              </Text>

              <Pressable
                onPress={
                  openDeliveryMap
                }
              >
                <Text
                  style={
                    styles.changeText
                  }
                >
                  {selectedPickupPoint
                    ? t(
                        'common.change'
                      )
                    : t(
                        'common.choose'
                      )}
                </Text>
              </Pressable>
            </View>

            {selectedPickupPoint ? (
              <>
                <Text
                  style={
                    styles.addressText
                  }
                >
                  {
                    selectedPickupPoint.name
                  }
                </Text>

                <Text
                  style={
                    styles.addressText
                  }
                >
                  {
                    selectedPickupPoint.address
                  }
                </Text>
              </>
            ) : (
              <Pressable
                style={
                  styles.addAddressButton
                }
                onPress={
                  openDeliveryMap
                }
              >
                <Text
                  style={
                    styles.addAddressText
                  }
                >
                  {t(
                    'checkout.choosePickup'
                  )}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'checkout.paymentMethod'
            )}
          </Text>

          <Pressable
            style={
              styles.deliveryOption
            }
            onPress={() =>
              setPaymentMethod(
                'CARD_ON_DELIVERY'
              )
            }
          >
            <View
              style={
                paymentMethod ===
                'CARD_ON_DELIVERY'
                  ? styles.radioActive
                  : styles.radioInactive
              }
            />

            <Text
              style={
                styles.deliveryText
              }
            >
              {t(
                'checkout.cardOnDelivery'
              )}
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.deliveryOption
            }
            onPress={() =>
              setPaymentMethod(
                'CASH'
              )
            }
          >
            <View
              style={
                paymentMethod ===
                'CASH'
                  ? styles.radioActive
                  : styles.radioInactive
              }
            />

            <Text
              style={
                styles.deliveryText
              }
            >
              {t(
                'checkout.cash'
              )}
            </Text>
          </Pressable>

          <View
            style={
              styles.disabledOption
            }
          >
            <View
              style={
                styles.radioInactive
              }
            />

            <View>
              <Text
                style={
                  styles.disabledText
                }
              >
                {t(
                  'checkout.online'
                )}
              </Text>

              <Text
                style={
                  styles.disabledHint
                }
              >
                {t(
                  'checkout.soon'
                )}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'checkout.orderComment'
            )}
          </Text>

          <TextInput
            style={
              styles.commentInput
            }
            placeholder={
              t(
                'checkout.commentPlaceholder'
              )
            }
            placeholderTextColor="#999"
            value={
              comment
            }
            onChangeText={
              setComment
            }
            multiline
            maxLength={300}
          />
        </View>

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'checkout.yourOrder'
            )}
          </Text>

          {items.map(
            (item) => (
              <View
                key={
                  item.product.id
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
                    {
                      getProductName(
                        item.product,
                        language
                      )
                    }
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
                  {item.product.isAvailable === false ? t('checkout.itemUnavailable') : formatPrice(
                    item.product.price *
                      item.quantity,
                    language
                  )}
                </Text>
              </View>
            )
          )}
        </View>

        {!isMinimumReached && (
          <View
            style={
              styles.minimumWarning
            }
          >
            <Text
              style={
                styles.minimumWarningText
              }
            >
              {t(
                'checkout.minimumRemaining',
                {
                  amount:
                    formatPrice(
                      MINIMUM_ORDER_AMOUNT -
                        subtotal,
                      language
                    ),
                }
              )}
            </Text>
          </View>
        )}

        <View
          style={
            styles.priceBlock
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
                subtotal,
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
              {deliveryType ===
              'pickup'
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
              {deliveryFee === 0
                ? t(
                    'common.free'
                  )
                : formatPrice(
                    deliveryFee,
                    language
                  )}
            </Text>
          </View>

          <View
            style={
              styles.totalDivider
            }
          />

          <View
            style={
              styles.priceRow
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
                totalPrice,
                language
              )}
            </Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.confirmButton,

            (
              isOrdering ||
              (!isMinimumReached && !hasPendingOrderAttempt(phoneScope))
            ) &&
              styles.confirmButtonDisabled,
          ]}
          disabled={
            isOrdering ||
            (!isMinimumReached && !hasPendingOrderAttempt(phoneScope))
          }
          onPress={
            handleConfirmOrder
          }
        >
          <Text
            style={
              styles.confirmButtonText
            }
          >
            {isOrdering
              ? t(
                  'checkout.confirming'
                )
              : t(
                  'checkout.confirm',
                  {
                    amount:
                      formatPrice(
                        totalPrice,
                        language
                      ),
                  }
                )}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};
