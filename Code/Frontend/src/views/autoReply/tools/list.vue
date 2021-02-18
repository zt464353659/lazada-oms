<template>
  <div>
    <div class="tool-parent">
      <div class="tool-child" v-permission="permissions.export" @click="transition">
        <svg-icon iconClass="export"></svg-icon>
        <el-button type="text">自动回复率统计</el-button>
      </div>
    </div>
    <!--转换弹窗-->
    <export-response-rate v-bind.sync="exportDataDialog"></export-response-rate>
  </div>
</template>

<script>
import exportResponseRate from '@/views/autoReply/tools/exportResponseRate'

export default {
  components: { exportResponseRate },
  data() {
    return {
      permissions: {
        export: 'lazada-operation.toolbar.auto-reply-rate'//自动回复率统计
      },//权限
      exportDataDialog: {
        open: false
      }
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    transition() {
      this.exportDataDialog = {
        open: true
      }
    }
  },
  filters: {},
  watch: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.tool-parent {
  display: flex;

  .tool-child {
    margin: 15px;
    text-align: center;
    cursor: pointer;
  }
}

.svg-icon {
  font-size: 38px;
  margin: 20px 20px 0 20px;
  color: #0078d7;
  display: block;
}
</style>
