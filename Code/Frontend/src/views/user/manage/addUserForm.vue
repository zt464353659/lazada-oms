<template>
  <div>
    <el-dialog
      title="添加用户"
      class="dialog-add-user"
      :visible="open"
      :before-close="onClose"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-steps
        v-loading="loading"
        direction="vertical"
      >
        <el-step
          title="基本信息"
          status="finish"
        >
          <template slot="description">
            <el-form
              :inline="true"
              :model="listQuery"
              size="small"
              @submit.native.prevent
            >
              <!--<h2>基本信息</h2>-->
              <el-form-item
                label="输入用户名检索"
                :label-width="'200px'"
              >
                <el-autocomplete
                  ref="input"
                  v-model="listQuery.key"
                  :fetch-suggestions="querySearchAsync"
                  placeholder="请输入用户名自动检索，最少输入两个字符开始检索"
                  @select="handleSelect"
                  :trigger-on-focus="false"
                />
              </el-form-item>
            </el-form>
            <el-table
              empty-text="暂无用户信息"
              :data="searchTableData"
              border
              size="small"
              class="table-gray"
              style="width: 100%"
            >
              <el-table-column
                prop="login_id"
                label="用户名"
                width="100"
              />
              <el-table-column
                prop="name"
                label="姓名"
                width="280"
              />
              <el-table-column
                prop="name_en"
                label="英文名"
                width=""
              />
              <el-table-column
                prop="mobile_phone"
                label="手机"
                width=""
              />
              <el-table-column
                prop="email"
                label="邮箱"
                width="160"
              />
            </el-table>
          </template>
        </el-step>
        <el-step
          title="账号编辑"
          status="finish"
        >
          <template slot="description">
            <el-button
              size="mini"
              type="primary"
              plain
              :disabled="searchTableData.length === 0"
              @click="editJurisdiction"
            >
              账号配置
            </el-button>
          </template>
        </el-step>
      </el-steps>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          :disabled="loading"
          @click="onCancel"
        >
          取 消
        </el-button>
        <el-button
          :disabled="loading"
          type="primary"
          @click="addUser"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>
    <account-privileges
      v-bind.sync="addPrivileges"
      @reload="reload"
    />
  </div>
</template>

<script>
  import { searchUserRequest, searchUserInfoRequest, addUserRequest, operableAccount } from '@/api/user'
  import accountPrivileges from './accountPrivileges'

  export default {
    components: { accountPrivileges },
    data() {
      return {
        isNewRecord: true,
        listQuery: {
          key: undefined
        },
        searchTableData: [],
        form: {
          id: null,
          name: null,
          status: null
        },
        addPrivileges: {
          open: false,
          operation: 'add',
          data: [],
          pointId: '',
          defaultKeys: []
        },
        options: [],
        searchNameLen: '2',
        roleParams: [],
        loading: false
      }
    },
    props: {
      data: {
        type: Object,
        default: () => {
        },
        required: true
      },
      open: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      /* 添加用户弹窗确定按钮的回调事件 */
      addUser() {
        if (this.searchTableData.length === 0) {
          this.$message.error('无法添加空用户！')
          return
        }
        this.$confirm('确认添加此用户吗？').then(_ => {
          const select_list = this.roleParams.select_list
          this.loading = true
          addUserRequest({ user_id: this.searchTableData[0].user_id, select_list }).then(response => {
            this.loading = false
            this.searchTableData = []
            this.listQuery.key = ''
            this.roleParams = []
            this.$emit('update:open', false)
            this.$emit('reload')
          }).catch(() => {
            this.loading = false
          })
        }).catch(_ => {
        })
      },
      /* 查询用户 */
      loadAccountData(str, cb) {
        const searchUserParams = this.listQuery.key
        searchUserRequest(searchUserParams).then(response => {
          const r = response.data
          let results = str ? r.filter(this.createFilter(str)) : r
          if (results.length === 0) {
            results = [{ value: '查询不到此用户，请检查输入是否正确' }]
          }
          cb(results)
          this.emptySearchTableData()
        })
      },
      /* 验证用户输入 */
      querySearchAsync(str, cb) {
        if (str.length < this.searchNameLen) {
          cb([{ value: '请最少输入2个字符检索' }])
          return
        }
        this.loadAccountData(str, cb)
      },
      createFilter(str) {
        return (r) => {
          return (r.value.toLowerCase().indexOf(str.toLowerCase()) === 0)
        }
      },
      handleSelect() {
        const searchUserParams = this.listQuery.key
        searchUserInfoRequest(searchUserParams).then(response => {
          this.searchTableData = response.data
        })
      },
      onCancel() {
        this.roleParams = []
        this.loading = false
        this.listQuery.key = ''
        this.emptySearchTableData()
        this.$emit('update:open', false)
      },
      onClose() {
        this.roleParams = []
        this.loading = false
        this.listQuery.key = ''
        this.emptySearchTableData()
        this.$emit('update:open', false)
      },
      emptySearchTableData() {
        this.searchTableData = []
      },
      editJurisdiction() {
        operableAccount({ user_id: 0 }).then(res => {
          // this._.forEach(res.data, v => {
          //   v.id = Number(v.id * 100000)
          //   this._.forEach(v.child, (v1) => {
          //     if (v1.selected === 1) {
          //       v1.id = Number(v1.id)
          //     }
          //   })
          // })
          this.addPrivileges = {
            open: true,
            operation: 'add',
            data: res.data,
            pointId: this.searchTableData.length ? this.searchTableData[0].user_id : '',
            defaultKeys: []
          }
        })
      },
      reload(data) {
        this.roleParams = data
      }
    },
    watch: {
      open(newValue) {
        if (newValue) {
          this.$nextTick(_ => {
            this.$refs.input.focus()
          })
        }
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .dialog-add-user .el-autocomplete {
    width: 400px;
  }

  h2 {
    font-size: 14px;
    &::before {
      content: "1";
      background: #41a1ff;
      color: transparent;
      margin-right: 10px;
    }
  }
</style>
