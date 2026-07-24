const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// lucide-react-native ships ESM (.mjs) files; Metro doesn't resolve that
// extension by default, so its icon submodules fail to bundle without this.
const config = {
  resolver: {
    sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
