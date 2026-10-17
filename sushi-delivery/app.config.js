export default ({ config }) => ({
  ...config,

  plugins: [
    ...(config.plugins ?? []),

    '@rnmapbox/maps',

    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme:
          process.env.GOOGLE_IOS_URL_SCHEME ||
          'com.googleusercontent.apps.placeholder',
      },
    ],
  ],
});