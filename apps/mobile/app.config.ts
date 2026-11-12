import type { ConfigContext, ExpoConfig } from 'expo/config';

// One codebase, two installs: APP_VARIANT=development builds a separate "dev" app that can sit
// next to the Play Store app on the same phone. See docs/operations/release.md.
const isDevelopmentBuild = process.env.APP_VARIANT === 'development';

// TODO(OPS-03): replace with the package name the owner chooses before the first Play upload.
// It can never change once the app is published.
const ANDROID_PACKAGE = 'in.mishracomputercentre.app';

// The dev auth bypass (src/lib/dev-bypass.ts) is ignored outside development bundles anyway;
// this makes a release build with it configured fail loudly instead of shipping the setting.
if (process.env.NODE_ENV === 'production' && process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS) {
  throw new Error(
    'EXPO_PUBLIC_DEV_AUTH_BYPASS is set. Remove it from .env.local (or the build environment) before building a release.',
  );
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: isDevelopmentBuild ? 'MCC Dev' : 'Mishra Computer Centre',
  slug: 'mishra-computer-centre',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'mishracc',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: isDevelopmentBuild ? `${ANDROID_PACKAGE}.dev` : ANDROID_PACKAGE,
    supportsTablet: false,
  },
  android: {
    package: isDevelopmentBuild ? `${ANDROID_PACKAGE}.dev` : ANDROID_PACKAGE,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    // The admin website is a single-page app: everything is behind sign-in, so there is
    // nothing to pre-render, and the static host only needs to serve index.html.
    output: 'single',
    favicon: './assets/images/favicon.png',
    name: 'Mishra Computer Centre — Admin',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#1F5FAE',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    [
      '@react-native-google-signin/google-signin',
      {
        // Needed only for iOS builds; Android uses the web client id at runtime. `||`, not `??`:
        // .env files leave unset values as empty strings, and the plugin rejects "".
        iosUrlScheme:
          process.env.GOOGLE_IOS_URL_SCHEME || 'com.googleusercontent.apps.not-configured',
      },
    ],
    '@config-plugins/react-native-blob-util',
    '@config-plugins/react-native-pdf',
    [
      'expo-image-picker',
      { photosPermission: 'Pick pictures for course covers and home banners.' },
    ],
  ],
  experiments: {
    reactCompiler: true,
  },
  extra: {
    eas: { projectId: process.env.EAS_PROJECT_ID || undefined },
  },
});
