import {
  useState,
} from 'react';

import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import {
  useTranslation,
} from 'react-i18next';

import {
  loginWithGoogle,
  startTelegramAuth,
  verifyTelegramCode,
} from '../../api/authApi';
import { ApiError } from '../../api/client';

import {
  useAuthStore,
} from '../../store/authStore';

import {
  styles,
} from './styles';

type AuthModalProps = {
  visible: boolean;
  onClose?: () => void;
};

type AuthStep =
  | 'start'
  | 'code';

type LoadingProvider =
  | 'google'
  | 'telegram'
  | 'code'
  | null;

const googleWebClientId =
  process.env
    .EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

GoogleSignin.configure({
  webClientId:
    googleWebClientId,
});

export const AuthModal = ({
  visible,
  onClose,
}: AuthModalProps) => {
  const { t } =
    useTranslation();

  const [
    step,
    setStep,
  ] = useState<AuthStep>(
    'start'
  );

  const [
    consentAccepted,
    setConsentAccepted,
  ] = useState(false);

  const [
    sessionToken,
    setSessionToken,
  ] = useState<string | null>(
    null
  );

  const [
    code,
    setCode,
  ] = useState('');

  const [
    loadingProvider,
    setLoadingProvider,
  ] =
    useState<LoadingProvider>(
      null
    );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const setAuth =
    useAuthStore(
      (state) =>
        state.setAuth
    );

  const isLoading =
    loadingProvider !== null;

  const resetTelegramFlow =
    () => {
      setStep('start');
      setCode('');
      setSessionToken(null);
      setError(null);
    };

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    resetTelegramFlow();

    onClose?.();
  };

  const handleGoogleLogin =
    async () => {
      if (
        !consentAccepted
      ) {
        setError(
          t(
            'auth.consentRequired'
          )
        );

        return;
      }

      if (
        !googleWebClientId
      ) {
        setError(
          t(
            'auth.googleNotConfigured'
          )
        );

        console.error(
          'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing'
        );

        return;
      }

      try {
        setLoadingProvider(
          'google'
        );

        setError(null);

        await GoogleSignin
          .hasPlayServices({
            showPlayServicesUpdateDialog:
              true,
          });

        const result =
          await GoogleSignin
            .signIn();

        const idToken =
          result.data?.idToken;

        if (!idToken) {
          throw new Error(
            'Google ID token was not returned'
          );
        }

        const response =
          await loginWithGoogle(
            idToken
          );

        await setAuth(
          response.accessToken,
          response.user
        );

        resetTelegramFlow();

        onClose?.();
      } catch (error) {
        if (
          isErrorWithCode(
            error
          )
        ) {
          if (
            error.code ===
            statusCodes
              .SIGN_IN_CANCELLED
          ) {
            return;
          }

          if (
            error.code ===
            statusCodes
              .IN_PROGRESS
          ) {
            setError(
              t(
                'auth.authInProgress'
              )
            );

            return;
          }

          if (
            error.code ===
            statusCodes
              .PLAY_SERVICES_NOT_AVAILABLE
          ) {
            setError(
              t(
                'auth.playServicesUnavailable'
              )
            );

            return;
          }
        }

        console.error(
          'Google login failed:',
          error
        );

        setError(
          t(
            error instanceof ApiError && error.status === 429 ? 'auth.rateLimited' : 'auth.googleError'
          )
        );
      } finally {
        setLoadingProvider(
          null
        );
      }
    };

  const handleTelegramLogin =
    async () => {
      if (
        !consentAccepted
      ) {
        setError(
          t(
            'auth.consentRequired'
          )
        );

        return;
      }

      try {
        setLoadingProvider(
          'telegram'
        );

        setError(null);

        const response =
          await startTelegramAuth();

        setSessionToken(
          response.sessionToken
        );

        setStep('code');

        await Linking.openURL(
          response.telegramUrl
        );
      } catch (error) {
        console.error(
          'Telegram auth start failed:',
          error
        );

        setError(
          t(
            error instanceof ApiError && error.status === 429 ? 'auth.rateLimited' : 'auth.telegramError'
          )
        );
      } finally {
        setLoadingProvider(
          null
        );
      }
    };

  const handleVerifyCode =
    async () => {
      if (!sessionToken) {
        setError(
          t(
            'auth.sessionNotFound'
          )
        );

        return;
      }

      if (
        code.length !== 6
      ) {
        setError(
          t(
            'auth.codeLength'
          )
        );

        return;
      }

      try {
        setLoadingProvider(
          'code'
        );

        setError(null);

        const response =
          await verifyTelegramCode(
            sessionToken,
            code
          );

        await setAuth(
          response.accessToken,
          response.user
        );

        resetTelegramFlow();

        onClose?.();
      } catch (error) {
        console.error(
          'Telegram verification failed:',
          error
        );

        setError(
          t(
            error instanceof ApiError && error.status === 429
              ? error.code === 'TELEGRAM_SESSION_LOCKED' ? 'auth.telegramLocked' : 'auth.rateLimited'
              : 'auth.invalidCode'
          )
        );
      } finally {
        setLoadingProvider(
          null
        );
      }
    };

  const handleBack = () => {
    resetTelegramFlow();
  };

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      onRequestClose={
        handleClose
      }
    >
      <View
        style={
          styles.overlay
        }
      >
        <Pressable
          style={
            styles.backdrop
          }
          onPress={
            handleClose
          }
        />

        <View
          style={
            styles.sheet
          }
        >
          <View
            style={
              styles.handle
            }
          />

          {step ===
          'start' ? (
            <>
              <Text
                style={
                  styles.icon
                }
              >
                🔐
              </Text>

              <Text
                style={
                  styles.title
                }
              >
                {t(
                  'auth.title'
                )}
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                {t(
                  'auth.subtitle'
                )}
              </Text>

              <Pressable
                style={
                  styles.consentRow
                }
                onPress={() =>
                  setConsentAccepted(
                    !consentAccepted
                  )
                }
              >
                <View
                  style={[
                    styles.checkbox,

                    consentAccepted &&
                      styles.checkboxActive,
                  ]}
                >
                  {consentAccepted && (
                    <Text
                      style={
                        styles.checkboxMark
                      }
                    >
                      ✓
                    </Text>
                  )}
                </View>

                <Text
                  style={
                    styles.consentText
                  }
                >
                  {t(
                    'auth.consent'
                  )}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.googleButton,

                  (
                    !consentAccepted ||
                    isLoading
                  ) &&
                    styles.disabledButton,
                ]}
                onPress={
                  handleGoogleLogin
                }
                disabled={
                  isLoading ||
                  !consentAccepted
                }
              >
                {loadingProvider ===
                'google' ? (
                  <ActivityIndicator
                    color="#555555"
                  />
                ) : (
                  <View
                    style={
                      styles.buttonContent
                    }
                  >
                    <Ionicons
                      name="logo-google"
                      size={22}
                      color="#4285F4"
                    />

                    <Text
                      style={
                        styles.googleButtonText
                      }
                    >
                      {t(
                        'auth.google'
                      )}
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.telegramButton,

                  (
                    !consentAccepted ||
                    isLoading
                  ) &&
                    styles.disabledButton,
                ]}
                onPress={
                  handleTelegramLogin
                }
                disabled={
                  isLoading ||
                  !consentAccepted
                }
              >
                {loadingProvider ===
                'telegram' ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <View
                    style={
                      styles.buttonContent
                    }
                  >
                    <Ionicons
                      name="paper-plane"
                      size={21}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.telegramButtonText
                      }
                    >
                      {t(
                        'auth.telegram'
                      )}
                    </Text>
                  </View>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={
                  styles.backButton
                }
                onPress={
                  handleBack
                }
                disabled={
                  isLoading
                }
              >
                <Text
                  style={
                    styles.backText
                  }
                >
                  ‹
                </Text>
              </Pressable>

              <Text
                style={
                  styles.icon
                }
              >
                🔐
              </Text>

              <Text
                style={
                  styles.title
                }
              >
                {t(
                  'auth.enterCode'
                )}
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                {t(
                  'auth.codeSent'
                )}
              </Text>

              <TextInput
                value={
                  code
                }
                onChangeText={(
                  value
                ) =>
                  setCode(
                    value.replace(
                      /\D/g,
                      ''
                    )
                  )
                }
                maxLength={6}
                keyboardType="number-pad"
                placeholder="000000"
                style={
                  styles.codeInput
                }
                editable={
                  !isLoading
                }
              />

              <Pressable
                style={[
                  styles.verifyButton,

                  isLoading &&
                    styles.disabledButton,
                ]}
                onPress={
                  handleVerifyCode
                }
                disabled={
                  isLoading
                }
              >
                {loadingProvider ===
                'code' ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.verifyButtonText
                    }
                  >
                    {t(
                      'auth.confirm'
                    )}
                  </Text>
                )}
              </Pressable>
            </>
          )}

          {error && (
            <Text
              style={
                styles.error
              }
            >
              {error}
            </Text>
          )}

          <Text
            style={
              styles.privacy
            }
          >
            {t(
              'auth.privacy'
            )}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
