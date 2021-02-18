<template>
  <el-dialog
    title="订单详情"
    class="dialog-details-plan order-table"
    :visible="open"
    :before-close="onClose"
    @closed="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="1400px"
  >
    <template>
      <el-table :key="newDate" :data="detailsData" border v-loading="listLoading" class="table-gray" style="width: 100%">
        <el-table-column prop="item_id" label="Item ID" width="140"></el-table-column>
        <el-table-column prop="lazada_id" label="Lazada ID" width="140"></el-table-column>
        <el-table-column prop="seller_sku" label="Seller SKU"></el-table-column>
        <el-table-column prop="lazada_sku" label="Lazada SKU"></el-table-column>
        <el-table-column prop="product" label="Product">
          <template slot-scope="scope">
            <div v-if="scope.row.product.length > 30">
              <el-popover placement="right" width="480" trigger="hover">
                <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.product }}</p>
                <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ scope.row.product }}</p>
              </el-popover>
            </div>
            <div v-else>{{ scope.row.product }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="shipment" label="Shipment"></el-table-column>
        <el-table-column prop="retail_price" label="Retail Price"></el-table-column>
        <el-table-column prop="voucher" label="Voucher"></el-table-column>
        <el-table-column prop="shipping" label="Shipping"></el-table-column>
        <el-table-column prop="status" label="Status"></el-table-column>
      </el-table>
    </template>
  </el-dialog>
</template>

<script>
import { getUserOrderDetail } from '@/api/chat'

export default {
  data() {
    return {
      newDate: new Date().getTime(),
      detailsData: [],
      listLoading: false,
      listQuery: {
        order_id: '',
        istore_account_name: ''
      },
      pagination: null
    }
  },
  props: {
    rowData: {
      type: Object,
      required: true,
      default: () => {
      }
    },
    open: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    clearInput() {
      this.listQuery = {
        istore_account_name: undefined,
        order_id: ''
      }
      this.getDetails()
    },
    search() {
      this.listQuery.page = 1
      this.getDetails()
    },
    getDetails() {
      this.listQuery.order_id = this.rowData.order_id
      this.listQuery.istore_account_name = this.rowData.site_code
      this.listLoading = true
      getUserOrderDetail(this.listQuery).then(response => {
        this.listLoading = false
        this.detailsData = response.data
        this.$nextTick(() => {
          document.querySelector('.el-dialog .el-table__body-wrapper').scrollTop = 0
          this.newDate = new Date().getTime()
        })
      }).catch(e => {
        this.listLoading = false
      })
    },
    onClose() {
      this.newDate = new Date().getTime()
      this.listQuery.status = undefined
      this.listQuery.istore_product_id = undefined
      this.detailsData = []
      this.$emit('update:open', false)
    }
  },
  watch: {
    open(val) {
      if (val) {
        this.getDetails()
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.dialog-details-plan {
  .el-table {
    .el-table__header {
      tr {
        background-color: #d3dce6;
      }
    }
  }
}
.order-table{
  .el-dialog__body{
    max-height:600px;
  }
}

#app .order-table .el-table__header th, #app .el-table__header tr {
  background-color: #f2f6fc !important;
  color: #909399 !important;
}
</style>
