const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { resolver } = config;

  config.resolver = {
    ...resolver,
    assetExts: [...resolver.assetExts, "glb", "gltf", "png", "jpg"],
    sourceExts: [
      ...resolver.sourceExts,
      "js",
      "jsx",
      "json",
      "ts",
      "tsx",
      "cjs",
      "mjs",
    ],
    extraNodeModules: {
      "@": __dirname + "/src", 
    },
  };

  return withNativeWind(config, { input: "./src/global.css" });
})();
