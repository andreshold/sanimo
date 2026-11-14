/**
 * onnxruntime-react-native contient un ancien `unimodule.json` : l'autolinking d'Expo le prend pour
 * un module Expo et n'enregistre jamais son ReactPackage (erreur « Cannot read property 'install' of null »).
 * On déclare donc explicitement son package Android.
 */
module.exports = {
  dependencies: {
    'onnxruntime-react-native': {
      platforms: {
        android: {
          packageImportPath: 'import ai.onnxruntime.reactnative.OnnxruntimePackage;',
          packageInstance: 'new OnnxruntimePackage()',
        },
      },
    },
  },
};
