<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form
        ref="listQuery"
        :inline="true"
        :model="listQuery"
        class="demo-form-inline"
        size="mini"
      >
        <el-form-item
          label="站点"
          prop="site_code"
        >
          <el-select
            v-model="listQuery.site_code"
            clearable
            filterable
            @change="listQuery.account_name = ''"
            placeholder="选择站点"
          >
            <el-option
              v-for="(item, index) in siteCodeList"
              :label="item.account"
              :value="item.account"
              :key="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="账号"
          prop="account_name"
        >
          <el-select
            v-model="listQuery.account_name"
            clearable
            filterable
            placeholder="选择站点"
          >
            <el-option
              v-for="(item, index) in accountList"
              :label="item.account"
              :value="item.account"
              :key="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-select
            v-model="listQuery.status"
            clearable
            placeholder="选择状态"
          >
            <el-option
              label="已处理"
              :value="0"
            />
            <el-option
              label="待处理"
              :value="1"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleFilter"
          >
            搜索
          </el-button>
          <el-button
            data-type="clear"
            @click="clearSearch"
          >
            清空
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="content-box">
      <el-table
        :data="listData"
        v-loading="listLoading"
        border
        :max-height="maxHeight"
        style="width: 100%"
      >
        <el-table-column
          prop="account_id"
          width="100"
          label="序号"
        >
          <template slot-scope="scope">
            {{ (listQuery.page -1) * listQuery.per_page + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          prop="account_name"
          label="消息"
        >
          <template slot-scope="scope">
            {{ scope.row.site_code + '站点 -> ' + scope.row.account_name + ' 有新消息' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          width="150"
          label="状态"
        >
          <template slot-scope="scope">
            <el-tag
              size="mini"
              :type="scope.row.status === '0' ? 'success' : 'warning'"
            >
              {{ scope.row.status | formatStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="create_time" label="时间">
          <template slot-scope="scope">
            <div>{{ moment(scope.row.create_time) }}</div>
          </template>
        </el-table-column> -->
        <el-table-column
          label="操作"
          width="300"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              @click="handleInfo(scope.row)"
            >
              查看详情
            </el-button>
            <el-button
              type="text"
              v-if="scope.row.status === '1'"
              size="mini"
              @click="handleSetStatus(scope.row)"
            >
              修改状态
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import { fetchAccountList, apiGetNoticeList, apiSetStatus } from '@/api/chat'
  export default {
    name: 'Notice',
    data() {
      return {
        permission: {
          edit: 'operation.shop-news.shop-news.set-status',
          chat: 'chat.view'
        },
        listData: [],
        siteCodeList: [],
        listLoading: false,
        pagination: null,
        maxHeight: document.documentElement.clientHeight - 200,
        listQuery: {
          page: 1,
          user_id: this.$store.getters.userInfo.id,
          per_page: 10,
          account_name: undefined,
          status: undefined,
          site_code: undefined
        }
      }
    },
    computed: {
      accountList() {
        let arr = []
        this._.forEach(this.siteCodeList, v => {
          if (this.listQuery.site_code === v.account) {
            arr = v.child
          }
        })
        return arr
      }
    },
    created() {
      this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
      this.getAccountList()
      this.renderList()
    },
    mounted() {
      window.onresize = () => {
        return (() => {
          window.maxHeight = document.documentElement.clientHeight - 200
          this.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
        })()
      }
    },
    methods: {
      handleInfo(row) {
        this.$store.commit('chat/SET_ACTIVE_ACCOUNT', [row.site_code, row.account_id])
        this.$router.push('/chat/list')
      },
      renderList() {
        this.listLoading = true
        this.listData = []
        apiGetNoticeList(this.listQuery).then((res) => {
          this.listData = res.data.list
          this.pagination = res.data.pagination
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.renderList()
      },
      handleSetStatus(row) {
        this.$confirm('确认操作？', '提示',
                      { confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        type: 'warning' }).then(() => {
                          apiSetStatus({ id: row.id }).then(() => {
                            this.renderList()
                          }).catch(() => {})
                        })
      },
      getAccountList() {
        const params = {
          user_id: this.listQuery.user_id,
          not_show_message: true
        }
        fetchAccountList(params).then(response => {
          this.siteCodeList = response.data
        })
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.renderList()
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.renderList()
      },
      handleFilter() {
        this.listQuery.page = 1
        this.renderList()
      }
    },
    filters: {
      formatStatus(val) {
        const statusMap = new Map([
          ['0', '已处理'],
          ['1', '待处理']
        ])
        return statusMap.get(val)
      }
    },
    watch: {
      maxHeight(val) {
        if (!this.timer) {
          this.maxHeight = val
          this.timer = true
          setTimeout(() => {
            this.timer = false
          }, 400)
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped></style>
