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
    <template>
      <el-form
        ref="formData"
        :model="formData"
        size="small"
        @submit.native.prevent
        v-loading="dialogLoading"
      >
        <el-form-item
          label="站点"
          label-width="130px"
          style="margin-bottom: 10px"
        >
          <el-select
            v-model="formData.site_code"
            clearable
            placeholder="选择站点"
          >
            <el-option
              v-for="(item, index) in siteList"
              :label="item"
              :value="item"
              :key="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="常见问题"
          label-width="130px"
          style="margin-bottom: 10px"
        >
          <el-row class="right-row">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-circle-plus-outline"
              style="position: absolute; top: 0; right: 90px;"
              @click="addBatch"
            >
              批量添加
            </el-button>
          </el-row>
        </el-form-item>
      </el-form>

      <div class="faq">
        <el-collapse
          v-model="activeNames"
          @change="handleChange"
        >
          <el-collapse-item
            :title="'关键词' + (index+1) + '：'+ item.keyword"
            :name="index + 1"
            v-for="(item, index) in formData.faq"
            :key="index"
          >
            <el-form
              :ref="'faq'+ index"
              :model="formData"
              size="small"
              class="faq-item"
            >
              <el-form-item
                label="关键词"
                label-width="80px"
              >
                <el-input
                  type="text"
                  v-model="item.keyword"
                  placeholder="请输入关键词"
                />
              </el-form-item>
              <el-form-item
                label="回复内容"
                label-width="80px"
              >
                <el-input
                  type="textarea"
                  v-model="item.reply"
                  placeholder="请输入回复内容"
                />
              </el-form-item>
            </el-form>
          </el-collapse-item>
          <!--<el-collapse-item title="关键词2" name="2">-->
          <!--<div style="height:200px">-->

          <!--</div>-->
          <!--</el-collapse-item>-->
          <!--<el-collapse-item title="关键词3" name="3">-->
          <!--<div style="height:200px">-->

          <!--</div>-->
          <!--</el-collapse-item>-->
        </el-collapse>
      </div>
    </template>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        @click="onCancel"
        :disabled="dialogLoading"
      >
        取 消
      </el-button>
      <el-button
        type="primary"
        @click="SubmitDomain"
        :disabled="dialogLoading"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import store from '@/store'
  import { fetchCollectorFans } from '@/api/fans'

  export default {
    props: {
      open: {
        type: Boolean,
        default: false
      },
      siteList: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        formData: {
          faq: [
            {
              key: Date.now() - 2,
              keyword: '',
              reply: ''
            },
            {
              key: Date.now() - 1,
              keyword: '',
              reply: ''
            },
            {
              key: Date.now(),
              keyword: '',
              reply: ''
            }
          ]
        },
        dialogLoading: false,
        activeNames: [1, 2, 3],
        errorArr: {},
        rule: (rule, value, callback) => {
          const index = this.formData.domains.indexOf(value)
          if (this._.trim(value.value)) {
            const regDomain = /^https?:\/\/shopee./
            if (regDomain.test(value.value)) {
              if (this.formData.domains.length > 1) {
                let count = 0
                this.formData.domains.forEach(item => {
                  if (item.value === value.value) {
                    ++count
                  }
                })
                if (count > 1) {
                  callback(new Error('店铺地址重复'))
                }
              }
              callback()
            } else {
              callback(new Error('请输入https://shopee或https://shopee开头的正确店铺地址'))
            }
          } else {
            callback(new Error('店铺地址不能全为空格或者为空'))
            this.formData.domains[index].value = ''
          }
        }
      }
    },
    created() {
    },
    methods: {
      handleChange(val) {
        console.log(val)
      },
      addBatch() {
        this.formData.faq.push({
          key: Date.now(),
          keyword: '',
          reply: ''
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
        this.$refs.formData.resetFields()
        this.formData = {
          domains: [
            {
              key: Date.now(),
              value: ''
            }
          ]
        }
        this.$emit('update:data', {})
        this.$emit('update:open', false)
      },
      // 删除 URL
      removeDomain(index) {
        this.formData.domains.splice(index, 1)
      },
      // input clear
      clearInput(index) {
        this.$refs.formData.clearValidate('domains.' + index)
      },
      // 增加店铺URL
      addStore() {
        this.formData.domains.push({
          key: Date.now(),
          value: ''
        })
      },
      // 增加domain or 提交
      SubmitDomain() {
        this.$refs.formData.validate((valid) => {
          if (valid) {
            this.dialogLoading = true
            // 保存
            const shop_url = []
            this.formData.domains.map(item => {
              console.log(item)
              shop_url.push(item.value)
            })
            const params = {
              shop_url: shop_url,
              create_user_id: store.getters.userInfo.id
            }
            fetchCollectorFans(params).then(response => {
              this.closeClearForm()
              this.$emit('reload')
            }).finally(_ => {
              this.dialogLoading = false
            })
          }
        })
      },
      blurInput() {
        this.$refs.formData.validate()
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
  }
  .faq{
    height: 490px;
    overflow: auto;
    width:75%;
    margin:auto;
    border-top: 1px solid #e6ebf5;
    &::-webkit-scrollbar-track-piece {
      background-color: #f8f8f8;
    }
    //滚动条的宽度
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
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
  .faq {
    .el-collapse{
      border-top:0;
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
  }

</style>
