'use strict'

const path = require('path')
const defaultSettings = require('./src/settings.js')
// 导入compression-webpack-plugin
const CompressionWebpackPlugin = require('compression-webpack-plugin')
// 定义压缩文件类型
const productionGzipExtensions = ['js', 'css']

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'Lazada运营管理系统'
// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
const port = 9528 // dev port
// const port = 8200 // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',

  // 输出文件路径，默认为dist
  outputDir: 'dist',

  // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
  assetsDir: 'static',

  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,

  devServer: {
    host: '0.0.0.0',
    port: port, // 配置端口
    open: true, // 自动开启浏览器
    compress: true, // 开启压缩
    // 设置让浏览器 overlay 同时显示警告和错误
    overlay: {
      warnings: false,
      errors: true
    },
    // 设置请求代理
    proxy: {
      // '/api/lazada/lazada/': {
      //   target: 'http://190.168.3.32:9501/',
      //   ws: true,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     '^/api/lazada/lazada/': '' // 请求地址
      //   }
      // },
      // '/api/lazada/*': {
      //   target: 'http://190.168.3.31:9501/',
      //   ws: true,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     '^/api/lazada/': '' // 请求地址
      //   }
      // },
      '/api/*': {
        target: 'http://190.168.3.228:8000/',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api/': '' // 请求地址
        }
      }
    }
    // proxy: {
    //   // change xxx-api/login => mock/login
    //   // detail: https://cli.vuejs.org/config/#devserver-proxy
    //   [process.env.VUE_APP_BASE_API]: {
    //     // target: `http://127.0.0.1:${port}/mock`,
    //     target: `http://190.168.3.129::${port}`,
    //     changeOrigin: true,
    //     pathRewrite: {
    //       ['^' + process.env.VUE_APP_BASE_API]: ''
    //     }
    //   }
    // },
    // after: require('./mock/mock-server.js')
  },

  configureWebpack: config => {
    config.name = name
    config.resolve.alias['@'] = resolve('src')
    config.performance = {
      hints: 'warning',
      // 入口起点的最大体积 整数类型（以字节为单位）
      maxEntrypointSize: 50000000,
      // 生成文件的最大体积 整数类型（以字节为单位 300k）
      maxAssetSize: 30000000,
      // 只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith('.js')
      }
    }
    if (process.env.NODE_ENV === 'production') {
      // 生产环境
      // 编译时删除console.log
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      //  配置productionGzip-高级的方式
      // 配置参数详解
      // asset： 目标资源名称。 [file] 会被替换成原始资源。[path] 会被替换成原始资源的路径， [query] 会被替换成查询字符串。默认值是 "[path].gz[query]"。
      // algorithm： 可以是 function(buf, callback) 或者字符串。对于字符串来说依照 zlib 的算法(或者 zopfli 的算法)。默认值是 "gzip"。
      // test： 所有匹配该正则的资源都会被处理。默认值是全部资源。
      // threshold： 只有大小大于该值的资源会被处理。单位是 bytes。默认值是 0。
      // minRatio： 只有压缩率小于这个值的资源才会被处理。默认值是 0.8。
      config.plugins.push(
        new CompressionWebpackPlugin({
          filename: '[path].gz[query]',
          algorithm: 'gzip',
          test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
          threshold: 10240,
          minRatio: 0.8
        })
      )
    } else {
      // 开发环境
    }
  },

  // configureWebpack: {
  //   // provide the app's title in webpack's name field, so that
  //   // it can be accessed in index.html to inject the correct title.
  //   name: name,
  //   resolve: {
  //     alias: {
  //       '@': resolve('src')
  //     }
  //   },
  //   optimization: {
  //     minimizer: [
  // 需要增加插件 uglifyjs-webpack-plugin，并引用 const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
  //       new UglifyJsPlugin({
  //         uglifyOptions: {
  //           compress: {
  //             // warnings: false,
  //             drop_console: true,
  //             drop_debugger: true,
  //             pure_funcs: ['console.log'] // 移除console
  //           }
  //         }
  //       })
  //     ]
  //   },
  //   performance: {
  //     hints: 'warning',
  //     //入口起点的最大体积 整数类型（以字节为单位）
  //     maxEntrypointSize: 50000000,
  //     //生成文件的最大体积 整数类型（以字节为单位 300k）
  //     maxAssetSize: 30000000,
  //     //只给出 js 文件的性能提示
  //     assetFilter: function(assetFilename) {
  //       return assetFilename.endsWith('.js')
  //     }
  //   },
  //  配置productionGzip-简单方式
  // plugins: [
  //   new CompressionWebpackPlugin({
  //     asset: '[path].gz[query]',
  //     algorithm: 'gzip',
  //     test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
  //     threshold: 10240,
  //     minRatio: 0.8
  //   })
  // ]
  // },
  chainWebpack(config) {
    config.plugins.delete('preload') // TODO: need test
    config.plugins.delete('prefetch') // TODO: need test

    // set svg-sprite-loader
    config.module.rule('svg').exclude.add(resolve('src/icons')).end()
    config.module.rule('icons').test(/\.svg$/).include.add(resolve('src/icons')).end().use('svg-sprite-loader').loader('svg-sprite-loader').options({
      symbolId: 'icon-[name]'
    }).end()

    // set preserveWhitespace
    config.module.rule('vue').use('vue-loader').loader('vue-loader').tap(options => {
      options.compilerOptions.preserveWhitespace = true
      return options
    }).end()

    // https://webpack.js.org/configuration/devtool/#development
    config.when(process.env.NODE_ENV === 'development',
      config => config.devtool('cheap-source-map')
    )

    config.when(process.env.NODE_ENV !== 'development',
      config => {
        config.plugin('ScriptExtHtmlWebpackPlugin').after('html').use('script-ext-html-webpack-plugin', [{
          // `runtime` must same as runtimeChunk name. default is `runtime`
          inline: /runtime\..*\.js$/
        }]).end()
        config.optimization.splitChunks({
          chunks: 'all',
          cacheGroups: {
            libs: {
              name: 'chunk-libs',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              chunks: 'initial' // only package third parties that are initially dependent
            },
            elementUI: {
              name: 'chunk-elementUI', // split elementUI into a single package
              priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
              test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
            },
            commons: {
              name: 'chunk-commons',
              test: resolve('src/components'), // can customize your rules
              minChunks: 3, //  minimum common number
              priority: 5,
              reuseExistingChunk: true
            }
          }
        })
        config.optimization.runtimeChunk('single')
      }
    )
  }
}
