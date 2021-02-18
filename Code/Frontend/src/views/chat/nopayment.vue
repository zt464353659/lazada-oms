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
              :label="item.account"
              :value="item.account"
              :key="index"
            />
          </el-select>
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
          width="100"
        />
        <el-table-column
          prop="site_code"
          label="站点"
          width="100"
        />
        <el-table-column
          prop="tips"
          label="提示内容"
          min-width="417"
        >
          <template slot-scope="scope">
            <div
              v-html="scope.row.tips"
              style="white-space: pre-line"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="tips_status"
          label="状态"
          width="100"
          column-key="tips_status"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.tips_status === '1' ? 'success' : 'info'"
              size="small"
              disable-transitions
            >
              {{ scope.row.tips_status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              v-permission="permission.edit"
              @click="enableOperation(scope.row)"
            >
              {{ scope.row.tips_status === '1' ? '禁用': '启用' }}
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
    </div>
    <!--dialog-->
    <el-dialog
      title="编辑待付款提示"
      :visible="dialog.open"
      v-loading="dialog.loading"
      @closed="onClosed"
      :before-close="onCancel"
      width="680px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
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
        <el-form-item
          label="提示内容"
          prop="tips"
        >
          <el-input
            type="textarea"
            v-model="form.tips"
            :autosize="{ minRows: 6, maxRows: 10}"
          />
          <!---->
        </el-form-item>
        <el-form-item style="margin-top:-15px; margin-bottom: -5px">
          <span class="tips"><svg-icon
            icon-class="opportunity"
            class="opportunity"
          />超过12H订单未支付，通过聊聊自动发送提示消息</span>
        </el-form-item>
        <el-form-item label="提示状态">
          <el-switch
            v-model="form.tips_status"
            active-value="1"
            inactive-value="0"
            active-icon-class="nopayment_switch_active"
            inactive-icon-class="nopayment_switch_inactive"
            @change="changeStatus"
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
  import { fetchNoPayment, fetchNoPaymentSeting } from '@/api/chat'
  export default {
    name: 'Nopayment',
    data() {
      const validateTips = (rule, value, callback) => {
        if (!value.replace(/\s/g, '')) {
          callback(new Error('提示内容不能为空'))
        } else if (this._.trim(value.replace(/ +/g, ' ').replace(/\n( ?\n)+/g, '\n').length) > 300) {
          callback(new Error('提示内容信息不能超过300个字'))
        }
        this.form.tips = this._.trim(this.form.tips.replace(/ +/g, ' ').replace(/\n( ?\n)+/g, '\n'))
        callback()
      }
      return {
        listLoading: false,
        maxHeight: document.documentElement.clientHeight - 200,
        // 权限
        permission: {
          edit: 'operation.chat.auto-tips.set-tips'
        },
        // 表格相关内容
        listQuery: {
          site_code: undefined
        },
        listData: [],
        siteCodeList: [],
        // dialog
        dialog: {
          open: false,
          loading: false,
          btnUnable: false
        },
        form: {
          id: '',
          tips_status: '',
          tips: '',
          site_code: '',
          update_user_id: ''
        },
        rules: {
          tips: [
            { required: true, validator: validateTips, trigger: 'blur' }
          ]
        }
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
      this.getList('init')
    },
    methods: {
      // 获取列表
      getList(sign) {
        this.listLoading = true
        this.listData = []
        sign === 'init' ? this.siteCodeList = [] : ''
        this.listQuery.site_code = this.listQuery.site_code || undefined
        fetchNoPayment(this.listQuery).then((res) => {
          this.listData = res.data
          if (sign === 'init') {
            res.data.forEach(item => {
              this.siteCodeList.push({ account: item.site_code })
            })
          }
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
      },
      // 清楚
      clearSearch() {
        this.listQuery.site_code = undefined
        this.getList()
      },
      // 禁用/启用
      enableOperation(row) {
        const tips = row.tips_status === '1' ? '禁用' : '启用'
        const status = row.tips_status === '1' ? '0' : '1'
        this.$confirm(`确定${tips}${row.site_code}站点待付款提示吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(_ => {
          this.listLoading = true
          this.editOperationData({ id: row.id, tips_status: status, update_user_id: this.$store.getters.userInfo.id }).catch(_ => { this.listLoading = false })
        })
      },
      // 编辑dialog
      editDialog(row) {
        this.dialog.open = true
        this.form = {
          id: row.id,
          tips_status: row.tips_status,
          tips: row.tips,
          site_code: row.site_code,
          update_user_id: this.$store.getters.userInfo.id
        }
      },
      // dialog
      onClosed() {
        this.dialog.open = false
        this.form = {
          id: '',
          tips_status: '',
          tips: '',
          site_code: '',
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
          fetchNoPaymentSeting(params).then(res => {
            resolve()
            this.getList()
          }).catch(_ => {
            reject()
          })
        })
      },
      changeStatus() {
        this.$refs.form.validateField('tips')
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
  .tips {
    font-size: 12px;
    color:#E6A23C;
  }
  .opportunity {
    font-size: 16px;
  }
</style>

