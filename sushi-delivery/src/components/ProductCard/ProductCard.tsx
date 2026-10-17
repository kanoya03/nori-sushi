import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import * as Haptics
  from 'expo-haptics';

import type {
  Product,
} from '../../types/product';

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
  1000;

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
  onAddPress?: () => void;
};

export const ProductCard = ({
  product,
  onPress,
  onAddPress,
}: ProductCardProps) => {
  const [
    isAdded,
    setIsAdded,
  ] = useState(false);

  const language =
    useLanguageStore(
      (state) =>
        state.language
    );

  const scaleAnim =
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

  const toggleFavorite =
    useFavoritesStore(
      (state) =>
        state.toggleFavorite
    );

  const isFavorite =
    useFavoritesStore(
      (state) =>
        state.isFavorite(
          product.id
        )
    );

  const accessToken =
    useAuthStore(
      (state) =>
        state.accessToken
    );

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

  const animateAddButton =
    () => {
      Animated.sequence([
        Animated.timing(
          scaleAnim,
          {
            toValue: 0.8,
            duration: 80,
            useNativeDriver:
              true,
          }
        ),

        Animated.timing(
          scaleAnim,
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
        Animated.spring(
          favoriteScaleAnim,
          {
            toValue: 1.22,
            useNativeDriver:
              true,
            speed: 30,
            bounciness: 8,
          }
        ),

        Animated.spring(
          favoriteScaleAnim,
          {
            toValue: 1,
            useNativeDriver:
              true,
            speed: 30,
            bounciness: 6,
          }
        ),
      ]).start();
    };

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

  const handleAddPress =
    () => {
      animateAddButton();
      triggerLightHaptic();

      onAddPress?.();

      setIsAdded(true);

      if (
        addedTimeoutRef.current
      ) {
        clearTimeout(
          addedTimeoutRef.current
        );
      }

      addedTimeoutRef.current =
        setTimeout(() => {
          setIsAdded(false);

          addedTimeoutRef.current =
            null;
        }, ADDED_FEEDBACK_DURATION);
    };

  const handleFavoritePress =
    async () => {
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

  return (
    <Pressable
      style={
        styles.container
      }
      onPress={
        onPress
      }
    >
      <View>
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
          style={[
            styles.favoriteButton,

            isFavorite &&
              styles.favoriteButtonActive,
          ]}
          onPress={(event) => {
            event.stopPropagation();

            void handleFavoritePress();
          }}
        >
          <Animated.View
            style={{
              transform: [
                {
                  scale:
                    favoriteScaleAnim,
                },
              ],
            }}
          >
            <Ionicons
              name={
                isFavorite
                  ? 'heart'
                  : 'heart-outline'
              }
              size={
                isFavorite
                  ? 21
                  : 23
              }
              color={
                isFavorite
                  ? '#E63B4D'
                  : '#B64A4A'
              }
            />
          </Animated.View>
        </Pressable>
      </View>

      <View
        style={
          styles.content
        }
      >
        <Text
          style={
            styles.name
          }
          numberOfLines={1}
        >
          {displayName}
        </Text>

        <Text
          style={
            styles.description
          }
          numberOfLines={2}
        >
          {displayDescription}
        </Text>

        <Text
          style={
            styles.weight
          }
        >
          {formatWeight(
            product.weight,
            language
          )}
        </Text>

        <View
          style={
            styles.footer
          }
        >
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

          <Animated.View
            style={{
              transform: [
                {
                  scale:
                    scaleAnim,
                },
              ],
            }}
          >
            <Pressable
              style={[
                styles.addButton,

                isAdded &&
                  styles.addedButton,
              ]}
              onPress={(
                event
              ) => {
                event.stopPropagation();

                handleAddPress();
              }}
            >
              <Text
                style={
                  styles.addButtonText
                }
              >
                {isAdded
                  ? '✓'
                  : '+'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
};