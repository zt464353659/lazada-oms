<template>
  <el-upload
    ref="upload"
    class="img-upload"
    :action="`xxx`"
    :multiple="false"
    :accept="'.jpg, .jpeg, .png'"
    :on-change="beforeAvatarUpload"
    :show-file-list="false"
    :file-list="fileList"
    :auto-upload="false"
  >
    <svg-icon icon-class="pic" />
  </el-upload>
</template>
<script>
  import { getUploadPath } from '@/utils/help'
  export default {
    name: 'List',
    props: {
      baseObj: {
        type: Object,
        default: () => {}
      },
      productOption: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        uploadData: {
          access_token: '1'
        },
        fileList: [],
        uploadPath: getUploadPath(),
        throttleSend: this._.throttle(() => {
          const obj = {
            imgUrl: ''
          }
          this.$emit('send-img', obj, 'image')
        }, 3000),
        isSending: false,
      }
    },
    created() {
    },
    mounted() {
    },
    methods: {
      beforeAvatarUpload(file) {
        const isJPG = file.raw.type === 'image/jpeg'
        const isGIF = file.raw.type === 'image/jpg'
        const isPNG = file.raw.type === 'image/png'
        const isLt1M = file.raw.size / 1024 / 1024 < 1
        const isImageMsg = '请上传正确的图片（jpg、jpeg、png）'
        const isLt1mbMsg = '图片大小不能超过 1MB'
        if (!(isJPG || isGIF || isPNG)) {
          this.$message({
            message: isImageMsg,
            type: 'error',
            showClose: true,
            duration: 3000
          })
          this.$emit('ready-upload',false)
          return
        }
        if (!isLt1M) {
          this.$message({
            message: isLt1mbMsg,
            type: 'error',
            showClose: true,
            duration: 3000
          })
          this.$emit('ready-upload',false)
          return
        }
        this.$emit('ready-upload',file.raw)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .img-upload {
    display: inline-block;
  }
  .svg-icon {
    font-size: 20px;
    color: #ff6700;
    cursor: pointer;
  }
</style>
