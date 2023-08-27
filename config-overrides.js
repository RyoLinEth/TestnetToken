const CompressionPlugin = require('compression-webpack-plugin');

module.exports = function override(config, env) {
  // 添加壓縮和混淆插件
  config.plugins.push(
    new CompressionPlugin({
      test: /\.(js|css|html|svg|xml|json)$/,
      filename: '[path][base].gz',
      algorithm: 'gzip',
      threshold: 10240,
      minRatio: 0.8,
    })
  );

  // 返回修改後的配置
  return config;
};
