<template>
  <el-dialog
    title="批量添加自动回复"
    class="dialog-add-upload-plan auto_reply"
    :visible="open"
    :before-close="onClose"
    :lock-scroll="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
  >
    <div v-loading="dialogLoading">
      <el-form
        ref="formData"
        :model="formData"
        size="small"
        @submit.native.prevent
      >
        <el-form-item label="模板" label-width="130px" style="margin-bottom: 10px">
          <div class="faq">
            <div v-for="(item, index) in formData.data"
                 :key="index"
            >
              <el-col :span="18">
                <el-card class="box-card" :title="'关键字' + (index+1) + '：'+ item.key"
                         :name="index + 1"
                >
                  <el-form :ref="'faq'+ index" :model="item" size="small" class="faq-item">
                    <el-form-item label="关键字" label-width="80px" prop="key"
                                  :rules="[
                                    { required: true, trigger: 'blur', message: '请输入关键字' },
                                    { validator: rule, trigger: 'blur' }
                                  ]"
                    >
                      <el-input type="text" @blur="checkValidate" v-model="item.key" placeholder="请输入关键字"/>
                    </el-form-item>
                    <el-form-item label="回复类型" label-width="80px" prop="type">
                      <el-select style="width:100%;" v-model="item.type" @change="templateTypeChange(index)">
                        <el-option label="文本" value="0"></el-option>
                        <el-option label="图片" value="1"></el-option>
                      </el-select>
                    </el-form-item>
                    <!-- 文本格式 -->
                    <el-form-item
                      label="回复内容"
                      label-width="80px"
                      v-if="item.type === '0'"
                      prop="answer"
                      :rules="[
                        { required: true, trigger: 'blur', message: '请输入回复内容' },
                        { validator: answerRule, trigger: 'blur' }
                      ]"
                    >
                      <el-input type="textarea" v-model="item.answer" placeholder="请输入回复内容"/>
                    </el-form-item>
                    <!-- 图片格式 -->
                    <el-form-item
                      v-else
                      label="回复内容"
                      label-width="80px"
                      prop="answer"
                      :rules="[
                        { required: true, trigger: 'blur', message: '请输入回复内容' },
                        { validator: answerPicRule, trigger: 'blur'}
                      ]"
                    >
                      <el-upload
                        ref="upload"
                        class="avatar-uploader"
                        :action="`xxx`"
                        :multiple="false"
                        :accept="'.jpg, .jpeg, .png'"
                        :on-change="(a) => beforeAvatarUpload(a, item)"
                        :show-file-list="false"
                        :file-list="item.fileList"
                        :auto-upload="false"
                      >
                        <div v-if="item.answer" v-loading="item.picLoading"><img :src="item.answer" class="avatar"></div>
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                      </el-upload>
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-col>
              <el-col :span="4" style="margin-top:5px;margin-left:10px">
                <el-button
                  type="primary"
                  plain
                  v-if="index === formData.data.length - 1"
                  icon="el-icon-plus"
                  style="float: left; padding: 5px;margin-right:2px"
                  circle
                  @click="addBatch"
                />
                <el-button
                  type="primary"
                  style="float: left; padding: 5px;margin-right:2px"
                  plain
                  icon="el-icon-minus"
                  circle
                  v-show="formData.data.length > 1"
                  @click.prevent="handleRemoveItem(index)"
                />
              </el-col>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel" :disabled="dialogLoading">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :disabled="dialogLoading || disabledSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addReply } from '@/api/autoReply'
import { mapGetters } from 'vuex'
import axios from 'axios'
import { getUploadPath } from '@/utils/help'
import { getToken } from '@/utils/auth'

