import {
  Pressable,
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
  useTranslation,
} from 'react-i18next';

import type {
  RootStackParamList,
} from '../../navigation/types';

import {
  styles,
} from './styles';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'OrderSuccess'
  >;

export const OrderSuccessScreen = ({
  navigation,
  route,
}: Props) => {
  const { t } =
    useTranslation();

  const { orderId } =
    route.params;

  const openOrder = () => {
    navigation.replace(
      'OrderDetails',
      {
        orderId,
      }
    );
  };

  const goToHome = () => {
    navigation.navigate(
      'Main',
      {
        screen: 'HomeTabs',
        params: {
          screen: 'Home',
        },
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
          styles.content
        }
      >
        <View
          style={
            styles.successCircle
          }
        >
          <Text
            style={
              styles.successIcon
            }
          >
            ✓
          </Text>
        </View>

        <Text
          style={
            styles.title
          }
        >
          {t(
            'orderSuccess.title'
          )}
        </Text>

        <Text
          style={
            styles.orderNumber
          }
        >
          {t(
            'orderSuccess.orderNumber',
            {
              id: orderId,
            }
          )}
        </Text>

        <Text
          style={
            styles.description
          }
        >
          {t(
            'orderSuccess.description'
          )}
        </Text>

        <Pressable
          style={
            styles.primaryButton
          }
          onPress={
            openOrder
          }
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            {t(
              'orderSuccess.viewOrder'
            )}
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.secondaryButton
          }
          onPress={
            goToHome
          }
        >
          <Text
            style={
              styles.secondaryButtonText
            }
          >
            {t(
              'orderSuccess.home'
            )}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};