module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
<<<<<<< HEAD
    
=======
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
  };
};