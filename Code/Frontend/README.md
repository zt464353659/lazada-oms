# Lazada OMS 

> 这是一个极简的 vue admin 管理后台，基于vue-admin-template模板修改而来。它只包含了 Element UI & axios & iconfont & permission control & lint，这些搭建后台必要的东西。

> 目前框架基于 `@vue/cli 3.x` 进行构建

## Build Setup

```bash
# 克隆项目
http://git.sfc.com/suntek/lazada-oms.git

# 进入项目目录
cd Code/Frontend

# 安装依赖(优先使用yarn工具)
yarn install

# 安装单个依赖（请安装在开发依赖devDependencies下）
yarn add -D appname

# 启动服务
yarn serve
```

浏览器访问 [http://localhost:9528](http://localhost:9528)

## 发布

```bash
# 构建生产环境
yarn build
```

## 其它

```bash

# 代码格式检查
yarn lint

# 本地预览
# dist 目录需要启动一个 HTTP 服务器来访问
# 在本地预览生产环境构建最简单的方式就是使用一个 Node.js 静态文件服务器，例如 serve
npm install -g serve
# -s 参数的意思是将其架设在 Single-Page Application 模式下
# 这个模式会处理即将提到的路由问题
serve -s dist

```

## Browsers support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions

