<template>
  <el-dialog
    title="发送图片"
    class="dialog-add-upload-plan"
    :visible="open"
    v-loading="listLoading"
    :before-close="closeClearForm"
    width="700px"
  >
    <template>
      <img
        :src="data.src"
        alt
        class="past-img"
      >
    </template>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="closeClearForm">
        取 消
      </el-button>
      <el-button
        type="primary"
        @click="onConfirm"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { getToken } from '@/utils/auth'
  import { getUploadPath } from '@/utils/help'
  import axios from 'axios'
  export default {
    props: {
      open: Boolean,
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        uploadPath: getUploadPath(),
        listLoading: false
      }
    },
    computed: {},
    created() {},
    methods: {
      closeClearForm() {
        this.$emit('update:open', false)
      },
      onConfirm() {
        this.listLoading = true
        const fileData = this.dataURItoBlob(this.data.src)
        const formData = new FormData()
        formData.append('file', fileData)
        formData.append('url', this.data.productOption.platform)
        formData.append('token', this.data.productOption.authorization.replace('Bearer ', ''))
        formData.append('to_id', '0-' + this.data.productOption.data.to_id)
        formData.append('not_show_message', true)
        axios({
          url: this.uploadPath,
          method: 'post',
          headers: {
            Authorization: getToken()
          },
          data: formData
        }).then((res) => {
          this.listLoading = false
          if (res.data.data && res.data.data.url) {
            const obj = {
              url: res.data.data.url
            }
            this.$emit('send-image', obj, 'image', 'isPaste')
            this.$emit('update:open', false)
          } else {
            this.$message.error('发送图片失败')
          }
        }).catch(() => {
          this.$message.error('发送图片失败')
          this.listLoading = false
        })
      },
      // 转换 base64 为 file类型
      dataURItoBlob(base64Data) {
        let byteString
        if (base64Data.split(',')[0].indexOf('base64') >= 0) {
          byteString = atob(base64Data.split(',')[1])
        } else {
          byteString = unescape(base64Data.split(',')[1])
        }
        var mimeString = base64Data
          .split(',')[0]
          .split(':')[1]
          .split(';')[0]
        var ia = new Uint8Array(byteString.length)
        this._.forEach(byteString, (v, i) => {
          ia[i] = byteString.charCodeAt(i)
        })
        const blob = new Blob([ia], { type: mimeString })
        const type = base64Data.substring(base64Data.indexOf(':') + 1, base64Data.indexOf(';'))
        return new window.File([blob], Math.random() + '', { type })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.past-img {
  display: block;
  max-width: 500px;
  margin: 0 auto;
  border: 1px solid #b0b0b0;
}
</style>
