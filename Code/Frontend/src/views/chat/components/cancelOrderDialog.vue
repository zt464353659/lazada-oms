<template>
  <el-dialog
    title="Cancel Order"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    width="500px"
  >
    <template>
      <el-form ref="formData" :model="formData" class="demo-form-inline" :rules="rules" size="mini" label-width="140px" label-position="right">
        <el-form-item label="退款金额" prop="refound_amount">
          {{ currency }} {{ showOrderData.receivables }}
        </el-form-item>
        <el-form-item label="取消原因" prop="cancel_reason">
          <el-select v-model="formData.cancel_reason" clearable placeholder="请选择取消原因">
            <el-option v-for="(item, index) in cancelReasonList" :label="item.label" :value="item.id" :key="index"></el-option>
          </el-select>
          <template v-if="formData.cancel_reason === 1">
            <div class="order-msg-card mt-10" v-for="(item, index) in showOrderData.products" :key="index">
              <div class="card-top">
                <el-checkbox v-model="item.is_select" class="mt-15"></el-checkbox>
                <img :src="item.image" alt="">
                <p class="ft-14 hover-link-text" @click="openTheNewTAB(item.product_url)">
                  {{ item.title }}
                </p>
              </div>
              <div style="display:flex; justify-content: space-between;padding: 0 15px;line-height:15px;color:#888">
                <span>{{ currency }} {{ item.price }} X {{ item.count }}</span>
                <span>Stock {{ item.stock }}</span>
              </div>
            </div>
          </template>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" @click="onConfirm('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { currencyBySiteMap } from '@/utils/statusMap'
  export default {
    props: {
      open: Boolean,
      orderData: {
        type: Object,
        default: () => {
          return {
            products: []
          }
        }
      },
      productOption: {
        type: Object,
        default: () => {}
      },
      siteCode: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        options: [],
        formData: {
          cancel_reason: ''
        },
        showOrderData: {
          products: []
        },
        rules: {
          cancel_reason: [
            { required: true, message: '请选择取消原因', trigger: 'change' }
          ]
        }
      }
    },
    computed: {
      currency() {
        if (this.siteCode) {
          return currencyBySiteMap[this.siteCode]
        } else {
          return ''
        }
      },
      cancelReasonList() {
        const arr = [{ id: 1, label: '缺货' }, { id: 2, label: '无法运送范围' }]
        if (['th', 'ph'].includes(this.siteCode)) {
          arr.push({ id: 3, label: '不提供此买家货到付款' })
        }
        return arr
      }
    },
    created() {
    },
    methods: {
      cloneDeep(data) {
        const obj = this._.cloneDeep(this[data])
        this[data] = {}
        this[data] = obj
      },
      openTheNewTAB(href) {
        if (!/^(http:\/\/)|^(https:\/\/)/.test(href)) {
          href = 'http://' + href
        }
        try {
          window.open(href, '_blank')
        } catch (err) {
          this.$message.error('无法打开错误的地址')
        }
      },
      onConfirm() {
        this.$refs['formData'].validate((valid) => {
          if (valid) {
            if (this.checkSubmit()) {
              alert('等待接口与账号')
            }
          }
        })
      },
      checkSubmit() {
        const isNoSelect = this._.every(this.showOrderData.products, v => {
          return !v.is_select
        })
        if (isNoSelect) {
          this.$message.error('请选择缺货商品')
          return false
        }
        return true
      },
      closeClearForm() {
        this.$emit('update:open', false)
        this.$refs['formData'].resetFields()
      },
      initData() {
        this.formData = {}
      }
    },
    watch: {
      open: {
        handler(val) {
          if (val) {
            this.initData()
            this.showOrderData = this._.cloneDeep(this.orderData)
            this._.forEach(this.showOrderData.products, v => {
              v.is_select = false
            })
            this.cloneDeep('showOrderData')
          }
        }
      // console.log(this.productOption, this.siteCode)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .order-msg-card {
    width: 260px;
    height: 95px;
    background-color: #fff;
    border: .25em solid #f4f4f4;
    border-radius: 2px;
    cursor: pointer;
    .card-top {
      padding: 10px 10px 0;
      display: flex;
      img {
        height: 56px;
        width: 56px;
      }
      p {
        width: calc(100% - 55px);
        height: 40px;
        line-height: 20px;
        overflow: hidden;
        word-break: break-word;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        margin: 5px 0;
      }
    }
  }
</style>
