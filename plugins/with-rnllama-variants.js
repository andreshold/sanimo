/**
 * Plugin de configuration Expo : limite les variantes CPU compilées par llama.rn.
 *
 * Par défaut llama.rn compile son pont JSI 7 fois (une fois par variante CPU, ~5 min chacune),
 * ce qui dépasse la limite de 45 min des builds EAS gratuits. On garde 3 variantes :
 *   - rnllama                     : OBLIGATOIRE. Le chargeur Java fait toujours System.loadLibrary("rnllama"),
 *                                   et seules les bibliothèques liées par CMake sont mises dans l'APK.
 *                                   Sert aussi de repli universel (rnllama_jni) sur tout téléphone.
 *   - rnllama_v8_2_dotprod        : la plupart des téléphones depuis 2019 (ex. Galaxy A15/A16)
 *   - rnllama_v8_2_dotprod_i8mm   : téléphones récents, plus rapide pour Makandal
 * Au démarrage, llama.rn choisit la meilleure variante disponible et retombe sur la générique sinon.
 */
const { withGradleProperties } = require('expo/config-plugins');

const DEFAULT_VARIANTS = ['rnllama', 'rnllama_v8_2_dotprod', 'rnllama_v8_2_dotprod_i8mm'];

module.exports = function withRnllamaVariants(config, { variants = DEFAULT_VARIANTS } = {}) {
  return withGradleProperties(config, (cfg) => {
    const key = 'rnllamaVariants';
    cfg.modResults = cfg.modResults.filter((item) => !(item.type === 'property' && item.key === key));
    cfg.modResults.push({ type: 'property', key, value: variants.join(',') });
    return cfg;
  });
};
