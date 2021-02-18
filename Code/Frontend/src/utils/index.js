/**
 * Created by yuxang on 18/05/20.
 */
import Vue from 'vue'
import moment from 'moment'

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"').replace(/\+/g, ' ') +
    '"}'
  )
}

/**
 * 转换空的查询参数
 */
export const filterQueryParams = (params) => Vue._.mapValues(params, (v) => (v || v === 0) ? v : undefined)

/**
 * 将树形结构数据转为list结构
 */
export const transformTreeToList = (treedata) => {
  const data = []
  const handleTreeSource = (treedata) => {
    Vue._.forEach(treedata, (value, key) => {
      data.push(value)
      if (!Vue._.isEmpty(value.children)) {
        handleTreeSource(value.children)
      }
    })
  }
  handleTreeSource(treedata)
  return data
}

/**
 * 转换为select options
 */
export const transformToOptions = (listdata) => {
  const data = []
  Vue._.forEach(listdata, (val, key) => {
    data.push({
      label: val.name,
      value: val.id
    })
  })
  return data
}

/**
 * 时间转换
 */
export function fattCreateTime(time, str) {
  if (str === 'd') {
    return moment(time).format('YYYY-MM-DD')
  } else {
    return moment(time).format('YYYY-MM-DD HH:mm:ss')
  }
}

/**
 * addClass
 */
export function addClass(el, className) {
  el.classList.add(className)
}

/**
 * removeClass
 */
export function removeClass(el, className) {
  el.classList.remove(className)
}

/**
 * toBoolean
 */
export const toBoolean = (v) => Boolean(parseInt(v))
