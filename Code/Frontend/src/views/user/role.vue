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
          label="角色名称"
          prop="name"
        >
          <el-input
            v-model="listQuery.name"
            placeholder="角色名称"
            clearable
          />
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
      <el-row class="right-row">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-circle-plus-outline"
          @click="onCreate"
          v-permission="permissions.add"
        >
          添加角色
        </el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        v-loading="listLoading"
        border
        :max-height="maxHeight"
        style="width: 100%"
        @filter-change="handleFilterChange"
        class="role-table"
      >
        <el-table-column
          prop="role_id"
          label="ID"
          width="80"
          sortable
          :sort-method="(a,b) => a-b"
        />
        <el-table-column
          prop="name"
          label="角色"
          min-width="140"
        />
        <el-table-column
          prop="status"
          :render-header="renderHeader"
          column-key="status"
          width="100"
          :filters="[{ text: '启用', value: '1' }, { text: '禁用', value: '0' }]"
          :filter-method="filterStatus"
          filter-placement="bottom-start"
        >
          <template slot-scope="scope">
            <el-tag
              :type="toBoolean(scope.row.status) ? 'success' : 'info'"
              size="small"
              disable-transitions
            >
              {{ toBoolean(scope.row.status) ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="220"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              @click="onEdit(scope.row)"
              v-permission="permissions.edit"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="onAccredit(scope.row)"
              v-permission="permissions.accredit"
            >
              授权
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="onChangeStatus(scope.row)"
              v-permission="permissions.enable"
              :disabled="role.indexOf(scope.row.id) > -1"
            >
              {{ toBoolean(scope.row.status) ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="onDelete(scope.row)"
              v-permission="permissions.delete"
              :disabled="role.indexOf(scope.row.id) > -1"
            >
              删除
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
    <role-dialog-form
      v-bind.sync="dialogFormOption"
      @reload="renderList"
    />
    <role-dialog-accredit v-bind.sync="dialogAccreditOption" />
  </div>
</template>

<script>
  import roleDialogForm from './role/form'
  import roleDialogAccredit from './role/accredit'
  import { toBoolean, filterQueryParams } from '@/utils'
  import { fetchList, saveRoleStatusRequest, delRoleRequest } from '@/api/role'
  import store from '@/store'

  export default {
    name: 'UserRole',
    components: { roleDialogForm, roleDialogAccredit },
    data() {
      return {
        role: store.getters.userInfo.role_id.split(','),
        newDate: new Date().getTime(),
        filter: 'filter',
        status: '状态 ',
        maxHeight: document.documentElement.clientHeight - 200,
        permissions: {
          add: 'lazada-operation.manager.role.add',
          edit: 'lazada-operation.manager.role.edit',
          delete: 'lazada-operation.manager.role.delete',
          enable: 'lazada-operation.manager.role.enable',
          accredit: 'lazada-operation.manager.role.permission'
        },
        listLoading: true,
        listTotal: null,
        listData: [],
        listQuery: {
          page: 1,
          per_page: 10,
          name: undefined,
          status: undefined
        },
        pagination: null,
        dialogFormOption: {
          data: {},
          open: false
        },
        dialogAccreditOption: {
          data: {},
          open: false
        }
      }
    },
    created() {
      this.renderList()
      this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
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
      toBoolean(v) {
        return toBoolean(v)
      },
      renderList() {
        this.listLoading = true
        this.listQuery.name = this._.trim(this.listQuery.name)
        const queryParams = filterQueryParams(this.listQuery)
        fetchList(queryParams).then(response => {
          this.listLoading = false
          this.listData = response.data.list
          this.pagination = response.data.pagination
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.renderList()
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.renderList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.renderList()
      },
      onChangeStatus(row) {
        const status = toBoolean(row.status)
        const tip = status ? '确定要禁用么？' : '确定要启用么？'
        this.$confirm(tip, '提示', { closeOnClickModal: false, closeOnPressEscape: false, confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(_ => {
          saveRoleStatusRequest({
            role_id: row.role_id,
            status: status ? 0 : 1
          }).then(response => {
            this.renderList()
          })
        }).catch(_ => {})
      },
      onCreate() {
        this.dialogFormOption = {
          open: true, data: {}
        }
      },
      onEdit(row) {
        this.dialogFormOption = {
          open: true, data: row
        }
      },
      onAccredit(row) {
        this.dialogAccreditOption = {
          open: true, data: row
        }
      },
      onDelete(row) {
        this.$confirm('确认删除？', '提示', { closeOnClickModal: false, closeOnPressEscape: false, confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(_ => {
          delRoleRequest({ role_id: row.role_id }).then(response => {
            this.renderList()
          })
        }).catch(_ => {})
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.renderList()
      },
      // 状态筛选
      filterStatus(value, row) {
        return row.status === value
      },
      // 筛选图标
      renderHeader(h, { column, $index }) {
        return h('span', [
          h('span', this.status),
          h('svg-icon', { 'attrs': { 'icon-class': this.filter }})
        ])
      },
      // 筛选图标处理
      handleFilterChange(filters) {
        if (filters.status.length === 0) {
          this.filter = 'filter'
          document.querySelector(' .el-table th>.cell>span>svg').style.color = '#c0c4cc'
        } else {
          this.filter = 'filter-in'
          document.querySelector(' .el-table th>.cell.highlight>span>svg').style.color = '#f00'
        }
      }
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
