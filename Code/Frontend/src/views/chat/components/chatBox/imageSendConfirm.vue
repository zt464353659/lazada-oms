<template>
  <div v-show="open">
    <div class="image-model">
      <div class="lzd-preview__content">
        <div class="lzd-preview__viewer">
          <img v-if="content.imgUrl" :src="content.imgUrl" alt="">
        </div>
      </div>
      <div class="lzd-preview__footer">
        <el-button size="mini" type="primary" @click="closeModel">取消</el-button>
        <el-button size="mini" type="danger" @click="sendPicture">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageSendConfirm',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    obj: {
      type: Object,
      require: true,
      default: () => {
      }
    },
    content: {
      type: Object,
      require: true,
      default: () => {
        return { imgUrl: '' }
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    closeModel() {
      this.$emit('update:open', false)
      // this.$emit('cancelPicture')
    },
    sendPicture() {
      this.$emit('update:open', false)
      this.$emit('send-picture', { file: this.obj.file, imgUrl: this.content.imgUrl }, 'image')
    }
  },
  filters: {},
  watch: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.image-model {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, .7);
  z-index: 1000;

  .lzd-preview__content {
    min-height: 560px;
    flex: 1 1;
    display: flex;
    padding: 30px;

    .lzd-preview__viewer {
      width:100%;
      min-height: 410px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      img{
        max-height:400px;
      }
    }
  }

  .lzd-preview__footer {
    display: flex;
    justify-content: center;
    background-color: rgba(0, 0, 0, .5);
    padding: 60px 50px;
  }
}
</style>
