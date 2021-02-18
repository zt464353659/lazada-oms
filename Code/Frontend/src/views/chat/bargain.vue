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
            placeholder="选择站点"
          >
            <el-option
              v-for="(item, index) in siteCodeList"
              :label="item"
              :value="item"
              :key="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账号">
          <el-input
            type="text"
            v-model="listQuery.account"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="负责人"
          v-show="roleId === '168'"
        >
          <el-input
            type="text"
            v-model="listQuery.duly_name"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-select
            v-model="listQuery.discuss_price_status"
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
            @click="getList"
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
          prop="id"
          label="ID"
        />
        <el-table-column
          prop="site_code"
          label="站点"
        />
        <el-table-column
          prop="account"
          label="账号"
        />
        <el-table-column
          prop="discuss_price"
          label="保本价比率%"
        />
        <el-table-column
          prop="discuss_price_status"
          label="状态"
          width="150"
          column-key="discuss_price_status"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.discuss_price_status === '1' ? 'success' : 'info'"
              size="small"
              disable-transitions
            >
              {{ scope.row.discuss_price_status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="duly_name"
          label="负责人"
        />
        <el-table-column label="更新时间">
          <template slot-scope="scope">
            <div>{{ fattTime(scope.row.update_time) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              v-if="scope.row.active === '1'"
              v-permission="permission.edit"
              @click="enableOperation(scope.row)"
            >
              {{ scope.row.discuss_price_status === '1' ? '禁用': '启用' }}
            </el-button>
            <el-button
              type="text"
              size="mini"
              v-permission="permission.edit"
              @click="editDialog(scope.row)"
            >
              编辑
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
    <!--dialog-->
    <el-dialog
      title="编辑议价设置"
      :visible="dialog.open"
      v-loading="dialog.loading"
      @closed="onClose"
      width="680px"
      :before-close="onCancel"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-dragMove
    >
      <el-form
        ref="form"
        :model="form"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item label="站点">
          <span>{{ form.site_code }}</span>
        </el-form-item>
        <el-form-item label="账号">
          <span>{{ form.account }}</span>
        </el-form-item>
        <el-form-item
          label="保本价比率"
          prop="discuss_price"
        >
          <el-input
            type="text"
            v-model="form.discuss_price"
            style="width:200px;"
          /><span style="padding-left:10px">%</span><br>
        </el-form-item>
        <el-form-item class="tip_item ">
          <div class="explan">
            <span>说明：</span><br>
            <span>买家要求的价格 ≥ 保本价*保本价比率时，自动接受议价</span><br>
            <span>买家要求的价格＜保本价*保本价比率时，自动拒绝议价</span>
          </div>
        </el-form-item>
        <el-form-item label="使用状态">
          <el-switch
            v-model="form.discuss_price_status"
            active-value="1"
            :disabled="form.active === '0'"
            inactive-value="0"
            active-icon-class="nopayment_switch_active"
            inactive-icon-class="nopayment_switch_inactive"
          />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          @click="onCancel"
          :disabled="dialog.btnUnable"
        >取 消</el-button>
        <el-button
          type="primary"
          @click="onSubmit"
          :disabled="dialog.btnUnable"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { fetchBargain, fetchBargainSeting } from '@/api/chat'
  import { fattCreateTime } from '@/utils'
  import store from '@/store'
  export default {
    name: 'Bargain',
    data() {
      const validatePrice = (rule, value, callback) => {
        value = value.trim()
        if (!value) {
          callback(new Error('保本价比率不能为空'))
        } else if (!/^[1-9]\d*$/.test(value)) {
          callback(new Error('保本价比率必为正整数'))
        } else if (parseInt(value) < 95) {
          callback(new Error('保本价比率不小于95'))
        }
        this.form.discuss_price = this._.trim(this.form.discuss_price)
        callback()
      }
      return {
        listLoading: false,
        maxHeight: document.documentElement.clientHeight - 200,
        // 权限
        permission: {
          edit: 'operation.chat.discuss-price.set-discuss-price'
        },
        roleId: store.getters.userInfo.role_id,
        // 表格相关内容
        listQuery: {
          page: 1,
          per_page: 10,
          user_id: store.getters.userInfo.id,
          role_id: store.getters.userInfo.role_id,
          site_code: undefined,
          account: undefined,
          duly_name: undefined,
          discuss_price_status: undefined
        },
        listData: [],
        pagination: null,
        siteCodeList: [],
        // dialog
        dialog: {
          open: false,
          loading: false,
          btnUnable: false
        },
        form: {
          id: '',
          discuss_price_status: '',
          discuss_price: '',
          site_code: '',
          active: undefined,
          account: undefined,
          update_user_id: ''
        },
        rules: {
          discuss_price: [
            { required: true, validator: validatePrice, trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
    },
    mounted() {
      this.getList()
      window.onresize = () => {
        return (() => {
          window.maxHeight = document.documentElement.clientHeight - 200
          this.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
        })()
      }
    },
    methods: {
      // 获取列表
      getList() {
        this.listLoading = true
        this.listData = []
        this.siteCodeList = []
        this.listQuery.site_code = this.listQuery.site_code || undefined
        this.listQuery.account = this._.trim(this.listQuery.account) || undefined
        fetchBargain(this.listQuery).then((res) => {
          this.listData = res.data.list
          this.pagination = res.data.pagination
          this.siteCodeList = res.data.site_code
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
      },
      // 清楚
      clearSearch() {
        this.listQuery.site_code = undefined
        this.listQuery.account = undefined
        this.listQuery.discuss_price_status = undefined
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
      // 格式化时间
      fattTime(time) {
        return fattCreateTime(Number(time) * 1000)
      },
      // 禁用/启用
      enableOperation(row) {
        const tips = row.discuss_price_status === '1' ? '禁用' : '启用'
        const status = row.discuss_price_status === '1' ? '0' : '1'
        this.$confirm(`确定${tips}${row.site_code}站点议价回复设置吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(_ => {
          this.listLoading = true
          this.editOperationData({ id: row.id, discuss_price_status: status, update_user_id: this.$store.getters.userInfo.id }).catch(_ => { this.listLoading = false })
        })
      },
      // 编辑dialog
      editDialog(row) {
        this.dialog.open = true
        this.form = {
          id: row.id,
          discuss_price_status: row.discuss_price_status,
          discuss_price: row.discuss_price,
          site_code: row.site_code,
          account: row.account,
          update_user_id: this.$store.getters.userInfo.id,
          active: row.active
        }
      },
      // dialog
      onClose() {
        this.form = {
          id: '',
          discuss_price_status: '',
          discuss_price: '',
          site_code: '',
          account: '',
          update_user_id: ''
        }
        this.$refs.form.clearValidate()
      },
      onCancel() {
        this.dialog.open = false
      },
      onSubmit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.dialog.btnUnable = true
            this.editOperationData(this.form).then(_ => {
              this.onCancel()
            }).finally(_ => {
              this.dialog.btnUnable = false
            })
          }
        })
      },
      // 编辑后端返回内容
      editOperationData(params) {
        return new Promise((resolve, reject) => {
          // 后端连接
          fetchBargainSeting(params).then(res => {
            resolve()
            this.getList()
          }).catch(_ => {
            reject()
          })
        })
      },
      changeStatus() {
        this.$refs.form.validateField('discuss_price')
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
  .explan{
    font-size: 12px;
    color: #E6A23C;
    line-height: 20px;
  }
</style>

