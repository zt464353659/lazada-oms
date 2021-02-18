<template>
  <el-dialog
    title="自动回复率统计"
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
        <el-form-item label="时间" prop="time">
          <el-date-picker
            v-model="form.time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
    </template>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        :disabled="loading"
        type="primary"
        @click="exportData"
      >
        导 出
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import axios from 'axios'
import qs from 'qs'
import { getToken } from '@/utils/auth'

export default {
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const checkTime = (rule, value, callback) => {
      if (!this.form.time || !this.form.time.length) {
        callback(new Error('请选择时间'))
      }
      callback()
    }
    return {
      options: [],
      rules: {
        time: [{ required: true, validator: checkTime, trigger: 'change' }]
      },
      loading: false,
      form: {
        time: []
      }
    }
  },
  methods: {
    exportData() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const obj = {
            start_time: this.$moment(this.form.time[0]).format('YYYY-MM-DD') + ' 00:00:00',
            end_time: this.$moment(this.form.time[1]).format('YYYY-MM-DD') + ' 23:59:59'
          }
          const basePath = process.env.NODE_ENV === 'development' ? 'http://190.168.3.228:8000/' : process.env.VUE_APP_BASE_API
          const url = `${ basePath }lazada-operation/toolbar/auto-reply-rate`
          const loading = this.$loading({
            lock: true,
            text: `加载中`,
            spinner: 'el-icon-loading',
            background: 'rgba(f, f, f, 0.5)'
          })
          axios({
            url,
            method: 'post',
            data: qs.stringify(obj),
            headers: {
              Authorization: getToken()
            },
            responseType: 'blob'
          }).then(res => {
            // 接口返回文件流
            if (res.data.type.indexOf('json') === -1) {
              const date = this.$moment(new Date().getTime()).format('YYYYMMDDHHmmss')
              const file_name = `Lazada自动回复率统计-${ date }.xlsx`
              let url = window.URL.createObjectURL(new Blob([res.data]))
              let a = document.createElement('a')
              a.style.display = 'none'
              a.href = url
              a.setAttribute('download', file_name)
              document.body.appendChild(a)
              this.$message.success('导出成功')
              a.click() //执行下载
              window.URL.revokeObjectURL(a.href)
              document.body.removeChild(a)
              loading.close()
            } else {
              // 接口返回json
              const _this = this
              const reader = new FileReader()
              reader.readAsText(res.data, 'utf-8');
              reader.onload = function () {
                _this.$message.error(JSON.parse(reader.result).message)
                loading.close()
              }
            }

          }).catch(err => {
            this.$message.error(err.message)
            loading.close()
          })
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
      this.$emit('update:open', false)
      this.$refs['form'].resetFields()
      this.$refs['form'].clearValidate()
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
