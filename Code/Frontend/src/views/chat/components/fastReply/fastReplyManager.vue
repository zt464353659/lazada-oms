<template>
  <el-dialog
    title="快捷回复管理"
    class="dialog-add-upload-plan auto_reply"
    :visible="open"
    :before-close="onClose"
    :lock-scroll="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
    height="600px"
  >
    <div v-loading="listLoading">
      <div class="dialog-body" style="min-height:400px;max-height:600px;overflow: auto;">
        <div class="reply-item div-flex" v-for="(item,index) in list" :key="index">
          <el-input type="textarea" :autosize="{minRows: 2, maxRows: 6}" v-model="item.message" style="width:70%;"></el-input>
          <div>
            <el-button size="mini" type="primary" @click="updateReply(item)">保存</el-button>
            <el-button size="mini" type="danger" @click="deleteReply(item)">删除</el-button>
          </div>
        </div>
        <el-button size="mini" type="primary" @click="showAdd">新增</el-button>
        <div class="div-flex" v-if="show_add">
          <el-input type="textarea" :autosize="{minRows: 2, maxRows: 6}" v-model="add_reply_content" style="width:70%;"></el-input>
          <div>
            <el-button size="mini" type="primary" @click="addReply">添加</el-button>
          </div>
        </div>
      </div>
      <!--<div slot="footer" class="dialog-footer">-->
      <!--<el-button @click="onCancel">取 消</el-button>-->
      <!--<el-button type="primary" @click="onClose">确 定</el-button>-->
      <!--</div>-->
    </div>
  </el-dialog>
</template>

<script>
  import store from '@/store'
  import { getReplyList, addFastReply, updateFastReply, deleteFastReply } from '@/api/chat'

  export default {
    props: {
      open: {
        type: Boolean,
        default: false
      },
      replyList: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        list: [],
        add_reply_content: '',
        listLoading: false,
        show_add: false,
        accountInfo: this.$store.getters.accountInfo
      }
    },
    methods: {
      showAdd() {
        this.show_add = !this.show_add
      },
      refreshList() {
        this.listLoading = true
        getReplyList(this.$store.getters.accountInfo.id).then(res => {
          this.list = res.data
          this.listLoading = false
        })
      },
      updateReply(item) {
        updateFastReply({ id: item.id, message: item.message, user_id: this.$store.getters.userInfo.id }).then(() => {
          this.refreshList()
        })
      },
      deleteReply(item) {
        deleteFastReply({ id: item.id }).then(() => {
          this.refreshList()
        })
      },
      addReply() {
        addFastReply({ account_id: this.$store.getters.accountInfo.id, user_id: this.$store.getters.userInfo.id, message: this.add_reply_content }).then(() => {
          this.add_reply_content = ''
          this.refreshList()
        })
      },
      onCancel() {
        this.closeClearForm()
      },
      onClose() {
        this.closeClearForm()
      },
      closeClearForm() {
        this.show_add = false
        this.$emit('update:replyList', [])
        this.$emit('update:open', false)
      }
    },
    watch: {
      open(val) {
        if(val) {
          this.refreshList()
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .div-flex {
    display: flex;
    margin: 10px 0;
    padding-right: 20px;
    justify-content: space-between;
  }

  .div-add {
    border-bottom: 1px solid #d3dce6
  }
</style>
<style rel="stylesheet/scss" lang="scss">
  .auto_reply .el-dialog__body {
    padding-bottom: 20px;
  }
</style>
