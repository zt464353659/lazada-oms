<template>
  <el-dialog
    title="编辑自动回复"
    class="dialog-add-upload-plan edit_reply"
    :visible="open"
    :before-close="onClose"
    :lock-scroll="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
  >
    <template>
      <el-form
        ref="formData"
        :model="formData"
        size="small"
        label-width="130px"
        v-loading="dialogLoading"
        :rules="rule"
      >
        <el-form-item label="关键字" style="margin-bottom: 30px" prop="key_words" label-width="80px">
          <el-input type="text" v-model="formData.key_words" placeholder="请输入关键字"/>
        </el-form-item>
        <el-form-item label="回复类型" label-width="80px" prop="type">
          <el-select style="width:100%;" v-model="formData.type" @change="templateTypeChange">
            <el-option label="文本" value="0"></el-option>
            <el-option label="图片" value="1"></el-option>
          </el-select>
        </el-form-item>
        <!-- 文本格式 -->
        <el-form-item
          label="回复内容"
          label-width="80px"
          v-if="formData.type === '0'"
          prop="answer"
        >
          <el-input type="textarea" v-model="formData.answer" placeholder="请输入回复内容"/>
        </el-form-item>
        <!-- 图片格式 -->
        <el-form-item
          v-else
          label="回复内容"
          label-width="80px"
          prop="answer"
        >
          <el-upload
            ref="upload"
            class="avatar-uploader"
            :action="`xxx`"
            :multiple="false"
            :accept="'.jpg, .jpeg, .png'"
            :on-change="(a) => beforeAvatarUpload(a)"
            :show-file-list="false"
            :file-list="fileList"
            :auto-upload="false"
          >
            <div v-if="formData.url" v-loading="picLoading"><img :src="formData.url" class="avatar"></div>
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel" :disabled="dialogLoading">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :disabled="dialogLoading || disabledSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { editReply } from '@/api/autoReply'
import axios from 'axios'
import { getUploadPath } from '@/utils/help'
import { getToken } from '@/utils/auth'

export default {
  props: {
    open: Boolean,
    data: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    const checkKeyWords = (rule,value,callback) => {
      if (!value.trim()) {
        callback(new Error('请输入关键字'))
      }
      if (!/^[a-zA-Z\s]+$/.test(value)) {
        callback(new Error('关键字存在违禁字符'))
      }
      callback()
    }
    return {
      picLoading: false,
      disabledSubmit: false,
      fileList: [],
      formData: {
        key_words: '',
        url: '',
        answer: '',
        id: undefined,
        type: '0'
      },
      cloneData: {},
      dialogLoading: false,
      rule: {
        key_words: [
          { required: true, validator: checkKeyWords },
          // { max: 100, message: '最大100个字符' }
        ],
        answer: [
          { required: true, message: '请输入回复内容' },
        ]
      }
    }
  },
  created() {
  },
  methods: {
    templateTypeChange() {
      this.formData.answer = ''
      this.formData.url = ''
      this.$refs['formData'].clearValidate()
    },
    beforeAvatarUpload(file, item) {
      const isJPG = file.raw.type === 'image/jpeg'
      const isGIF = file.raw.type === 'image/jpg'
      const isPNG = file.raw.type === 'image/png'
      const isLt1M = file.raw.size / 1024 / 1024 < 2
      const isImageMsg = '请上传正确的图片（jpg、jpeg、png）'
      const isLt1mbMsg = '图片大小不能超过 2MB'
      if (!(isJPG || isGIF || isPNG)) {
        this.$message({
          message: isImageMsg,
          type: 'error',
          showClose: true,
          duration: 3000
        })
        return
      }
      if (!isLt1M) {
        this.$message({
          message: isLt1mbMsg,
          type: 'error',
          showClose: true,
          duration: 3000
        })
        return
      }
      this.disabledSubmit = true
      this.picLoading = true
      // 禁止提交并上传图片到服务器
      this.formData.url = URL.createObjectURL(file.raw)
      const formData = new FormData()
      formData.append('file', file.raw)
      formData.append('access_token', '1')
      axios({
        url: getUploadPath(),
        method: 'post',
        headers: {
          Authorization: getToken()
        },
        data: formData
      }).then(res => {
        this.formData.answer = JSON.stringify(res.data.data.data)
        this.picLoading = false
        this.disabledSubmit = false
      }).catch((err) => {
        this.$message.error('图片上传服务器失败！请重试')
        this.picLoading = false
        this.disabledSubmit = false
      })
    },
    onCancel() {
      this.closeClearForm()
    },
    onClose() {
      this.closeClearForm()
    },
    // dialog 关闭
    closeClearForm() {
      this.initData()
      this.$refs.formData.resetFields()
      this.$emit('update:open', false)
    },
    initData() {
      this.formData = {
        key_words: '',
        url: '',
        answer: '',
        id: undefined,
        type: '0'
      }
    },
    // 编辑自动回复
    handleSubmit() {
      // 数据是否改变
      if (this._.isEqual(this.formData, this.cloneData)) {
        this.$message.warning('模板数据未发生改变')
        return
      }
      this.$refs.formData.validate(valid => {
        if (valid) {
          this.dialogLoading = true
          const data = this.createSubmitData()
          editReply(data)
            .then(response => {
              this.closeClearForm()
              this.$emit('reload')
              this.dialogLoading = false
            })
            .catch(_ => {
              this.dialogLoading = false
            })
        }
      })
    },
    createSubmitData() {
      return {
        key_words: this.formData.key_words,
        template_type: this.formData.type,
        template: this.formData.answer,
        id: this.data.id
      }
    }
  },
  watch: {
    open: {
      handler(val) {
        if (val) {
          this.formData = this._.cloneDeep(this.data)
          this.formData = {
            key_words: this.data.key,
            url: this.data.template_type === 0 ? '' : JSON.parse(this.data.answer).url,
            answer: this.data.answer,
            id: this.data.id,
            type: String(this.data.template_type)
          }
          this.cloneData = this._.cloneDeep(this.formData)
        }
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.edit_reply{
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar {
    width: 100px;
    height: 100px;
    display: block;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 50px;
    height: 50px;
    line-height: 50px;
    text-align: center;

    .el-icon-plus:before {
      color: green;
      content: "\E6D9";
    }
  }
}

</style>
