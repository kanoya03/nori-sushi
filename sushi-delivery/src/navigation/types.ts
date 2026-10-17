import type {
  NavigatorScreenParams,
} from '@react-navigation/native';

import type {
  DrawerParamList,
} from './DrawerNavigator';

export type RootStackParamList = {
  Main:
    | NavigatorScreenParams<DrawerParamList>
    | undefined;

  Product: {
    productId: number;
  };

  EditProfile: undefined;

  DeliveryMap: undefined;

  OrderDetails: {
    orderId: number;
  };

  Checkout: undefined;

  OrderSuccess: {
    orderId: number;
  };

  Search: undefined;
};