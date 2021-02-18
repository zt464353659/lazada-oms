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
        <el-form-item label="账号" prop="account">
          <el-input type="text" v-model="listQuery.account" clearable placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="状态" prop="auto_reply_status">
          <el-select v-model="listQuery.auto_reply_status" clearable placeholder="请选择状态">
            <el-option
              label="启用"
              value="1"
            />
            <el-option
              label="禁用"
              value="0"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!--表格-->
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
        <el-table-column prop="account" min-width="250" label="账号" />
        <el-table-column prop="auto_reply_status" min-width="250" label="是否启用自动回复">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.auto_reply_status === '1' ? 'success' : 'info'"
              size="small"
              disable-transitions
            >
              {{ scope.row.auto_reply_status === '1' ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.active === '1'" type="text" v-permission="permission.edit" size="mini" @click="handleSetAutoReply(scope.row)">
              {{ scope.row.auto_reply_status === '1' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[20, 50, 100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import { apiReplySetList, apiReplySetEdit } from '@/api/chat'
  export default {
    name: 'SetUp',
    components: {},
    data() {
      return {
        listLoading: false,
        maxHeight: document.documentElement.clientHeight - 200,
        // 权限
        permission: {
          edit: 'operation.auto-reply.auto-reply-set.set'
        },
        // 表格相关内容
        listQuery: {
          page: 1,
          per_page: 20,
          account: undefined,
          user_id: this.$store.getters.userInfo.id,
          role_id: this.$store.getters.userInfo.role_id,
          auto_reply_status: undefined
        },
        listData: [],
        pagination: null
      }
    },
    created() {
      this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
    },
    mounted() {
      window.onresize = () => {
        return (() => {
          window.maxHeight = document.documentElement.clientHeight - 200
          this.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
        })()
      }
      this.getList()
    },
    methods: {
      // 获取列表
      getList() {
        this.listLoading = true
        this.listData = []
        this.listQuery.account = this._.trim(this.listQuery.account) || undefined
        this.listQuery.auto_reply_status = this.listQuery.auto_reply_status || undefined
        apiReplySetList(this.listQuery)
          .then(res => {
            this.listData = res.data.list
            this.pagination = res.data.pagination
            this.listLoading = false
          })
          .catch(() => {
            this.listLoading = false
          })
      },
      // 清楚
      clearSearch() {
        this.listQuery.page = 1
        this.listQuery.account = undefined
        this.listQuery.auto_reply_status = undefined
        this.getList()
      },
      // 分页
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      },
      // 删除
      handleSetAutoReply(row) {
        this.$confirm(
          `确定${row.auto_reply_status === '0' ? '启用' : '禁用'}自动回复吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'warning'
          }
        )
          .then(_ => {
            const data = {
              id: row.id,
              auto_reply_status: row.auto_reply_status === '1' ? '0' : '1'
            }
            apiReplySetEdit(data).then(response => {
              this.getList()
            })
          })
          .catch(_ => {})
      },
      // 批量添加
      addBatch() {
        this.addBatchDialog = {
          open: true
        }
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
<style rel="stylesheet/scss" lang="scss" scoped>
.explan {
  font-size: 12px;
  color: #e6a23c;
  line-height: 20px;
}
</style>

