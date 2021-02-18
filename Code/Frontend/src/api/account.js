import request from '@/utils/request'

/**
 * 站点列表
 *
 */
export function getAllSite() {
  return request({
    url: 'lazada-operation/site/select-site',
    method: 'get'
  })
}

/**
 * 账号组列表
 * @param query
 */
export function fetchPlanList(query) {
  return request({
    url: 'lazada-operation/account/list',
    method: 'get',
    params: query
  })
}

/**
 * 添加账户
 * @param data
 */
export function addAccount(data) {
  return request({
    url: 'lazada-operation/account/add',
    method: 'post',
    data
  })
}

/**
 * 编辑账户
 * @param data
 */
export function editAccount(data) {
  return request({
    url: 'lazada-operation/account/update',
    method: 'post',
    data
  })
}

/**
 * 删除账户
 * @param data
 */
export function delAccount(data) {
  return request({
    url: 'lazada-operation/account/delete',
    method: 'post',
    data
  })
}

/**
 * 启用/禁用 账户
 * @param data
 */
export function apiUpdateAccountStatus(data) {
  return request({
    url: 'lazada-operation/account/set-status',
    method: 'post',
    data
  })
}

// 获取账号
export function getAccount(query) {
  return request({
    url: 'lazada-operation/account/select-account',
    method: 'get',
    params: query
  })
}
