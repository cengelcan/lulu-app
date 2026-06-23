const { withPodfile } = require('expo/config-plugins');

/** Google Sign-In static pod integration needs modular headers on iOS. */
function withIosModularHeaders(config) {
  return withPodfile(config, (podfileConfig) => {
    if (!podfileConfig.modResults.contents.includes('use_modular_headers!')) {
      podfileConfig.modResults.contents = podfileConfig.modResults.contents.replace(
        'use_expo_modules!',
        'use_expo_modules!\n  use_modular_headers!'
      );
    }

    return podfileConfig;
  });
}

module.exports = withIosModularHeaders;
