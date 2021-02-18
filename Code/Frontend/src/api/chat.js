import request from '@/utils/request'
// import requestThird from '@/utils/request-third'

/* 会话列表 */
export function apiFetchConversations(data) {
  return request({
    url: '/lazada-operation/chat/conversations-list',
    method: 'post',
    data
  })
}

/* 消息列表 */
export function apiFetchmessage(data) {
  return request({
    url: '/lazada-operation/chat/message-list',
    method: 'post',
    data
  })
}

/* 删除会话 */
export function deleteConversations(data) {
  return request({
    url: '/lazada-operation/conversations/delete',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/* 消息回复 */
export function apiSendMessage(data) {
  return request({
    url: '/lazada-operation/chat/send-message',
    method: 'post',
    data
  })
}

/* 读取消息 */
export function apiReadMessage(data) {
  return request({
    url: '/lazada-operation/chat/sign-message-read',
    method: 'post',
    data
  })
}

/* 获取当前用户下站点账户列表*/
export function fetchAccountList() {
  return request({
    url: '/lazada-operation/chat/get-chat-account',
    method: 'get'
  })
}

/* 获取当前账户基础信息 */
export function fetchAccountInfo(data) {
  return request({
    url: '/lazada/account/account/detail',
    method: 'post',
    data
  })
}

/* 获取通知消息 */
export function apiGetNoticeList(params) {
  return request({
    url: '/lazada/shop-news/shop-news/list',
    method: 'get',
    params
  })
}

/* 定时请求是否有未处理通知消息 */
export function apiGetIsNotice(params) {
  return request({
    url: '/operation/shop-news/shop-news/get-notice-status',
    method: 'get',
    params
  })
}

/* 修改通知消息状态 */
export function apiSetStatus(data) {
  return request({
    url: '/operation/shop-news/shop-news/set-status',
    method: 'post',
    data
  })
}

/* 获取产品列表 */
export function apiGetProductList(data, Cookie) {
  return request({
    header: {
      Cookie
    },
    url: '/operation/lazada/product/list',
    method: 'post',
    data
  })
}

/* 获取产品详情 */
export function apiGetProductInfo(data) {
  return request({
    url: '/operation/lazada/product/info',
    method: 'post',
    data
  })
}

/* 获取买家订单 */
export function apiGetOrderInfo(data) {
  return request({
    url: '/lazada-operation/chat/buyer-order-list',
    method: 'post',
    data
  })
}

/**
 * 待付款列表
 */
export function fetchNoPayment(params) {
  return request({
    url: '/lazada/chat/auto-tips/list',
    method: 'get',
    params
  })
}

/**
 * 待付款设置
 */
export function fetchNoPaymentSeting(data) {
  return request({
    url: '/lazada/chat/auto-tips/set-tips',
    method: 'post',
    data
  })
}

/**
 * 议价回复列表
 */
export function fetchBargain(params) {
  return request({
    url: '/lazada/chat/discuss-price/list',
    method: 'get',
    params
  })
}

/**
 * 议价回复设置
 */
export function fetchBargainSeting(data) {
  return request({
    url: '/lazada/chat/discuss-price/set-discuss-price',
    method: 'post',
    data
  })
}

/**
 * 议价详情
 */
export function apiBargainInfo(data) {
  return request({
    url: '/lazada-operation/offer',
    method: 'post',
    data
  })
}

/**
 * 操作平台议价
 */
export function apiSetBargain(data) {
  return request({
    url: '/lazada/chat/discuss-price/lazada-discuss-price',
    method: 'post',
    data
  })
}

/**
 * 自动回复列表
 */
export function fetchReply(params) {
  return request({
    url: '/lazada/auto-reply/auto-reply-template/list',
    method: 'get',
    params
  })
}

/**
 * 编辑自动回复模板
 */
export function apiReplyEdit(data) {
  return request({
    url: '/lazada/auto-reply/auto-reply-template/set',
    method: 'post',
    data
  })
}

/**
 * 删除自动回复模板
 */
export function apiReplyDel(data) {
  return request({
    url: '/lazada/auto-reply/auto-reply-template/del',
    method: 'post',
    data
  })
}

/**
 * 新增自动回复模板
 */
export function apiReplyAdd(data) {
  return request({
    url: '/lazada/auto-reply/auto-reply-template/add',
    method: 'post',
    data
  })
}

/**
 * 自动回复设置列表
 */
export function apiReplySetList(params) {
  return request({
    url: '/lazada/auto-reply/auto-reply-set/list',
    method: 'get',
    params
  })
}

/**
 * 自动回复设置编辑
 */
export function apiReplySetEdit(data) {
  return request({
    url: '/lazada/auto-reply/auto-reply-set/set',
    method: 'post',
    data
  })
}

/**
 * 语言翻译
 */
export function apiTranslateText(data) {
  return request({
    url: '/lazada-operation/message/translate',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 消息右侧订单列表
 */
export function apiGetOrderList(data) {
  return request({
    url: '/lazada-operation/order/cur-list',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 消息右侧买家订单统计
 */
export function apiGetBuyerCount(data) {
  return request({
    url: '/lazada-operation/shop/statistics',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 消息右侧接受/拒绝  买家申请的取消订单
 */
export function apiSetCancelOrder(data) {
  return request({
    url: '/lazada-operation/order/cancel',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 消息右侧买家信息
 */
export function apiGetBuyerInfo(data) {
  return request({
    url: '/lazada-operation/userinfo',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 物流信息
 */
export function apiGetLogistics(data) {
  return request({
    url: '/lazada-operation/chat/order-logistics-detail',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 订单状态查询
 */
export function apiGetOrderMeta(data) {
  return request({
    url: '/lazada-operation/order/meta',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 获取活动优惠券列表
 */
export function getActiveCouponList(data) {
  return request({
    url: '/lazada-operation/chat/activity-coupon-list',
    method: 'post',
    data
  })
}

/**
 * 获取店铺优惠券列表
 */
export function getShopCouponList(data) {
  return request({
    url: '/lazada-operation/chat/shop-coupon-list',
    method: 'post',
    data
  })
}

/**
 * 获取卖家产品列表
 */
export function getProductList(data) {
  return request({
    url: '/lazada-operation/chat/seller-item-list',
    method: 'post',
    data
  })
}

/**
 * 获取订单列表
 */
export function getOrderList(data) {
  return request({
    url: '/lazada-operation/chat/buyer-order-list',
    method: 'post',
    data
  })
}

/**
 * 编辑订单备注
 */
export function editOrderNote(data) {
  return request({
    url: '/lazada-operation/order/update',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 快捷回复列表
 */
export function getReplyList(id) {
  return request({
    url: `/lazada/reply/fast-reply/list?account_id=${ id }`,
    method: 'get'
  })
}

/**
 * 快捷回复添加
 */
export function addFastReply(data) {
  return request({
    url: '/lazada/reply/fast-reply/add',
    method: 'post',
    data
  })
}

/**
 * 快捷回复编辑
 */
export function updateFastReply(data) {
  return request({
    url: '/lazada/reply/fast-reply/update',
    method: 'post',
    data
  })
}

/**
 * 快捷回复删除
 */
export function deleteFastReply(data) {
  return request({
    url: '/lazada/reply/fast-reply/delete',
    method: 'post',
    data
  })
}

/**
 * 星标
 */
export function changeCustomStar(data) {
  return request({
    url: '/lazada-operation/chat/star-user',
    method: 'post',
    data
  })
}

/**
 * 买家国家信息
 */
export function getCustomCountry(data) {
  return request({
    url: '/lazada-operation/nationality',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * istore物流信息
 */
export function getIstoreOrder(data) {
  return request({
    url: '/lazada-operation/webservice/posts/server',
    method: 'post',
    data
  })
}

// lazada获取消息列表图片url
export function getImageUrl(data) {
  return request({
    url: '/lazada-operation/chat/get-image-url',
    method: 'post',
    data
  })
}

// lazada 买家是否关注了店铺
export function getBuyerProfile(data) {
  return request({
    url: '/lazada-operation/chat/get-buyer-profile',
    method: 'post',
    data
  })
}

// 订单模块当前用户可用账号
export function getUserAccount() {
  return request({
    url: '/lazada-operation/web-service/istore-order/select',
    method: 'get'
  })
}

// 订单模块、订单列表
export function getUserOrderList(data) {
  return request({
    url: '/lazada-operation/web-service/istore-order/order-list',
    method: 'post',
    data
  })
}

// 订单模块、订单详情
export function getUserOrderDetail(params) {
  return request({
    url: '/lazada-operation/web-service/istore-order/order-info',
    method: 'get',
    params
  })
}

// 获取大金额订单客户信息
export function getBigOrderCustom(data) {
  return request({
    url: '/lazada-operation/order/huge-order',
    method: 'post',
    data
  })
}
