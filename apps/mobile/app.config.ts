import type { ConfigContext, ExpoConfig } from 'expo/config';

// One codebase, two installs: APP_VARIANT=development builds a separate "dev" app that can sit
// next to the Play Store app on the same phone. See docs/operations/release.md.
const isDevelopmentBuild = process.env.APP_VARIANT === 'development';

// TODO(OPS-03): replace with the package name the owner chooses before the first Play upload.
// It can never change once the app is published.
const ANDROID_PACKAGE = 'in.mjcccomputercentre.app';

// The brand's ink blue (src/ui/theme.ts, `hero`): behind the icon, the splash screen and the
// browser's toolbar. The icon and splash pictures in assets/images are the design system's
// M key on this colour; replace them when the centre has its own logo (backlog OPS-07).
const BRAND_INK = '#121640';

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
    bundleIdentifier: isDevelopmentBuild ? `${ANDROID_PACKAGE}.dev` : ANDROID_PACKAGE,
    supportsTablet: false,
  },
  android: {
    package: isDevelopmentBuild ? `${ANDROID_PACKAGE}.dev` : ANDROID_PACKAGE,
    adaptiveIcon: {
      backgroundColor: BRAND_INK,
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // The app never uses the camera or microphone (the privacy policy says so, and Play checks
    // the declared permissions against it), but libraries add them: expo-image-picker asks for
    // both, and the template asks to draw over other apps. Remove them from the store app.
    blockedPermissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      ...(isDevelopmentBuild ? [] : ['android.permission.SYSTEM_ALERT_WINDOW']),
    ],
  },
  web: {
    // The website (public pages, the student app and the admin panel) is a single-page app:
    // the static host serves index.html for every address (public/index.html, vercel.json).
    // Each page sets its own title and description when it opens (src/lib/page-title.tsx).
    output: 'single',
    favicon: './assets/images/favicon.png',
    name: 'Mishra Computer Centre',
    description:
      'Computer courses from Mishra Computer Centre, Makhdumpur, Jehanabad: video lessons, PDF notes and timed tests.',
    themeColor: BRAND_INK,
    lang: 'en',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: BRAND_INK,
        image: './assets/images/splash-icon.png',
        imageWidth: 96,
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
      {
        photosPermission: 'Pick pictures for course covers and home banners.',
        cameraPermission: false,
        microphonePermission: false,
      },
    ],
  ],
  experiments: {
    reactCompiler: true,
  },
  extra: {
    eas: { projectId: process.env.EAS_PROJECT_ID || '3cf62934-c973-4a1e-a41b-67e717b8364b' },
  },
});
