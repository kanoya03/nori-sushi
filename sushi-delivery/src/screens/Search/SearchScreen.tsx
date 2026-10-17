import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
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
  Ionicons,
} from '@expo/vector-icons';

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
  getProducts,
} from '../../api/productsApi';

import {
  ProductCard,
} from '../../components/ProductCard/ProductCard';

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
  getProductCategoryName,
  getProductName,
} from '../../utils/productLocalization';

import {
  styles,
} from './styles';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'Search'
  >;

export const SearchScreen = ({
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
    query,
    setQuery,
  ] = useState('');

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

    const loadProducts =
      async () => {
        try {
          const data =
            await getProducts();

          if (!isActive) {
            return;
          }

          setProducts(
            data
          );
        } catch (error) {
          if (!isActive) {
            return;
          }

          console.error(
            'Failed to load search products:',
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

    void loadProducts();

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

  const filteredProducts =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      if (!normalizedQuery) {
        return [];
      }

      return products.filter(
        (product) =>
          getProductName(
            product,
            language
          )
            .toLowerCase()
            .includes(
              normalizedQuery
            )
      );
    }, [
      products,
      query,
      language,
    ]);

  const groupedProducts =
    useMemo(() => {
      const groups: Record<
        string,
        {
          title: string;
          products: Product[];
        }
      > = {};

      filteredProducts.forEach(
        (product) => {
          const key =
            product.categorySlug;

          if (!groups[key]) {
            groups[key] = {
              title:
                getProductCategoryName(
                  product,
                  language
                ),

              products: [],
            };
          }

          groups[key].products.push(
            product
          );
        }
      );

      return Object.entries(
        groups
      );
    }, [
      filteredProducts,
      language,
    ]);

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
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
          hitSlop={10}
        >
          <Ionicons
            name="chevron-back"
            size={30}
            color="#111111"
          />
        </Pressable>

        <Text
          style={
            styles.title
          }
        >
          {t(
            'search.title'
          )}
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      <View
        style={
          styles.searchContainer
        }
      >
        <Ionicons
          name="search-outline"
          size={24}
          color="#9D9D9D"
        />

        <TextInput
          style={
            styles.input
          }
          placeholder={
            t(
              'search.placeholder'
            )
          }
          placeholderTextColor="#9A9A9A"
          value={
            query
          }
          onChangeText={
            setQuery
          }
          autoFocus
          returnKeyType="search"
        />

        {query.length > 0 && (
          <Pressable
            style={
              styles.clearButton
            }
            onPress={() =>
              setQuery('')
            }
            hitSlop={8}
          >
            <Ionicons
              name="close"
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View
          style={
            styles.messageContainer
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
      ) : query.trim().length ===
        0 ? (
        <View
          style={
            styles.messageContainer
          }
        >
          <View
            style={
              styles.messageIcon
            }
          >
            <Ionicons
              name="search-outline"
              size={36}
              color="#B9B9B9"
            />
          </View>

          <Text
            style={
              styles.hint
            }
          >
            {t(
              'search.startTyping'
            )}
          </Text>
        </View>
      ) : filteredProducts.length ===
        0 ? (
        <View
          style={
            styles.messageContainer
          }
        >
          <View
            style={
              styles.messageIcon
            }
          >
            <Ionicons
              name="search-outline"
              size={36}
              color="#B9B9B9"
            />
          </View>

          <Text
            style={
              styles.message
            }
          >
            {t(
              'search.nothingFound'
            )}
          </Text>

          <Text
            style={
              styles.emptyHint
            }
          >
            {t(
              'search.changeQuery'
            )}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.resultsContent
          }
        >
          {groupedProducts.map(
            ([
              categorySlug,
              group,
            ]) => (
              <View
                key={
                  categorySlug
                }
                style={
                  styles.categorySection
                }
              >
                <View
                  style={
                    styles.categoryHeader
                  }
                >
                  <Text
                    style={
                      styles.categoryTitle
                    }
                  >
                    {group.title}
                  </Text>

                  <Text
                    style={
                      styles.categoryCount
                    }
                  >
                    {
                      group.products.length
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.productsSection
                  }
                >
                  {group.products.map(
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
                </View>
              </View>
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};