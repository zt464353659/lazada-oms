import Vue from 'vue'
import store from '@/store'

export default {
  inserted(el, binding, vnode) {
    const { value, arg } = binding
    const permissions = store.getters && store.getters.permissions
    if (!Array.isArray(value)) {
      if (value && permissions.length > 0) {
        const hasPermission = Vue._.some(permissions, { 'tag': value, 'enable': true })
        if (!hasPermission) {
          if (arg) {
            vnode.context[arg] = false
          } else {
            el.parentNode && el.parentNode.removeChild(el)
          }
        }
      } else {
        throw new Error(`permission! Like v-permission="system.view"`)
      }
    } else {
      if (value.length > 0 && permissions.length > 0) {
        const hasPermissions = []
        value.map(V => {
          hasPermissions.push(Vue._.some(permissions, { 'tag': V, 'enable': true }))
        })
        if (!hasPermissions.some((value) => value === true)) {
          if (arg) {
            vnode.context[arg] = false
          } else {
            el.parentNode && el.parentNode.removeChild(el)
          }
        }
      } else {
        throw new Error(`permission! Like v-permission="system.view" Array cannot be empty`)
      }
    }
  }
}
