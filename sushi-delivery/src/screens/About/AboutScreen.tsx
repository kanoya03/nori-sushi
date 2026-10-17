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
  CompositeNavigationProp,
} from '@react-navigation/native';

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
  styles,
} from './styles';

type AboutNavigationProp =
  CompositeNavigationProp<
    DrawerNavigationProp<
      DrawerParamList,
      'About'
    >,
    NativeStackNavigationProp<
      RootStackParamList
    >
  >;

type HomeTab =
  keyof BottomTabParamList;

export const AboutScreen = () => {
  const navigation =
    useNavigation<AboutNavigationProp>();

  const { t } =
    useTranslation();

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const openHomeTab = (
    screen: HomeTab
  ) => {
    navigation.navigate(
      'HomeTabs',
      {
        screen,
      }
    );
  };

  const goToOrders = () => {
    navigation.navigate(
      'Orders'
    );
  };

  const goToDelivery = () => {
    navigation.navigate(
      'DeliveryMap'
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
            'about.title'
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
            styles.brandCard
          }
        >
          <View
            style={
              styles.logo
            }
          >
            <Ionicons
              name="restaurant"
              size={38}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={
              styles.brandName
            }
          >
            NORI SUSHI
          </Text>

          <Text
            style={
              styles.brandSubtitle
            }
          >
            {t(
              'about.brandSubtitle'
            )}
          </Text>
        </View>

        <View
          style={
            styles.aboutCard
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'about.aboutTitle'
            )}
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            {t(
              'about.paragraphOne'
            )}
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            {t(
              'about.paragraphTwo'
            )}
          </Text>
        </View>

        <Text
          style={
            styles.navigationTitle
          }
        >
          {t(
            'about.features'
          )}
        </Text>

        <View
          style={
            styles.menuCard
          }
        >
          <Pressable
            style={
              styles.menuRow
            }
            onPress={() =>
              openHomeTab(
                'Home'
              )
            }
          >
            <View
              style={
                styles.menuLeft
              }
            >
              <View
                style={
                  styles.featureIcon
                }
              >
                <Ionicons
                  name="restaurant-outline"
                  size={23}
                  color="#555555"
                />
              </View>

              <View
                style={
                  styles.featureContent
                }
              >
                <Text
                  style={
                    styles.featureTitle
                  }
                >
                  {t(
                    'about.menu'
                  )}
                </Text>

                <Text
                  style={
                    styles.featureText
                  }
                >
                  {t(
                    'about.menuDescription'
                  )}
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#BBBBBB"
            />
          </Pressable>

          <View
            style={
              styles.divider
            }
          />

          <Pressable
            style={
              styles.menuRow
            }
            onPress={() =>
              openHomeTab(
                'Favorites'
              )
            }
          >
            <View
              style={
                styles.menuLeft
              }
            >
              <View
                style={
                  styles.featureIcon
                }
              >
                <Ionicons
                  name="heart-outline"
                  size={23}
                  color="#555555"
                />
              </View>

              <View
                style={
                  styles.featureContent
                }
              >
                <Text
                  style={
                    styles.featureTitle
                  }
                >
                  {t(
                    'about.favorites'
                  )}
                </Text>

                <Text
                  style={
                    styles.featureText
                  }
                >
                  {t(
                    'about.favoritesDescription'
                  )}
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#BBBBBB"
            />
          </Pressable>

          <View
            style={
              styles.divider
            }
          />

          <Pressable
            style={
              styles.menuRow
            }
            onPress={
              goToOrders
            }
          >
            <View
              style={
                styles.menuLeft
              }
            >
              <View
                style={
                  styles.featureIcon
                }
              >
                <Ionicons
                  name="receipt-outline"
                  size={23}
                  color="#555555"
                />
              </View>

              <View
                style={
                  styles.featureContent
                }
              >
                <Text
                  style={
                    styles.featureTitle
                  }
                >
                  {t(
                    'about.orders'
                  )}
                </Text>

                <Text
                  style={
                    styles.featureText
                  }
                >
                  {t(
                    'about.ordersDescription'
                  )}
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#BBBBBB"
            />
          </Pressable>

          <View
            style={
              styles.divider
            }
          />

          <Pressable
            style={
              styles.menuRow
            }
            onPress={
              goToDelivery
            }
          >
            <View
              style={
                styles.menuLeft
              }
            >
              <View
                style={
                  styles.featureIcon
                }
              >
                <Ionicons
                  name="location-outline"
                  size={23}
                  color="#555555"
                />
              </View>

              <View
                style={
                  styles.featureContent
                }
              >
                <Text
                  style={
                    styles.featureTitle
                  }
                >
                  {t(
                    'about.delivery'
                  )}
                </Text>

                <Text
                  style={
                    styles.featureText
                  }
                >
                  {t(
                    'about.deliveryDescription'
                  )}
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#BBBBBB"
            />
          </Pressable>
        </View>

        <Pressable
          style={
            styles.menuButton
          }
          onPress={() =>
            openHomeTab(
              'Home'
            )
          }
        >
          <Text
            style={
              styles.menuButtonText
            }
          >
            {t(
              'about.goToMenu'
            )}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>

        <View
          style={
            styles.versionCard
          }
        >
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="#999999"
          />

          <View>
            <Text
              style={
                styles.versionTitle
              }
            >
              NORI SUSHI
            </Text>

            <Text
              style={
                styles.versionText
              }
            >
              {t(
                'about.version'
              )}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};