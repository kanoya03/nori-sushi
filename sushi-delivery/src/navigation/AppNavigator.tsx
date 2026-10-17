import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  DrawerNavigator,
} from './DrawerNavigator';

import type {
  RootStackParamList,
} from './types';

import {
  ProductScreen,
} from '../screens/Product/ProductScreen';

import {
  EditProfileScreen,
} from '../screens/EditProfile/EditProfileScreen';

import {
  DeliveryMapScreen,
} from '../screens/DeliveryMap/DeliveryMapScreen';

import {
  OrderDetailsScreen,
} from '../screens/OrderDetails/OrderDetailsScreen';

import {
  CheckoutScreen,
} from '../screens/Checkout/CheckoutScreen';

import {
  OrderSuccessScreen,
} from '../screens/OrderSuccess/OrderSuccessScreen';

import {
  SearchScreen,
} from '../screens/Search/SearchScreen';

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export const AppNavigator =
  () => {
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="Main"
            component={
              DrawerNavigator
            }
          />

          <Stack.Screen
            name="Product"
            component={
              ProductScreen
            }
          />

          <Stack.Screen
            name="EditProfile"
            component={
              EditProfileScreen
            }
          />

          <Stack.Screen
            name="DeliveryMap"
            component={
              DeliveryMapScreen
            }
          />

          <Stack.Screen
            name="OrderDetails"
            component={
              OrderDetailsScreen
            }
          />

          <Stack.Screen
            name="Checkout"
            component={
              CheckoutScreen
            }
          />

          <Stack.Screen
            name="OrderSuccess"
            component={
              OrderSuccessScreen
            }
          />

          <Stack.Screen
            name="Search"
            component={
              SearchScreen
            }
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  };