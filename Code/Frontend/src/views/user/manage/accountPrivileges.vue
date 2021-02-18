<template>
  <el-dialog
    title="账号配置"
    class="dialog-edit-user-roles"
    v-if="open"
    :visible="true"
    v-loading="listLoading"
    :before-close="onCancel"
    :close-on-click-modal="false"
    :close-on-pres-sescape="false"
    width="680px"
  >
    <div v-loading="loading" v-if="showData.length">
      <el-input
        size="mini"
        placeholder="输入关键字进行过滤"
        clearable
        v-model="filterText"
      />
      <br>
      <br>
      <div class="row-3">
        <el-checkbox-group v-model="selectList">
          <el-checkbox v-for="item in showData" :label="item.account_group_name" :key="item.id">{{ item.account_group_name }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div v-else>暂无可配置账号</div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button type="primary" plain="" @click="resetChecked">清 空</el-button>
      <el-button
        :disabled="loading"
        @click="onCancel"
      >
        取 消
      </el-button>
      <el-button
        :disabled="loading"
        type="primary"
        @click="saveUserRoles"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import {
    editUserAccount
  } from '@/api/user'

  export default {
    props: {
      data: {
        type: Array,
        required: true
      },
      open: {
        type: Boolean,
        default: false
      },
      pointId: {
        type: [String, Number],
        default: ''
      },
      operation: {
        type: String,
        default: 'add'
      },
      defaultKeys: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        listLoading: false,
        superior_role_options: [],
        checkedRoles: [],
        filterText: '',
        defaultProps: {
          children: 'child',
          label: 'account_name'
        },
        loading: false,
        initDefault: [],
        selectList: [],
        unselectList: [],
        showData: [],
        baseData: []
      }
    },
    methods: {
      /* 筛选角色 */
      filterNode(value, data) {
        if (!value) {
          return true
        }
        return data.account.indexOf(value) !== -1
      },
      /* 清空 */
      resetChecked() {
        this.selectList = []
      },
      saveUserRoles() {
        const unSelectList = []
        const selectList = this.selectList.length ? this.selectList.join(',') : ''
        this.baseData.map(item => {
          if (!this._.includes(this.selectList, item.account_group_name)) {
            unSelectList.push(item.account_group_name)
          }
        })
        const roleParams = {
          select_list: selectList,
          un_select_list: unSelectList.length ? unSelectList.join(',') : ''
        }
        if (this.operation === 'add') {
          this.$emit('reload', roleParams)
          this.closeClearForm()
        } else {
          if (this._.isEqual(this.defaultKeys, this.selectList)) {
            this.closeClearForm()
            return
          }
          this.loading = true
          roleParams.user_id = this.pointId
          editUserAccount(roleParams).then(res => {
            this.loading = false
            this.$emit('reload')
            this.closeClearForm()
          }).catch(() => {
            this.loading = false
          })
        }
      },
      onCancel() {
        this.loading = false
        this.filterText = ''
        this.checkedRoles = []
        this.resetChecked()
        this.closeClearForm()
      },
      closeClearForm() {
        this.loading = false
        this.filterText = ''
        this.checkedRoles = []
        this.$emit('update:open', false)
      }
    },
    watch: {
      filterText(val) {
        const d = this._.trim(val)
        if (!d) {
          this.showData = this._.cloneDeep(this.baseData) || []
          return
        }
        this.showData = []
        // 筛选出展示的子集
        this._.forEach(this.baseData, v => {
          if (this._.includes(v.account_group_name, d)) {
            this.showData.push(v)
          }
        })
      },
      data: {
        deep: true,
        handler(val) {
          this.showData = this._.cloneDeep(this.data)
          this.baseData = this._.cloneDeep(this.data)
        }
      },
      open(val) {
        if (val) {
          // 初始默认选中项
          this.selectList = this._.cloneDeep(this.defaultKeys)
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped></style>
<style rel="stylesheet/scss" lang="scss">
  .filter-tree {
    & > .el-tree-node {
      & > .el-tree-node__content {
        background-color: #e6eaef;
        margin: 1px 0;
      }
      & > .el-tree-node__children {
        background-color: #eff3f8;
        & > .el-tree-node {
          min-width: 25%;
          float: left;
          & > .el-tree-node__content {
            margin: 1px 0;
          }
        }
      }
    }
    .el-tree-node__expand-icon {
      color: #409eff;
    }
    .el-tree-node__expand-icon.is-leaf {
      color: transparent;
    }
  }
  /* 多选框一行固定显示3个 */
  .row-3 .el-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    label{
      width:33%;
      margin: 5px 0px;
    }
  }
</style>
