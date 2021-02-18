<template>
  <!-- 聊天窗口右侧订单列表 -->
  <div class="order-page is-set-scroll" ref="order-page">
    <div v-if="showFollow" style="text-align: right;padding:5px;"><el-button type="text" @click="addFollowMessage">Ask To Follow</el-button></div>
    <el-tabs
      v-model="activeName"
      :stretch="true"
    >
      <el-tab-pane label="Customer" name="order">
        <order-card :chat-params="chatParams" :interval-read="intervalRead" @sendOrder="sendMsg"></order-card>
      </el-tab-pane>
      <el-tab-pane label="Product" name="product">
        <div class="search">
          <el-select v-model="productSearchType" style="width:45%;margin-right:-8px;border:none;" size="mini">
            <el-option label="Product Name" value="title"></el-option>
            <el-option label="Seller Sku" value="seller_sku"></el-option>
            <el-option label="Shop Sku" value="shop_sku"></el-option>
          </el-select>
          <el-input align="right" style="width:50%;" size="mini" v-model="productSearch" @keyup.enter.native="searchProduct"></el-input>
          <i class="el-icon-search" style="font-size:16px;" @click="searchProduct"></i>
        </div>
        <div>
          <div class="product" v-show="productList.length">
            <div class="product-item" v-for="(item,index) in productList" :key="index">
              <div class="item-info">
                <div class="info-left" :style="{ 'background-image': `url(${item.images[0].value})` }"></div>
                <div class="info-right">
                  <div class="item-label" style="font-size: 14px;">{{ (item.title.value).slice(0, 23) }}...</div>
                  <div style="font-size:12px;margin-top:3px;display: flex;justify-content: space-between;">
                    <span>{{ item.sellerSku.value }}</span>
                    <span>×{{ item.stock[0].value }}</span>
                  </div>
                  <div class="item-price">{{ `${ Number(item.salePrice.value).toFixed(2) } ${ currencyCode }` }}</div>
                </div>
              </div>
              <div class="item-bottom">
                <button class="btn-detail" @click="openNewPage(item.title.url,'fullPath')">Details</button>
                <button class="btn-send" @click="sendMsg(item,'product')">Send</button>
              </div>
            </div>
          </div>
          <div class="nothing-tip" v-show="!productList.length && !productListLoading">无产品</div>
          <div v-show="productListLoading" class="load-more"><i class="el-icon-loading"></i></div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Voucher" name="coupon">
        <el-tabs v-model="activeVoucher" @tab-click="handleClick">
          <el-tab-pane label="Campaign" name="active">
            <div v-loading="couponListLoading">
              <div class="coupon" v-show="activeVoucherList.length">
                <div v-for="(item, index) in activeVoucherList" :key="index" class="coupon-item">
                  <div class="item-info">
                    <div class="info-left"></div>
                    <div class="info-right">
                      <div class="info-label"><span>- {{ item.discount }}</span></div>
                      <div class="info-name"><span>{{ item.promotionName }}</span></div>
                      <div class="info-date"><span>{{ formatDateShow(Number(item.startDate)) }} - {{ formatDateShow(Number(item.endDate)) }}</span></div>
                    </div>
                  </div>
                  <div class="item-bottom">
                    <div class="bottom-left">SHOP</div>
                    <div>
                      <span style="color:#0898ff;margin-left:80px;font-size:14px;">Collective Voucher</span>
                      <button class="bottom-right" @click="sendMsg(item,'activeCoupon')">send</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="nothing-tip" v-show="!activeVoucherList.length">无优惠券</div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Collectable" name="shop">
            <div v-loading="couponListLoading">
              <div class="coupon" v-show="shopCouponList.length">
                <div v-for="(item, index) in shopCouponList" :key="index" class="coupon-item">
                  <div class="item-info">
                    <div class="info-left"></div>
                    <div class="info-right">
                      <div class="info-label"><span>- {{ item.discount }}</span></div>
                      <div class="info-name"><span>{{ item.promotionName }}</span></div>
                      <div class="info-date"><span>{{ formatDateShow(Number(item.startDate)) }} - {{ formatDateShow(Number(item.endDate)) }}</span></div>
                    </div>
                  </div>
                  <div class="item-bottom">
                    <div class="bottom-left">SHOP</div>
                    <div>
                      <span style="color:#0898ff;margin-left:80px;font-size:14px;">Collective Voucher</span>
                      <button class="bottom-right" @click="sendMsg(item,'shopCoupon')">send</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="nothing-tip" v-show="!shopCouponList.length">无优惠券</div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
    <!--    <note-dialog v-bind.sync="noteDialog" @refreshOrderList="refreshOrder"></note-dialog>-->
  </div>
