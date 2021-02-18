<template>
  <div class="product-page">
    <div class="product-search">
      <el-input size="mini" :disabled="listLoading" v-model="listQuery.data.keyword" @input="handelSearch" placeholder="Search"></el-input>
    </div>
    <div class="table-head">
      <div class="table-head-content">
        <div class="products-line">Products</div>
        <div class="price-line">Price</div>
        <div class="stock-line">Stock</div>
        <div class="sales-line">Sales</div>
        <div class="action-line">Action</div>
      </div>
    </div>
    <div class="mask" v-if="listLoading" v-loading="listLoading" element-loading-background="rgba(255, 255, 255, 1)"></div>
    <ul ref="products-table" class="products-table is-set-scroll">
      <li v-for="(item, index) in listData" :key="index">
        <div class="products-line"><img :src="item.image" alt=""><span @click="openTheNewTAB(item.product_url)">{{ item.name }}</span></div>
        <div class="price-line">
          <del style="display: block;color:#b0b0b0;margin-top:5px">{{ item.showBeforePrice }}</del>
          <p style="margin:5px 0 0">{{ item.showPrice }}</p>
        </div>
        <div class="stock-line">{{ item.stock }}</div>
        <div class="sales-line">{{ item.sold }}</div>
        <div class="action-line"><el-button type="primary" size="mini" @click="sendProduct(item)">send</el-button></div>
      </li>
      <div v-if="!listData.length" style="text-align:center; height: 100px;margin-top:10px;">暂无数据</div>
      <div v-if="loadingShow" class="loading-wrap"><i class="el-icon-loading"></i></div>
    </ul>
  </div>
</template>

<script>
  import { currencyBySiteMap } from '@/utils/statusMap'
  import { apiGetProductList } from '@/api/chat'
  export default {
    name: 'Products',

    data() {
      return {
        listData: [],
        pagination: null,
        listQuery: {
          platform: '',
          authorization: '',
          data: {
            page: 1,
            per_page: 50,
            shop_id: undefined,
            keyword: undefined,
            _uid: undefined
          },
          not_show_message: true
        },
        loadingShow: false,
        listLoading: false,
        noNewProduct: false,
        debounceRenderList: this._.debounce(() => {
          this.noNewProduct = false
          this.listData = []
          this.listQuery.data.page = 1
          this.listQuery.data.per_page = 50
          this.renderList()
        }, 1000)
      }
    },
    props: {
      productOption: {
        type: Object,
        default: () => {}
      },
      slideShow: {
        type: String,
        default: ''
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
    created() {
      this.addMouseWheel()
    },
    methods: {
      handelSearch() {
        this.debounceRenderList()
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
      addMouseWheel() {
        window.addEventListener('mousewheel', this.checkWheel, false)
      },
      checkWheel(el) {
        const parentEl = this.$refs['products-table']
        const isParent = this.isParent(el.target, parentEl)
        // 向下滚动 && 距离底部20以内 && 在商品列表滚动 && 当前没有请求数据 && 有数据
        if (el.wheelDelta < 0 && ((parentEl.scrollTop + parentEl.offsetHeight + 20) >= parentEl.scrollHeight) && isParent && !this.loadingShow && !this.noNewProduct && this.listData.length) {
          this.loadingShow = true
          this.listQuery.data.page++
          this.renderList('mouseWheel')
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
      renderList(fromWhere) {
        if (fromWhere !== 'mouseWheel') {
          this.listLoading = true
        }
        this.listQuery.data.keyword = this._.trim(this.listQuery.data.keyword)
        apiGetProductList(this.listQuery)
          .then(res => {
            this.listData = this._.unionWith(this.listData, res.data, this._.isEqual)
            // 接收到的数据不为 50 条的时候，就认为没有数据了
            if (res.data.length !== this.listQuery.data.per_page) {
              this.noNewProduct = true
            }
            this.formatShowData()
            this.pagination = res.data.pagination
          }).finally(() => {
            this.listLoading = false
            this.loadingShow = false
          })
      },
      formatShowData() {
        this._.forEach(this.listData, v => {
          if (v.original_prices[0] === v.original_prices[1]) {
            v.showBeforePrice = `${this.currency}${v.original_prices[0]}`
          } else {
            v.showBeforePrice = `${this.currency}${v.original_prices[0]} - ${this.currency}${v.original_prices[1]}`
          }
          if (v.actual_prices[0] === v.actual_prices[1]) {
            v.showPrice = `${this.currency}${v.actual_prices[0]}`
          } else {
            v.showPrice = `${this.currency}${v.actual_prices[0]} - ${this.currency}${v.actual_prices[1]}`
          }
          // 商品链接根据 platform 去除 seller.
          v.product_url = this.productOption.platform.replace('seller.', '') + '/product/' + v.shop_id + '/' + v.id
        })
      },
      sendProduct(item) {
        const obj = {
          shop_id: item.shop_id,
          product_id: item.id
        }
        const textContent = this._.cloneDeep(item)
        this.$emit('send-product', obj, 'product', textContent)
      },
      initData() {
        this.listQuery = {
          platform: '',
          authorization: '',
          data: {
            page: 1,
            per_page: 50,
            shop_id: undefined,
            keyword: undefined,
            _uid: undefined
          },
          not_show_message: true
        }
        this.listData = []
        this.listLoading = false
      }
    },
    watch: {
      slideShow() {
        if (this.slideShow === 'product') {
          this.initData()
          this.listQuery.platform = this.productOption.platform
          this.listQuery.authorization = this.productOption.authorization
          this.listQuery.data.shop_id = this.productOption.data.shop_id
          this.listQuery.data._uid = this.productOption.data._uid
          this.renderList()
        }
      }
    },
    destroyed() {
      window.removeEventListener('mousewheel', this.checkWheel)
    }
  }
</script>

<style lang="scss" scoped>
  li {
    list-style: none;
  }
  .product-page {
    position: relative;
    height: 300px;
    border-top: 1px solid #cccccc;
    .loading-wrap {
      font-size: 16px;
      padding: 2px 0;
      text-align: center;
    }
    .product-search {
      padding: 8px 12px;
    }
    .table-head {
      font-size: 12px;
      border-bottom: .07em solid rgba(0,0,0,.05);
      padding: .57em 1.86em .57em 1.43em;
      .table-head-content {
        display: flex;
        justify-content: flex-start;
      }
    }
    .mask {
      position: absolute;
      top: 84px;
      height: 215px;
      width: 100%;
      z-index: 99;
    }
    .products-table {
      margin-top: 5px;
      position: relative;
      font-size: 12px;
      overflow: auto;
      height: 215px;
      padding: .57em 1.86em .57em 1.43em;
      li {
        padding: 8px 0;
        &:nth-child(2n) {
          background: #fafafa;
        }
        display: flex;
        div {
          display: flex;
          align-items: center;
          img {
            width: 35px;
          }
        }
        .price-line {
          display: block;
        }
      }
    }
    .products-line {
        width: 40%;
        span {
          max-width: calc(100% - 38px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          text-decoration: underline;
          margin-left: 5px;
        }
    }
    .price-line {
      width: 30%;
      text-align: right;
      justify-content: flex-end;
      padding-right: 30px;
    }
    .stock-line, .sales-line, .action-line {
      width: 10%;
    }
  }
</style>
