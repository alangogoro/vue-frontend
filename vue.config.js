const { defineConfig } = require('@vue/cli-service')
module.exports = {
  transpileDependencies: true,
  devServer: {
    https: true,
    allowedHosts: "all"
  }
}
