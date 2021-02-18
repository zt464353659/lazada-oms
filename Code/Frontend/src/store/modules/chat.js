
const state = {
  activeAccount: [],
  noticeAccount: [],
  isNoticeShow: true,
  baseObj: {}
}

const mutations = {
  SET_ACTIVE_ACCOUNT: (state, info) => {
    state.activeAccount = info
  },
  SET_NOTICE_ACCOUNT: (state, info) => {
    state.noticeAccount = info
  },
  SET_NOTICE_SHOW: (state, info) => {
    state.isNoticeShow = info
  },
  SET_BASEOBJ: (state, info) => {
    state.baseObj = info
  },
}

const actions = {
  setNoticeAccount({ commit }, data) {
    commit('SET_NOTICE_ACCOUNT', data)
  },
  setBaseObj({ commit }, data) {
    commit('SET_BASEOBJ', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

