const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  permissions: state => state.user.permissions,
  permission_routers: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,
  userInfo: state => state.user.info,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  errorLogs: state => state.errorLog.logs,
  accountInfo: state => state.platform.info,
  theme: state => state.settings.theme,
  title: state => state.settings.title,
  activeAccount: state => state.chat.activeAccount,
  uploadToken: state => state.user.uploadToken,
  noticeAccount: state => state.chat.noticeAccount,
  isNoticeShow: state => state.chat.isNoticeShow,
  baseObj: state => state.chat.baseObj
}
export default getters
