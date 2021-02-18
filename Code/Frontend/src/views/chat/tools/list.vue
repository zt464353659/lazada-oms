<template>
  <div>
    <div class="tool-parent">
      <div class="tool-child" @click="transition" v-permission="permissions.export">
        <svg-icon iconClass="export"></svg-icon>
        <el-button type="text">回复率和回复时长</el-button>
      </div>
    </div>
    <!--转换弹窗-->
    <export-response-rate v-bind.sync="exportDataDialog"></export-response-rate>
  </div>
</template>

<script>
import exportResponseRate from '@/views/chat/tools/exportResponseRate'

export default {
  components: { exportResponseRate },
  data() {
    return {
      permissions: {
        export: 'lazada-operation.toolbar.export-store-performance',//导出回复率
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
