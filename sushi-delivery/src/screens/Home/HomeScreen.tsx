import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
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

import {
  Header,
} from '../../components/Header/Header';

import {
  DeliveryToggle,
} from '../../components/DeliveryToggle/DeliveryToggle';

import {
  AddressCard,
} from '../../components/AddressCard/AddressCard';

import {
  PromoBanner,
} from '../../components/PromoBanner/PromoBanner';

import {
  CategoryChip,
} from '../../components/CategoryChip/CategoryChip';

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

import type {
  Product,
} from '../../types/product';

import type {
  Category,
} from '../../api/categoriesApi';

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
  getProducts,
} from '../../api/productsApi';

import {
  getCategories,
} from '../../api/categoriesApi';

import {
  getCategoryName,
} from '../../utils/productLocalization';

import {
  styles,
} from './styles';

type HomeNavigationProp =
  CompositeNavigationProp<
    BottomTabNavigationProp<
      BottomTabParamList,
      'Home'
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

export const HomeScreen = () => {
  const navigation =
    useNavigation<HomeNavigationProp>();

  const { t } =
    useTranslation();

  const language =
    useLanguageStore(
      (state) =>
        state.language
    );

  const scrollRef =
    useRef<ScrollView | null>(
      null
    );

  const menuY =
    useRef(0);

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<number | null>(
    null
  );

  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const addProduct =
    useCartStore(
      (state) =>
        state.addProduct
    );

  const accessToken =
    useAuthStore(
      (state) =>
        state.accessToken
    );

  const loadFavorites =
    useFavoritesStore(
      (state) =>
        state.loadFavorites
    );

  useEffect(() => {
    let isActive = true;

    const loadHomeData =
      async () => {
        try {
          const [
            productsData,
            categoriesData,
          ] =
            await Promise.all([
              getProducts(),
              getCategories(),
            ]);

          if (!isActive) {
            return;
          }

          setProducts(
            productsData
          );

          setCategories(
            categoriesData
          );
        } catch (error) {
          if (!isActive) {
            return;
          }

          console.error(
            'Failed to load home data:',
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

    void loadHomeData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    void loadFavorites(
      accessToken
    );
  }, [
    accessToken,
    loadFavorites,
  ]);

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const scrollToMenu = () => {
    scrollRef.current?.scrollTo({
      y: menuY.current,
      animated: true,
    });
  };

  const filteredProducts =
    activeCategory === null
      ? products
      : products.filter(
          (product) =>
            product.categoryId ===
            activeCategory
        );

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <Header
        onMenuPress={
          openDrawer
        }
        onSearchPress={() =>
          navigation.navigate(
            'Search'
          )
        }
      />

      <ScrollView
        ref={
          scrollRef
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <DeliveryToggle />

        <AddressCard
          onPress={() =>
            navigation.navigate(
              'DeliveryMap'
            )
          }
        />

        <PromoBanner
          onOrderPress={
            scrollToMenu
          }
        />

        <View
          style={
            styles.categoriesSection
          }
          onLayout={(
            event
          ) => {
            menuY.current =
              event.nativeEvent
                .layout.y;
          }}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'home.menu'
            )}
          </Text>

          {isLoading ? (
            <View
              style={
                styles.loadingCategoryRow
              }
            >
              <View
                style={
                  styles.loadingCategoryLarge
                }
              />

              <View
                style={
                  styles.loadingCategory
                }
              />

              <View
                style={
                  styles.loadingCategory
                }
              />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.categoriesContent
              }
            >
              <CategoryChip
                title={
                  t(
                    'home.all'
                  )
                }
                isActive={
                  activeCategory ===
                  null
                }
                onPress={() =>
                  setActiveCategory(
                    null
                  )
                }
              />

              {categories.map(
                (category) => (
                  <CategoryChip
                    key={
                      category.id
                    }
                    title={
                      getCategoryName(
                        category,
                        language
                      )
                    }
                    isActive={
                      activeCategory ===
                      category.id
                    }
                    onPress={() =>
                      setActiveCategory(
                        category.id
                      )
                    }
                  />
                )
              )}
            </ScrollView>
          )}
        </View>

        {isLoading ? (
          <View
            style={
              styles.loadingProductsGrid
            }
          >
            {[1, 2, 3, 4].map(
              (item) => (
                <View
                  key={item}
                  style={
                    styles.loadingProductCard
                  }
                >
                  <View
                    style={
                      styles.loadingImage
                    }
                  />

                  <View
                    style={
                      styles.loadingCardContent
                    }
                  >
                    <View
                      style={
                        styles.loadingLineLarge
                      }
                    />

                    <View
                      style={
                        styles.loadingLineMedium
                      }
                    />

                    <View
                      style={
                        styles.loadingLineSmall
                      }
                    />

                    <View
                      style={
                        styles.loadingBottomRow
                      }
                    >
                      <View
                        style={
                          styles.loadingPrice
                        }
                      />

                      <View
                        style={
                          styles.loadingAddButton
                        }
                      />
                    </View>
                  </View>
                </View>
              )
            )}
          </View>
        ) : (
          <>
            {filteredProducts.length ===
              0 && (
              <View
                style={
                  styles.noResults
                }
              >
                <Ionicons
                  name="search-outline"
                  size={34}
                  color="#999"
                />

                <Text
                  style={
                    styles.noResultsText
                  }
                >
                  {t(
                    'home.nothingFound'
                  )}
                </Text>
              </View>
            )}

            <View
              style={
                styles.productsSection
              }
            >
              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                    onPress={() =>
                      navigation.navigate(
                        'Product',
                        {
                          productId:
                            product.id,
                        }
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
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};