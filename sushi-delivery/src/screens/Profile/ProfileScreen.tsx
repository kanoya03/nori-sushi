import {
  useState,
} from 'react';

import {
  Modal,
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
  AuthModal,
} from '../../components/AuthModal/AuthModal';

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
  useAuthStore,
} from '../../store/authStore';

import {
  useLanguageStore,
} from '../../store/languageStore';

import type {
  AppLanguage,
} from '../../i18n';

import {
  styles,
} from './styles';

type ProfileNavigationProp =
  CompositeNavigationProp<
    BottomTabNavigationProp<
      BottomTabParamList,
      'Profile'
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

type DrawerScreen =
  Exclude<
    keyof DrawerParamList,
    'HomeTabs'
  >;

export const ProfileScreen = () => {
  const navigation =
    useNavigation<ProfileNavigationProp>();

  const { t } =
    useTranslation();

  const language =
    useLanguageStore(
      (state) =>
        state.language
    );

  const setLanguage =
    useLanguageStore(
      (state) =>
        state.setLanguage
    );

  const user =
    useAuthStore(
      (state) =>
        state.user
    );

  const logout =
    useAuthStore(
      (state) =>
        state.logout
    );

  const [
    authVisible,
    setAuthVisible,
  ] = useState(!user);

  const [
    languageVisible,
    setLanguageVisible,
  ] = useState(false);

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const openDrawerScreen = (
    screen: DrawerScreen
  ) => {
    navigation.navigate(
      screen
    );
  };

  const openEditProfile = () => {
    navigation.navigate(
      'EditProfile'
    );
  };

  const changeLanguage = (
    nextLanguage:
      AppLanguage
  ) => {
    void setLanguage(
      nextLanguage
    );

    setLanguageVisible(
      false
    );
  };

  const renderLanguageModal =
    () => (
      <Modal
        visible={
          languageVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setLanguageVisible(
            false
          )
        }
      >
        <View
          style={
            styles.languageOverlay
          }
        >
          <Pressable
            style={
              styles.languageBackdrop
            }
            onPress={() =>
              setLanguageVisible(
                false
              )
            }
          />

          <View
            style={
              styles.languageSheet
            }
          >
            <View
              style={
                styles.languageHandle
              }
            />

            <View
              style={
                styles.languageHeader
              }
            >
              <Text
                style={
                  styles.languageTitle
                }
              >
                {t(
                  'profile.language'
                )}
              </Text>

              <Pressable
                style={
                  styles.languageCloseButton
                }
                onPress={() =>
                  setLanguageVisible(
                    false
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#777777"
                />
              </Pressable>
            </View>

            <View
              style={
                styles.languageOptions
              }
            >
              <Pressable
                style={[
                  styles.languageOption,

                  language ===
                    'ru' &&
                    styles.languageOptionActive,
                ]}
                onPress={() =>
                  changeLanguage(
                    'ru'
                  )
                }
              >
                <Text
                  style={[
                    styles.languageOptionText,

                    language ===
                      'ru' &&
                      styles.languageOptionTextActive,
                  ]}
                >
                  RU
                </Text>

                {language ===
                  'ru' && (
                  <View
                    style={
                      styles.languageCheck
                    }
                  >
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color="#FFFFFF"
                    />
                  </View>
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.languageOption,

                  language ===
                    'en' &&
                    styles.languageOptionActive,
                ]}
                onPress={() =>
                  changeLanguage(
                    'en'
                  )
                }
              >
                <Text
                  style={[
                    styles.languageOptionText,

                    language ===
                      'en' &&
                      styles.languageOptionTextActive,
                  ]}
                >
                  ENG
                </Text>

                {language ===
                  'en' && (
                  <View
                    style={
                      styles.languageCheck
                    }
                  >
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color="#FFFFFF"
                    />
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );

  if (!user) {
    return (
      <>
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
                'profile.title'
              )}
            </Text>

            <Pressable
              style={[
                styles.headerButton,
                styles.headerButtonRight,
              ]}
              onPress={() =>
                setLanguageVisible(
                  true
                )
              }
              hitSlop={10}
            >
              <View
                style={
                  styles.languageHeaderBadge
                }
              >
                <Text
                  style={
                    styles.languageHeaderBadgeText
                  }
                >
                  {language ===
                  'ru'
                    ? 'RU'
                    : 'ENG'}
                </Text>
              </View>
            </Pressable>
          </View>

          <View
            style={
              styles.guestContainer
            }
          >
            <View
              style={
                styles.guestAvatar
              }
            >
              <Ionicons
                name="person-outline"
                size={52}
                color="#AAAAAA"
              />
            </View>

            <Text
              style={
                styles.guestTitle
              }
            >
              {t(
                'profile.guestTitle'
              )}
            </Text>

            <Text
              style={
                styles.guestDescription
              }
            >
              {t(
                'profile.guestDescription'
              )}
            </Text>

            <Pressable
              style={
                styles.loginButton
              }
              onPress={() =>
                setAuthVisible(
                  true
                )
              }
            >
              <Text
                style={
                  styles.loginButtonText
                }
              >
                {t(
                  'profile.login'
                )}
              </Text>
            </Pressable>

            <AuthModal
              visible={
                authVisible
              }
              onClose={() =>
                setAuthVisible(
                  false
                )
              }
            />
          </View>
        </SafeAreaView>

        {renderLanguageModal()}
      </>
    );
  }

  const displayName =
    user.firstName ||
    user.lastName
      ? `${user.firstName ?? ''} ${
          user.lastName ?? ''
        }`.trim()
      : t(
          'profile.user'
        );

  const authProviderText =
    user.googleId
      ? t(
          'profile.googleConnected'
        )
      : user.telegramId
        ? t(
            'profile.telegramConnected'
          )
        : t(
            'profile.accountConnected'
          );

  return (
    <>
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
              'profile.title'
            )}
          </Text>

          <Pressable
            style={[
              styles.headerButton,
              styles.headerButtonRight,
            ]}
            onPress={() =>
              setLanguageVisible(
                true
              )
            }
            hitSlop={10}
          >
            <View
              style={
                styles.languageHeaderBadge
              }
            >
              <Text
                style={
                  styles.languageHeaderBadgeText
                }
              >
                {language ===
                'ru'
                  ? 'RU'
                  : 'ENG'}
              </Text>
            </View>
          </Pressable>
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
              styles.profileCard
            }
          >
            <View
              style={
                styles.avatarContainer
              }
            >
              <Ionicons
                name="person"
                size={52}
                color="#D2D2D2"
              />
            </View>

            <View
              style={
                styles.profileInfo
              }
            >
              <Text
                style={
                  styles.name
                }
                numberOfLines={1}
              >
                {displayName}
              </Text>

              {(user.contactEmail || user.email) && (
                <Text
                  style={
                    styles.profileDescription
                  }
                  numberOfLines={1}
                >
                  {user.contactEmail || user.email}
                </Text>
              )}

              <Text
                style={
                  styles.telegramStatus
                }
              >
                {authProviderText}
              </Text>
            </View>

            <Pressable
              style={
                styles.editIconButton
              }
              onPress={
                openEditProfile
              }
              hitSlop={10}
            >
              <Ionicons
                name="pencil-outline"
                size={21}
                color="#999999"
              />
            </Pressable>
          </View>

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
                navigation.navigate(
                  'Favorites'
                )
              }
            >
              <View
                style={
                  styles.menuLeft
                }
              >
                <Ionicons
                  name="heart-outline"
                  size={24}
                  color="#999999"
                />

                <Text
                  style={
                    styles.menuText
                  }
                >
                  {t(
                    'profile.favorites'
                  )}
                </Text>
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
                openDrawerScreen(
                  'Orders'
                )
              }
            >
              <View
                style={
                  styles.menuLeft
                }
              >
                <Ionicons
                  name="receipt-outline"
                  size={24}
                  color="#999999"
                />

                <Text
                  style={
                    styles.menuText
                  }
                >
                  {t(
                    'profile.orders'
                  )}
                </Text>
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
                openDrawerScreen(
                  'Promotions'
                )
              }
            >
              <View
                style={
                  styles.menuLeft
                }
              >
                <Ionicons
                  name="pricetag-outline"
                  size={24}
                  color="#999999"
                />

                <Text
                  style={
                    styles.menuText
                  }
                >
                  {t(
                    'profile.promotions'
                  )}
                </Text>
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
                openDrawerScreen(
                  'Notifications'
                )
              }
            >
              <View
                style={
                  styles.menuLeft
                }
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#999999"
                />

                <Text
                  style={
                    styles.menuText
                  }
                >
                  {t(
                    'profile.notifications'
                  )}
                </Text>
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
                openDrawerScreen(
                  'About'
                )
              }
            >
              <View
                style={
                  styles.menuLeft
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#999999"
                />

                <Text
                  style={
                    styles.menuText
                  }
                >
                  {t(
                    'profile.about'
                  )}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#BBBBBB"
              />
            </Pressable>
          </View>

          <View
            style={
              styles.menuCard
            }
          >
            <Pressable
              style={
                styles.menuRow
              }
              onPress={
                openEditProfile
              }
            >
              <View
                style={
                  styles.menuLeft
                }
              >
                <Ionicons
                  name="create-outline"
                  size={24}
                  color="#999999"
                />

                <Text
                  style={
                    styles.menuText
                  }
                >
                  {t(
                    'profile.editProfile'
                  )}
                </Text>
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
                void logout()
              }
            >
              <View
                style={
                  styles.menuLeft
                }
              >
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color="#999999"
                />

                <Text
                  style={
                    styles.logoutText
                  }
                >
                  {t(
                    'profile.logout'
                  )}
                </Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {renderLanguageModal()}
    </>
  );
};
