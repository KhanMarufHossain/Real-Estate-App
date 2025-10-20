export default {
  expo: {
    name: "Marrfa",
    slug: "Marrfa",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/Logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    extra: {
      eas: {
        projectId: "fb547329-211f-4507-847f-8a328bf33641"
      }
    },
    splash: {
      image: "./assets/Logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
      ios: {
      supportsTablet: true,
      bundleIdentifier: "com.marffa.app",
      // Note: keep GoogleService-Info.plist out of the public repo. Provide the file
      // locally or via secure CI variables. The Google Maps API key should be set
      // through EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.
      googleServicesFile: process.env.GOOGLE_SERVICE_IOS_FILE || "./GoogleService-Info.plist",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY'
      }
    },
      android: {
      package: "com.marffa.app",
      // Keep google-services.json out of the public repo. Provide the file locally
      // or via secure distribution. The maps api key is expected in EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.
      googleServicesFile: process.env.GOOGLE_SERVICE_ANDROID_FILE || "./google-services.json",
      permissions: [],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY'
        }
      },
      adaptiveIcon: {
        foregroundImage: "./assets/Logo.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/Logo.png"
    }
  }
};
