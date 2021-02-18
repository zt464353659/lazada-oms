<template>
  <el-dialog
    :title="isNewRecord ? '新增' : '编辑'"
    :visible="open"
    :before-close="onClose"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      size="small"
      label-width="100px"
      class="permission-form"
    >
      <input
        type="hidden"
        v-model="form.id"
      >
      <!--<el-form-item label="平台名称" prop="platform">-->
      <!--<el-input v-model="form.platform"></el-input>-->
      <!--</el-form-item>-->
      <el-form-item
        label="父级权限"
        prop="pid_list"
      >
        <el-cascader
          style="width: 90%;"
          :options="options"
          change-on-select
          :props="props"
          v-model="form.pid_list"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="权限名称"
        prop="name"
      >
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item
        label="Tag"
        prop="tag"
      >
        <el-input v-model="form.tag" />
      </el-form-item>
      <el-form-item
        label="Action"
        prop="action"
      >
        <el-input v-model="form.action" />
      </el-form-item>
      <el-form-item
        label="验证权限"
        prop="is_checked"
      >
        <el-radio-group v-model="form.is_checked">
          <el-radio :label="1">
            是
          </el-radio>
          <el-radio :label="0">
            否
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="请求类型"
        prop="method"
      >
        <el-select
          v-model="form.method"
          placeholder="请选择请求类型"
        >
          <el-option
            label="GET"
            value="GET"
          />
          <el-option
            label="POST"
            value="POST"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="service_url"
        prop="service_url"
      >
        <el-input v-model="form.service_url" />
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
  import { addPermission, editPermission } from '@/api/permission'
  // import { transformTreeToList, transformToOptions } from '@/utils/help'
  export default {
    data() {
      const checkName = (rule, value, callback) => {
        const reg = /^[A-Za-z0-9\u4e00-\u9fa5()（）/ ]+$/
        if (!reg.test(value)) {
          callback(new Error('存在非法字符'))
        } else {
          callback()
        }
      }
      const checkTag = (rule, value, callback) => {
        const reg = /(^[A-Za-z0-9\u4e00-\u9fa5().-]+$)|(^\s*$)/
        if (!reg.test(value)) {
          callback(new Error('存在非法字符'))
        } else {
          callback()
        }
      }
      const checkAction = (rule, value, callback) => {
        const reg = /(^[A-Za-z0-9\u4e00-\u9fa5()/-]+$)|(^\s*$)/
        if (!reg.test(value)) {
          callback(new Error('存在非法字符'))
        } else {
          callback()
        }
      }
      return {
        isNewRecord: true,
        form: {
          id: null,
          pid: null,
          pid_list: [],
          name: null,
          tag: null,
          action: null,
          method: null,
          platform: 'lazada-operation',
          service_url: '',
          is_checked: 1
        },
        options: [],
        defaultOption: [{
          id: '0',
          pid: '0',
          pid_list: ['0'],
          name: '顶级权限',
          tag: null,
          action: null,
          method: 'GET'
        }],
        props: {
          value: 'id',
          label: 'name'
        },
        rules: {
          pid_list: [
            { required: true, message: '父级权限不能为空', trigger: 'change' }
          ],
          platform: [
            { required: true, message: '平台不能为空', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '权限名称不能为空', trigger: 'change' },
            { max: 50, message: '不能超过50个字符', trigger: 'change' },
            { validator: checkName, trigger: 'change' }
          ],
          tag: [
            { required: true, message: '权限标签不能为空', trigger: 'change' },
            // { max: 30, message: '不能超过30个字符', trigger: 'blur' },
            { validator: checkTag, trigger: 'change' }
          ],
          action: [
            // { max: 30, message: '不能超过30个字符', trigger: 'blur' },
            { validator: checkAction, trigger: 'change' }
          ],
          method: [
            { required: true, message: '请求类型不能为空', trigger: 'change' }
          ]
        }
      }
    },
    props: {
      data: {
        type: Object,
        required: true
      },
      open: {
        type: Boolean,
        default: false
      },
      treeData: {
        type: Array,
        default: () => []
      }
    },
    watch: {
      data(newVal) {
        this.isNewRecord = this._.isEmpty(newVal)
        if (this.isNewRecord) {
          this.form = {
            id: null,
            pid: null,
            pid_list: [],
            name: null,
            tag: null,
            action: null,
            method: null,
            platform: 'lazada-operation',
            service_url: '',
            is_checked: 1
          }
        } else {
          this.form.pid_list = this.data.pid_list
          if (this.form.pid_list.length > 1) {
            this._.pull(this.form.pid_list, '0')
          }
          this.form = this._.assign(this.form, this._.pick(newVal, this._.keys(this.form)))
          this.form.is_checked = Number(this.form.is_checked)
          if (this.form.pid === '0') {
            this.defaultOption[0].id = '0'
          } else {
            delete this.defaultOption[0].id
          }
        }
        this.options = this._.concat(this.defaultOption, this.treeData)
      }
    },
    methods: {
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.isNewRecord) {
              const num1 = this.form.pid_list.length
              const key1 = num1 - 1
              this.form.pid = this.form.pid_list[key1]
              addPermission(this.form).then(response => {
                this.closeClearForm()
                this.$emit('reload')
              })
            } else {
              const num2 = this.form.pid_list.length
              const key2 = num2 - 1
              this.form.pid = this.form.pid_list[key2]
              if (this.form.pid_list[0] === undefined) {
                this.form.pid = 0
              }
              if (this.form.pid === this.form.id) {
                this.$alert('不能放在这里')
              } else {
                editPermission(this.form).then(response => {
                  this.closeClearForm()
                  this.$emit('reload')
                })
              }
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

<style rel="stylesheet/scss" lang="scss" scoped>
  .permission-form {
    .el-input, .el-select {
      width: 90%;
    }
  }
</style>
