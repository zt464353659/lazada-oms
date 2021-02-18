<template>
  <div class="conversations-page">
    <div class="tab-top">
      <div class="tab-left">
        <el-button v-if="allDataList.length" type="primary" size="mini" @click="jumpToLoginSeller">卖家后台登录</el-button>
      </div>
      <div class="tab-site">
        <div v-for="(item,index) in accountData.child" :key="index">
          <div class="tab-site-item" @click="changeActiveSite(item)">
            <span :class="item.account_id === activeAccountId ? 'active-site-item' : ''">{{ item.site_code }}</span>
            <div class="site-item-tip" v-if="item.unread_count && item.account_id !== activeAccountId">{{ item.unread_count }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="header-box" style="margin-bottom: -1px">
    </div>
    <el-container>
      <div class="mask" v-loading="aside_loading" element-loading-text="加载会话中">
      </div>
      <el-aside width="280px"
                class="conver-box"
      >
        <div class="search-box" v-if="showConversationSearch">
          <el-select v-model="conversationType" @change="conversationTypeChange" style="width:120px;margin-right:-8px;border:none;" size="mini">
            <el-option :label="`All(${allDataList.length})`" value="all"></el-option>
            <el-option :label="`Unread(${allDataList.filter(v => v.sessionData.nonReadNumber > 0).length})`" value="unread"></el-option>
          </el-select>
          <el-input align="right" style="width:55%;" placeholder="Search name..." size="mini" v-model="searchInput" @input="searchConversation" @change="searchConversation"></el-input>
          <i class="el-icon-search" style="font-size:16px;" @click="searchConversation"></i>
        </div>
        <ul ref="conversation-box" v-show="conversationsList.length" class="conversation-box is-set-scroll" :key="refresh">
          <li v-for="(item, index) in conversationsList"
              :key="index"
              :class="activeConversations === item.sessionId ? 'cur' : ''"
              @click="changeConversations(item)"
          >
            <div class="conversation-item">
              <div class="item-left">
                <el-badge v-if="item.sessionData.nonReadNumber > 0" :value="item.sessionData.nonReadNumber" :max="99" class="item"></el-badge>
                <img :src="item.showAvatar" alt="img">
              </div>
              <div class="item-right">
                <div class="title-line">
                  <span :class="item.is_big_order_unread ? 'red-color': ''" style="font-size:13px;font-weight:700">{{ item.showName }}</span>
                  <span style="font-size:12px;align-item:right;">{{ item.msgTime }}</span>
                </div>
                <div class="content-line">
                  <div style="overflow: hidden;">{{ item.sessionData.content }}</div>
                  <i v-if="item.customStar" style="color:rgb(230, 232, 47);;font-size:20px;" class="el-icon-star-on" ref="custom-star" :class="'left'"></i>
                  <!--<svg-icon v-if="item.customStar" icon-class="star-yellow" style="font-size:20px;"></svg-icon>-->
                </div>
              </div>
            </div>

            <!--<svg-icon icon-class="wrong" @click.stop="deleteConversations(item, index)"></svg-icon>-->
          </li>
        </ul>
        <div v-show="!conversationsList.length" style="height:100%;color:#ccc;position:relative">
          <!-- <img src="@/assets/logo.png" class="logo" alt=""> -->
          <span style="position:absolute;top:0;bottom:0;margin:auto 0;height:30px;text-align:center;display:block;width: 100%;">暂无数据</span>
        </div>
      </el-aside>
      <el-main>
        <chat-box
          :chatParams="chatParams"
          :siteCode="siteCodeName"
          :intervalRead="intervalRead"
          :baseObj="baseObj"
          :accountData="accountData"
          @emit-readMsg="readMsg"
          @addStar="addStar"
        ></chat-box>
        <!--@emit-refesh-order-count="getOrderStatusCount"-->
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { fetchAccountList, apiFetchConversations, deleteConversations, apiReadMessage, apiGetOrderMeta, getBigOrderCustom } from '@/api/chat'
import { mapGetters } from 'vuex'
import chatBox from './components/chatBox'

const defaultImg = require('@/assets/img_default.jpg')
export default {
  name: 'List',
  components: { chatBox },
  props: {
    accountData: {
      type: Object,
      default: () => {
      }
    },
    activeTag: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showConversationSearch: false,
      conversationType: 'all',
      allDataList: [],
      refresh: new Date().getTime(),
      searchInput: '',
      activeAccountId: undefined,
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
      conversationsList: [],
      activeConversations: '',
      chatParams: {},
      orderStatusCountObj: {
        cancelCount: 0,
        refoundCount: 0
      },
      next_timestamp: -1,
      baseObj: {},
      readMsgFlag: true, // 读取消息开关，避免多次请求
      renderListByTime: undefined, // 定时请求的 fn
      intervalRead: false, // 是否为定时请求
      noConversation: false,
      platFormList: {
        'my': 'https://seller.shopee.com.my',
        'sg': 'https://seller.shopee.sg',
        'ph': 'https://seller.shopee.ph',
        'id': 'https://seller.shopee.co.id',
        'th': 'https://seller.shopee.co.th',
        'vn': 'https://seller.shopee.vn',
        'tw': 'https://seller.shopee.tw'
      },
      activeSite: '',
      activeAccountInfo: {},
      otherInfo: ''
    }
  },
  created() {
    this.activeAccountInfo = this.accountData.child[0]
    // 存储当前激活账号信息
    this.$store.commit('chat/SET_ACTIVE_ACCOUNT', this.activeAccountInfo)
    this.activeAccountId = this.accountData.child[0].account_id
  },
  computed: {
    ...mapGetters([
      'activeAccount'
    ]),
    siteCodeName() {
      return this.accountData.site_code
    }
  },
  methods: {
    sortBigOrder() {
      // 根据大订单金额客户置顶排序
      const first = [], last = []
      if (this.bigOrderCustoms.length) {
        this.conversationsList.forEach(v => {
          // 大金额订单客户且有未读消息即置顶
          if (this.bigOrderCustoms.some(v1 => v1.buyer_name === v.sessionData.title) && Number(v.sessionData.nonReadNumber)) {
            v.is_big_order_unread = true
            first.push(v)
          } else {
            last.push(v)
          }
        })
        this.conversationsList = first.concat(last)
      }
    },
    getBigOrder() {
      getBigOrderCustom({ account_id: this.activeAccountId, not_show_message: true }).then(res => {
        this.bigOrderCustoms = res.data
      })
    },
    // 卖家后台登录
    jumpToLoginSeller() {
      window.open(`${ this.activeAccountInfo.uri }/apps/seller/login?platform=lazada&account_id=${ this.activeAccountInfo.account_id }`)
    },
    conversationTypeChange(val) {
      if (val === 'all') {
        this.conversationsList = this.allDataList
        window.addEventListener('mousewheel', this.checkWheel, false)
      } else {
        window.removeEventListener('mousewheel', this.checkWheel)
        this.conversationsList = this.allDataList.filter(v => v.sessionData.nonReadNumber > 0)
      }
    },
    changeActiveSite(item) {
      if (this.activeSite === item.site_code) {
        return
      }
      // 站点未读置为已读
      item.unread_count = 0
      this.activeAccountInfo = item
      // 存储当前激活账户信息
      this.$store.commit('chat/SET_ACTIVE_ACCOUNT', this.activeAccountInfo)
      this.activeAccountId = item.account_id
      this.conversationsList = []
      this.showConversationSearch = false
      this.allDataList = []
      this.chatParams = {}
    },
    // 添加星标
    addStar(item, star) {
      this.conversationsList.forEach(v => {
        if (v.sessionId === item.sessionId) {
          v.customStar = star
        }
      })
    },
    openTheNewTAB(href) {
      if (!/^(http:\/\/)|^(https:\/\/)/.test(href)) {
        href = 'http://' + href
      }
      const realhref = this.accountData.site_code === 'tw' ? 'https://seller.xiapi.shopee.cn' : href
      try {
        window.open(realhref, '_blank')
      } catch (error) {
        this.$message.error('无法打开错误的地址')
      }
    },
    cloneDeep(data) {
      const obj = this._.cloneDeep(this[data])
      this[data] = []
      this[data] = obj
    },
    searchConversation() {
      if (this.searchInput.trim()) {
        this.conversationsList = this.allDataList.filter(v => v.showName.toLowerCase().indexOf(this.searchInput.toLowerCase()) !== -1)
      } else {
        this.conversationsList = this._.cloneDeep(this.allDataList)
      }
    },
    checkWheel(el) {
      const parentEl = this.$refs['conversation-box']
      const isParent = this.isParent(el.target, parentEl)
      // 向下滚动 && 距离底部500以内 && 在会话列表滚动 && 会话列表没有loading && 有数据
      if (parentEl) {
        if (el.wheelDelta < 0 && ((parentEl.scrollTop + parentEl.offsetHeight) >= parentEl.scrollHeight) && isParent && !this.aside_loading && !this.noConversation) {
          this.aside_loading = true
          this.fetchConversations('mouseWheel')
        }
      }
    },
    // 判断父元素中是否包含子元素呢
    isParent(obj, parentObj) {
      while (obj !== undefined && obj !== null && obj.tagName && obj.tagName.toUpperCase() !== 'BODY') {
        if (obj === parentObj) {
          return true
        }
        obj = obj.parentNode
      }
      return false
    },
    /* 查看会话 */
    changeConversations(item) {
      this.next_timestamp = -1
      if (this.debounceLiClick) {
        this.intervalRead = false
        this.debounceLiClick = false
        setTimeout(() => {
          this.debounceLiClick = true
        }, 1500)
        if (this.activeConversations !== item.sessionId) {
          this.activeConversations = item.sessionId
          this.fetchMessages(item)
        }
      }
    },
    /* 获取当前用户下站点账户列表 */
    fetchAccountList() {
      const params = {
        user_id: this.user_id,
        // user_id: 1,
        not_show_message: true
      }
      fetchAccountList(params).then(response => {
        const { data } = response
        this.options_account = response.data || []
        if (!this.options_account.length) {
          this.options_account = [
            {
              value: 'zhinan',
              label: '暂无数据',
              disabled: true
            }
          ]
          return
        }
      }).catch(() => {
      })
    },
    /* 获取会话列表 */
    getAllConversations(startTime) {
      if (this.renderListByTime) {
        clearInterval(this.renderListByTime)
      }
      let params = {
        not_show_message: true,
        startTime,
        account_id: this.activeAccountInfo.account_id
      }
      // 仅在第一次数据加载时显示loading
      if (startTime === -1) {
        this.aside_loading = true
      }

      // 聊天窗口显示时间初始化
      function formatShowTime(val) {
        let month = new Date().getMonth()
        let today = new Date().getDate()
        let msgMonth = new Date(val).getMonth()
        let msgDate = new Date(val).getDate()
        let msgHour = new Date(val).getHours()
        let msgMini = new Date(val).getMinutes()
        if (msgDate === today && month === msgMonth) {
          if (msgHour < 10) {
            msgHour = '0' + msgHour
          }
          if (msgMini < 10) {
            msgMini = '0' + msgMini
          }
          return `${ msgHour }:${ msgMini }`
        } else {
          msgMonth = msgMonth + 1
          if (msgMonth < 10) {
            msgMonth = '0' + msgMonth
          }
          if (msgDate < 10) {
            msgDate = '0' + msgDate
          }
          return `${ msgDate }/${ msgMonth }`
        }
      }

      // 星标初始化
      const formatCustomStar = (val) => {
        if (val.sessionData.tags) {
          return val.sessionData.tags.includes('star')
        } else {
          return false
        }
      }
      apiFetchConversations(params).then(response => {
        // 防止因请求过快导致不同站点会话列表合并
        if (response.data.data.countryCode === this.activeAccountInfo.site_code) {
          const list = response.data.data.sessionViewDTOList
          if (startTime === -1) {
            this.otherInfo = {
              sellerId: response.data.data.userAccountId,
              siteCode: response.data.data.countryCode
            }
          }
          this.aside_loading = false
          if (list.length === 0) {
            this.noConversation = true
            return
          } else {
            this.noConversation = false
          }
          this._.forEach(list, v => {
            // 设置头像展示和默认消息展示
            // v.showAvatar = v.sessionData.headUrl || defaultImg
            v.showAvatar = defaultImg
            v.showName = String(v.sessionData.title).length > 20 ? String(v.sessionData.title).substring(0, 20) + '...' : String(v.sessionData.title)
            v.msgTime = formatShowTime(Number(v.sessionData.viewModifyTime))
            v.sortTime = v.sessionData.viewModifyTime
            v.customStar = formatCustomStar(v)
            v.is_big_order_unread = false
          })
          const newList = list.sort((a, b) => b.sortTime - a.sortTime)
          this.allDataList = this.allDataList.concat(newList)
          this.allDataList = this._.uniqBy(this.allDataList, 'sessionId')
          this.conversationsList = this._.cloneDeep(this.allDataList)
          // 置顶大订单金额会话
          this.sortBigOrder()
          // 存在后续会话列表 第一次加载列表或后续加载列表数据为整100条时
          if ((params.startTime === -1 && newList.length === 20) || (params.startTime !== -1 && list.length >= 100 && this.allDataList.length < 1020)) {
            this.getAllConversations(Number(response.data.data.nextStartTime))
          } else {
            //  获取1000会话列表结束 启动定时器,添加滚动加载事件，会话列表可搜索 存储滚动获取下次列表时间戳
            this.next_timestamp = response.data.data.nextStartTime
            this.intervalRead = true
            if (this.renderListByTime) {
              clearInterval(this.renderListByTime)
            }
            this.renderListByTime = setInterval(() => {
              // 是否根据定时请求的 来 判断是否需要增加 loading
              this.intervalRead = true
              this.fetchConversations('interval', -1)
            }, 30000)
            window.addEventListener('mousewheel', this.checkWheel, false)
            this.showConversationSearch = true
          }
        }
      }).catch((err) => {
        // 第一次加载即失败
        if (startTime === -1) {
          this.allDataList = []
          this.conversationsList = []
        }
        this.$message.error(err)
        this.aside_loading = false
      })
    },
    fetchConversations(fromWhere, intervalTime) {
      if (this.renderListByTime) {
        clearInterval(this.renderListByTime)
      }
      // 30秒自动请求一次接口
      this.renderListByTime = setInterval(() => {
        // 是否根据定时请求的 来 判断是否需要增加 loading
        this.intervalRead = true
        this.fetchConversations('interval', -1)
      }, 30000)
      if (fromWhere !== 'interval') {
        this.aside_loading = true
      }
      const params = {
        not_show_message: true,
        startTime: intervalTime ? intervalTime : this.next_timestamp,
        account_id: this.activeAccountInfo.account_id
      }

      function formatShowTime(val) {
        let month = new Date().getMonth()
        let today = new Date().getDate()
        let msgMonth = new Date(val).getMonth()
        let msgDate = new Date(val).getDate()
        let msgHour = new Date(val).getHours()
        let msgMini = new Date(val).getMinutes()
        if (msgDate === today && month === msgMonth) {
          if (msgHour < 10) {
            msgHour = '0' + msgHour
          }
          if (msgMini < 10) {
            msgMini = '0' + msgMini
          }
          return `${ msgHour }:${ msgMini }`
        } else {
          msgMonth = msgMonth + 1
          if (msgMonth < 10) {
            msgMonth = '0' + msgMonth
          }
          if (msgDate < 10) {
            msgDate = '0' + msgDate
          }
          return `${ msgDate }/${ msgMonth }`
        }
      }

      // 星标初始化
      const formatCustomStar = (val) => {
        if (val.sessionData.tags) {
          return val.sessionData.tags.includes('star')
        } else {
          return false
        }
      }

      apiFetchConversations(params).then(response => {
        const list = response.data.data.sessionViewDTOList
        this.otherInfo = {
          sellerId: response.data.data.userAccountId,
          siteCode: response.data.data.countryCode
        }

        this.aside_loading = false
        if (fromWhere !== 'interval') {
          if (list.length === 0) {
            this.noConversation = true
            return
          } else {
            this.noConversation = false
          }
        }
        if (fromWhere !== 'interval' && this.conversationsList.length) {
          // 滚轮下拉
          this.next_timestamp = Number(response.data.data.nextStartTime)
        }
        this._.forEach(list, v => {
          // 设置头像展示和默认消息展示
          // v.showAvatar = v.sessionData.headUrl || defaultImg
          v.showAvatar = defaultImg
          v.showName = String(v.sessionData.title).length > 20 ? String(v.sessionData.title).substring(0, 20) + '...' : String(v.sessionData.title)
          v.msgTime = formatShowTime(Number(v.sessionData.viewModifyTime))
          v.sortTime = v.sessionData.viewModifyTime
          v.customStar = formatCustomStar(v)
          v.is_big_order_unread = false
        })
        this.allDataList = this._.unionWith(list, this.allDataList, this._.isEqual).sort((a, b) => b.sortTime - a.sortTime)
        this.allDataList = this._.uniqBy(this.allDataList, 'sessionId')
        if (this.conversationType === 'all') {
          this.conversationsList = this._.cloneDeep(this.allDataList)
        } else {
          this.conversationsList = this.allDataList.filter(v => v.sessionData.nonReadNumber > 0)
        }
        // 置顶大订单金额会话
        this.sortBigOrder()
        //  请求会话列表完成后，当前如果有打开的消息窗口，就刷新打开窗口的消息,将当前打开的窗口消息置为已读
        if (this.activeConversations) {
          this.conversationsList.forEach(item => {
            if (item.sessionId === this.activeConversations) {
              this.intervalRead = true
              this.chatParams = this.createParams(item)
            }
          })
        }
      }).catch((err) => {
        this.$message.error(err)
        this.aside_loading = false
      })
    },
    /* 获取消息列表 */
    fetchMessages(item, notRead, fromWhere) {
      this.baseObj = Object.assign(item, { otherInfo: this.otherInfo, activeAccountInfo: this.activeAccountInfo })
      // 存储当前激活账号信息
      this.$store.commit('chat/SET_BASEOBJ', this.baseObj)
      const params = this.createParams(item)
      // 有未读消息 && 读消息 && 不是定时请求的方法 => 请求读取消息接口
      // if (item.sessionData.nonReadNumber > 0 && !notRead && fromWhere !== 'interval') {
      if (item.sessionData.nonReadNumber > 0 && !notRead && fromWhere !== 'interval') {
        this.readMsg(item)
      }
      this.chatParams = params
    },
    createParams(item) {
      const params = {
        not_show_message: true,
        startTime: this.next_timestamp,
        sessionViewId: item.sessionId,
        account_id: this.activeAccountInfo.account_id
      }
      return params
    },
    readMsg(item) {
      const params = {
        sessionViewId: item.sessionId,
        account_id: this.activeAccountInfo.account_id,
        to_user_id: item.target.targetId,
        not_show_message: true
      }
      apiReadMessage(params).then(() => {
        this._.forEach(this.conversationsList, v => {
          if (v.sessionId === item.sessionId) {
            v.sessionData.nonReadNumber = 0
            v.is_big_order_unread = false
          }
        })
      })
    }
  },
  filters: {},
  watch: {
    activeAccountId: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {
          // 获取大金额订单会话
          this.getBigOrder()
          // 有打开的定时器就清掉
          if (this.renderListByTime) {
            clearInterval(this.renderListByTime)
          }
          this.aside_loading = true
          this.getAllConversations(-1)
        }
      }
    }
  }
  ,
  destroyed() {
    this.getAllConversations = () => {
    }
    if (this.renderListByTime) {
      clearInterval(this.renderListByTime)
    }
    window.removeEventListener('mousewheel', this.checkWheel)
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.conversation-item {
  width: 100%;
  display: flex;

  .item-left {
    width: 50px;
  }

  .item-right {
    width: 80%;

    .title-line {
      display: flex;
      justify-content: space-between;
    }

    .content-line {
      position: relative;
      margin-top: 10px;
      padding-right: 20px;
      max-height: 30px;
      font-size: 12px;
      line-height: 15px;
      color: #666;
      overflow: hidden;
      word-break: keep-all;

      i {
        position: absolute;
        right: 0;
        top: -2px;
      }
    }
  }
}

.el-container {
  position: relative;
  height: 675px;
  overflow-y: auto;
  border: 1px solid #d3dce6;

  .mask {
    position: absolute;
    width: 280px;
    height: 100%;
    border-right: 1px solid;
  }

  .el-aside {
    position: relative;
    border-right: 1px solid #d3dce6;

    .conver-box {
      position: relative;
    }

    .search-box {
      padding: 5px;

      .el-select .el-input {
        input {
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
        }
      }

      .el-input {
        input {
          border-left: none;
          border-top: none;
        }
      }

      margin-left: 6px;
      margin-bottom: 10px;
      position: relative;
      text-align: right;

      i {
        position: absolute;
        top: 10px;
        right: 9px;
        cursor: pointer;
      }
    }

    overflow: hidden;

    ul {
      margin: 0;
      height: calc(100% - 28px);
      list-style: none;
      padding: 0;
      overflow-x: hidden;
      overflow-y: auto;

      li {
        position: relative;
        width: 100%;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        list-style: none;
        padding: 8px 12px;
        display: inline-flex;
        cursor: pointer;
        border-bottom: 1px solid #d3dce6;

        &.cur {
          background-color: #dde7f1;
        }

        .el-badge {
          position: absolute !important;
          top: 10px;
          left: 0;
        }

        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: inline-block;
        }

        .tt {
          display: inline-block;
          color: #333;
          font-size: 14px;
          line-height: 44px;
          padding-left: 12px;
        }

        .svg-icon {
          color: red;
          display: none;
          position: absolute;
          top: 10px;
          right: 10px;
        }

        &:hover {
          background-color: #dde7f1;

          .svg-icon {
            color: red;
            display: inline-block;
          }
        }
      }
    }
  }

  .el-main {
    /*background-color: #3a8ee6;*/
    padding: 0;
  }
}

.tab-top {
  display: flex;
  justify-content: space-between;
}

.tab-site {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  .tab-site-item {
    position: relative;
    padding: 0 20px 0 15px !important;
    min-width: 70px;
    height: 40px;
    line-height: 40px;
    cursor: pointer;

    .site-item-tip {
      position: absolute;
      top: 1px;
      right: 15px;
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
  }

  .tab-site-item:hover {
    color: red;
  }
}

.active-site-item {
  color: red;
}

.red-color {
  color: red;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.search-box {
  .el-select .el-input {
    input {
      border: none;
      border-radius: 0;
      border-left: 1px solid #e9e9e9;
      border-top: 1px solid #e9e9e9;
      border-bottom: 1px solid #e9e9e9;
    }
  }

  .el-input {
    input {
      border: none;
      border-radius: 0;
      border-top: 1px solid #e9e9e9;
      border-bottom: 1px solid #e9e9e9;
      border-right: 1px solid #e9e9e9;
      padding-right: 30px;
    }
  }
}
</style>
