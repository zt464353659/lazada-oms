<template>
  <div
    style="min-width:1200px;min-height:400px"
    class="chat-list-page"
    v-loading="aside_loading"
  >
    <el-tabs
      v-model="activeTag"
      type="card"
      :before-leave="beforeLeave"
      @tab-click="tabChange"
    >
      <el-tab-pane
        v-for="(item,index) in accountListFormated"
        :key="index"
        :label="item.account_group_name"
        :name="item.account_group_name"
      >
        <div slot="label" :class="item.status ==='0' && item.disabledShow ? 'disabled-tab-wrap' : ''" @mouseover.stop="accountHover(item, true)" @mouseleave.stop="accountHover(item, false)">
          <span>{{ item.account_group_name }}<span v-if="item.isNotice" class="is-notice">{{ item.show_unread }}</span></span>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div class="content-box">
      <div
        v-for="(item, index) in accountListFormated"
        :key="index"
      >
        <conversations
          v-if="item.account_group_name === activeTag"
          :account-data="item"
          :active-tag="activeTag"
        />
      </div>
      <div
        v-if="noData"
        class="no-account-box"
      >
        <svg-icon icon-class="remind"/>
        当前用户下没有账号，请先配置账号
      </div>
    </div>
  </div>
</template>

<script>
import { fetchAccountList } from '@/api/chat'
import { mapGetters } from 'vuex'
import conversations from './conversations'

export default {
  name: 'List',
  components: { conversations },
  data() {
    return {
      activeTag: '',
      searchInput: '',
      debounceLiClick: true,
      aside_loading: false,
      user_id: this.$store.getters.userInfo.id,
      options_account: [
        {
          value: 'zhinan',
          label: '暂无数据',
          disabled: true
        }
      ],
      props: {
        label: 'account',
        value: 'id',
        children: 'child'
      },
      accountInfo: this.$store.getters.accountInfo,
      noData: false,
      changeTabCooling: false,
      accountListFormated: []
    }
  },
  computed: {
    ...mapGetters([
      // 'activeAccount',
      'noticeAccount'
    ])
  },
  created() {
    this.$store.commit('platform/SET_INFO', '')
    this.fetchAccountList()
  },
  mounted() {
  },
  methods: {
    accountHover(item, type) {
      item.disabledShow = type
      this.$forceUpdate()
    },
    tabChange() {
      // 切换账号时去除当前红点
      this._.forEach(this.accountListFormated, v => {
        if (v.account_group_name === this.activeTag) {
          v.isNotice = false
        }
      })
      this.checkTopNotice()
    },
    // 当红点都消失时顶部提示不闪烁
    checkTopNotice() {
      const isNoticeList = this._.filter(this.accountListFormated, v => {
        return v.isNotice
      })
      this.$store.commit('chat/SET_NOTICE_SHOW', !!isNoticeList.length)
    },
    cloneDeep(data) {
      const obj = this._.cloneDeep(this[data])
      this[data] = []
      this[data] = obj
    },
    beforeLeave(newTab, oldTab) {
      if (!oldTab) {
        return true
      }
      if (!this.changeTabCooling) {
        this.changeTabCooling = true
        setTimeout(() => {
          this.changeTabCooling = false
        }, 3000)
        return true
      } else {
        return false
      }
    },
    /* 获取当前用户下站点账户列表 */
    fetchAccountList() {
      const params = {
        user_id: this.user_id,
        // user_id: 1,
        not_show_message: true
      }
      this.aside_loading = true
      fetchAccountList(params).then(response => {
        const { data } = response
        this.options_account = data || []
        this.noData = Boolean(!this.options_account.length)
        this.aside_loading = false
        this.accountListFormated = response.data
        if (!Number(this.activeTag)) {
          this.activeTag = this.accountListFormated[0].account_group_name
        }
        // 判断是否通知消息查看详情 由 store 取值后赋值为空
        // if (this.activeAccount.length) {
        //   this._.forEach(this.accountListFormated, v => {
        //     // 禁用状态图标展示
        //     v.disabledShow = false
        //     if (v.site_code === this.activeAccount[0] && v.id === this.activeAccount[1]) {
        //       this.activeTag = v.account
        //     }
        //   })
        // }
        // this.cloneDeep('accountListFormated')
        this.formatAccountNotice()
        // this.$store.commit('chat/SET_ACTIVE_ACCOUNT', '')
      }).catch(() => {
        this.aside_loading = false
      })
    },
    // 账号消息红点展示
    formatAccountNotice() {
      this.accountListFormated = this.noticeAccount
      this._.forEach(this.accountListFormated, v => {
        v.isNotice = !!Number(v.unread_count)
        if (v.account_group_name === this.activeTag) {
          v.isNotice = false
        }
        v.show_unread = v.unread_count
        if (Number(v.unread_count) > 99) {
          v.show_unread = '99+'
        }
      })
    }
  },
  watch: {
    noticeAccount: {
      deep: true,
      handler(val) {
        this.formatAccountNotice()
      }
    }
  },
  filters: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.disabled-tab-wrap {
  position: relative;
  text-align: center;
  background: rgba(0, 0, 0, 0.1);
  width: calc(100% + 20px);
  transform: translateX(-10px);
}

.disabled-icon {
  position: absolute;
  font-size: 25px;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  color: red !important;
  transition: all 0.3s ease;
}

.no-account-box {
  margin-top: 160px;
  text-align: center;
  font-size: 20px;
}

.svg-icon {
  color: #ff6600;
}

.is-notice {
  display: block;
  position: absolute;
  top: 1px;
  right: 1px;
  width: 20px;
  height: 20px;
  background: red;
  line-height: 20px;
  text-align: center;
  font-size: 12px;
  color: #fff;
  font-weight: bold;
  border-radius: 50%;
}
</style>
