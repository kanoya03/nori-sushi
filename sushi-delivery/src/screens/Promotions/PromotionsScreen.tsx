import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import type {
  DrawerNavigationProp,
} from '@react-navigation/drawer';

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
  DrawerParamList,
} from '../../navigation/DrawerNavigator';

import {
  styles,
} from './styles';

type PromotionsNavigationProp =
  DrawerNavigationProp<
    DrawerParamList,
    'Promotions'
  >;

const PROMOTIONS = [
  {
    id: 1,
    icon:
      'restaurant-outline',
    key: 'first',
  },
  {
    id: 2,
    icon:
      'car-outline',
    key: 'second',
  },
  {
    id: 3,
    icon:
      'gift-outline',
    key: 'third',
  },
] as const;

export const PromotionsScreen =
  () => {
    const navigation =
      useNavigation<PromotionsNavigationProp>();

    const { t } =
      useTranslation();

    const openDrawer = () => {
      navigation.openDrawer();
    };

    const goToMenu = () => {
      navigation.navigate(
        'HomeTabs',
        {
          screen: 'Home',
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
              'promotions.title'
            )}
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <View
            style={
              styles.hero
            }
          >
            <View
              style={
                styles.heroIcon
              }
            >
              <Ionicons
                name="pricetag-outline"
                size={34}
                color="#FFFFFF"
              />
            </View>

            <Text
              style={
                styles.heroTitle
              }
            >
              {t(
                'promotions.heroTitle'
              )}
            </Text>

            <Text
              style={
                styles.heroText
              }
            >
              {t(
                'promotions.heroText'
              )}
            </Text>

            <Pressable
              style={
                styles.heroButton
              }
              onPress={
                goToMenu
              }
            >
              <Text
                style={
                  styles.heroButtonText
                }
              >
                {t(
                  'promotions.openMenu'
                )}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={19}
                color="#111111"
              />
            </Pressable>
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'promotions.available'
            )}
          </Text>

          {PROMOTIONS.map(
            (promotion) => {
              const prefix =
                `promotions.${promotion.key}`;

              return (
                <View
                  key={
                    promotion.id
                  }
                  style={
                    styles.promotionCard
                  }
                >
                  <View
                    style={
                      styles.promotionTop
                    }
                  >
                    <View
                      style={
                        styles.promotionIcon
                      }
                    >
                      <Ionicons
                        name={
                          promotion.icon
                        }
                        size={25}
                        color="#111111"
                      />
                    </View>

                    <View
                      style={
                        styles.badge
                      }
                    >
                      <Text
                        style={
                          styles.badgeText
                        }
                      >
                        {t(
                          `${prefix}.badge`
                        )}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={
                      styles.promotionTitle
                    }
                  >
                    {t(
                      `${prefix}.title`
                    )}
                  </Text>

                  <Text
                    style={
                      styles.promotionDescription
                    }
                  >
                    {t(
                      `${prefix}.description`
                    )}
                  </Text>

                  <Pressable
                    style={
                      styles.promotionButton
                    }
                    onPress={
                      goToMenu
                    }
                  >
                    <Text
                      style={
                        styles.promotionButtonText
                      }
                    >
                      {t(
                        `${prefix}.button`
                      )}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>
              );
            }
          )}

          <Text
            style={
              styles.notice
            }
          >
            {t(
              'promotions.demoNotice'
            )}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  };