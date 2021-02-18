import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/lazada-operation/manager/role/list',
    method: 'get',
    params: query
  })
}

/**
 * 获取当前角色授权信息
 */
export function fetchPerList(query) {
  return request({
    url: '/lazada-operation/manager/role/permission',
    method: 'get',
    params: query
  })
}

/**
 * 更改当前角色的授权信息
 */
export function updatePermission(data) {
  return request({
    url: '/lazada-operation/manager/role/edit-role-permission',
    method: 'post',
    data
  })
}

/* add role */
export function addRoleRequest(param) {
  return request({
    url: '/lazada-operation/manager/role/add',
    method: 'post',
    data: param
  })
}

/* edit role */
export function editRoleRequest(data) {
  return request({
    url: '/lazada-operation/manager/role/edit',
    method: 'post',
    data
  })
}

/* delete role */
export function delRoleRequest(param) {
  return request({
    url: '/lazada-operation/manager/role/delete',
    method: 'post',
    data: param
  })
}

/* save role status*/
export function saveRoleStatusRequest(data) {
  return request({
    url: '/lazada-operation/manager/role/enable',
    method: 'post',
    data
  })
}