export default {
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      disabledSubmit: false,
      formData: {
        data: [
          {
            type: '0',
            key: '',
            answer: '',
            url: '',
            fileList: []
          }
        ]
      },
      dialogLoading: false,
      activeNames: [1, 2, 3],
      errorArr: {},
      rule: (rule, value, callback) => {
        if (this._.trim(value)) {
          const filterList = this._.filter(this.formData.data, v => {
            return this._.toUpper(this._.trim(v.key)) === this._.toUpper(this._.trim(value))
          })
          if (filterList.length > 1) {
            callback(new Error('该关键字已存在，不可重复添加'))
          }
          if (!/^[a-zA-Z\s]+$/.test(value)) {
            callback(new Error('关键字存在违禁字符'))
          }
        } else {
          callback(new Error('请输入关键字'))
        }
        callback()
      },
      answerRule: (rule, value, callback) => {
        // if (this._.trim(value)) {
          // if (value.length > 200) {
          //   callback(new Error('最大200个字符'))
          // }
        // } else {
        //   callback(new Error('请输入回复内容'))
        // }
        if (!this._.trim(value)) {
          callback(new Error('请输入回复内容'))
        }
        callback()
      },
      answerPicRule:(rule,value,callback) => {
        callback()
      }
    }
  },
  computed: {
    allRefs() {
      const arr = []
      this._.forEach(this.formData.data, (v, i) => {
        arr.push('faq' + i)
      })
      return arr
    },
    ...mapGetters([
      'userInfo'
    ])
  },
  created() {
  },
  methods: {
    // 修改类型，清除内容，清除验证
    templateTypeChange(ind) {
      console.log(this.formData)
      this.formData.data[ind].answer = ''
      console.log(this.formData)
      this.$refs['faq'+ ind][0].clearValidate()
    },
    beforeAvatarUpload(file,item) {
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
      // 禁止提交并上传图片到服务器
      item.picLoading = true
      item.answer = URL.createObjectURL(file.raw)
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
        item.url = JSON.stringify(res.data.data.data)
        item.picLoading = false
        this.disabledSubmit = false
      }).catch((err) => {
        item.picLoading = false
        item.disabledSubmit = false
        this.$message.error('图片上传服务器失败！请重试')
      })
    },
    addBatch() {
      if (this.formData.data.length >= 5) {
        this.$message.error('批量添加最多一次性可添加5条问题')
        return
      }
      this.formData.data.push({
        type: '0',
        key: '',
        answer: '',
        url: '',
        fileList: []
      })
      this.activeNames.push(this.formData.data.length)
      // this.$nextTick(() => {
      //   document.querySelector('.faq').scrollTop = 10000
      // })
    },
    onCancel() {
      this.closeClearForm()
    },
    onClose() {
      this.closeClearForm()
    },
    // dialog 关闭
    closeClearForm() {
      this.$emit('update:open', false)
      this.resetFields()
      this.initData()
    },
    initData() {
      this.formData = {
        data: [
          {
            type: '0',
            key: '',
            answer: '',
            url: '',
            fileList: []
          }
        ]
      }
      this.activeNames = [1, 2, 3]
    },
    // 批量添加
    handleSubmit() {
      this.checkValidate()
      this.$refs['formData'].validate(valid => {
        if (valid) {
          if (!this.checkValidate()) {
            return
          }
          if (!this.allRefs.length) {
            this.$message.error('无数据')
            return
          }
          const data = this.createSubmitData()
          this.dialogLoading = true
          addReply({ data, not_show_message: true }).then(res => {
            this.closeClearForm()
            this.$emit('reload')
            let msg = '<div style="max-height: 700px;padding-left:20px">'
            this._.forEach(res.data.success, v => {
              msg += `<div style="color: green">关键字：<span style="font-weight: bold">“${ v }“</span>  添加成功</div>`
            })
            this._.forEach(res.data.repeat, v => {
              msg += `<div style="color: red">关键字：<span style="font-weight: bold">“${ v }“</span> 重复，添加失败</div>`
            })
            this._.forEach(res.data.error, v => {
              msg += `<div style="color: red">关键字：<span style="font-weight: bold">“${ v }“</span>  添加失败</div>`
            })
            this._.forEach(res.data.no_plain_text, v => {
              msg += `<div style="color: red">关键字：<span style="font-weight: bold">“${ v }“</span>  存在违禁字符</div>`
            })
            msg += '</div>'
            this.$alert(msg, '提示', {
              dangerouslyUseHTMLString: true
            })
            this.dialogLoading = false
          }).catch((err) => {
            this.$message.error(typeof err === 'string' ? err : '添加失败')
            this.dialogLoading = false
          })
        }
      })
    },
    createSubmitData() {
      return this._.map(this.formData.data, v => {
        return {
          key_words: this._.trim(v.key),
          template: v.type === '0' ? this._.trim(v.answer) : v.url,
          template_type: v.type
        }
      })
      // return data
    },
    checkValidate() {
      let flag = true
      this._.forEach(this.allRefs, v => {
        this.$refs[v][0].validate(valid => {
          if (!valid) {
            flag = false
          }
        })
      })
      return flag
    },
    resetFields() {
      this._.forEach(this.allRefs, v => {
        this.$refs[v][0].resetFields()
      })
      this.$refs.formData.resetFields()
    },
    handleRemoveItem(index) {
      this.formData.data.splice(index, 1)
      this.$forceUpdate()
      this.$nextTick(() => {
        this.checkValidate()
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.el-form-item {
  p {
    margin: 0;
    color: #f56c6c;
    font-size: 12px;
  }
}

.box-card {
  margin-bottom: 20px;
}

.faq {
  height: 490px;
  overflow: auto;
  margin-top: 10px;
  //滚动条凹槽的颜色，还可以设置边框属性
  &::-webkit-scrollbar-track-piece {
    background-color: #f8f8f8;
  }

  //滚动条的宽度
  &::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }

  //滚动条的设置
  &::-webkit-scrollbar-thumb {
    background-color: #dddddd;
    background-clip: padding-box;
    min-height: 28px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #bbb;
  }

  .faq-item {
    padding: 10px 0 0;
  }
}
</style>
<style rel="stylesheet/scss" lang="scss">
.auto_reply .el-dialog__body {
  padding-bottom: 20px;
}

.auto_reply {
  .el-card__header {
    padding: 5px 20px;
  }

  .card-title {
    height: 0;
    line-height: 0;
  }

  .el-card.is-always-shadow {
    box-shadow: unset;
  }

  .el-card__body {
    padding: 10px;
  }
}

.faq {
  .el-collapse {
    border-top: 0;
  }

  .el-collapse-item__header {
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-weight: 600;
    background-color: #dcdfe6;
    border-bottom: 1px solid #409eff;
    padding-left: 8px;
  }

  .el-collapse-item__header.is-active {
    border-bottom-color: transparent;
  }

  .el-collapse-item__content {
    padding-bottom: 0;
  }

  .el-collapse-item__wrap {
    border-bottom: 0 !important;
  }

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
