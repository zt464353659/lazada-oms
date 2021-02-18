<template>
  <el-select
    @input.native="checkAccount"
    @click.native.capture="checkAccount"
    @change="accountChange"
    v-model="account"
    :reserve-keyword="true"
    filterable
    clearable
    multiple
    collapse-tags
    placeholder="请选择"
    style="width:220px;"
    class="more-select-el"
  >
    <div style="text-align:center;padding: 2px 0" v-show="nowAccountArr.length">
      <el-button size="mini" @click="handleSelectAllUser">Select all</el-button>
      <el-button size="mini" @click="handleCancelAllUser">Cancel all</el-button>
    </div>
    <el-option
      class="sm-option"
      v-for="item in accountArr"
      :key="item.id"
      :label="item.account"
      :value="item[accountKey]"
    >
    </el-option>
  </el-select>
</template>

<script>
export default {
  props: {
    accountArr: {
      type: Array,
      default: () => {
      }
    },
    accountKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      account: [],
      nowAccountArr: [] // 存储当前account下拉框的值
    }
  },
  watch: {
    accountArr: {
      deep: true,
      handler() {
        this.nowAccountArr = this._.cloneDeep(this.accountArr)
        this.account = []
      }
    }
  },
  methods: {
    // 根据输入的值，获取当前下拉框中显示的数组
    checkAccount(el) {
      const str = el.target.value
      if (this._.trim(str) === '') {
        this.nowAccountArr = this._.cloneDeep(this.accountArr)
      } else {
        this.nowAccountArr = this._.filter(this.accountArr, v => {
          return this._.includes(v.account.toLowerCase(), str.toLowerCase())
        })
      }
    },
    // select 当前下拉框中的值 （拼接并去重）
    handleSelectAllUser() {
      const arr = this._.map(this.nowAccountArr, this.accountKey)
      this.account = this._.uniq(this._.concat(this.account, arr))
      this.accountChange()
    },
    // cancel 当前下拉框中的值
    handleCancelAllUser() {
      const arr = this._.map(this.nowAccountArr, this.accountKey)
      this.account = this._.without(this.account, ...arr)
      this.$emit('clean-select')
      this.$emit('check-set-shipping')
    },
    accountChange() {
      this.$emit('select-account', this.account)
      this.$emit('check-set-shipping')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.more-select-el{
  .el-tag{
    position: relative;
    display: inline-block;
    max-width: 130px;
    overflow: hidden;
    padding-right: 20px;
  }
  .el-icon-close{
    position: absolute;
    right: 0!important;
    bottom: 0;
    margin: auto 0;
  }
}
</style>

