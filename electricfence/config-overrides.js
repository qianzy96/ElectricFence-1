const {
  injectBabelPlugin
} = require('react-app-rewired');

function rewireMobX(config, env) {
  return injectBabelPlugin(["@babel/plugin-proposal-decorators", {
    "legacy": true
  }], config);
}

module.exports = function override(config, env) {
  // do stuff with the webpack config...
  config = rewireMobX(config, env);
  config = injectBabelPlugin(
    ['import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: 'css'
    }],
    config,
  );
  return config;
};
