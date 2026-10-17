import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import type {
  CompositeNavigationProp,
} from '@react-navigation/native';

import type {
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';

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

import type {
  BottomTabParamList,
} from '../../navigation/BottomTabNavigator';

import type {
  DrawerParamList,
} from '../../navigation/DrawerNavigator';

import type {
  RootStackParamList,
} from '../../navigation/types';

import {
  useCartStore,
} from '../../store/cartStore';

import {
  useLanguageStore,
} from '../../store/languageStore';

import {
  getProductName,
} from '../../utils/productLocalization';

import {
  formatPrice,
} from '../../utils/formatters';

import {
  styles,
} from './styles';

type CartNavigationProp =
  CompositeNavigationProp<
    BottomTabNavigationProp<
      BottomTabParamList,
      'Cart'
    >,
    CompositeNavigationProp<
      DrawerNavigationProp<
        DrawerParamList,
        'HomeTabs'
      >,
      NativeStackNavigationProp<
        RootStackParamList
      >
    >
  >;

export const CartScreen = () => {
  const navigation =
    useNavigation<CartNavigationProp>();

  const { t } =
    useTranslation();

  const language =
    useLanguageStore(
      (state) =>
        state.language
    );

  const items =
    useCartStore(
      (state) =>
        state.items
    );

  const increaseQuantity =
    useCartStore(
      (state) =>
        state.increaseQuantity
    );

  const decreaseQuantity =
    useCartStore(
      (state) =>
        state.decreaseQuantity
    );

  const removeProduct =
    useCartStore(
      (state) =>
        state.removeProduct
    );

  const getTotalPrice =
    useCartStore(
      (state) =>
        state.getTotalPrice
    );

  const totalPrice =
    getTotalPrice();

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const openCheckout = () => {
    navigation.navigate(
      'Checkout'
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
            'cart.title'
          )}
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      {items.length === 0 ? (
        <View
          style={
            styles.emptyContainer
          }
        >
          <Ionicons
            name="bag-outline"
            size={48}
            color="#B3B3B3"
          />

          <Text
            style={
              styles.emptyTitle
            }
          >
            {t(
              'cart.emptyTitle'
            )}
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            {t(
              'cart.emptyText'
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
          {items.map(
            (item) => (
              <View
                key={
                  item.product.id
                }
                style={
                  styles.item
                }
              >
                <Image
                  source={{
                    uri:
                      item.product.image,
                  }}
                  style={
                    styles.image
                  }
                />

                <View
                  style={
                    styles.itemContent
                  }
                >
                  <Text
                    style={
                      styles.name
                    }
                  >
                    {getProductName(
                      item.product,
                      language
                    )}
                  </Text>

                  <Text
                    style={
                      styles.price
                    }
                  >
                    {formatPrice(
                      item.product.price,
                      language
                    )}
                  </Text>

                  <View
                    style={
                      styles.actions
                    }
                  >
                    <View
                      style={
                        styles.counter
                      }
                    >
                      <Pressable
                        style={
                          styles.counterButton
                        }
                        onPress={() =>
                          decreaseQuantity(
                            item.product.id
                          )
                        }
                      >
                        <Text
                          style={
                            styles.counterText
                          }
                        >
                          −
                        </Text>
                      </Pressable>

                      <Text
                        style={
                          styles.quantity
                        }
                      >
                        {
                          item.quantity
                        }
                      </Text>

                      <Pressable
                        style={
                          styles.counterButton
                        }
                        onPress={() =>
                          increaseQuantity(
                            item.product.id
                          )
                        }
                      >
                        <Text
                          style={
                            styles.counterText
                          }
                        >
                          +
                        </Text>
                      </Pressable>
                    </View>

                    <Pressable
                      style={
                        styles.removeButton
                      }
                      onPress={() =>
                        removeProduct(
                          item.product.id
                        )
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#C64040"
                      />

                      <Text
                        style={
                          styles.remove
                        }
                      >
                        {t(
                          'cart.remove'
                        )}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )
          )}

          <View
            style={
              styles.summary
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              {t(
                'cart.total'
              )}
            </Text>

            <Text
              style={
                styles.summaryPrice
              }
            >
              {formatPrice(
                totalPrice,
                language
              )}
            </Text>
          </View>

          <Pressable
            style={
              styles.checkoutButton
            }
            onPress={
              openCheckout
            }
          >
            <Text
              style={
                styles.checkoutButtonText
              }
            >
              {t(
                'cart.checkout'
              )}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
