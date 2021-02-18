<template>
  <div>
    <div class="header-box">
      <el-form
        ref="listQuery"
        :inline="true"
        :model="listQuery"
        class="demo-form-inline"
        size="mini"
      >
        <!--页面title-->
        <!--<el-form-item label="用户管理"></el-form-item>-->
        <!--检索区域form-->
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input
            clearable
            v-model="listQuery.username"
            placeholder="用户名"
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
      <!--操作按钮组 -左侧-->
      <!--<el-row class="left-row">
        <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline">按钮1</el-button>
        <el-button type="warning" size="mini" icon="el-icon-circle-plus-outline">按钮2</el-button>
      </el-row>-->
      <!--操作按钮组 -右侧-->
      <el-row class="right-row">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-circle-plus-outline"
          @click="addUser"
          v-permission="permission.add"
        >
          添加用户
        </el-button>
      </el-row>
    </div>
    <!--内容区-->
    <div class="content-box">
      <el-table
        :key="newDate"
        ref="table"
        v-loading="listLoading"
        :data="tableData"
        border
        :default-sort="{prop: 'create_time', order: 'descending'}"
        empty-text="暂无相关结果"
        :max-height="maxHeight"
        style="width: 100%"
      >
        <el-table-column
          prop="user_id"
          label="ID"
          width="60"
        />
        <el-table-column
          prop="username"
          label="用户名"
          show-overflow-tooltip
          min-width="120"
        />
        <el-table-column
          prop="email"
          label="邮箱"
          show-overflow-tooltip
          min-width="200"
        />
        <el-table-column
          prop="name"
          label="姓名"
          min-width="80"
        />
        <el-table-column
          prop="mobile"
          label="手机"
          width="110"
        />
        <el-table-column
          prop="have_account"
          label="拥有账号"
          show-overflow-tooltip
          min-width="200"
        />
        <el-table-column
          prop="role"
          label="拥有角色"
          show-overflow-tooltip
          min-width="80"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="70"
          column-key="status"
        >
          <template slot-scope="scope">
            <el-tag
              :type="Number(scope.row.status) === 1 ? 'success' : 'info'"
              size="small"
              disable-transitions
            >
              {{ Number(scope.row.status) === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          fixed="right"
          width="200"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              @click="editUserRoles(scope.row)"
              v-permission="permission.editRole"
            >
              修改角色
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="editAccount(scope.row)"
              v-permission="permission.account"
            >
              账号配置
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="modifyStatus(scope.row)"
              v-permission="permission.enable"
              :disabled="scope.row.id === userId"
            >
              {{ Number(scope.row.status) === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="deleteUser(scope.row)"
              v-permission="permission.delete"
              :disabled="scope.row.id === userId"
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
    <!--添加用户弹窗dialog-->
    <add-user-form
      v-bind.sync="addUserDialogOption"
      @reload="getList"
    />
    <!--编辑权限dialog-->
    <account-privileges
      v-bind.sync="addPrivileges"
      @reload="getList"
    />
    <!--修改角色弹窗dialog-->
    <edit-role-form
      v-bind.sync="editRoleDialogOption"
      @reload="getList"
    />
  </div>
</template>

<script>
  import {
    fetchList,
    delUserRequest,
    modifyStatusRequest,
    operableAccount
  } from '@/api/user'
  import addUserForm from './manage/addUserForm'
  import accountPrivileges from './manage/accountPrivileges'
  import editRoleForm from './manage/editRoleForm'
  import { filterQueryParams } from '@/utils'
  import store from '@/store'

  export default {
    name: 'UserManage',
    components: { addUserForm, accountPrivileges, editRoleForm },
    data() {
      return {
        // 权限
        permission: {
          add: 'lazada-operation.manager.user.add', // 增
          delete: 'lazada-operation.manager.user.delete', // 删
          enable: 'lazada-operation.manager.user.edit-user-status', // 禁用/启用
          editRole: 'lazada-operation.manager.user.edit-user-role', // 角色编辑
          account: 'lazada-operation.manager.user.edit-user-account' // 账号编辑
        },
        userId: store.getters.userInfo.id,
        newDate: new Date().getTime(),
        filter: 'filter',
        status: '状态 ',
        maxHeight: document.documentElement.clientHeight - 200,
        editRoleDialogOption: {
          data: {},
          open: false
        },
        addUserDialogOption: {
          data: {},
          open: false
        },
        addPrivileges: {
          open: false,
          operation: 'edit',
          data: [],
          pointId: '',
          defaultKeys: []
        },
        tableData: [],
        listLoading: false,
        listQuery: {
          page: 1,
          per_page: 10,
          username: undefined,
          status: undefined
        },
        pagination: null
      }
    },
    created() {
      this.getList()
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
      getList() {
        this.listLoading = true
        this.listQuery.role = this._.trim(this.listQuery.role)
        this.listQuery.username = this._.trim(this.listQuery.username)
        const queryParams = filterQueryParams(this.listQuery)
        if (queryParams.username || queryParams.username === 0) {
          queryParams.username = this.trim(queryParams.username)
        }
        fetchList(queryParams).then(response => {
          this.listLoading = false
          this.tableData = response.data.list
          this._.forEach(this.tableData, (v) => {
            v.hasAccount = v.have_account.split(',')
          })
          this.pagination = response.data.pagination
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
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
      handleFilter() {
        this.listQuery.page = 1
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.getList()
      },
      /* 状态修改-启用禁用 */
      modifyStatus(d) {
        const message = Number(d.status) === 1 ? '禁用' : '启用'
        this.$confirm('确认' + message + '此用户？', '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'warning'
          }).then(_ => {
          const modifyStatusParams = {
            id: d.user_id,
            status: Number(d.status) === 1 ? '0' : '1'
          }
          modifyStatusRequest(modifyStatusParams).then(response => {
            this.getList()
          })
        }).catch(_ => {
        })
      },
      /* 用户删除 */
      deleteUser(d) {
        this.$confirm('删除后数据不可恢复，确定删除吗？', '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'warning'
          }).then(_ => {
          delUserRequest({ id: d.user_id }).then(response => {
            this.getList()
          })
        }).catch(_ => {
        })
      },
      /* 添加用户 */
      addUser() {
        this.addUserDialogOption = {
          open: true,
          data: {}
        }
      },
      editUserRoles(d) {
        this.editRoleDialogOption = {
          open: true,
          data: d
        }
      },
      /* 账号授权 */
      editAccount(d) {
        operableAccount({ user_id: d.user_id }).then(res => {
          const arr = []
          this._.forEach(res.data, v => {
            if (Number(v.user_id) > 0) {
              arr.push(v.account_group_name)
            }
          })
          this.addPrivileges = {
            open: true,
            operation: 'edit',
            data: res.data,
            pointId: d.user_id,
            defaultKeys: arr
          }
        })
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.getList()
      },
      // 筛选图标处理
      handleFilterChange(filters) {
        if (filters.status instanceof Array) {
          if (filters.status.length === 0) {
            this.filter = 'filter'
            document.querySelector(' .el-table th>.cell>span>svg').style.color = '#c0c4cc'
          } else {
            this.filter = 'filter-in'
            document.querySelector(' .el-table th>.cell.highlight>span>svg').style.color = '#f00'
          }
        }
      },
      // 去除前后空格
      trim(str) {
        return String(str).replace(/^\s+|\s+$/g, '')
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
<style rel="stylesheet/scss" lang="scss" scoped></style>
