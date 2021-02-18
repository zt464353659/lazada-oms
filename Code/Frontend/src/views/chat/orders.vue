<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="账号" prop="istore_account_name">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <el-form-item label="时间" prop="start_time">
          <el-date-picker
            v-model="listQuery.start_time"
            class="custom-css"
            type="daterange"
            style="width: 240px"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="订单状态" prop="order_status">
          <el-select v-model="listQuery.order_status" placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item, key) in orderStatus" :key="key" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        :max-height="maxHeight"
        v-loading="listLoading"
        border
        style="width: 100%"
      >
        <el-table-column prop="site_code" label="账号" align="center"></el-table-column>
        <el-table-column prop="order_id" label="订单号" align="center"></el-table-column>
        <el-table-column prop="created_at" label="订单时间" align="center"></el-table-column>
        <el-table-column prop="order_type" label="订单类型" align="center"></el-table-column>
        <el-table-column prop="payment_method" label="付款方式" align="center"></el-table-column>
        <el-table-column prop="price" label="订单价格" align="center"></el-table-column>
        <el-table-column prop="items_count" label="产品数量" align="center"></el-table-column>
        <el-table-column prop="status" label="订单状态" align="center"></el-table-column>
        <el-table-column prop="sla_time_stamp" label="最迟发货时间" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button v-permission="permissions.info" type="text" size="mini" @click="getPlanDetails(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper" small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--订单详情弹窗dialog-->
    <details-form v-bind.sync="detailsPlanDialogOption"></details-form>
  </div>
</template>

<script>
import { getUserAccount, getUserOrderList } from '@/api/chat'
import detailsForm from './components/orders/details'
import multipleSelectAccount from '@/views/chat/components/orders/components/multipleSelectAccount'
import { filterQueryParams } from '@/utils'

export default {
  name: 'Orders',
  components: { detailsForm, multipleSelectAccount },
  data() {
    return {
      orderStatus: [],
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'istore_account_name'
      },
      // 权限管理
      permissions: {
        info: 'lazada-operation.web-service.istore-order.order-info'
      },
      newDate: new Date().getTime(),
      maxHeight: document.documentElement.clientHeight - 200,
      detailsPlanDialogOption: {
        rowData: {},
        open: false
      },
      listData: [{ account_name: 'xxx' }],
      listLoading: false,
      listQuery: {
        page: 1,
        per_page: 10,
        istore_account_name: '',
        order_status: 'pending',
        start_time: [],
        not_show_message: true
      },
      pagination: null
    }
  },
  created() {
    this.searchInit()
    this.getList()
  },
  mounted() {
    const that = this
    window.onresize = () => {
      return (() => {
        window.maxHeight = document.documentElement.clientHeight - 200
        that.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
      })()
    }
  },
  methods: {
    searchInit() {
      getUserAccount().then(res => {
        this.multipleSelectAccountOption.accountArr = res.account_list
        this.orderStatus = res.order_status
      })
    },
    selectAccount(arr) {
      this.listQuery.istore_account_name = arr.join(',')
    },
    clearAccount() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
    },
    cleanSelect() {
      this.$refs['listQuery'].resetFields()
    },
    getList() {
      this.listLoading = true
      const queryParams = filterQueryParams(this.listQuery)
      delete queryParams.start_time
      if (this.listQuery.start_time && this.listQuery.start_time.length) {
        queryParams.start_time = this.listQuery.start_time[0]
        queryParams.end_time = this.listQuery.start_time[1]
      }
      getUserOrderList(queryParams).then(response => {
        this.listLoading = false
        this.listData = response.data.list
        this.pagination = response.data.pagination
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).catch(e => {
        this.listLoading = false
        this.$message.error(e)
      })
    },
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    getPlanDetails(data) {
      this.detailsPlanDialogOption = {
        open: true,
        rowData: data
      }
    },
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.clearAccount()
      this.getList()
    },
    handleFilter() {
      this.newDate = new Date().getTime()
      this.listQuery.page = 1
      this.listQuery.per_page = 10
      this.getList()
    },
  },
  watch: {
    maxHeight(val) {
      if (!this.timer) {
        this.maxHeight = val
        this.timer = true
        const that = this
        setTimeout(function() {
          that.timer = false
        }, 400)
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.custom-css {
  .el-range-separator {
    margin-right: 15px !important;
  }
}
</style>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-popover {
  max-height: 400px !important;
  overflow-y: auto !important;
}
</style>
