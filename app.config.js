export default {
  expo: {
    name: "appconsegne-test",
    slug: "iosappconsegne",
    version: "1.0.0",
    newArchEnabled: false,

    extra: {
      eas: {
        projectId: "4ae6d32a-7607-4ca3-b616-7e3af770f67e"
      }
    },

    owner: "damianotosi1973",

    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0"
          }
        }
      ]
    ],

    doctor: {
      reactNativeDirectoryCheck: {
        listUnknownPackages: false
      }
    }
  }
}