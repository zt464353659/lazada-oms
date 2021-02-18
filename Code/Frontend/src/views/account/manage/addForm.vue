<template>
  <el-dialog
    :title="operation === 'add' ? '添加账号' : '编辑账号'"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
  >
    <template>
      <el-form
        v-loading="loading"
        ref="form"
        :model="form"
        :rules="rules"
        label-width="130px"
        size="small"
        @submit.native.prevent
      >
        <el-form-item
          label="账号组"
          prop="account_group_name"
        >
          <el-input
            style="width: 90%"
            v-model="form.account_group_name"
            clearable
            size="mini"
            placeholder="请输入账号组"
          />
          <div class="tips">注意：请保证每套账号的账号组名一致</div>
        </el-form-item>
        <el-form-item
          label="账号"
          prop="account_name"
          v-if="operation === 'add'"
        >
          <el-input
            style="width: 90%"
            v-model="form.account_name"
            clearable
            size="mini"
            placeholder="请输入账号"
          />
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input
            style="width: 90%"
            v-model="form.password"
            clearable
            size="mini"
            placeholder="请输入账号密码"
          />
        </el-form-item>
        <el-form-item label="站点" prop="site_code" v-if="operation === 'add'">
          <el-checkbox-group v-model="form.site_code">
            <el-checkbox v-for="(item,ind) in options" :key="ind" :label="item.site_code"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="验证码" prop="verify_code" v-if="need_verify">
          <el-input type="text" v-model="form.verify_code" placeholder="请输入验证码" size="mini" style="width:90%;"></el-input>
        </el-form-item>
      </el-form>
    </template>
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
        @click="addSite('form')"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import store from '@/store'
  import { addAccount, editAccount, getAllSite } from '@/api/account'

  export default {
    props: {
      open: {
        type: Boolean,
        default: false
      },
      formData: {
        type: Object,
        default: () => {
          return {
            account_name: '',
            account_group_name: '',
            password: '',
          }
        }
      },
      operation: {
        type: String,
        default: ''
      },
      siteCode: {
        type: Array,
        default: () => []
      }
    },
    data() {
      const checkVerify = (rule, value, callback) => {
        const reg = /^\d{6}$/
        if (reg.test(value)) {
          callback()
          return
        }
        callback(new Error('请输入6位数字验证码'))
      }
      const checkSite = (rule,value,callback) => {
        if (!this.form.site_code.length) {
          callback(new Error('请选择站点'))
        }
        callback()
      }
      return {
        options: [],
        rules: {
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 0, max: 100, message: '最大长度为100个字符', trigger: 'blur' }
          ],
          account_name: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            { min: 1, max: 100, message: '最大长度为100个字符', trigger: 'blur' }
          ],
          account_group_name: [
            { required: true, message: '请输入账号组', trigger: 'blur' },
            { min: 1, max: 100, message: '最大长度为100个字符', trigger: 'blur' }
          ],
          verify_code: [
            { required: true, validator: checkVerify, trigger: 'blur' }
          ],
          site_code: [{ required: true, validator: checkSite, trigger: 'change' }]
        },
        loading: false,
        initData: {},
        form: {
          account_name: '',
          account_group_name: '',
          password: '',
          // verify_code: '',
          site_code: []
        },
        platform: 'lazada',
        need_verify: false
      }
    },
    created() {
      this.searchInit()
    },
    methods: {
      searchInit() {
        getAllSite().then(res => {
          this.options = res.data
        })
      },
      addSite(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true
            // 需要验证码添加验证码参数
            // if (this.need_verify) {
            //   form.verify_code = this.form.verify_code
            // }
            if (this.operation === 'add') {
              const form = {
                account_name: this.form.account_name,
                password: btoa(btoa(btoa(`${this.platform}${this.form.password}`))),
                account_group_name: this.form.account_group_name,
                site_code: this.form.site_code.join(',')
              }
              addAccount(form).then(res => {
                this.loading = false
                // if (res.data.is_verify) {
                //接口返回是否需要验证码
                // this.$message.warning('该账号需要输入验证码')
                // this.need_verify = true
                // return
                // }
                this.closeClearForm()
                this.$emit('reload')
              }).catch(err => {
                this.loading = false
              })
            } else {
              const isSame = this._.isEqual(this.form, this.initData)
              // 编辑内容未改变关闭弹窗
              if (isSame) {
                this.closeClearForm()
              } else {
                const form = {
                  password: btoa(btoa(btoa(`${this.platform}${this.form.password}`))),
                  account_group_name: this.form.account_group_name,
                  account_id: this.form.site_code.join(',')
                }
                editAccount(form).then(res => {
                  this.closeClearForm()
                  this.$emit('reload')
                }).catch(err => {
                  this.loading = false
                  this.$message.error(err)
                })
              }
            }
          }
        })
      },
      onCancel() {
        this.closeClearForm()
      },
      onClose() {
        this.closeClearForm()
      },
      closeClearForm() {
        this.loading = false
        this.form = {
          account_name: '',
          account_group_name: '',
          password: '',
          verify_code: '',
          site_code: []
        }
        this.$emit('update:data', {})
        this.$emit('update:open', false)
        this.need_verify = false
      }
    },
    watch: {
      open(val){
        if (val) {
          if (this.operation === 'add') {
            this.form.site_code = this.options.map(v => v.site_code)
          }
        }
      },
      formData: {
        deep: true,
        immediate: true,
        handler(val) {
          if (!this._.isEmpty(val)) {
            const data = this._.cloneDeep(this.formData)
            this.initData = {
              account_group_name: data.account_group_name,
              password: atob(atob(atob(String(data.password)))).slice(6),
              site_code: data.info.map(v => v.account_id)
            }
            this.form = this._.cloneDeep(this.initData)
            console.log(this.form)
          }
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .el-form-item {
    p {
      margin: 0;
      color: #F56C6C;
      font-size: 12px;
    }

    .tips {
      width: 90%;
      line-height: 1.7;
      color: #F56C6C;
      font-size: 14px
    }
  }
</style>
