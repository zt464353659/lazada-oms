<template>
  <!-- 议价类型的消息 -->
  <div style="position: relative">
    <div class="bargaining_card" v-loading="loading" element-loading-background="rgba(255, 255, 255, 1)">
      <div class="card-top">
        <img :src="productData.image" alt="">
        <p>{{ productData.name }}</p>
      </div>
      <div class="card-content">
        <del>{{ productData.asking_price }}</del>
        <p>{{ productData.offer_price }} <span class="ft-18">{{ productData.products_count ? '× ' + productData.products_count : '' }}</span></p>
      </div>
      <div class="card-btm" v-if="productData.status === 'pending'">
        <div class="reject" @click="handlerOperate('rejected')">拒绝</div>
        <div class="confirm" @click="handlerOperate('accepted')">接受</div>
      </div>
      <div class="card-btm" v-else>
        <p>{{ productData.status | filterStatus }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  import { currencyBySiteMap } from '@/utils/statusMap'
  import { apiBargainInfo, apiGetProductInfo, apiSetBargain } from '@/api/chat'
  export default {
    name: 'Sticker',

    data() {
      return {
        loading: false,
        productData: {},
        formated: false // 是否加载过，用于判断是否展示loading
      }
    },
    props: {
      baseObj: {
        type: Object,
        default: () => {}
      },
      productOption: {
        type: Object,
        default: () => {}
      },
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
      }
    },
    methods: {
      cloneDeep(data) {
        const obj = this._.cloneDeep(this[data])
        this[data] = {}
        this[data] = obj
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
      // 获取议价信息
      getBargainInfo() {
        // 首次加载 loading
        if (!this.formated) {
          this.loading = true
          this.productData = {}
        }
        this.formated = true
        const cloneObj = this._.cloneDeep(this.baseObj)
        const obj = {
          platform: this.productOption.platform,
          authorization: this.productOption.authorization,
          data: {
            offer_id: cloneObj.content.offer_id,
            shop_id: cloneObj.content.shop_id,
            _uid: this.productOption.data._uid
          },
          not_show_message: true
        }
        apiBargainInfo(obj).then(res => {
          obj.data.product_id = res.data.product_id
          this.productData.offer_price = res.data.offer_price
          this.productData.asking_price = res.data.asking_price
          this.productData.products_count = res.data.products_count
          this.productData.status = res.data.status
          this.productData.id = res.data.id
          this.$emit('emit-bargaining_status', res.data.status, this.baseObj)
          // 加载过产品信息就不再加载了
          if (!this.productData.name) {
            this.getProductInfo(obj)
          }
          this.$forceUpdate()
        }).catch(() => {
          this.loading = false
          this.productData = {}
        })
      },
      // 获取产品信息
      getProductInfo(obj) {
        apiGetProductInfo(obj).then(res => {
          const { data } = res
          this.loading = false
          this.productData.name = data.name
          this.productData.image = data.image
          this.productData.actual_prices = data.actual_prices
          this.productData.original_prices = data.original_prices
          // 原价/现价 价格与价格区间展示
          if (this.productData.actual_prices[0] === this.productData.actual_prices[1]) {
            this.productData.show_actual_prices = `${this.currency}${this.productData.actual_prices[0]}`
          } else {
            this.productData.show_actual_prices = `${this.currency}${this.productData.actual_prices[0]} - ${this.productData.actual_prices[1]}`
          }
          if (this.productData.original_prices[0] === this.productData.original_prices[1]) {
            this.productData.show_original_prices = `${this.currency}${this.productData.original_prices[0]}`
          } else {
            this.productData.show_original_prices = `${this.currency}${this.productData.original_prices[0]} - ${this.productData.original_prices[1]}`
          }
          // 产品信息用于展示当前议价上方的商品
          data.platform = this.productOption.platform
          data.data = {}
          data.data.shop_id = this.productOption.data.shop_id
          data.data.product_id = obj.data.product_id
          this.$emit('emit-bargaining_product', data, this.baseObj)
        }).catch(() => {
          this.loading = false
          this.productData = {}
        })
      },
      // 接受 / 拒绝议价
      handlerOperate(status) {
        const data = this.createSubmitData(status)
        this.loading = true
        apiSetBargain(data).then(() => {
          this.formated = false
          this.getBargainInfo()
        }).catch(() => {
          this.loading = false
        })
      },
      createSubmitData(status) {
        const obj = {
          url: this.productOption.platform,
          offer_id: this.productData.id,
          shop_uid: this.productOption.data._uid,
          status,
          shop_id: this.productOption.data.shop_id,
          token: this.productOption.authorization.replace('Bearer ', ''),
          cookie: this.productOption.cookie,
          not_show_message: true
        }
        return obj
      }
    },
    watch: {
      productOption: {
        deep: true,
        immediate: true,
        handler(val) {
          if (JSON.stringify(val) !== '{}' && !this.formated) {
            this.getBargainInfo()
          }
          if (this.productData.status === 'pending') {
            this.getBargainInfo()
          }
        }
      }
    },
    filters: {
      filterStatus(val) {
        const statusMap = new Map([
          ['accepted', '出价已接受'],
          ['cancelled', '出价已取消'],
          ['rejected', '出价已拒绝']
        ])
        return statusMap.get(val)
      }
    }
  }
</script>

<style lang="scss" scoped>
.bargaining_card {
  width: 300px;
  height: 170px;
  background-color: #fff;
  border: .25em solid #f4f4f4;
  border-radius: 2px;
  .card-top {
    padding: 10px 20px 0;
    display: flex;
    img {
      height: 36px;
      width: 36px;
    }
    p {
      width: calc(100% - 45px);
      margin: 10px 0;
      margin-left: 8px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .card-content {
    del {
      display: block;
      margin-top: 10px;
      color: #b0b0b0;
    }
    p {
      font-size: 24px;
      margin: 2px 0;
    }
    text-align: center;
  }
  .card-btm {
    border-top: 1px solid #f2f2f2;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    > div {
      width: 50%;
      text-align: center;
      line-height: 50px;
      cursor: pointer;
    }
    .reject {
      border-right: 1px solid #f2f2f2;
    }
    .confirm {
      color: #ff6700;
    }
    p {
      color: #888;
    }
  }
}
</style>
