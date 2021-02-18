import request from '@/utils/request'

export function login(username, password) {
  // 正式环境 url: '/operation/manager/passport/login',
  // 测试     url: '/manager/passport/login',
  return request({
    url: 'lazada-operation/manager/passport/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function getInfo(token) {
  return request({
    url: 'lazada-operation/manager/permission/get-info-to-login',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: 'lazada-operation/manager/passport/logout',
    method: 'post'
  })
}
