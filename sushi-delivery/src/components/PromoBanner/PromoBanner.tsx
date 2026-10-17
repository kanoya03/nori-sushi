import {
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  useTranslation,
} from 'react-i18next';

import {
  styles,
} from './styles';

type PromoBannerProps = {
  onOrderPress: () => void;
};

export const PromoBanner = ({
  onOrderPress,
}: PromoBannerProps) => {
  const { t } =
    useTranslation();

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.content
        }
      >
        <Text
          style={
            styles.badge
          }
        >
          {t(
            'promo.badge'
          )}
        </Text>

        <Text
          style={
            styles.title
          }
        >
          {t(
            'promo.title'
          )}
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          {t(
            'promo.subtitle'
          )}
        </Text>

        <Pressable
          style={
            styles.button
          }
          onPress={
            onOrderPress
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            {t(
              'promo.order'
            )}
          </Text>
        </Pressable>
      </View>

      <Text
        style={
          styles.emoji
        }
      >
        🍣
      </Text>
    </View>
  );
};