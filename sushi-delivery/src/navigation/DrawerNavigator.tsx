import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';

import type {
  DrawerContentComponentProps,
} from '@react-navigation/drawer';

import type {
  NavigatorScreenParams,
} from '@react-navigation/native';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useTranslation,
} from 'react-i18next';

import {
  BottomTabNavigator,
} from './BottomTabNavigator';

import type {
  BottomTabParamList,
} from './BottomTabNavigator';

import {
  OrdersScreen,
} from '../screens/Orders/OrdersScreen';

import {
  AboutScreen,
} from '../screens/About/AboutScreen';

import {
  PromotionsScreen,
} from '../screens/Promotions/PromotionsScreen';

import {
  NotificationsScreen,
} from '../screens/Notifications/NotificationsScreen';

export type DrawerParamList = {
  HomeTabs:
    | NavigatorScreenParams<BottomTabParamList>
    | undefined;

  Orders: undefined;
  About: undefined;
  Promotions: undefined;
  Notifications: undefined;
};

type HomeTabName =
  keyof BottomTabParamList;

type DrawerScreenName =
  Exclude<
    keyof DrawerParamList,
    'HomeTabs'
  >;

const Drawer =
  createDrawerNavigator<DrawerParamList>();

type DrawerMenuItemProps = {
  label: string;

  icon:
    keyof typeof Ionicons.glyphMap;

  onPress: () => void;
};

const DrawerMenuItem = ({
  label,
  icon,
  onPress,
}: DrawerMenuItemProps) => {
  return (
    <Pressable
      style={({
        pressed,
      }) => [
        styles.menuItem,

        pressed &&
          styles.menuItemPressed,
      ]}
      onPress={
        onPress
      }
    >
      <View
        style={
          styles.iconContainer
        }
      >
        <Ionicons
          name={icon}
          size={28}
          color="#666666"
        />
      </View>

      <Text
        style={
          styles.menuText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
};

const CustomDrawerContent = (
  props:
    DrawerContentComponentProps
) => {
  const { t } =
    useTranslation();

  const goToHomeTab = (
    screen: HomeTabName
  ) => {
    props.navigation.navigate(
      'HomeTabs',
      {
        screen,
      }
    );

    props.navigation.closeDrawer();
  };

  const goToDrawerScreen = (
    screen: DrawerScreenName
  ) => {
    props.navigation.navigate(
      screen
    );

    props.navigation.closeDrawer();
  };

  return (
    <View
      style={
        styles.drawer
      }
    >
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.logoBlock
          }
        >
          <Text
            style={
              styles.logo
            }
          >
            NORI SUSHI
          </Text>
        </View>

        <View
          style={
            styles.menu
          }
        >
          <DrawerMenuItem
            label={
              t(
                'drawer.profile'
              )
            }
            icon="person-circle-outline"
            onPress={() =>
              goToHomeTab(
                'Profile'
              )
            }
          />

          <DrawerMenuItem
            label={
              t(
                'drawer.menu'
              )
            }
            icon="restaurant-outline"
            onPress={() =>
              goToHomeTab(
                'Home'
              )
            }
          />

          <DrawerMenuItem
            label={
              t(
                'drawer.cart'
              )
            }
            icon="bag-handle-outline"
            onPress={() =>
              goToHomeTab(
                'Cart'
              )
            }
          />

          <DrawerMenuItem
            label={
              t(
                'drawer.favorites'
              )
            }
            icon="heart-outline"
            onPress={() =>
              goToHomeTab(
                'Favorites'
              )
            }
          />

          <View
            style={
              styles.separator
            }
          />

          <DrawerMenuItem
            label={
              t(
                'drawer.orders'
              )
            }
            icon="receipt-outline"
            onPress={() =>
              goToDrawerScreen(
                'Orders'
              )
            }
          />

          <DrawerMenuItem
            label={
              t(
                'drawer.promotions'
              )
            }
            icon="pricetag-outline"
            onPress={() =>
              goToDrawerScreen(
                'Promotions'
              )
            }
          />

          <DrawerMenuItem
            label={
              t(
                'drawer.notifications'
              )
            }
            icon="notifications-outline"
            onPress={() =>
              goToDrawerScreen(
                'Notifications'
              )
            }
          />

          <DrawerMenuItem
            label={
              t(
                'drawer.about'
              )
            }
            icon="information-circle-outline"
            onPress={() =>
              goToDrawerScreen(
                'About'
              )
            }
          />
        </View>

        <View
          style={
            styles.footer
          }
        >
          <Text
            style={
              styles.footerText
            }
          >
            {t(
              'drawer.publicOffer'
            )}
          </Text>

          <Text
            style={
              styles.footerText
            }
          >
            {t(
              'drawer.privacyPolicy'
            )}
          </Text>

          <Text
            style={
              styles.version
            }
          >
            NORI • Demo
          </Text>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

export const DrawerNavigator =
  () => {
    return (
      <Drawer.Navigator
        drawerContent={(
          props
        ) => (
          <CustomDrawerContent
            {...props}
          />
        )}
        screenOptions={{
          headerShown: false,

          drawerType:
            'front',

          drawerStyle: {
            width: '76%',

            backgroundColor:
              '#050505',
          },

          overlayColor:
            'rgba(0, 0, 0, 0.48)',

          swipeEdgeWidth: 35,
        }}
      >
        <Drawer.Screen
          name="HomeTabs"
          component={
            BottomTabNavigator
          }
        />

        <Drawer.Screen
          name="Orders"
          component={
            OrdersScreen
          }
        />

        <Drawer.Screen
          name="About"
          component={
            AboutScreen
          }
        />

        <Drawer.Screen
          name="Promotions"
          component={
            PromotionsScreen
          }
        />

        <Drawer.Screen
          name="Notifications"
          component={
            NotificationsScreen
          }
        />
      </Drawer.Navigator>
    );
  };

const styles =
  StyleSheet.create({
    drawer: {
      flex: 1,

      backgroundColor:
        '#050505',
    },

    scrollContent: {
      flexGrow: 1,

      paddingTop: 20,
      paddingBottom: 24,
    },

    logoBlock: {
      paddingHorizontal: 28,
      paddingTop: 28,
      paddingBottom: 26,
    },

    logo: {
      color: '#FFFFFF',

      fontSize: 28,
      fontWeight: '800',

      letterSpacing: 3,
    },

    menu: {
      paddingHorizontal: 12,
    },

    menuItem: {
      minHeight: 66,

      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 18,

      borderRadius: 16,
    },

    menuItemPressed: {
      backgroundColor:
        '#151515',
    },

    iconContainer: {
      width: 48,

      alignItems:
        'flex-start',

      justifyContent:
        'center',
    },

    menuText: {
      flex: 1,

      color: '#F4F4F4',

      fontSize: 18,
      fontWeight: '600',
    },

    separator: {
      height: 1,

      marginHorizontal: 18,
      marginVertical: 10,

      backgroundColor:
        '#1B1B1B',
    },

    footer: {
      marginTop: 'auto',

      paddingHorizontal: 30,
      paddingTop: 30,
    },

    footerText: {
      marginBottom: 10,

      color: '#666666',

      fontSize: 13,
      lineHeight: 20,
    },

    version: {
      marginTop: 12,

      color: '#3F3F3F',

      fontSize: 12,
    },
  });