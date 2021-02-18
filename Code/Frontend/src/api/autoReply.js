import request from '@/utils/request'

// 自动回复模板列表
export function getReplyList(params) {
  return request({
    url: '/lazada-operation/auto-reply/list',
    method: 'get',
    params
  })
}

// 新增自动回复模板
export function addReply(data) {
  return request({
    url: '/lazada-operation/auto-reply/add',
    method: 'post',
    data
  })
}

// 删除自动回复模板
export function delReply(data) {
  return request({
    url: '/lazada-operation/auto-reply/del',
    method: 'post',
    data
  })
}

// 编辑自动回复模板
export function editReply(data) {
  return request({
    url: '/lazada-operation/auto-reply/set',
    method: 'post',
    data
  })
}
