<template>
  <el-dialog
    title="修改用户角色"
    class="dialog-edit-user-roles"
    :visible="open"
    :before-close="onClose"
    width="900px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      :model="formData"
      size="small"
      label-width="200px"
      class="demo-form-inline"
    >
      <el-form-item label="输入角色名称检索">
        <el-input
          v-model="formData.name"
          placeholder="请输入角色名称"
          clearable
          style="width: 80%"
        />
      </el-form-item>
    </el-form>
    <el-checkbox-group
      v-model="checkedRoles"
      size="mini"
    >
      <el-checkbox
        v-for="role in roles"
        :label="role.id"
        :key="role.id"
        :disabled="Number(role.status) !== 1"
        v-show="isShowFunc(role.name)"
      >
        {{ role.name }}
      </el-checkbox>
    </el-checkbox-group>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="onCancel">
        取 消
      </el-button>
      <el-button
        type="primary"
        @click="saveUserRoles"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { fetchUserRolesList, saveUserRolesList } from '@/api/user'
  import store from '@/store'

  export default {
    data() {
      return {
        formData: {
          name: ''
        },
        checkAll: false,
        // 当前行数据
        cRowData: {},
        // 选中的角色
        checkedRoles: [],
        // 角色全集(name+id的数组)
        roles: []
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
    mounted() {
      // document.querySelector('.el-dialog__body').scrollTop = 0
    },
    watch: {
      open(val) {
        if (val) {
          this.cRowData = this.data
          this.checkedRoles = this.cRowData.role_id.split(',').map(v => Number(v))
          this.getRolesList()
        }
      }
    },
    methods: {
      isShowFunc(value) {
        return this._.includes(value, this.formData.name)
      },
      getRolesList() {
        fetchUserRolesList().then(response => {
          this.roles = response.data
          document.querySelector('.el-dialog__body').scrollTop = 0
        })
      },
      saveUserRoles() {
        const roleParams = {
          id: this.data.user_id,
          roleId: this.checkedRoles.join(',')
        }
        saveUserRolesList(roleParams).then(response => {
          if (this.cRowData.name === store.getters.userInfo.name) {
            window.location.reload()
          } else {
            this.formData.name = ''
            this.$emit('update:open', false)
            this.$emit('reload')
          }
        })
      },
      onCancel() {
        this.formData.name = ''
        this.checkedRoles = this.cRowData.role_id.split(',')
        this.$emit('update:open', false)
      },
      onClose() {
        this.formData.name = ''
        this.$emit('update:open', false)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .dialog-edit-user-roles {
    .el-checkbox {
      margin: 6px 1%;
      min-width: 23%;
    }
  }
</style>
