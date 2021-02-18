<template>
  <!-- 消息列表中由 右侧订单 发送链接的订单消息 -->
  <div style="position: relative">
    <div class="order-msg-card" @click="handleLink" v-loading="loading" element-loading-background="rgba(255, 255, 255, 1)">
      <div class="card-top" v-if="!isReqError">
        <img :src="orderData.image" alt="">
        <p>
          <span :style="{'color': '#01bfa5'}" class="item-status">{{ orderStatus.label }}</span>
          <br>
          {{ orderData.products_count }} 个商品, 总额 {{ currency }}{{ orderData.price_before_discount ? orderData.price_before_discount.toFixed(2) : '' }}
        </p>
      </div>
      <div v-if="isReqError" @click.stop="getOrderInfo('own')" style="margin-top:30px;text-align: center;color:blue;position:relative;z-index:2000">重新加载</div>
    </div>
  </div>
</template>

<script>
  import { currencyBySiteMap } from '@/utils/statusMap'
  import { apiGetOrderInfo } from '@/api/chat'
  export default {
    data() {
      return {
        loading: false,
        orderData: {},
        formated: false,
        isReqError: false,
        orderStatusList: [
          { label: '未付款', name: 'unpaid', color: '#000' },
          { label: '待出货', name: 'to_ship', color: '#4a90e2' },
          { label: '运送中', name: 'shipping', color: '#4a90e2' },
          { label: '已完成', name: 'completed', color: '#53d38a' },
          { label: '已取消', name: 'cancelled', color: '#b4b4b4' },
          { label: '退款', name: 'refund', color: '#9b9b9b' }
        ]
      }
    },
    props: {
      productOption: {
        type: Object,
        default: () => {}
      },
      baseObj: {
        type: Object,
        default: () => {}
      },
      intervalRead: Boolean,
      siteCode: {
        type: String,
        default: ''
      }
    },
    computed: {
      currency() {
        if (this.siteCode) {
          return currencyBySiteMap[this.siteCode]
        } else {
          return ''
        }
      },
      orderStatus() {
        const obj = {
          label: '',
          color: ''
        }
        this._.forEach(this.orderStatusList, (v) => {
          if (v.name === this.orderData.status) {
            obj.label = v.label
            obj.color = v.color
          }
        })
        return obj
      }
    },
    methods: {
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
      handleLink() {
        this.openTheNewTAB(`${this.productOption.platform}/portal/sale/${this.orderData.id}`)
      },
      // 获取订单信息
      getOrderInfo(own) {
        if (own) {
          this.formated = false
        }
        if (!this.formated) {
          this.formated = true
          this.loading = true
          const data = this.createOrderData()
          apiGetOrderInfo(data).then(res => {
            this.orderData = res.data
            this.loading = false
            this.isReqError = false
          }).catch(() => {
            this.loading = false
            this.isReqError = true
            this.orderData = {}
            this.formated = false
          })
        }
      },
      createOrderData() {
        const cloneData = this.productOption
        const obj = {
          platform: cloneData.platform,
          authorization: cloneData.authorization,
          data: {
            _uid: cloneData.data._uid,
            shop_id: cloneData.data.shop_id,
            product_id: this.baseObj.content.order_id
          },
          not_show_message: true
        }
        return obj
      }
    },
    watch: {
      baseObj: {
        deep: true,
        immediate: true,
        handler(val) {
          if (JSON.stringify(val) !== '{}') {
            this.getOrderInfo()
          }
        }
      }
    },
    filters: {
    }
  }
</script>

<style lang="scss" scoped>
  .order-msg-card {
    width: 260px;
    height: 88px;
    background-color: #fff;
    border: .25em solid #f4f4f4;
    border-radius: 2px;
    cursor: pointer;
    .card-top {
      padding: 10px 10px 0;
      display: flex;
      img {
        height: 56px;
        width: 56px;
      }
      p {
        width: calc(100% - 45px);
        margin: 12px 0;
        margin-left: 8px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: left;
      }
    }
    .item-status {
      line-height: 25px
    }
  }
</style>
