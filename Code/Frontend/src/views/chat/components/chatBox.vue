<template>
  <div class="chat-right-wrap">
    <div class="chat-box" :style="{ 'width': !orderBoxShow || JSON.stringify(chatParams) === '{}' ? '100%' : 'calc(100% - 300px)' }">
      <!--<div class="chat-box" style="width:100%">-->
      <div v-show="JSON.stringify(chatParams) !== '{}'" class="msg-box" @onmousewheel.passive="checkScroll" v-loading="loading" element-loading-background="rgba(255, 255, 255, 1)">
        <div class="triangle" v-show="orderBoxShow && requested">
          <div class="custom-country" style="color:#454545;">
            <span style="margin-right:15px;">{{ titleCustomInfo.custom }}</span>
            <span>{{ titleCustomInfo.en_name }}</span>
          </div>
          <div>
            <div>
              <svg-icon v-if="customStar" icon-class="star-yellow" style="cursor: pointer" @click="starChange(false)"></svg-icon>
              <svg-icon v-else icon-class="star-cancel" style="cursor:pointer" @click="starChange(true)"></svg-icon>
            </div>
          </div>
        </div>
        <ul :style="{ 'padding-top': activeProductObj.source_type ? '64px' : '' }" ref="msg-box-ul" class="msg-box-ul is-set-scroll" :key="newDate">
          <div v-if="isNoMsg" style="text-align:center;color: #ccc; font-size: 14px;">暂无更多消息</div>
          <div v-if="loadingShow" class="loading-wrap"><i class="el-icon-loading"></i></div>
          <template v-for="(item,index) in msgList">
            <!-- 系统提示 -->
            <div class="system-tip" :key="index" v-if="item.formatData.msgType === 'systemTip'">{{ item.formatData.txt }}</div>
            <li
              v-else
              :key="index"
              :class="item.formatData.isSeller ? 'ownMsg' : 'otherMsg'"
            >
              <!-- 暂时展示 'txt', 'emoji', 'product' 'order' 'coupon' 类型的消息 -->
              <div style="overflow: hidden">
                <img :src="item.formatData.isSeller ? item.formatData.avatar : custom_avatar" alt="img" class="avatar">
                <div class="item-content">
                  <!-- 文字消息 -->
                  <div class="text-wrap" v-if="item.formatData.msgType === 'txt'">
                    <pre v-html="item.formatData.txt">
                    </pre>
                    <!--有翻译的话显示翻译-->
                    <div class="translate-box" style="border-top:1px dotted #ccc" v-if="item.formatData.templateData.translateTxt && item.formatData.msgType === 'txt'">
                      <div v-if="item.formatData.translateTxt">
                        <p style="margin: 10px 0" :style="{ 'color': item.formatData.templateData.translateTxt ? '#000' : '' }">
                          {{ item.formatData.templateData.translateTxt }}
                        </p>
                        <div style="text-align: right;">
                          <span style="color:rgba(100, 100, 100, .5); font-size: 12px;text-align: right">
                            Alibaba Translation
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 自动回复消息 -->
                  <div class="auto-reply text-wrap" v-if="item.formatData.msgType === 'auto_reply'">
                    <pre style="margin-bottom: 15px;" v-html="JSON.parse(item.formatData.txt).en"></pre>
                    <div v-for="(key,ind) in Object.keys(item.formatData.templateData)" :key="ind">
                      <div class="action-item" v-if="item.formatData.templateData.hasOwnProperty(`action${ind + 1}Txt`)">
                        <a href="">{{ JSON.parse(item.formatData.templateData[`action${ ind + 1 }Txt`]).en }}</a>
                      </div>
                    </div>
                  </div>
                  <!-- 图片消息 -->
                  <div class="img-box" v-if="item.formatData.msgType === 'image'">
                    <picture-view
                      v-if="item.formatData.imgUrl || item.formatData.templateData.imgUrl"
                      :thumbnail="false"
                      :pictureList="[item.formatData.imgUrl ? item.formatData.imgUrl : item.formatData.templateData.imgUrl]"
                    ></picture-view>
                    <i v-if="!item.sendSuccess && item.textLoading" class="el-icon-loading"></i>
                    <i v-if="item.showSystemErr" style="color: red;" class="el-icon-warning"></i>
                  </div>
                  <!--表情包消息 -->
                  <div class="sticker-box" v-if="item.formatData.msgType === 'emoji'">
                    <img :src="item.formatData.emojiUrl">
                  </div>
                  <!--follow store消息-->
                  <div class="product-box" :class="item.formatData.isSeller ? 'seller-color' : 'custom-color'" v-if="item.formatData.msgType === 'follow'">
                    <div class="product-card">
                      <div class="card-header">{{ JSON.parse(item.formatData.templateData.title).en }}</div>
                      <div class="card-content">
                        <div class="left-content">
                          <img :src="item.formatData.templateData.iconUrl" alt="" style="width:100%;">
                        </div>
                        <div class="right-content">
                          <div class="show-title">
                            {{ item.formatData.templateData.desc }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!--产品信息消息-->
                  <div class="product-box" :class="item.formatData.isSeller ? 'seller-color' : 'custom-color'" v-if="item.formatData.msgType === 'product'"
                       @click="openProductDetail(item.formatData.templateData.actionUrl)"
                  >
                    <div class="product-card">
                      <div class="card-header">Product Information</div>
                      <div class="card-content">
                        <div class="left-content">
                          <img :src="item.formatData.templateData.iconUrl" alt="" style="width:100%;">
                        </div>
                        <div class="right-content">
                          <div class="show-title">
                            {{ item.formatData.templateData.title }}
                          </div>
                          <div class="show-price">{{ item.formatData.templateData.price }}</div>
                          <div class="bottom-discount">
                            <div style="text-decoration: line-through;">{{ item.formatData.templateData.oldPrice }}</div>
                            <div>{{ item.formatData.templateData.discount }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!--优惠券消息-->
                  <div class="coupon-box" :class="item.formatData.isSeller ? 'seller-color' : 'custom-color'" v-if="item.formatData.msgType === 'coupon'">
                    <div class="coupon-card">
                      <div class="card-top">
                        <div class="coupon-title">
                          <div class="left-icon"></div>
                          <span>Specific Product Level</span>
                        </div>
                        <div class="coupon-discount">
                          {{ item.formatData.templateData.title }}
                        </div>
                        <div class="promotion">
                          <div>
                            <span>{{ item.formatData.templateData.discountValue }}</span>
                            <span style="font-size:14px;">{{ item.formatData.templateData.discountUnit }}</span>
                          </div>
                          <button class="collect" @click="openProductDetail(item.formatData.templateData.appBuyerUrl)">collect</button>
                        </div>
                      </div>
                      <div class="card-bottom">
                        <div class="active-time">{{ item.formatData.templateData.period }}</div>
                      </div>
                    </div>
                  </div>
                  <!--订单消息-->
                  <div
                    class="order-box"
                    :class="item.formatData.isSeller ? 'seller-color' : 'custom-color'"
                    v-if="item.formatData.msgType === 'order'"
                    @click="openProductDetail(`${ $store.getters.activeAccount.uri }/apps/seller/login?platform=lazada&account_id=${ $store.getters.activeAccount.account_id }&path=/order/detail/${item.formatData.templateData.orderId}/${$store.getters.activeAccount.seller_id}`)"
                  >
                    <div class="order-card">
                      <div class="card-header">{{ `Order Number #${ item.formatData.templateData.orderId }` }}</div>
                      <div class="card-content">
                        <div class="left-content">
                          <img :src="item.formatData.templateData.iconUrl" alt="" style="width:100%;">
                        </div>
                        <div class="right-content">
                          <div class="two-line">{{ item.formatData.templateData.title }}</div>
                          <div>{{ item.formatData.templateData.status }}</div>
                          <div>{{ item.formatData.templateData.content }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <i v-if="!item.sendSuccess && item.textLoading" class="el-icon-loading"></i>
                  <i v-if="item.showSystemErr" style="color: red;" class="el-icon-warning"></i>
                  <!--<i v-if="!item.sendSuccess && !item.textLoading" style="color: red;" class="el-icon-warning"></i>-->
                  <!--<i v-if="!item.sendSuccess && !item.textLoading" @click="addMessage(item, 'old')" style="color: red;" class="el-icon-warning"></i>-->
                  <span style="color:#b0b0b0;">{{ item.formatData.sendTime | moment('YYYY-MM-DD HH:mm:ss') }}</span>
                </div>
              </div>
            </li>
          </template>
        </ul>
      </div>
      <div class="talk-box" :class="'talk-box-' + talkBoxKey" v-show="requested && JSON.stringify(chatParams) !== '{}'">
        <div ref="slide-tool">
          <div class="slide-tool sticker-tool" :class="{ 'active': slideShow === 'sticker' }">
            <sticker @send-sticker="addMessage"></sticker>
          </div>
          <div class="slide-tool sticker-tool" :class="{ 'active': slideShow === 'fastReply' }">
            <div style="padding: 5px 5px;height:300px;overflow: auto;" class="is-set-scroll">
              <el-button size="mini" type="primary" @click="openReplyDialog" style="float:right;">管理</el-button>
              <div v-loading="replyLoading" style="clear: both;color:rgb(176,176,176);">
                <div style="padding:10px 0;">
                  <el-input size="mini" v-model="fastReplyKeyword" @input="searchFastReply" placeholder="请输入关键字"></el-input>
                </div>
                <div v-if="replyList.length">
                  <div style="padding: 3px 0; cursor: pointer;overflow-wrap: break-word" v-for="(v,index) in replyList" :key="index" @click="addMessage({ txt: v.message }, 'txt')">
                    {{ v.message }}
                  </div>
                </div>
                <div v-else style="color:rgb(176,176,176);text-align: center">空空如也</div>
              </div>
            </div>
          </div>
          <div class="tool-box">
            <el-tooltip class="item" effect="dark" content="贴图" placement="bottom">
              <svg-icon icon-class="Smile" @click="showSlide('sticker')"></svg-icon>
            </el-tooltip>
            <!--<el-tooltip class="item" effect="dark" content="快捷回复" placement="bottom">-->
            <!--<svg-icon icon-class="menu1" @click="showSlide('fastReply')"></svg-icon>-->
            <!--</el-tooltip>-->
            <el-tooltip class="item" effect="dark" content="图片" placement="bottom" @click.native="hideSlide">
              <upload @ready-upload="readyUploadPic"></upload>
            </el-tooltip>
            <!--<el-tooltip class="item" effect="dark" content="商品" placement="bottom">-->
            <!--<svg-icon icon-class="bags" @click="showSlide('product')"></svg-icon>-->
            <!--</el-tooltip>-->
          </div>
        </div>
        <el-input
          resize="none"
          class="talk-input"
          type="textarea"
          ref="talk-input"
          :rows="4"
          placeholder="请输入内容"
          @keydown.enter.native.prevent.exact="addMessage({ txt: content }, 'txt')"
          @keydown.enter.ctrl.native.prevent.exact="lineFeed"
          @input="contentChange"
          v-model="content"
        >
        </el-input>
        <div class="send-btm">
          <span>Enter发送，Ctrl+Enter换行</span>
          <el-button type="primary" size="mini" :disabled="content.trim() === ''" @click="addMessage({ txt: content }, 'txt')">发送</el-button>
        </div>
      </div>
      <div v-show="JSON.stringify(chatParams) === '{}'" class="no-msg-box" style="height:100%;text-align:center;color:#ccc;">
        <span style="position:absolute;top:0;bottom:0;margin:auto 0;height:30px;">Lazada 聊聊</span>
      </div>
    </div>
    <div v-if="JSON.stringify(chatParams) !== '{}'" :style="{ 'width': orderBoxShow ? '300px' : 0 }">
      <orderBox
        :intervalRead="intervalRead"
        :chatParams="chatParams"
        @emit-triggerOrderShow="triggerOrderShow"
        @emit-send-order="addMessage"
        @emit-refesh-order-count="emitRefeshOrderCount"
      ></orderBox>
    </div>
    <!--<fast-reply-manager v-bind.sync="fastReplyOption"></fast-reply-manager>-->
    <image-send-confirm v-bind.sync="sendConfirmOption" @send-picture="addMessage"></image-send-confirm>
  </div>
</template>

<script>
const { sticker_map } = require('@/utils/sticker_map')
const defaultImg = require('@/assets/img_default.jpg')
const sticker_img = require('@/assets/no-sticker.png')
import { findEmoji } from '@/utils/emoji'
import PictureView from 'vue-simple-picture-preview'
import { apiFetchmessage, apiSendMessage, apiTranslateText, apiReadMessage, getReplyList, changeCustomStar, getCustomCountry, getImageUrl } from '@/api/chat'
import sticker from './sticker'
import { getToken } from '@/utils/auth'
import { getUploadPath } from '@/utils/help'
import axios from 'axios'
// import products from './products'
// import bargainingCard from './card/bargainingCard'
// import productCard from './card/productCard'
import upload from './upload'
import orderBox from './orderBox'
// import orderChatCard from './card/orderChatCard'
// import pasteImgDialog from './pasteImgDialog'
// import fastReplyManager from './fastReply/fastReplyManager'
import imageSendConfirm from './chatBox/imageSendConfirm'
import { country } from './chatBox/common/country'

export default {
  components: { sticker, PictureView, orderBox, upload, imageSendConfirm },
  // components: { sticker, PictureView, orderBox, fastReplyManager, upload, imageSendConfirm },
  props: {
    chatParams: {
      type: Object,
      default: () => {
      }
    },
    intervalRead: {
      type: Boolean
    },
    baseObj: {
      type: Object,
      default: () => {
      }
    },
    siteCode: {
      type: String,
      default: ''
    },
    accountData: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      patsePic: {
        imgUrl: ''
      },
      fastReplyKeyword: '',
      copyReplyList: [],
      fileList: [],
      stickerMap: sticker_map,
      loading: false,
      content: '',
      loadingShow: false,
      msg_limit: 20, // 请求的条数
      requested: false,
      isNoMsg: false, // 请求一次没有请求到数据就不再请求了
      msgList: [],
      isUrl: () => {
        return /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([0-9-a-zA-Z0-9@:%_+.~#?&//=]*)/g
      },
      slideShow: '',
      productOption: {},
      activeProductObj: {}, // 当前用户正在浏览的商品
      uploadBaseObj: {
        content: {}
      }, // 图片上传的对象 因上传完组件里无法定位对应消息的图片路径，传入 obj 后传出
      showBtmStatus: ['accepted', 'rejected', 'cancelled'],
      debounceCheckScroll: this._.debounce(() => {
        if (this.baseObj.unread_count) {
          this.$emit('emit-readMsg', this.baseObj)
        }
      }, 3000),
      hasTranslateSite: ['id', 'th'], // 需要翻译的站点
      orderBoxShow: true, // 右侧订单信息栏是否展示
      imgDialogOption: {
        open: false,
        data: {}
      },
      talkBoxKey: Math.floor(Math.random() * 1000000000 + 1) + '', // 给每个 talk-box 设置理想化的唯一的类名
      custom_avatar: defaultImg,
      coupon: {},
      order: {},
      product: {},
      replyLoading: true,
      replyList: [{ message: 'hello' }, { message: 'sorry' }],
      fastReplyOption: {
        open: false,
        replyList: []
      },
      newDate: new Date().getTime(),
      customStar: false,
      starColorList: {
        'star-rd': 'red',
        'star-yl': 'yellow',
        'star-gn': 'rgb(26, 250, 41)',
        'star-bu': 'rgb(75,165,255)',
        'star-pl': 'rgb(214,134,255)',
        'cancel': '#333'
      },
      titleCustomInfo: {},
      sendConfirmOption: {
        open: false,
        obj: {},
        content: {}
      },
      oldPicInfo: {}
    }
  },
  created() {
    this.resetScroll()
    this.addMouseWheel()
    this.addOtherClick()
  },
  mounted() {
  },
  computed: {
    nextStartTime() {
      if (!this.msgList.length) {
        return -1
      }
      return Number(this.msgList[0].body.typeData.sendTime)
    }
  },
  methods: {
    readyUploadPic(file) {
      if (file) {
        // 插入图片记录
        const that = this
        var reader = new FileReader()
        reader.readAsDataURL(file)
        this.patsePic = {
          imgUrl: ''
        }
        reader.onload = function(data) {
          const imgUrl = data.target.result
          that.sendConfirmOption = {
            open: true,
            obj: {
              file
            },
            content: {
              imgUrl
            }
          }
        }
      }
    },
    contentChange(val) {
      if (val.length > 4000) {
        this.content = this.content.slice(0, 4000)
      }
    },
    // 快捷回复搜索
    searchFastReply(val) {
      this.replyList = this.copyReplyList
      if (val.trim()) {
        this.replyList = this.replyList.filter(v => {
          return v.message.toLowerCase().indexOf(val.toLowerCase()) !== -1
        })
      }
    },
    // 星标切换
    starChange(val) {
      const cloneData = this._.cloneDeep(this.chatParams)
      const params = {
        account_id: cloneData.account_id,
        // uri: cloneData.uri,
        // cookie: cloneData.cookie,
        sessionViewId: cloneData.sessionViewId,
        starOtherwiseUnstar: val
      }
      changeCustomStar(params).then(() => {
        this.customStar = val
        this.$emit('addStar', this.baseObj, this.customStar)
      })
    },
    getReply() {
      getReplyList(this.$store.getters.accountInfo.id).then(res => {
        this.replyList = res.data
        this.copyReplyList = this._.cloneDeep(this.replyList)
        this.$nextTick(() => {
          this.replyLoading = false
        })
      }).catch(() => {
      })
    },
    openReplyDialog() {
      this.fastReplyOption = {
        open: true,
        replyList: this.replyList
      }
    },
    openTheNewTAB(href) {
      if (!/^(http:\/\/)|^(https:\/\/)/.test(href)) {
        href = 'http://' + href
      }
      try {
        window.open(href, '_blank')
      } catch (err) {
        this.$message.error('无法打开错误的地址')
      }
    },
    emitRefeshOrderCount() {
      this.$emit('emit-refesh-order-count')
    },
    addMouseWheel() {
      window.addEventListener('mousewheel', this.checkWheel, false)
    },
    addOtherClick() {
      window.addEventListener('click', this.checkOutClick, false)
    },
    // 检测外部点击，收缩 表情包与产品框
    checkOutClick(el) {
      if (!this.isParent(el.target, this.$refs['slide-tool'])) {
        this.slideShow = ''
      }
    },
    checkWheel(el) {
      const parentEl = this.$refs['msg-box-ul']
      const isParent = this.isParent(el.target, parentEl)
      // 向上滑动 && 滚动到顶部 && 在消息栏上滚动 && 当前没有请求数据 && 有消息
      if (el.wheelDelta > 0 && parentEl.scrollTop <= 0 && isParent && !this.loadingShow && !this.isNoMsg) {
        this.loadingShow = true
        this.getMoreMsgList()
      }
      parentEl.addEventListener('scroll', this.checkScroll)
    },
    checkScroll() {
      this.debounceCheckScroll()
    },
    // 判断父元素中是否包含子元素
    isParent(obj, parentObj) {
      while (obj !== undefined && obj !== null && obj.tagName && obj.tagName.toUpperCase() !== 'BODY') {
        if (obj === parentObj) {
          return true
        }
        obj = obj.parentNode
      }
      return false
    },
    getMoreMsgList() {
      if (this.msgList.length < 20) {
        this.isNoMsg = true
        this.loadingShow = false
        return
      }
      this.getChatMessage(undefined, this.nextStartTime)
    },
    // 添加内容
    /**
     * @param
     * @content obj 发送的内容
     * @type str 发送的类型
     * @textContent any 其他数据（发送商品的详细数据 || 区分粘贴发送图片 （'isPaste'））
     */
    addMessage(content, type, otherData) {
      this.checkScroll()
      this.slideShow = ''
      let obj
      // if (type === 'old') {
      //   obj = content
      //   obj.textLoading = true
      //   const sendContent = this._.cloneDeep(obj.content)
      //   this.sendMessage(obj, sendContent)
      // }
      // 新增关注店铺消息类型
      if (type === 'follow') {
        obj = this._.cloneDeep(content)
        obj.textLoading = true
        obj.sendSuccess = false
        obj.formatData = {
          msgType: 'follow',
          templateData: obj,
          isSeller: true,
          sendTime: new Date().getTime(),
          avatar: 'https://ae01.alicdn.com/kf/HTB1_NJNKwHqK1RjSZFk760.WFXa5.png'
        }
        // 为消息列表追加最新数据，发送消息
        this.msgList.push(obj)
        this.resetScroll()
        this.sendMessage(obj, content)
        return
      }
      if (type === 'image') {
        obj = {}
        obj.textLoading = true
        obj.sendSuccess = false
        obj.formatData = {
          msgType: 'image',
          templateData: this.patsePic,
          isSeller: true,
          sendTime: new Date().getTime(),
          avatar: 'https://ae01.alicdn.com/kf/HTB1_NJNKwHqK1RjSZFk760.WFXa5.png',
          imgUrl: ''
        }
        this.msgList.push(obj)
        this.resetScroll()
        const formData = new FormData()
        formData.append('file', content.file)
        formData.append('access_token', '1')
        axios({
          url: getUploadPath(),
          method: 'post',
          headers: {
            Authorization: getToken()
          },
          data: formData
        }).then(res => {
          if (res.data.data.data.url) {
            this.patsePic['imgUrl'] = res.data.data.data.url
            this.patsePic['image'] = {}
            this.patsePic['width'] = res.data.data.data.width
            this.patsePic['height'] = res.data.data.data.height
            this.sendMessage(obj, this.patsePic)
          }
        }).catch(() => {
          this.$message.error('图片上传失败！请重试')
          // 上传失败清除图片消息
          this.msgList.pop()
        })
      }
      if (type === 'activeCoupon' || type === 'shopCoupon') {
        obj = this._.cloneDeep(content)
        obj.textLoading = true
        obj.sendSuccess = false
        obj.formatData = {
          msgType: 'coupon',
          templateData: Object.assign(obj, { appBuyerUrl: `https://www.lazada.com.my/shop/i/landing_page/voucher?wh_weex=true&scene=im&domain=store&sellerId=${ content.sellerId }&voucherId=${ content.promotionId }` }),
          isSeller: true,
          sendTime: new Date().getTime(),
          avatar: 'https://ae01.alicdn.com/kf/HTB1_NJNKwHqK1RjSZFk760.WFXa5.png'
        }
        this.msgList.push(obj)
        this.sendMessage(obj, content)
        return
      }
      if (type === 'product') {
        obj = this._.cloneDeep(content)
        obj.textLoading = true
        obj.sendSuccess = false
        obj.formatData = {
          msgType: 'product',
          templateData: obj,
          isSeller: true,
          sendTime: new Date().getTime(),
          avatar: 'https://ae01.alicdn.com/kf/HTB1_NJNKwHqK1RjSZFk760.WFXa5.png'
        }
        this.msgList.push(obj)
        this.resetScroll()
        this.sendMessage(obj, content)
        return
      }
      if (type === 'order') {
        obj = this._.cloneDeep(content)
        obj.textLoading = true
        obj.sendSuccess = false
        obj.formatData = {
          msgType: 'order',
          templateData: obj,
          isSeller: true,
          sendTime: new Date().getTime(),
          avatar: 'https://ae01.alicdn.com/kf/HTB1_NJNKwHqK1RjSZFk760.WFXa5.png'
        }
        this.msgList.push(obj)
        this.resetScroll()
        this.sendMessage(obj, content)
        return
      }
      if (type === 'txt') {
        // 发送文本为空不处理
        if (!content.txt.trim()) {
          return
        }
        obj = {}
        obj.textLoading = true
        obj.sendSuccess = false
        obj.formatData = {
          msgType: 'txt',
          txt: content.txt || '',
          templateData: {
            translateTxt: ''
          },
          isSeller: true,
          sendTime: new Date().getTime(),
          avatar: 'https://ae01.alicdn.com/kf/HTB1_NJNKwHqK1RjSZFk760.WFXa5.png'
        }
        // 清空输入区域
        if (type === 'txt') {
          this.content = ''
        }
        this.msgList.push(obj)
        this.resetScroll()
        this.sendMessage(obj, content)
        return
      }
      if (type === 'sticker') {
        obj = {}
        obj.textLoading = true
        obj.sendSuccess = false
        obj.formatData = {
          msgType: 'emoji',
          txt: `[${ content.name }]`,
          templateData: {
            translateTxt: ''
          },
          emojiUrl: content.address,
          url: `http://ae01.alicdn.com/kf/${ content.value }`,
          isSeller: true,
          sendTime: new Date().getTime(),
          avatar: 'https://ae01.alicdn.com/kf/HTB1_NJNKwHqK1RjSZFk760.WFXa5.png'
        }
        let sendContent = {
          txt: `[${ content.name }]`,
          imgUrl: content.imgUrl,
          smallImgUrl: content.smallImgUrl
        }
        this.msgList.push(obj)
        this.resetScroll()
        this.sendMessage(obj, sendContent)
      }
    },
    // 选择图片成功后执行
    imgSuccess(content) {
      this.uploadBaseObj = { content: {} }
      this.resetScroll()
      // 保存上传成功的图片信息 防止发送消息失败
      this.oldPicInfo = this._.cloneDeep(content)
      this.sendConfirmOption = {
        open: true,
        obj: this.msgList[this.msgList.length - 1],
        content
      }
    },
    uploadImgError(obj) {
      this.msgList = this._.differenceWith(this.msgList, [obj], this._.isEqual)
      this.$message.error('图片发送失败')
    },
    // cancelSendPicture() {
    //   this.msgList.pop()
    // },
    // 议价下方展示 接受、拒绝、取消状态
    set_bargaining_status(val, obj) {
      this.$set(obj, 'show_bargaining_status', val)
    },
    // 议价上方产品信息
    set_bargaining_product(val, obj) {
      this.$set(obj, 'showProductObj', val)
    },
    sendMessage(obj, content) {
      // 文本
      let templateId = 1
      // 发送产品信息
      if (obj.formatData.msgType === 'product') {
        templateId = 10006
      }
      // 发送优惠券
      if (obj.formatData.msgType === 'coupon') {
        templateId = 10008
      }
      // 发送订单
      if (obj.formatData.msgType === 'order') {
        templateId = 10007
      }
      // 发送图片
      if (obj.formatData.msgType === 'image') {
        templateId = 3
      }
      // 发送表情
      if (obj.formatData.msgType === 'emoji') {
        templateId = 4
      }
      // 发送关注信息
      if (obj.formatData.msgType === 'follow') {
        templateId = 10010
      }
      const cloneData = this._.cloneDeep(this.chatParams)
      const params = {
        account_id: cloneData.account_id,
        sessionViewId: cloneData.sessionViewId,
        content: JSON.stringify(content),
        not_show_message: true,
        templateId
      }
      apiSendMessage(params).then((res) => {
        this.resetScroll()
        const findHasMsg = this._.filter(this.msgList, v => {
          return v.mid === res.data.data.messageId
        })
        if (findHasMsg.length > 0) {
          obj.sendSuccess = false
        } else {
          obj.mid = res.data.data.messageId
          obj.sendSuccess = true
        }
        obj.textLoading = false
      }).catch(() => {
        this.msgList.pop()
        setTimeout(() => {
          obj.sendSuccess = false
          obj.textLoading = false
        }, 200)
      })
    }
    ,
    resetScroll() {
      setTimeout(() => {
        const el = this.$refs['msg-box-ul']
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      }, 400)
    }
    ,
    checkBottom() {
      const el = this.$refs['msg-box-ul']
      const isBottom = Math.abs(el.scrollTop + el.offsetHeight - el.scrollHeight) < 200
      return isBottom
    }
    ,
    // 换行
    lineFeed() {
      if (this.content.length < 3998) {
        this.content += '\n'
        this.$nextTick(() => {
          document.querySelector('.el-textarea__inner').scrollTop = 100000
        })
      }
    },
    getChatMessage(forceToBottom, offset) {
      if (!this.intervalRead && !this.loadingShow) {
        this.loading = true
      }
      const obj = this._.cloneDeep(this.chatParams)
      // obj.data.limit = this.msg_limit + ''
      if (offset) {
        obj.startTime = offset
      }
      // 存储当前聊天第一个li，用于加载消息后设置滚动位置
      const ele = this.$refs['msg-box-ul']
      let topEl = ''
      if (offset && ele) {
        topEl = ele.querySelector('li')
      }
      apiFetchmessage(obj).then((res) => {
        const list = res.data.data.result
        const isBottom = this.checkBottom()
        // 粘贴事件监听
        this.$nextTick(() => {
          const el = document.querySelector(`.talk-box-${ this.talkBoxKey }`)
          el.addEventListener('paste', this.getPastData)
        })
        this.requested = true
        this.loadingShow = false
        setTimeout(() => {
          this.loading = false
        }, 400)
        // 滚动条在最下面 || 不是定时请求，滚动条到底部
        if (isBottom || forceToBottom) {
          this.resetScroll()
        }
        // 在向上滑动的情况下  请求的数据不是50的整数就说明没数据了
        if (offset) {
          this.isNoMsg = list.length < 50
        }
        if (list.length) {

          //保存当前请求的数据列表
          let newData = list.reverse()
          // 如果有未读消息置为已读
          // if (Number(res.data.lastMessage.sessionData.nonReadNumber) > 0) {
          //   this.readMessage(res.data.lastMessage)
          // }

          // 数据结构处理
          newData = this.formatMsgList(newData, this.baseObj.otherInfo.sellerId)

          // 判断是否为当前打开的会话处理消息列表
          if (this.baseObj.sessionId === list[0].body.typeData.sid) {
            // 防止发送过程自动刷新，合并去重, 按照时间排序
            // this.msgList = (this._.uniqBy(this._.unionWith(newData, this.msgList, this._.isEqual), 'mid') || [])
            const list = (this._.uniqBy(this._.unionWith(newData, this.msgList, this._.isEqual), 'mid') || []).sort((a, b) => a.sendTime - b.sendTime)
            list.forEach((v, ind) => {
              v.showSystemErr = formatSystemTip(list, ind + 1, v)
            })
            this.msgList = (this._.uniqBy(this._.unionWith(this.msgList, list, this._.isEqual), 'mid') || [])
            // 是否存在需要重新调接口的图片消息
            this.msgList.forEach(v => {
              if (v.formatData.msgType === 'image' && !v.formatData.imgUrl) {
                // 调用接口请求当前图片
                getImageUrl({ not_show_message: true, objectKey: v.formatData.templateData.osskey, account_id: this.baseObj.activeAccountInfo.account_id }).then(res => {
                  v.formatData.imgUrl = res.data.downloadUrl
                  v.formatData.imgUrl = ''
                  this.$nextTick(() => {
                    v.formatData.imgUrl = res.data.downloadUrl
                  })
                })
              }
            })
            this.$forceUpdate()

            // 跟据下一条消息是否为系统提示类型 本消息是否为卖家消息区分是否显示未发送成功图标
            function formatSystemTip(arr, ind, target) {
              // 如果存在下一条消息
              if (arr[ind]) {
                // 本条消息为卖家消息 下一条消息为卖家消息且为系统提示 显示未发送成功
                return (target.formatData.isSeller && arr[ind].formatData.isSeller && (arr[ind].formatData.msgType === 'systemTip'))
              }
              return false
            }

            if (offset) {
              this.$nextTick(() => {
                this.$refs['msg-box-ul'].scrollTop = topEl && (topEl.offsetTop) - 20
              })
            }
          }
        }
      }).catch((err) => {
        // this.msgList = []
        this.$message.error(err)
        this.loadingShow = false
        setTimeout(() => {
          this.loading = false
        }, 400)
      })
    }
    ,
    formatMsgList(list, sellerId) {
      // 重新组装数据格式
      list.forEach((v, ind) => {
        v.formatData = {}
        v.formatData.txt = JSON.parse(v.body.templateData).txt || ''
        v.formatData.translateTxt = JSON.parse(v.body.templateInfo).translateTxt || ''
        v.formatData.sendTime = Number(v.body.typeData.sendTime)
        v.formatData.avatar = 'https://ae01.alicdn.com/kf/HTB1_NJNKwHqK1RjSZFk760.WFXa5.png'
        v.formatData.isSeller = Number(sellerId) === Number(v.body.typeData.from)
        v.formatData.msgType = formatType(v.body.typeData.tempId)
        v.formatData.emojiUrl = formatEmoji(v)
        v.formatData.templateData = JSON.parse(v.body.templateData)
        v.formatData.imgUrl = JSON.parse(v.body.templateData).imgUrl || ''
        v.sendTime = v.formatData.msgType === 'systemTip' ? Number(v.body.typeData.sendTime) + 1 : Number(v.body.typeData.sendTime)
        v.mid = v.body.typeData.mid
        v.sendSuccess = true
      })
      return list

      // 区分消息类型
      function formatType(origin) {
        // 10015 自动回复 10010关注店铺
        if (origin === '10007') {
          return 'order'
        } else if (origin === '10008') {
          return 'coupon'
        } else if (origin === '10006') {
          return 'product'
        } else if (origin === '3') {
          return 'image'
        } else if (origin === '10015') {
          return 'auto_reply'
        } else if (origin === '2') {
          return 'systemTip'
        } else if (origin === '4') {
          return 'emoji'
        } else if (origin === '10010') {
          return 'follow'
        } else {
          return 'txt'
        }
      }

      // 匹配对应表情
      function formatEmoji(origin) {
        if (formatType(origin.body.typeData.tempId) === 'emoji') {
          const sign = JSON.parse(origin.body.templateData).txt || ''
          const emoji = sign.toLowerCase().replace(/[\[\]\s+]/ig, '')
          return findEmoji(emoji)
        }
        return ''
      }
    },
    // 转换 base64 为 file类型
    dataURItoBlob(base64Data) {
      let byteString
      if (base64Data.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(base64Data.split(',')[1])
      } else {
        byteString = unescape(base64Data.split(',')[1])
      }
      var mimeString = base64Data
        .split(',')[0]
        .split(':')[1]
        .split(';')[0]
      var ia = new Uint8Array(byteString.length)
      this._.forEach(byteString, (v, i) => {
        ia[i] = byteString.charCodeAt(i)
      })
      const blob = new Blob([ia], { type: mimeString })
      const type = base64Data.substring(base64Data.indexOf(':') + 1, base64Data.indexOf(';'))
      return new window.File([blob], Math.random() + '', { type })
    },
    getPastData(e) {
      const that = this
      var cbd = e.clipboardData
      // 没有数据
      if (!(e.clipboardData && e.clipboardData.items)) {
        return
      }
      for (var i = 0; i < cbd.items.length; i++) {
        var item = cbd.items[i]
        if (item.kind === 'file') {
          var blob = item.getAsFile()
          if (blob.size === 0) {
            return
          }
          // 插入图片记录
          var reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onload = function(data) {
            const fileData = that.dataURItoBlob(data.target.result)
            that.readyUploadPic(fileData)
          }
        }
      }
    }
    ,
    initData() {
      this.isNoMsg = false
      this.requested = false
      this.msgList = []
      this.activeProductObj = {}
      this.content = ''
    }
    ,
    showSlide(type) {
      if (this.slideShow === type) {
        this.slideShow = ''
      } else {
        this.slideShow = type
      }
    }
    ,
    hideSlide() {
      this.slideShow = ''
    }
    ,
    triggerOrderShow() {
      this.orderBoxShow = !this.orderBoxShow
    },
    openProductDetail(url) {
      window.open(url)
    },
    readMessage(data) {
      const cloneData = this._.cloneDeep(this.chatParams)
      const params = {
        cookie: cloneData.cookie,
        uri: cloneData.uri,
        sessionViewId: cloneData.sessionViewId,
        to_user_id: this.baseObj.target.targetId,
        not_show_message: true
      }
      apiReadMessage(params).then(() => {
        this.$emit('emit-readMsg', data.sessionId)
      })
    }
  },
  watch: {
    chatParams: {
      handler(val) {
        this.productOption = this.baseObj.activeAccountInfo
        // 不是定时请求的时候才重置数据
        if (!this.intervalRead || JSON.stringify(val) === '{}') {
          this.slideShow = ''
          this.initData()
        }
        if (JSON.stringify(val) !== '{}') {
          this.getChatMessage(!this.intervalRead)

          // 当前用户的星标颜色
          // this.customStar = this.baseObj.starColor
          // this.$refs['custom-star'].style.color = this.starColorList[this.customStar]
        }
      }
    },
    slideShow(val) {
      if (val === 'fastReply') {
        this.getReply()
      }
    }
  }
  ,
  destroyed() {
    window.removeEventListener('mousewheel', this.checkWheel, false)
    const el = this.$refs['msg-box-ul']
    if (el) {
      el.removeEventListener('scroll', this.checkScroll, false)
    }
    const slideEl = this.$refs['slide-tool']
    if (slideEl) {
      el.removeEventListener('scroll', this.checkScroll, false)
    }
    const talkEl = document.querySelector(`.talk-box-${ this.talkBoxKey }`)
    if (talkEl) {
      talkEl.removeEventListener('paste', this.getPastData)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

.star-item {
  padding: 2px 0;

  svg.left {
    margin-right: 15px;
  }

  svg.right {
    float: right;
    color: red;
  }

  cursor: pointer;
}

.seller-color {
  background: #e3f0ff;
}

.custom-color {
  background: #fff;
}

/* 产品信息css */
.product-box {
  border-radius: 4px;
  width: 265px;
  height: 135px;
  padding: 5px;
  box-sizing: border-box;

  .product-card {
    text-align: left;
    cursor: pointer;
    width: 255px;
    height: 125px;
    background: #fff;

    .bottom-discount {
      display: flex;
      justify-content: space-between;

      div {
        font-size: 12px;
        line-height: 12px;
        color: #999;
      }
    }

    .card-header {
      height: 30px;
      line-height: 30px;
      font-size: 12px;
      color: #3a434d;
      border-bottom: 1px solid #d5d5d5;
    }

    .card-content {
      margin-top: 9px;
      margin-bottom: 9px;
      width: 100%;
      display: flex;

      .left-content {
        flex-shrink: 0;
        border: 0 solid #e6e7eb;
        width: 62px;
        height: 62px;
        margin-right: 8px;
      }

      .right-content {
        flex: 1 1;
        flex-shrink: 0;
        line-height: 20px;
        overflow: hidden;
        flex-wrap: wrap;

        .show-title {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          word-break: break-all;
          max-height: 30px;
          font-size: 12px;
          line-height: 14px;
          color: #3a434d;
        }

        .show-price {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 5px;
          font-size: 16px;
          color: #ff3d00;
          font-weight: 500;
        }
      }
    }
  }
}

/* 折扣劵css */
.coupon-box {
  width: 265px;
  text-align: left;
  padding: 5px;
  border-radius: 4px;
  /*background-color: #e3f0ff;*/
  .coupon-card {
    display: flex;
    flex-direction: column;
    width: 255px;
    box-sizing: border-box;
    font-size: 12px;
    color: #3a434d;
    background: #fff;

    .card-top {
      color: #fff;
      width: 100%;
      background: url(https://sg-live-02.slatic.net/original/39b91780e2dad9b1066ad7e51519b9cd.jpg) no-repeat;
      background-size: 100% 100%;
      height: 109px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      flex: 1 1;

      .coupon-title {
        display: flex;
        height: 20px;
        line-height: 20px;

        .left-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-image: url(https://laz-img-cdn.alicdn.com/tfs/TB1TeV9oiAnBKNjSZFvXXaTKXXa-128-128.jpg);
          background-repeat: no-repeat;
          background-size: contain;
          margin-right: 5px;
        }
      }

      .coupon-discount {
        margin-top: 5px;
        margin-bottom: 4px;
        height: 32px;
        font-size: 13px;
        line-height: 14px;
      }

      .promotion {
        width: 100%;
        color: #823102;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 22px;

        .collect {
          height: 24px;
          line-height: 24px;
          width: 65px;
          text-align: center;
          font-size: 12px;
          color: #fff;
          background-image: linear-gradient(90deg, #ff8763, #ff330c);
          border-radius: 2px;
          cursor: pointer;
          border: 0px;
          outline: none;
        }
      }
    }

    .card-bottom {
      background: #ffba27;
      position: relative;
      height: 30px;
      /*overflow: visible;*/
      display: flex;
      padding: 0 10px;
      -moz-border-radius-topleft: 16px;
      -moz-border-radius-topright: 16px;

      .active-time::before {
        content: " ";
        display: table;
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #fff;
        left: -8px;
        top: -8px;
      }

      .active-time::after {
        content: " ";
        display: table;
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #fff;
        right: -8px;
        top: -8px;
        clear: both;
      }

      .active-time {
        margin-top: 8px;
        font-size: 12px;
      }
    }
  }
}

/* 订单消息css */
.order-box {
  cursor: pointer;
  text-align: left;
  width: 265px;
  padding: 5px;
  box-sizing: border-box;
  font-size: 12px;
  background: #f9f9f9;

  .order-card {
    background-color: #fff;
    box-sizing: border-box;
    padding: 0 10px;

    .card-header {
      height: 30px;
      line-height: 30px;
      border-bottom: 1px solid #d5d5d5;
    }

    .card-content {
      margin-top: 9px;
      width: 100%;
      display: flex;

      .left-content {
        flex-shrink: 0;
        width: 62px;
        height: 62px;
        margin-right: 8px;
      }

      .right-content {
        vertical-align: baseline;

        .two-line {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          word-break: break-all;
        }
      }
    }
  }
}

.chat-right-wrap {
  height: 100%;
  display: flex;
}

.chat-box {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid #d3dce6;

  .top {
    padding: 5px 0;
    text-align: center;
    background: #cccccc;
  }

  .logo {
    margin-top: -12px;
    height: 50px;
    width: 40px;
  }

  .msg-box {
    padding-bottom: 40px;

    .triangle {
      line-height: 30px;
      display: flex;
      justify-content: space-between;
      min-height: 30px;
      padding: 0 40px;

      div.el-popover__reference {
        svg {
          font-size: 17px;
        }
      }

      div.custom-country {

      }
    }

    position: relative;
    height: calc(100% - 188px);
    font-size: 14px;

    .loading-wrap {
      font-size: 16px;
      padding: 2px 0;
      text-align: center;
    }

    .active-product {
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 999;
    }

    ul {
      padding: 0 20px;
      height: 100%;
      margin: 0;
      overflow-y: auto;
    }

    .system-tip {
      font-size: 14px;
      color: #9299a2;
      word-break: break-word;
      text-align: center;
      line-height: 20px;
      box-sizing: border-box;
      margin: 0 auto 16px;
    }

    li {
      margin-top: 10px;
      overflow: hidden;
      list-style: none;

      .avatar {
        vertical-align: top;
        height: 40px;
        width: 40px;
        border-radius: 50%;
      }

      .item-content {
        max-width: 75%;

        a {
          text-decoration: underline;
          color: green;
        }

        .text-wrap {
          border-radius: 4px;
          padding: 10px;
          text-align: left;
        }

        pre {
          display: block;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 20px;
          font-family: "微软雅黑";
        }

        .img-box {
          .img-loading {
            max-width: 300px;
            border: 1px solid #cccccc;
            cursor: pointer;
          }

          img {
            max-width: 300px;
            border: 1px solid #cccccc;
            cursor: pointer;
          }
        }

        .sticker-box {
          img {
            max-width: 160px;
          }
        }

        .translate-btn {
          cursor: pointer;
          text-decoration: underline;
        }

        .auto-reply {
          .action-item {
            margin-bottom: 5px;

            a {
              color: #fafad2;
              cursor: pointer;
              text-decoration: none;
            }
          }
        }
      }

      // 别人的消息
      &.otherMsg {
        .avatar, .item-content {
          float: left;
        }

        .item-content {
          padding-left: 20px;
          padding-right: 20px;
          position: relative;
          text-align: left;

          pre {
            text-align: left;
          }
        }

        .text-wrap {
          background: #f4f4f4;
        }

        i {
          height: 16px;
          width: 16px;
          position: absolute;
          right: 0;
          top: 0;
          bottom: 10px;
          margin: auto 0;
        }
      }

      // 自己的消息
      &.ownMsg {
        .avatar, .item-content {
          float: right;
        }

        .item-content {
          overflow: hidden;
          position: relative;
          padding-left: 30px;
          padding-right: 20px;
          text-align: right;

          pre {
            color: #fff;
            text-align: left;
          }
        }

        .text-wrap {
          background: rgb(81, 180, 255);
        }

        i {
          height: 16px;
          width: 16px;
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          margin: auto 0;
        }
      }

      .item-btm-wrap {
        text-align: center;
        padding-bottom: 5px;

        .item-btm {
          display: inline-block;
          padding: 0 1.285em;
          background-color: rgba(0, 0, 0, .2);
          border-radius: 2px;
          color: #fff;
          text-align: center;
          line-height: 30px;
          max-width: 2300px;
          margin: 0 auto;
        }
      }
    }
  }

  .talk-box {
    width: 100%;
    height: 188px;
    border-top: 1px solid #cccccc;
    position: relative;
    z-index: 99;

    .send-btm {
      padding: 10px 20px;
      width: 100%;
      text-align: right;
      background: #fff;

      & > span {
        margin-right: 20px;
        line-height: 28px;
        display: inline-block;
        color: #666;
        font-size: 14px;
      }
    }

    .tool-box {
      height: 45px;
      padding: 10px 0 0;
      background: #fff;

      .svg-icon {
        font-size: 20px;
        color: #ff6700;
        cursor: pointer;
      }

      .item {
        margin-left: 20px;
      }
    }

    .slide-tool {
      position: absolute;
      background: #fff;
      left: 0;
      width: 100%;
      transition: -webkit-transform 366ms ease-in-out;
      transition: all 366ms ease-in-out;
      /* transition: transform 366ms ease-in-out,-webkit-transform 366ms ease-in-out; */
      border-top: .07em solid rgba(0, 0, 0, .05);
      z-index: -1;
      top: 0;

      &.active {
        transform: translateY(-100%)
      }
    }
  }
}
</style>
<style rel="stylesheet/scss" lang="scss">
.talk-input {
  textarea {
    border: none;
  }
}
</style>
