import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { apiUploadLogin } from '@/api/upload'
const state = {
  token: getToken(),
  name: '',
  avatar: '',
  permissions: [],
  info: null,
  uploadToken: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  },
  SET_INFO: (state, info) => {
    state.info = info
  },
  SET_UPLOADTOKEN: (state, uploadToken) => {
    state.uploadToken = uploadToken
  }
}

const actions = {
  // 登录
  Login({ commit }, userInfo) {
    const username = userInfo.username.trim()
    return new Promise((resolve, reject) => {
      login(username, userInfo.password).then(response => {
        setToken(response.data.token)
        commit('SET_TOKEN', response.data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户信息
  GetInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        // data.permissions.forEach(v => {
        //   v.enable = true
        // })
        if (data.permissions && data.permissions.length > 0) { // 验证返回的permissions是否是一个非空数组
          commit('SET_PERMISSIONS', data.permissions)
        } else {
          reject('getInfo: permissions must be a non-null array !')
        }
        const { info } = data
        commit('SET_NAME', info.name)
        commit('SET_INFO', info)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取上传token
  GetUploadToken({ commit, state }) {
    const data = {
      app_id: 'istore2',
      not_show_message: true
    }
    return new Promise((resolve, reject) => {
      apiUploadLogin(data).then(res => {
        const { access_token } = res
        commit('SET_UPLOADTOKEN', access_token)
        resolve(access_token)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 登出
  LogOut({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        removeToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 前端 登出
  FedLogOut({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

