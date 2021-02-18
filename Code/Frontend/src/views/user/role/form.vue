<template>
  <el-dialog
    :title="isNewRecord ? '新增' : '编辑'"
    :visible="open"
    :before-close="onClose"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      ref="form"
      :model="form"
      label-width="80px"
      :rules="rules"
      size="small"
      @submit.native.prevent
    >
      <input
        type="hidden"
        v-model="form.role_id"
      >
      <el-form-item
        label="角色名称"
        prop="name"
      >
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="启用">
        <el-switch v-model="form.status" />
      </el-form-item>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="onCancel">取 消</el-button>
      <el-button
        type="primary"
        @click="onSubmit('form')"
      >确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { toBoolean } from '@/utils'
  import { addRoleRequest, editRoleRequest } from '@/api/role'

  export default {
    name: 'RoleForm',
    data() {
      var checkName = (rule, value, callback) => {
        var reg = /^[A-Za-z0-9\u4e00-\u9fa5()（）/ ]+$/
        if (!reg.test(value)) {
          callback(new Error('存在非法字符'))
        } else {
          callback()
        }
      }
      return {
        isNewRecord: true,
        form: {
          role_id: null,
          name: null,
          status: null
        },
        options: [],
        rules: {
          name: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' },
            { max: 30, message: '不能超过30个字符', trigger: 'blur' },
            { validator: checkName, trigger: 'blur' }
          ]
        }
      }
    },
    props: {
      data: {
        type: Object,
        default: () => {},
        required: true
      },
      open: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      data(newVal) {
        this.isNewRecord = this._.isEmpty(newVal)
        if (this.isNewRecord) {
          this.form = this._.mapValues(this.form, () => null)
          this.form.status = true
        } else {
          this.form = this._.assign(this.form, this._.pick(newVal, this._.keys(this.form)))
          this.form.status = toBoolean(this.form.status)
        }
      }
    },
    methods: {
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.isNewRecord) {
              addRoleRequest(this.form).then(response => {
                this.closeClearForm()
                this.$emit('reload')
              })
            } else {
              editRoleRequest(this.form).then(response => {
                this.closeClearForm()
                this.$emit('reload')
              })
            }
          } else {
            return false
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
        this.$refs['form'].resetFields()
        this.$emit('update:data', {})
        this.$emit('update:open', false)
      }
    }
  }
</script>