</template>

<script>
import { currencyBySiteMap } from '@/utils/statusMap'
import orderCard from '@/views/chat/components/orderBox/orderCard'
// import noteDialog from './orderBox/noteDialog'
import { getActiveCouponList, getProductList, getOrderList, getShopCouponList, getBuyerProfile } from '@/api/chat'
import { mapGetters } from 'vuex'

export default {
  name: 'OrderPage',
  components: { orderCard },
  props: {
    chatParams: {
      type: Object,
      default: () => {
      }
    },
    intervalRead: Boolean
  },
  data() {
    return {
      followInfo: {},
      showFollow: false,
      activeVoucher: 'active',
      moreActiveVoucher: false,
      moreShopVoucher: false,
      currencyCode: '',
      productParams: {
        page: 1
      },
      activeCouponParams: {
        page: 1
      },
      shopCouponParams: {
        page: 1
      },
      productSearchType: 'title',
      activeName: 'order',
      activeVoucherList: [],
      shopCouponList: [],
      productList: [],
      orderListData: [],
      productSearch: '',
      productListLoading: true,
      couponListLoading: true,
      moreProduct: false,
      productPage: 1
      // noteDialog: {
      //   open: false,
      //   orderInfo: {}
      // }
    }
  },
  computed: {
    ...mapGetters([
      'baseObj'
    ]),
    // 货币单位
    currency() {
      if (this.siteCode) {
        return currencyBySiteMap[this.siteCode]
      } else {
        return ''
      }
    }
  },
  methods: {
    // 获取买家关注信息
    getBuyerFollow() {
      getBuyerProfile({
        account_id: this.baseObj.activeAccountInfo.account_id,
        buyerUserId: this.baseObj.target.targetId,
        not_show_message: true
      }).then(res => {
        this.showFollow = res.data.followInfo.isFollow === 'false'
        this.followInfo = res.data.followInfo
      })
    },
    // 给买家发送关注消息
    addFollowMessage() {
      const obj = {
        sellerId: this.baseObj.activeAccountInfo.seller_id,
        sellerUserId: this.baseObj.activeAccountInfo.platform_account_id,
        targetUserId: this.baseObj.target.targetId,
        cardType: 10010,
        title: this.followInfo.title,
        desc: this.followInfo.desc,// 店铺名称
        iconUrl: this.followInfo.iconUrl,// 店铺logo url地址
        mallIconUrl: '',
        shopId: this.followInfo.shopId, //店铺ID
        action: 'followCard_follow', // 固定值
        actionUrl: 'mtop.lazada.lsms.im.card.action.buyer' // 固定值
      }
      this.$emit('emit-send-order', obj, 'follow')
    },
    isParent(obj, parentObj) {
      while (obj !== undefined && obj !== null && obj.tagName && obj.tagName.toUpperCase() !== 'BODY') {
        if (obj === parentObj) {
          return true
        }
        obj = obj.parentNode
      }
      return false
    },
    checkWheel(el) {
      const parentEl = this.$refs['order-page']
      const isParent = this.isParent(el.target, parentEl)
      // 向下滚动 && 距离底部500以内 && 在右侧产品列表滚动 && 产品列表没有loading && 产品列表有更多数据
      if (el.wheelDelta < 0 && ((parentEl.scrollTop + parentEl.offsetHeight) >= parentEl.scrollHeight) && isParent && !this.productListLoading && this.moreProduct) {
        if (this.moreProduct) {
          this.loadMore()
        }
      }
    },
    checkWheelActiveVoucher(el) {
      const parentEl = this.$refs['order-page']
      const isParent = this.isParent(el.target, parentEl)
      // 向下滚动 && 距离底部500以内 && 在右侧产品列表滚动 && 活动优惠券没有loading && 活动优惠券有更多数据
      if (el.wheelDelta < 0 && ((parentEl.scrollTop + parentEl.offsetHeight) >= parentEl.scrollHeight) && isParent && !this.couponListLoading && this.moreActiveVoucher) {
        this.activeCouponParams.page++
        this.getActiveCoupon(this.activeCouponParams,'loadmore')
      }
    },
    checkWheelShopVoucher(el) {
      const parentEl = this.$refs['order-page']
      const isParent = this.isParent(el.target, parentEl)
      // 向下滚动 && 距离底部500以内 && 在右侧产品列表滚动 && 店铺优惠券列表没有loading && 店铺优惠券有更多数据
      if (el.wheelDelta < 0 && ((parentEl.scrollTop + parentEl.offsetHeight) >= parentEl.scrollHeight) && isParent && !this.couponListLoading && this.moreShopVoucher) {
        this.shopCouponParams.page++
        this.getShopCoupon(this.shopCouponParams,'loadmore')
      }
    },
    handleClick(val) {
      if (val.name === 'first') {
        this.couponListLoading = true
        // this.activeVoucherList = []
        this.getActiveCoupon(this.activeCouponParams)
      } else {
        this.couponListLoading = true
        // this.shopCouponList = []
        this.shopCouponParams.voucher_type = val.name
        this.shopCouponParams.account_id = this.baseObj.activeAccountInfo.account_id
        this.shopCouponParams.not_show_message = true
        this.getShopCoupon(this.shopCouponParams)
      }
    },
    // 获取店铺优惠券
    getShopCoupon(val,concat) {
      if (!this.intervalRead) {
        this.couponListLoading = true
      }
      getShopCouponList(val).then(res => {
        if (Array.isArray(res.data.result)) {
          if (concat) {
            this.shopCouponList = this.shopCouponList.concat(res.data.result)
          } else {
            this.shopCouponList = res.data.result
          }
          if (res.data.result.length === 10) {
            this.moreShopVoucher = true
          }
        }
      }).finally(() => {
        this.couponListLoading = false
      })
    },
    // 获取产品列表
    getProduct(val) {
      if (!this.intervalRead) {
        this.productListLoading = true
      }
      getProductList(val).then(res => {
        this.currencyCode = res.data.currency
        this.productList = []
        if (Array.isArray(res.data.result)) {
          this.productList = res.data.result
          if (res.data.result.length === 10) {
            this.moreProduct = true
          }
        }
      }).finally(() => {
        this.productListLoading = false
      })
    },
    // 获取优惠券列表
    getActiveCoupon(val,concat) {
      if (!this.intervalRead) {
        this.couponListLoading = true
      }
      getActiveCouponList(val).then(res => {
        this.couponListLoading = false
        if (Array.isArray(res.data.result)) {
          if (concat) {
            this.activeVoucherList = this.activeVoucherList.concat(res.data.result)
          } else {
            this.activeVoucherList = res.data.result
          }
          if (res.data.result.length === 10) {
            this.moreActiveVoucher = true
          }
        }
      }).finally(() => {
        this.couponListLoading = false
      })
    },
    // 产品搜索
    searchProduct(val) {
      let params = this._.cloneDeep(this.productParams)
      if (val && this.productSearch.trim()) {
        params[this.productSearchType] = this.productSearch.trim()
      }
      this.productList = []
      this.productListLoading = true
      this.getProduct(params)
    },
    // 缩回订单栏
    triggerOrderShow() {
      this.$emit('emit-triggerOrderShow')
    },
    // 产品加载更多
    loadMore() {
      this.moreProduct = false
      this.productParams.page++
      this.productListLoading = true
      getProductList(this.productParams).then(res => {
        this.productListLoading = false
        if (Array.isArray(res.data.result)) {
          this.productList = this.productList.concat(res.data.result)
          if (res.data.result.length === 10) {
            this.moreProduct = true
          }
        }
      })
    },
    // 发送订单、优惠券、产品类型消息
    sendMsg(data, type) {
      let obj = {}
      if (type === 'activeCoupon') {
        obj = this.formatActiveCoupon(data)
      }
      if (type === 'shopCoupon') {
        obj = this.formatShopCoupon(data)
      }
      if (type === 'product') {
        obj = this.formatProduct(data)
      }
      if (type === 'order') {
        obj = this.formatOrder(data)
      }
      this.$emit('emit-send-order', obj, type)
    },
    formatShopCoupon(item) {
      const obj = {
        promotionId: item.promotionId,
        voucherCode: item.voucherCode,
        promotionName: item.promotionName,
        createdAt: item.createdAt,
        startDate: item.startDate,
        endDate: item.endDate,
        promotionLevel: item.promotionLevel,
        voucherType: item.voucherType,
        showOnPDP: item.showOnPDP,
        status: item.status,
        slogan: item.slogan,
        shopUrl: item.shopUrl,
        discount: item.discount.split(' ')[0],
        actions: item.actions,
        editable: true,
        displayArea: 'Regular Channel',
        password: null,
        discountValue: item.discount.split(' ')[0],
        discountUnit: item.discount.split(' ')[1],
        sellerId: this.baseObj.activeAccountInfo.seller_id,
        cardType: 'SHOP',
        voucherId: item.promotionId,
        title: item.promotionName,
        desc: item.shopUrl,
        iconUrl: 'https://laz-img-cdn.alicdn.com/tfs/TB1TeV9oiAnBKNjSZFvXXaTKXXa-128-128.jpg',
        period: `${ this.formatDateShow(Number(item.startDate)) }-${ this.formatDateShow(Number(item.endDate)) }`
      }
      return obj
    },
    formatActiveCoupon(item) {
      const obj = {
        promotionId: item.promotionId,
        voucherCode: item.voucherCode,
        promotionName: item.promotionName,
        startDate: item.startDate,
        endDate: item.endDate,
        promotionLevel: item.promotionLevel,
        voucherType: item.voucherType,
        showOnPDP: item.showOnPDP,
        status: item.status,
        displayArea: item.displayArea,
        editable: item.editable,
        slogan: item.slogan,
        shopUrl: item.shopUrl,
        discount: item.discount.split(' ')[0],
        discountValue: item.discount.split(' ')[0],
        discountUnit: item.discount.split(' ')[1],
        sellerId: this.baseObj.activeAccountInfo.seller_id,
        cardType: 'SHOP',
        voucherId: item.promotionId,
        title: item.promotionName,
        desc: item.shopUrl,
        iconUrl: 'https://laz-img-cdn.alicdn.com/tfs/TB1TeV9oiAnBKNjSZFvXXaTKXXa-128-128.jpg',
        createdAt: null,
        period: `${ this.formatDateShow(Number(item.startDate)) }-${ this.formatDateShow(Number(item.endDate)) }`
      }
      return obj
    },
    formatProduct(item) {
      let obj = {
        'title': item.title.value,
        'price': `MYR${ Number(item.salePrice.value).toFixed(2) }`,
        'oldPrice': `MYR${ Number(item.price.value).toFixed(2) }`,
        'discount': `-${ ((item.price.value - item.salePrice.value) * 100 / item.price.value).toFixed(2) }%`,
        'iconUrl': item.images[0].value,
        'itemId': item.itemId,
        'actionUrl': item.title.url
      }
      return obj
    },
    formatOrder(item) {
      let obj = {
        url: item.url,
        title: item.id,
        status: item.status,
        orderId: Number(item.id),
        content: this.$moment(item.gmtCreatedTime).format('YYYY-MM-DD HH:mm'),
        iconUrl: item.orderItemList[0].imageUrl,
        productName: item.orderItemList[0].productName
      }
      return obj
    },
    // 恢复初始tab显示
    initData() {
      this.activeName = 'order'
      this.activeVoucher = 'active'
    },
    formatDateShow(num) {
      const year = new Date(num).getFullYear()
      const month = new Date(num).getMonth() + 1
      const date = new Date(num).getDate()
      return `${ month }/${ date }/${ year }`
    },
    openNewPage(url, fullPath) {
      let path = fullPath ? url : `https://sellercenter.lazada.com.${ this.baseObj.activeAccountInfo.site_code }${ url }`
      window.open(path, '_blank')
    }
  },
  watch: {
    chatParams: {
      deep: true,
      immediate: true,
      handler(val, oldval) {
        // 切换会话时恢复订单界面
        if (val && oldval && (val.sessionViewId !== oldval.sessionViewId)) {
          this.initData()
        }
        // 定义搜索参数
        this.productParams = {
          page: 1,
          account_id: this.baseObj.activeAccountInfo.account_id,
          not_show_message: true
        }
        this.activeCouponParams = {
          account_id: this.baseObj.activeAccountInfo.account_id,
          page: 1,
          not_show_message: true
        }

        // 不是定时请求重置数据并请求
        if (JSON.stringify(val) !== '{}' && !this.intervalRead) {
          this.getProduct(this.productParams)
          this.getActiveCoupon(this.activeCouponParams)
          // 是否可以发送求关注消息
          this.getBuyerFollow()
        }
        if (JSON.stringify(val) === '{}') {
          this.initData()
        }
      }
    },
    activeName(val) {
      // product列表页滚动时间
      if (val === 'product' && this.moreProduct) {
        window.addEventListener('mousewheel', this.checkWheel, false)
      }
      // 移除product列表页滚动事件
      if (val !== 'product') {
        window.removeEventListener('mousewheel', this.checkWheel)
      }
      if (val === 'coupon') {
        // 活动优惠券鼠标滚动事件添加、移除
        if (this.activeVoucher === 'active' && this.moreActiveVoucher) {
          window.addEventListener('mousewheel',this.checkWheelActiveVoucher,false)
        }
        if (this.activeVoucher !== 'active') {
          window.removeEventListener('mousewheel',this.checkWheelActiveVoucher)
        }
      }
    },
    activeVoucher(val) {
      // 优惠券二级tab切换鼠标滚动事件添加、移除
      if (val === 'active' && this.moreActiveVoucher) {
        window.addEventListener('mousewheel',this.checkWheelActiveVoucher,false)
      }
      if (val !== 'active') {
        window.removeEventListener('mousewheel',this.checkWheelActiveVoucher)
      }
      if (val === 'shop' && this.moreShopVoucher) {
        window.addEventListener('mousewheel',this.checkWheelShopVoucher,false)
      }
      if (val !== 'shop') {
        window.removeEventListener('mousewheel',this.checkWheelShopVoucher)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.load-more {
  text-align: center;
  color: #2e9cc3;
  cursor: pointer;
  padding: 20px 0;
}

.note-edit {
  color: #2e9cc3;
  cursor: pointer;
}

.search {
  border-bottom: 1px solid #e9e9e9;

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
    top: 5px;
    right: 9px;
    cursor: pointer;
  }
}

.nothing-tip {
  text-align: center;
  color: #666;
  margin-top: 15px;
}

.order-page {
  height: 100%;
  overflow: auto;
}

.coupon {
  .coupon-item {
    .item-info {
      display: flex;

      .info-left {
        background-image: url(https://laz-img-cdn.alicdn.com/tfs/TB1TeV9oiAnBKNjSZFvXXaTKXXa-128-128.jpg);
        border: 1px solid #e8e8e8;
        width: 64px;
        height: 64px;
        margin-left: 12px;
        background-position: 50%;
        background-size: cover;
        -ms-flex-negative: 0;
        flex-shrink: 0;
        margin-right: 12px;
      }

      .info-right {
        .info-label {
          font-size: 16px;
          color: #f96150;
          font-weight: 600;
        }

        .info-name {
          font-size: 12px;
        }

        .info-date {
          font-size: 10px;
          color: #878787;
          margin-top: 3px;
        }
      }
    }

    .item-bottom {
      //display: flex;
      //justify-content: flex-start;
      margin-top: 0;
      background: #eff2fa;
      height: 45px;

      .bottom-left {
        align-self: flex-start;
        width: 64px;
        text-align: center;
        color: #878787;
        font-size: 12px;
        letter-spacing: 0;
        border: 1px solid #e8e8e8;
        border-top: 0 solid #e8e8e8;
        height: 21px;
        line-height: 21px;
        background: #fff;
        margin-right: 12px;
        margin-left: 12px;
      }

      .bottom-right {
        background: rgb(8, 152, 255);
        position: absolute;
        right: 12px;
        color: #fff;
        border-radius: 4px;
        border: none;
        height: 20px;
        padding: 0 12px;
        font-size: 12px;
        line-height: 18px;
        outline: none;
        cursor: pointer;
      }
    }
  }
}

.product {
  .product-item {
    margin-bottom: 10px;

    .item-info {
      display: flex;

      .info-left {
        border: 1px solid #e8e8e8;
        width: 64px;
        height: 64px;
        margin-left: 12px;
        background-position: 50%;
        background-size: cover;
        flex-shrink: 0;
        margin-right: 12px;
      }

      .info-right {
        .item-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-price {
          font-size: 12px;
          font-weight: 700;
          margin-top: 4px;
        }
      }
    }

    .item-bottom {
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 20px;

      .btn-detail {
        margin: 0;
        height: 20px;
        padding: 0 12px;
        font-size: 12px;
        line-height: 18px;
        margin-right: 10px;
        border-radius: 4px;
        border: none;
        background: #eff5f7;
        color: #333;
        outline: none;
        cursor: pointer;
      }

      .btn-send {
        background: #ff3e3e;
        position: relative;
        color: #fff;
        border-radius: 4px;
        border: none;
        height: 20px;
        padding: 0 12px;
        font-size: 12px;
        line-height: 18px;
        outline: none;
        cursor: pointer;
      }
    }
  }
}

</style>
<style lang="scss">
.search {
  .el-select .el-input {
    input {
      border: none;
      border-radius: 0;
    }
  }

  .el-input {
    input {
      border: none;
      border-radius: 0;
      border-left: 1px solid #e9e9e9;
      padding-right: 30px;
    }
  }
}
</style>
