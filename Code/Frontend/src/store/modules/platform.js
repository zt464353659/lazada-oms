import { fetchAccountInfo } from '@/api/chat'

const state = {
  info: null
}

const mutations = {
  SET_INFO: (state, info) => {
    state.info = info
  }
}

const actions = {
  // 获取当前账户基础信息
  FetchAccountInfo({ commit }, accountInfo) {
    return new Promise((resolve, reject) => {
      fetchAccountInfo(accountInfo).then(response => {
        commit('SET_INFO', response.data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

