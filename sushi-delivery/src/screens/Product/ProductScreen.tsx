import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Image,
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

import * as Haptics
  from 'expo-haptics';

import {
  useTranslation,
} from 'react-i18next';

import type {
  RootStackParamList,
} from '../../navigation/types';

import type {
  Product,
} from '../../types/product';

import {
  getProductById,
} from '../../api/productsApi';

import {
  useCartStore,
} from '../../store/cartStore';

import {
  useFavoritesStore,
} from '../../store/favoritesStore';

import {
  useAuthStore,
} from '../../store/authStore';

import {
  useLanguageStore,
} from '../../store/languageStore';

import {
  getProductDescription,
  getProductName,
} from '../../utils/productLocalization';

import {
  formatPrice,
  formatWeight,
} from '../../utils/formatters';

import {
  styles,
} from './styles';

const ADDED_FEEDBACK_DURATION =
  1200;

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'Product'
  >;

export const ProductScreen = ({
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

  const { productId } =
    route.params;

  const [
    product,
    setProduct,
  ] = useState<Product | null>(
    null
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState(false);

  const [
    isAdded,
    setIsAdded,
  ] = useState(false);

  const cartScaleAnim =
    useRef(
      new Animated.Value(1)
    ).current;

  const favoriteScaleAnim =
    useRef(
      new Animated.Value(1)
    ).current;

  const addedTimeoutRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const addProduct =
    useCartStore(
      (state) =>
        state.addProduct
    );

  const toggleFavorite =
    useFavoritesStore(
      (state) =>
        state.toggleFavorite
    );

  const restoreGuestFavorites =
    useFavoritesStore(
      (state) =>
        state.restoreGuestFavorites
    );

  const accessToken =
    useAuthStore(
      (state) =>
        state.accessToken
    );

  const isFavorite =
    useFavoritesStore(
      (state) =>
        product
          ? state.isFavorite(
              product.id
            )
          : false
    );

  useEffect(() => {
    if (!accessToken) {
      void restoreGuestFavorites();
    }
  }, [
    accessToken,
    restoreGuestFavorites,
  ]);

  useEffect(() => {
    let isActive = true;

    const loadProduct =
      async () => {
        try {
          setIsLoading(
            true
          );

          setLoadError(
            false
          );

          const data =
            await getProductById(
              productId
            );

          if (!isActive) {
            return;
          }

          setProduct(
            data
          );
        } catch (error) {
          console.error(
            'Failed to load product:',
            error
          );

          if (isActive) {
            setLoadError(
              true
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(
              false
            );
          }
        }
      };

    void loadProduct();

    return () => {
      isActive = false;
    };
  }, [
    productId,
  ]);

  useEffect(() => {
    return () => {
      if (
        addedTimeoutRef.current
      ) {
        clearTimeout(
          addedTimeoutRef.current
        );
      }
    };
  }, []);

  const triggerLightHaptic =
    () => {
      void Haptics
        .impactAsync(
          Haptics
            .ImpactFeedbackStyle
            .Light
        )
        .catch(() => {});
    };

  const animateCartButton =
    () => {
      Animated.sequence([
        Animated.timing(
          cartScaleAnim,
          {
            toValue: 0.96,
            duration: 80,
            useNativeDriver:
              true,
          }
        ),

        Animated.timing(
          cartScaleAnim,
          {
            toValue: 1,
            duration: 120,
            useNativeDriver:
              true,
          }
        ),
      ]).start();
    };

  const animateFavoriteButton =
    () => {
      Animated.sequence([
        Animated.timing(
          favoriteScaleAnim,
          {
            toValue: 0.82,
            duration: 80,
            useNativeDriver:
              true,
          }
        ),

        Animated.spring(
          favoriteScaleAnim,
          {
            toValue: 1,
            friction: 4,
            tension: 180,
            useNativeDriver:
              true,
          }
        ),
      ]).start();
    };

  const handleAddToCart =
    () => {
      if (!product) {
        return;
      }

      animateCartButton();
      triggerLightHaptic();

      addProduct(
        product
      );

      setIsAdded(
        true
      );

      if (
        addedTimeoutRef.current
      ) {
        clearTimeout(
          addedTimeoutRef.current
        );
      }

      addedTimeoutRef.current =
        setTimeout(() => {
          setIsAdded(
            false
          );

          addedTimeoutRef.current =
            null;
        }, ADDED_FEEDBACK_DURATION);
    };

  const handleFavoritePress =
    async () => {
      if (!product) {
        return;
      }

      animateFavoriteButton();
      triggerLightHaptic();

      try {
        await toggleFavorite(
          product,
          accessToken
        );
      } catch (error) {
        console.error(
          'Failed to toggle favorite:',
          error
        );
      }
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
            styles.notFound
          }
        >
          <Text
            style={
              styles.notFoundText
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
    loadError ||
    !product
  ) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.notFound
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color="#AAAAAA"
          />

          <Text
            style={
              styles.notFoundText
            }
          >
            {t(
              'product.notFound'
            )}
          </Text>

          <Pressable
            style={
              styles.notFoundButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.notFoundButtonText
              }
            >
              {t(
                'common.back'
              )}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const displayName =
    getProductName(
      product,
      language
    );

  const displayDescription =
    getProductDescription(
      product,
      language
    );

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={
            styles.imageContainer
          }
        >
          <Image
            source={{
              uri:
                product.image,
            }}
            style={
              styles.image
            }
          />

          <Pressable
            style={
              styles.navigationButton
            }
            onPress={() =>
              navigation.goBack()
            }
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color="#111111"
            />
          </Pressable>

          <Animated.View
            style={[
              styles.favoriteButtonWrapper,
              {
                transform: [
                  {
                    scale:
                      favoriteScaleAnim,
                  },
                ],
              },
            ]}
          >
            <Pressable
              style={[
                styles.favoriteButton,

                isFavorite &&
                  styles.favoriteButtonActive,
              ]}
              onPress={() =>
                void handleFavoritePress()
              }
              hitSlop={8}
            >
              <Ionicons
                name={
                  isFavorite
                    ? 'heart'
                    : 'heart-outline'
                }
                size={
                  isFavorite
                    ? 24
                    : 26
                }
                color={
                  isFavorite
                    ? '#E63B4D'
                    : '#B64A4A'
                }
              />
            </Pressable>
          </Animated.View>
        </View>

        <View
          style={
            styles.content
          }
        >
          <View
            style={
              styles.topInfoRow
            }
          >
            <Text
              style={
                styles.name
              }
            >
              {displayName}
            </Text>

            <View
              style={
                styles.weightBadge
              }
            >
              <Text
                style={
                  styles.weightText
                }
              >
                {formatWeight(
                  product.weight,
                  language
                )}
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.description
            }
          >
            {displayDescription}
          </Text>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.priceRow
            }
          >
            <View>
              <Text
                style={
                  styles.priceLabel
                }
              >
                {t(
                  'product.price'
                )}
              </Text>

              <Text
                style={
                  styles.price
                }
              >
                {formatPrice(
                  product.price,
                  language
                )}
              </Text>
            </View>

            <View
              style={
                styles.quantityHint
              }
            >
              <Ionicons
                name="restaurant-outline"
                size={17}
                color="#777777"
              />

              <Text
                style={
                  styles.quantityHintText
                }
              >
                {t(
                  'product.serving'
                )}
              </Text>
            </View>
          </View>

          <Animated.View
            style={{
              transform: [
                {
                  scale:
                    cartScaleAnim,
                },
              ],
            }}
          >
            <Pressable
              style={[
                styles.cartButton,

                isAdded &&
                  styles.cartButtonAdded,
              ]}
              onPress={
                handleAddToCart
              }
            >
              <Ionicons
                name={
                  isAdded
                    ? 'checkmark'
                    : 'bag-outline'
                }
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.cartButtonText
                }
              >
                {isAdded
                  ? t(
                      'product.added'
                    )
                  : t(
                      'product.addToCart'
                    )}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};