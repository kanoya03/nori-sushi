import {
  useState,
} from 'react';

import {
  Platform,
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

import DateTimePicker
  from '@react-native-community/datetimepicker';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useTranslation,
} from 'react-i18next';

import type {
  Gender,
} from '../../api/authApi';

import {
  updateProfile,
} from '../../api/usersApi';

import type {
  RootStackParamList,
} from '../../navigation/types';

import {
  useAuthStore,
} from '../../store/authStore';

import {
  useLanguageStore,
} from '../../store/languageStore';

import {
  styles,
} from './styles';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'EditProfile'
  >;

export const EditProfileScreen = ({
  navigation,
}: Props) => {
  const { t } =
    useTranslation();

  const language =
    useLanguageStore(
      (state) =>
        state.language
    );

  const locale =
    language === 'ru'
      ? 'ru-RU'
      : 'en-US';

  const user =
    useAuthStore(
      (state) =>
        state.user
    );

  const accessToken =
    useAuthStore(
      (state) =>
        state.accessToken
    );

  const setUser =
    useAuthStore(
      (state) =>
        state.setUser
    );

  const [
    firstName,
    setFirstName,
  ] = useState(
    user?.firstName ?? ''
  );

  const [
    lastName,
    setLastName,
  ] = useState(
    user?.lastName ?? ''
  );

  const [
    gender,
    setGender,
  ] = useState<Gender | null>(
    user?.gender ?? null
  );

  const [
    birthDate,
    setBirthDate,
  ] = useState<Date | null>(
    user?.birthDate
      ? new Date(
          user.birthDate
        )
      : null
  );

  const [
    showDatePicker,
    setShowDatePicker,
  ] = useState(false);

  const [
    email,
    setEmail,
  ] = useState(
    user?.email ?? ''
  );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const handleSave =
    async () => {
      if (!accessToken) {
        return;
      }

      try {
        setIsSaving(
          true
        );

        setError(
          null
        );

        const normalizedEmail =
          email
            .trim()
            .toLowerCase();

        const updatedUser =
          await updateProfile(
            accessToken,
            {
              firstName:
                firstName.trim() ||
                undefined,

              lastName:
                lastName.trim() ||
                undefined,

              gender:
                gender ??
                undefined,

              birthDate:
                birthDate
                  ? birthDate.toISOString()
                  : undefined,

              email:
                normalizedEmail ||
                undefined,
            }
          );

        setUser(
          updatedUser
        );

        navigation.goBack();
      } catch (error) {
        console.error(
          'Failed to update profile:',
          error
        );

        setError(
          t(
            'editProfile.saveError'
          )
        );
      } finally {
        setIsSaving(
          false
        );
      }
    };

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.headerRow
          }
        >
          <Pressable
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color="#fff"
            />
          </Pressable>

          <Text
            style={
              styles.screenTitle
            }
          >
            {t(
              'editProfile.title'
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
            styles.avatar
          }
        >
          <Ionicons
            name="person"
            size={58}
            color="#2F8F6B"
          />
        </View>

        <TextInput
          style={
            styles.input
          }
          placeholder={
            t(
              'editProfile.firstName'
            )
          }
          placeholderTextColor="#888"
          value={
            firstName
          }
          onChangeText={
            setFirstName
          }
        />

        <TextInput
          style={
            styles.input
          }
          placeholder={
            t(
              'editProfile.lastName'
            )
          }
          placeholderTextColor="#888"
          value={
            lastName
          }
          onChangeText={
            setLastName
          }
        />

        <View
          style={
            styles.genderRow
          }
        >
          <Pressable
            style={[
              styles.genderButton,

              gender ===
                'MALE' &&
                styles.genderButtonActive,
            ]}
            onPress={() =>
              setGender(
                'MALE'
              )
            }
          >
            <Text
              style={
                styles.genderTitle
              }
            >
              {t(
                'editProfile.gender'
              )}
            </Text>

            <Text
              style={
                styles.genderText
              }
            >
              {t(
                'editProfile.male'
              )}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.genderButton,

              gender ===
                'FEMALE' &&
                styles.genderButtonActive,
            ]}
            onPress={() =>
              setGender(
                'FEMALE'
              )
            }
          >
            <Text
              style={
                styles.genderTitle
              }
            >
              {t(
                'editProfile.gender'
              )}
            </Text>

            <Text
              style={
                styles.genderText
              }
            >
              {t(
                'editProfile.female'
              )}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={
            styles.dateInput
          }
          onPress={() =>
            setShowDatePicker(
              true
            )
          }
        >
          <View>
            <Text
              style={
                styles.dateLabel
              }
            >
              {t(
                'editProfile.birthDate'
              )}
            </Text>

            <Text
              style={[
                styles.dateText,

                !birthDate &&
                  styles.datePlaceholder,
              ]}
            >
              {birthDate
                ? birthDate.toLocaleDateString(
                    locale
                  )
                : t(
                    'editProfile.chooseDate'
                  )}
            </Text>
          </View>

          <Ionicons
            name="calendar-outline"
            size={22}
            color="#9B9B9B"
          />
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={
              birthDate ??
              new Date(
                2000,
                0,
                1
              )
            }
            mode="date"
            display="default"
            maximumDate={
              new Date()
            }
            onValueChange={(
              event,
              selectedDate
            ) => {
              if (
                selectedDate
              ) {
                setBirthDate(
                  selectedDate
                );
              }

              if (
                Platform.OS ===
                'android'
              ) {
                setShowDatePicker(
                  false
                );
              }
            }}
            onDismiss={() =>
              setShowDatePicker(
                false
              )
            }
          />
        )}

        <TextInput
          style={
            styles.input
          }
          placeholder={
            t(
              'editProfile.email'
            )
          }
          placeholderTextColor="#888"
          value={
            email
          }
          onChangeText={
            setEmail
          }
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {error && (
          <Text
            style={
              styles.error
            }
          >
            {error}
          </Text>
        )}

        <Pressable
          style={[
            styles.saveButton,

            isSaving &&
              styles.saveButtonDisabled,
          ]}
          onPress={
            handleSave
          }
          disabled={
            isSaving
          }
        >
          <Text
            style={
              styles.saveButtonText
            }
          >
            {isSaving
              ? t(
                  'editProfile.saving'
                )
              : t(
                  'editProfile.save'
                )}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};