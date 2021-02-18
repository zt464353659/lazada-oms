<template>
  <div>
    <div class="customer-profile">
      <div class="customer-info">
        <span class="buyer-name">{{ baseObj.showName }}</span>
      </div>
      <div class="order-summary">
        <span class="label">Total Orders:</span>
        <span class="text">{{ orderTotal || '0' }}</span>
      </div>
    </div>
    <div class="search">
      <el-select v-model="orderSearchType" style="width:33%;margin-right:-8px;border:none;" size="mini" @change="orderSelectChange('type')">
        <el-option label="All" value="all"></el-option>
        <el-option label="Unpaid" value="unpaidAll"></el-option>
        <el-option label="Pending" value="pendingAll"></el-option>
        <el-option label="Ready to ship" value="readyToShip"></el-option>
        <el-option label="Shipped" value="shipped"></el-option>
      </el-select>
      <el-input align="right" style="width:65%;" size="mini" v-model="searchOrderNumber" @keyup.enter.native="orderSelectChange('input')" placeholder="Please input search value"></el-input>
      <i class="el-icon-search" style="font-size:16px;" @click="orderSelectChange('input')"></i>
    </div>
    <div>
      <div class="order" v-show="orderListData.length && !orderListLoading">
        <div class="order-info" v-for="(item,index) in orderListData" :key="index">
          <p>
            <span class="order-label">Order Status:</span>
            <span style="font-weight:600">{{ item.status }}</span>
          </p>
          <p>
            <span class="order-label">Order ID:</span>
            <a @click="jumpToLoginSeller(item.url)">{{ item.id }}</a>
            <i class="el-icon-s-order" style="font-size:16px;cursor:pointer;" @click="copyOrderId(item.id)" title="复制订单号"></i>
          </p>
          <p>
            <span class="order-label">Order Time:</span>
            <span>{{ $moment(item.gmtCreatedTime).format('YYYY-MM-DD HH:mm') }}</span>
          </p>
          <p>
            <span class="order-label">Order Number:</span>
            <a v-if="item.order_url" :href="item.order_url" target="_blank">{{ item.order_number }}</a>
          </p>
          <!--          不显示运单号-->
          <!--          <p>-->
          <!--            <span class="order-label">Tracking Number:</span>-->
          <!--            <a v-if="item.tracking_url" :href="item.tracking_url" target="_blank">{{ item.tracking_number }}</a>-->
          <!--          </p>-->
          <p>
            <span>Total Price:</span>
            <span style="font-weight:600;color:#333;">{{ item.orderAmount.amountFRMStr }}</span>
          </p>
          <div style="margin-bottom:10px;" v-if="item.status !== 'Unpaid'">
            <span class="order-label">Logistics</span>
            <el-popover placement="right" trigger="hover" @show="getLogistics(item.id)" width="960">
              <p>Logistics Detail</p>
              <div v-loading="logisticsLoading" element-loading-background="rgba(255, 255, 255, 1)">
                <div v-if="loadLogisticsErr && !logisticsLoading">No logistics data for this order</div>
                <div style="display: flex" v-else>
                  <div class="logistics-packages">
                    <div class="logistics-summary">
                      <div class="order-id">Order ID {{ logicInfo.package.orderId }}</div>
                      <div class="order-time">Created on {{ $moment(logicInfo.package.createTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
                      <div class="package-count">You have {{ logicInfo.package.packages.length }} packages</div>
                    </div>
                    <div class="package-card" v-for="(card,ind) in logicInfo.package.packages" :key="ind">
                      <div class="package-header">
                        <span class="title">Package {{ `${ ind + 1 }/${ logicInfo.package.packages.length }` }}</span>
                        <span class="status">{{ card.logisticsStatus }}</span>
                      </div>
                      <div class="package-body">
                        <div class="cell">
                          <div class="label">Logistic Company</div>
                          <div class="content">{{ card.shipmentProviderName }}</div>
                        </div>
                        <div class="cell">
                          <div class="label">Expected Delivery</div>
                          <div class="content">---</div>
                        </div>
                        <div class="cell">
                          <div class="label">Tracking No.</div>
                          <div class="content">{{ card.trackingCode }}</div>
                        </div>
                        <div class="cell">
                          <div class="label">Drop-off Points</div>
                          <div class="content">-</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="logistics-tracking">
                    <ul class="main-range is-set-scroll">
                      <div v-if="JSON.stringify(logicInfo.logistics) === '{}'" style="text-align: center; margin-top:10px">暂无物流信息</div>
                      <div v-if="logicInfo.package.packages.length">
                        <li v-for="(item1, ind) in logicInfo.logistics[logicInfo.package.packages[0]['packageId']]" :key="ind" :class="ind === 0 ? 'isActive' : ''">
                          <h4 v-if="item1.description" v-html="item1.description"></h4>
                          <p>{{ $moment(item1.eventTime).format('YYYY-MM-DD HH:mm') }}</p>
                        </li>
                      </div>
                    </ul>
                  </div>
                </div>
              </div>
              <span style="color: #2192d9;cursor: pointer;font-size: 12px;" slot="reference">View Logistics Detail</span>
            </el-popover>
          </div>
          <div class="order-body" v-for="(orderChild,order_index) in item.orderItemList" :key="order_index">
            <template v-if="order_index < 2 || item.showAll">
              <div class="body-left" :style="{'background-image':`url(${orderChild.imageUrl})`}"></div>
              <div class="body-right">
                <p class="order-title">{{ orderChild.productName.slice(0, 20) }}...</p>
                <p class="order-title-secondary">{{ orderChild.sellerSKU }}</p>
                <p style="display: flex;justify-content: space-between;">
                  <span>{{ orderChild.productPrice.amountFRMStr }}</span>
                  <span>×1</span>
                </p>
              </div>
            </template>
          </div>
          <div v-if="!item.showAll && item.orderItemList.length > 2" style="text-align: center;color:#2e9cc3;cursor: pointer;font-size:14px;" @click="showAllOrder(item.id,true)">See More</div>
          <div v-if="item.showAll && item.orderItemList.length > 2" style="text-align: center;color:#2e9cc3;cursor: pointer;font-size:14px;" @click="showAllOrder(item.id,false)">See Less</div>
          <div style="text-align: right;margin-bottom:15px;">
            <button class="btn-order order-view" @click="jumpToLoginSeller(item.url)">View</button>
            <button class="btn-order order-send" @click="sendMsg(item, 'order')">Send</button>
          </div>
        </div>
      </div>
      <div class="nothing-tip" v-show="!orderListData.length && !orderListLoading">无订单</div>
      <div v-show="orderListLoading" class="load-more"><i class="el-icon-loading"></i></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { apiGetLogistics, getIstoreOrder, getOrderList, getProductList } from '@/api/chat'

export default {
  name: 'OrderCard',
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
      orderParams: {
        page: 1
      },
      orderTotal: '',
      orderSearchType: 'all',
      searchOrderNumber: '',
      orderListLoading: true,
      orderListData: [],
      moreOrder: false,
      loadLogisticsErr: false,
      logicInfo: {
        logistics: {},
        package: {
          packages: []
        }
      },
      logisticsLoading: false
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    // 卖家后台登录
    jumpToLoginSeller(val) {
      window.open(`${ this.$store.getters.activeAccount.uri }/apps/seller/login?platform=lazada&account_id=${ this.$store.getters.activeAccount.account_id }&path=${ val }`)
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
      this.$nextTick(() => {
        const parentEl = document.querySelector('.order-page')
        const isParent = this.isParent(el.target, parentEl)
        // 向下滚动 && 距离底部500以内 && 在右侧产品列表滚动 && 产品列表没有loading && 产品列表有更多数据
        if (el.wheelDelta < 0 && ((parentEl.scrollTop + parentEl.offsetHeight) >= parentEl.scrollHeight) && isParent && !this.orderListLoading && this.moreOrder) {
          if (this.moreOrder) {
            this.loadMore()
          }
        }
      })
    },
    // 复制订单号
    copyOrderId(id) {
      let oInput = document.createElement('input')
      oInput.value = id
      document.body.appendChild(oInput)
      oInput.select() // 选择对象;
      document.execCommand('Copy') // 执行浏览器复制命令
      document.body.removeChild(oInput)
      this.$message.success('复制成功')
    },
    sendMsg(data, type) {
      this.$emit('sendOrder', data, type)
    },
    openNewPage(url, fullPath) {
      let path = fullPath ? url : `https://sellercenter.lazada.com.${ this.baseObj.activeAccountInfo.site_code }${ url }`
      window.open(path, '_blank')
    },
    loadMore() {
      this.moreOrder = false
      this.orderParams.page++
      this.orderListLoading = true
      this.getOrder(this.orderParams, 'concat')
    },
    // 获取物流信息
    getLogistics(id) {
      const params = {
        account_id: this.baseObj.activeAccountInfo.account_id,
        order_id: id,
        not_show_message: true
      }
      this.logisticsLoading = true
      apiGetLogistics(params).then(res => {
        this.logicInfo = res.data
        this.logisticsLoading = false
      }).catch(e => {
        this.loadLogisticsErr = true
      }).finally(() => {
        this.logisticsLoading = false
      })
    },
    // 获取订单列表
    getOrder(val, concat) {
      const params = this._.cloneDeep(val)
      if (!this.intervalRead) {
        this.orderListLoading = true
      }
      if (!concat) {
        params.page = 1
      }
      getOrderList(params).then(res => {
        if (res.data.result) {
          this.orderTotal = res.data.totalCount
          const arr = res.data.result
          arr.forEach(v => {
            v.showAll = false
          })
          const orderListData = arr
          const orderIdList = res.data.result.map(v => v.id)
          // 获取订单id后拉取istore物流信息
          getIstoreOrder({
            valitoken: JSON.stringify({ 'userID': 'pzwg_yingyan', 'token': 'eeed4f9ffaa9bcbc5b3d1117ade04cf7' }),
            action: 'Order_getTrackingCode',
            parameter: JSON.stringify({ 'order_id': orderIdList.join(',') }),
            not_show_message: true
          }).then(res => {
            const result = res.data
            // 存在查询结果
            if (!Array.isArray(result)) {
              const copyList = this._.cloneDeep(orderListData)
              copyList.forEach(v => {
                if (Object.keys(result).includes(String(v.id))) {
                  v.order_number = result[String(v.id)].order_number
                  v.tracking_number = result[String(v.id)].tracking_number
                  v.tracking_url = result[String(v.id)].tracking_url
                  v.order_url = result[String(v.id)].order_url
                }
              })
              if (concat) {
                this.orderListData = this.orderListData.concat(copyList)
              } else {
                this.orderListData = copyList
              }
            this.orderTotal = this.orderListData.length
            } else {
              // istore无订单数据
              if (concat) {
                this.orderListData = this.orderListData.concat(orderListData)
              } else {
                this.orderListData = orderListData
              }
              this.orderTotal = this.orderListData.length
            }
            this.orderListLoading = false
          }).catch(() => {
            this.orderListLoading = false
          })
          if (res.data.result && res.data.result.length === 10) {
            this.moreOrder = true
          }
        } else {
          this.orderListLoading = false
          this.orderListData = []
          this.orderTotal = 0
        }
      }).catch(() => {
        this.orderListLoading = false
      })
    },
    // 订单搜索
    orderSelectChange(type) {
      if (type === 'type') {
        this.orderParams.tab = this.orderSearchType
      }
      if (type === 'input') {
        this.orderParams.order_number = this.searchOrderNumber
      }
      this.orderListLoading = true
      this.getOrder(this.orderParams)
    },
    // 显示/收起订单子项
    showAllOrder(id, val) {
      this._.forEach(this.orderListData, v => {
        if (v.id === id) {
          v.showAll = val
        }
      })
    }
  },
  computed: {
    ...mapGetters([
      'baseObj'
    ])
  },
  filters: {},
  watch: {
    chatParams: {
      deep: true,
      immediate: true,
      handler(val, oldval) {
        // 定义搜索参数
        this.orderParams = {
          account_id: this.baseObj.activeAccountInfo.account_id,
          customer: this.baseObj.target.targetId,
          tab: this.orderSearchType,
          page: 1,
          not_show_message: true
        }
        // 非定时请求加载loading
        if (!this.intervalRead) {
          this.orderTotal = ''
          this.orderListLoading = true
        }
        this.getOrder(this.orderParams)
      }
    },
    moreOrder(val) {
      if (val) {
        console.log('add event')
        window.addEventListener('mousewheel', this.checkWheel, false)
      } else {
        console.log('remove event')
        window.removeEventListener('mousewheel', this.checkWheel)
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.load-more {
  text-align: center;
  color: #2e9cc3;
  cursor: pointer;
  padding: 20px 0;
}

.customer-profile {
  background-color: #f7f8fa;
  border-bottom: 1px solid #e9e9e9;
  padding: 20px;

  .customer-info {
    text-align: center;
    margin-bottom: 14px;
    font-weight: 700;
  }

  .order-summary {
    text-align: center;

    .label {
      color: #999;
      margin-right: 4px;
    }
  }
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
      padding-right: 30px;
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

.order {
  margin: 0 12px;

  .order-info {
    padding-bottom: 2px;
    border-bottom: 1px solid #eee;

    p {
      font-size: 13px;
      margin: 0;
      margin-bottom: 4px;
      font-weight: 400;
      line-height: 20px;

      .order-label {
        color: #666;
        white-space: nowrap;
        margin-right: 4px;
      }

      a {
        color: #0073bd;
      }
    }
  }

  .order-body {
    display: flex;

    .body-left {
      border: 1px solid #e8e8e8;
      width: 64px;
      height: 64px;
      margin-left: 12px;
      background-position: 50%;
      background-size: cover;
      flex-shrink: 0;
      margin-right: 12px;
    }

    .body-right {
      p {
        margin: 0;
        margin-bottom: 4px;
        font-size: 13px;
        line-height: 20px;
      }

      .order-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .order-title-secondary {
        font-size: 12px;
        color: #858b9c;
      }
    }
  }
}

.nothing-tip {
  text-align: center;
  color: #666;
  margin-top: 15px;
}

.logistics-packages {
  flex: 1 1;
  background-color: #f2f2f2;
  border-right: 1px solid #e8e8e8;
  padding: 15px;

  .package-card {
    background-color: #fff;
    border-radius: 5px;
    padding: 10px;
    cursor: pointer;

    .package-header {
      display: flex;
      justify-content: space-between;

      .title {
        font-size: 16px;
        font-weight: 700;
      }

      .status {
        color: #ef7026;
        font-weight: 700;
      }
    }

    .package-body {
      display: flex;
      flex-wrap: wrap;

      .cell {
        width: 50%;
        margin-top: 15px;

        .label {
          color: #999;
          font-size: 12px;
          margin-bottom: 4px;
        }
      }
    }
  }

  .logistics-summary {
    .order-id {
      font-weight: 700;
      margin-bottom: 5px;
    }

    .order-time {
      color: #999;
      margin-bottom: 5px;
    }

    .package-count {
      margin-bottom: 10px;
    }
  }
}

.logistics-tracking {
  flex: 1 1;
  padding: 15px;
}

.main-range {
  //width: 150px;
  height: 300px;
  padding: 0 3px;
  overflow-y: auto;

  li {
    &.isActive {
      h4 {
        color: #333;
        word-break: keep-all;

        a:link {
          color: #33a3b3 !important;
        }

        a:visited {
          color: #33a3b3 !important;
        }
      }

      &:before {
        background: #33a3b3;
      }
    }

    border-left: 1px solid #888;
    padding: 0 5px 10px 10px;
    position: relative;

    h4 {
      color: #000;
      font-weight: normal;
      margin: 0;
    }

    p {
      margin-top: 5px;
      color: #888;
    }

    &:before {
      position: absolute;
      content: '';
      top: 0;
      left: -3px;
      height: 6px;
      width: 6px;
      border-radius: 50%;
      background: #888;
      z-index: 999;
    }

    &:last-of-type {
      padding-bottom: 0;
    }
  }
}

.btn-order {
  line-height: 26px;
  border-width: 1px;
  height: 28px;
  padding: 0 16px;
  outline: 0;
  background: transparent;
  cursor: pointer;
  box-shadow: none;
  border-radius: 4px;
  font-size: 13px;
}

.order-view {
  border-style: solid;
  background-color: #f7f8fa;
  border-color: #c4c6cf;
}

.order-send {
  background-color: #fff;
  color: #ff3e3e;
  border-color: #ff3e3e;
}
</style>
<style rel="stylesheet/scss" lang="scss">
h4 {
  color: #333;
  word-break: keep-all;

  a:link {
    color: #0073bd !important;
  }

  a:visited {
    color: #0073bd !important;
  }
}
</style>
