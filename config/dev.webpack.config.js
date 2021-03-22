const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  https: true,
  useFileHash: false,
  deployment: process.env.BETA ? 'beta/apps' : 'apps'
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')({
    root: resolve(__dirname, '../'),
    useFileHash: false,
    exposes: {
      './RootApp': resolve(__dirname, '../src/AppEntry'),
    },
  })
);

module.exports = {
  ...webpackConfig,
  plugins
};
