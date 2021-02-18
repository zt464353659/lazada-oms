<template>
  <el-dialog
    title="Add Note"
    :visible="open"
    :before-close="closeClearForm"
    width="470px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template>
      <p>Please add your note here. This note is invisible to the buyer.</p>
      <div>
        <input type="textarea" v-model="note" class="note-input" maxlength="40">
        <div style="text-align: right">{{ `${note.length}/40` }}</div>
        <div v-show="showErr" style="color:red;font-size:12px;">备注信息不能为空！</div>
      </div>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" @click="confirmAdd">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>

  import { editOrderNote } from '@/api/chat'

  export default {
    data() {
      return {
        note: '',
        showErr: false
      }
    },
    props: {
      open: {
        type: Boolean,
        default: false
      },
      orderInfo: {
        type: Object,
        default: () => {
        }
      }
    },
    methods: {
      // 添加计划
      confirmAdd() {
        if (this.note.trim()) {
          let obj = {
            platform: 'aliexpress',
            cookie: this.orderInfo.headers,
            token: this.orderInfo.m_h5_tk,
            data: {
              accessKey: 'ae-pc-h5',
              accessToken: 'ae-secret',
              content: this.note,
              orderId: this.orderInfo.orderSubList[0].orderId
            }
          }
          editOrderNote(obj).then(() => {
            this.$emit('refreshOrderList')
            this.closeClearForm()
          })
          return
        }
        this.showErr = true
      },
      // 关闭弹窗，清除内容
      closeClearForm() {
        this.note = ''
        this.showErr = false
        this.$emit('update:open', false)
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.note = this.orderInfo.sellerMemo || ''
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .note-input {
    width: 100%;
    height: 60px;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
    resize: none;
    box-sizing: border-box;
  }
</style>
