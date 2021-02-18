<template>
  <div class="product_card" v-loading="loading" element-loading-background="rgba(255, 255, 255, 1)">
    <img :src="productData.image" alt="">
    <div style="flex-grow: 1;">
      <p class="title">{{ productData.name }}</p>
      <div style="font-size: 12px">
        <del style="color:#bbb">{{ productData.show_original_prices }}</del>
        <span>{{ productData.show_actual_prices }}</span>
        <span style="color: #888">{{ productData.stock }}现货</span>
      </div>
    </div>
    <div class="right-box">
      <span class="hover-text" @click="openTheNewTAB(productData.mailUrl)">在商城查看</span>
      <span style="margin: 0 10px;">|</span>
      <span class="hover-text" @click="openTheNewTAB(productData.centreUrl)">在卖家中心查看</span>
    </div>
  </div>
</template>

<script>
  import { currencyBySiteMap } from '@/utils/statusMap'
  import { apiGetProductInfo } from '@/api/chat'
  export default {
    name: 'Sticker',

    data() {
      return {
        productData: {},
        loading: false,
        formated: false
      }
    },
    created() {
      console.log('product card')
    },
    props: {
      activeProductObj: {
        type: Object,
        default: () => {}
      }, // 传入此值则使用此值查询
      showProductObj: {
        type: Object,
        default: () => {}
      }, // 传入此值则使用此值为展示
      isRequest: Boolean, // 是否需要请求
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
      getProductInfo(data) {
        if (!this.formated) {
          this.loading = true
          this.formated = true
        }
        apiGetProductInfo(data).then(res => {
          this.loading = false
          this.productData = res.data
          this.formatShowData(this.activeProductObj)
        }).catch(() => {
          this.productData = {}
        })
      },
      formatShowData(obj) {
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
        const mailUrl = this.siteCode === 'tw' ? 'https://xiapi.xiapibuy.com' : obj.platform.replace('seller.', '')
        const centreUrl = this.siteCode === 'tw' ? 'https://seller.xiapi.shopee.cn' : obj.platform
        this.productData.mailUrl = `${mailUrl}/product/${obj.data.shop_id}/${obj.data.product_id}`
        this.productData.centreUrl = `${centreUrl}/portal/product/${obj.data.product_id}`
        this.cloneDeep('productData')
      }
    },
    watch: {
      activeProductObj: {
        deep: true,
        immediate: true,
        handler(val) {
          if (this.isRequest && JSON.stringify(val) !== '{}') {
            this.getProductInfo(val)
          }
          if (this.isRequest && JSON.stringify(val) === '{}') {
            this.productData = {}
          }
          if (!this.isRequest) {
            this.productData = this._.cloneDeep(this.showProductObj)
            this.formatShowData(this.productData)
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .product_card {
    height: 64px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: .75em;
    background-color: #f4f4f4;
    border-radius: 2px;
    margin-bottom: 10px;
    > div {
      width: calc(50% - 30px);
      margin-left: 30px;
    }
    img {
      width: 36px;
    }
    p {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 5px 0;
    }
    .hover-text {
      cursor: pointer;
      &:hover {
        color: #ff6700;
      }
    }
    .right-box {
      display: flex;
      flex-grow: 1;
    }
  }
</style>
