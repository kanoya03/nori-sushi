import {
  useCallback,
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

import {
  ProductCard,
} from '../../components/ProductCard/ProductCard';

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
  useFavoritesStore,
} from '../../store/favoritesStore';

import {
  useCartStore,
} from '../../store/cartStore';

import {
  useAuthStore,
} from '../../store/authStore';

import {
  styles,
} from './styles';

type FavoritesNavigationProp =
  CompositeNavigationProp<
    BottomTabNavigationProp<
      BottomTabParamList,
      'Favorites'
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

export const FavoritesScreen =
  () => {
    const navigation =
      useNavigation<FavoritesNavigationProp>();

    const { t } =
      useTranslation();

    const accessToken =
      useAuthStore(
        (state) =>
          state.accessToken
      );

    const favorites =
      useFavoritesStore(
        (state) =>
          state.favorites
      );

    const isLoading =
      useFavoritesStore(
        (state) =>
          state.isLoading
      );

    const loadFavorites =
      useFavoritesStore(
        (state) =>
          state.loadFavorites
      );

    const addProduct =
      useCartStore(
        (state) =>
          state.addProduct
      );

    useFocusEffect(
      useCallback(() => {
        void loadFavorites(
          accessToken
        );
      }, [
        accessToken,
        loadFavorites,
      ])
    );

    const openDrawer =
      () => {
        navigation.openDrawer();
      };

    const openProduct = (
      productId: number
    ) => {
      navigation.navigate(
        'Product',
        {
          productId,
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
              'favorites.title'
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
        ) : favorites.length ===
          0 ? (
          <View
            style={
              styles.emptyContainer
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="heart-outline"
                size={42}
                color="#B3B3B3"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              {t(
                'favorites.emptyTitle'
              )}
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              {t(
                'favorites.emptyText'
              )}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.productsContainer
            }
          >
            {favorites.map(
              (product) => (
                <ProductCard
                  key={
                    product.id
                  }
                  product={
                    product
                  }
                  onPress={() =>
                    openProduct(
                      product.id
                    )
                  }
                  onAddPress={() =>
                    addProduct(
                      product
                    )
                  }
                />
              )
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  };