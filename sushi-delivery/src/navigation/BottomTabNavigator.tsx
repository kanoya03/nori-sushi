import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useTranslation,
} from 'react-i18next';

import {
  HomeScreen,
} from '../screens/Home/HomeScreen';

import {
  ProfileScreen,
} from '../screens/Profile/ProfileScreen';

import {
  FavoritesScreen,
} from '../screens/Favorites/FavoritesScreen';

import {
  CartScreen,
} from '../screens/Cart/CartScreen';

import {
  useCartStore,
} from '../store/cartStore';

export type BottomTabParamList = {
  Home: undefined;
  Profile: undefined;
  Favorites: undefined;
  Cart: undefined;
};

type TabName =
  keyof BottomTabParamList;

type TabIconConfig = {
  active:
    keyof typeof Ionicons.glyphMap;

  inactive:
    keyof typeof Ionicons.glyphMap;
};

const TAB_ICONS:
  Record<
    TabName,
    TabIconConfig
  > = {
    Home: {
      active: 'home',
      inactive: 'home-outline',
    },

    Profile: {
      active: 'person',
      inactive: 'person-outline',
    },

    Favorites: {
      active: 'heart',
      inactive: 'heart-outline',
    },

    Cart: {
      active: 'bag',
      inactive: 'bag-outline',
    },
  };

const Tab =
  createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator =
  () => {
    const { t } =
      useTranslation();

    const totalQuantity =
      useCartStore(
        (state) =>
          state.getTotalQuantity()
      );

    return (
      <Tab.Navigator
        screenOptions={({
          route,
        }) => ({
          headerShown: false,

          tabBarActiveTintColor:
            '#2F8F6B',

          tabBarInactiveTintColor:
            '#8A8A8A',

          tabBarStyle: {
            height: 72,

            paddingTop: 8,
            paddingBottom: 8,

            borderTopWidth: 1,

            borderTopColor:
              '#EEEEEE',

            backgroundColor:
              '#FFFFFF',
          },

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => {
            const icons =
              TAB_ICONS[
                route.name
              ];

            return (
              <Ionicons
                name={
                  focused
                    ? icons.active
                    : icons.inactive
                }
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={
            HomeScreen
          }
          options={{
            title:
              t(
                'tabs.menu'
              ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={
            ProfileScreen
          }
          options={{
            title:
              t(
                'tabs.profile'
              ),
          }}
        />

        <Tab.Screen
          name="Favorites"
          component={
            FavoritesScreen
          }
          options={{
            title:
              t(
                'tabs.favorites'
              ),
          }}
        />

        <Tab.Screen
          name="Cart"
          component={
            CartScreen
          }
          options={{
            title:
              t(
                'tabs.cart'
              ),

            tabBarBadge:
              totalQuantity > 0
                ? totalQuantity
                : undefined,

            tabBarBadgeStyle: {
              backgroundColor:
                '#2F8F6B',

              color: '#FFFFFF',

              fontSize: 11,
              fontWeight: '700',
            },
          }}
        />
      </Tab.Navigator>
    );
  };