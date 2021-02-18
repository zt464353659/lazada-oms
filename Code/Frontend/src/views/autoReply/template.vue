<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form
        ref="listQuery"
        :inline="true"
        :model="listQuery"
        class="demo-form-inline"
        size="mini"
      >
        <el-form-item label="关键字" prop="key_words">
          <el-input type="text" v-model="listQuery.key_words" clearable placeholder="请输入关键字"/>
        </el-form-item>
        <el-form-item label="回复类型" prop="template_type">
          <el-select v-model="listQuery.template_type">
            <el-option label="文本" value="0"></el-option>
            <el-option label="图片" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button
          v-permission="permission.add"
          type="primary"
          size="mini"
          icon="el-icon-circle-plus-outline"
          @click="addBatch"
        >
          <!--          v-permission="permission.add" -->
          批量添加
        </el-button>
      </el-row>
    </div>

    <!--表格-->
    <div class="content-box">
      <el-table
        :data="listData"
        v-loading="listLoading"
        border
        :max-height="maxHeight"
        style="width: 100%"
      >
        <el-table-column
          prop="account_id"
          width="100"
          label="序号"
        >
          <template slot-scope="scope">
            {{ (listQuery.page - 1) * listQuery.per_page + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="template_type" width="100" label="回复类型">
          <template slot-scope="scope">{{ scope.row.template_type ? '图片' : '文本' }}</template>
        </el-table-column>
        <el-table-column prop="key" width="250" label="关键字">
          <template slot-scope="scope">{{ scope.row.key.replace(/\s/g, '&nbsp;') }}</template>
        </el-table-column>
        <el-table-column prop="answer" min-width="300" label="回复内容">
          <template slot-scope="scope">
            <span v-if="scope.row.template_type === 0">{{ scope.row.answer.replace(/\s/g, '&nbsp;') }}</span>
            <picture-view
              v-else
              :thumbnail="false"
              :pictureList="[JSON.parse(scope.row.answer).url]"
            ></picture-view>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button v-permission="permission.edit" type="text" size="mini" @click="handleEditItem(scope.row)">编辑</el-button>
            <el-button v-permission="permission.del" type="text" size="mini" @click="deleteItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[20, 50, 100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        />
      </div>
    </div>
    <!--批量添加dialog-->
    <add-batch v-bind.sync="addBatchDialog" @reload="getList"/>
    <edit-auto-reply v-bind.sync="editAutoReplyDialogOption" @reload="getList"></edit-auto-reply>
  </div>
</template>

<script>
import { fetchReply, apiReplyDel } from '@/api/chat'
import { getReplyList, delReply } from '@/api/autoReply'
import addBatch from './components/addBatch'
import editAutoReply from './components/editAutoReply'
import PictureView from 'vue-simple-picture-preview'

export default {
  name: 'Template',
  components: {
    addBatch,
    editAutoReply,
    PictureView
  },
  data() {
    return {
      listLoading: false,
      maxHeight: document.documentElement.clientHeight - 200,
      // 权限
      permission: {
        edit: 'lazada-operation.auto-reply.set',
        add: 'lazada-operation.auto-reply.add',
        del: 'lazada-operation.auto-reply.del'
      },
      // 表格相关内容
      listQuery: {
        page: 1,
        per_page: 20,
        key_words: undefined,
        template_type: undefined,
      },
      listData: [],
      pagination: null,
      // 批量
      addBatchDialog: {
        open: false
      },
      editAutoReplyDialogOption: {
        open: false,
        data: {}
      }
    }
  },
  created() {
    this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        window.maxHeight = document.documentElement.clientHeight - 200
        this.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
      })()
    }
    this.getList()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 获取列表
    getList() {
      this.listLoading = true
      this.listData = []
      this.listQuery.key_words = this._.trim(this.listQuery.key_words) || undefined
      getReplyList(this.listQuery).then(res => {
        this.listData = res.data.list
        this.pagination = res.data.pagination
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 清楚
    clearSearch() {
      this.listQuery.key_words = undefined
      this.listQuery.template_type = undefined
      this.getList()
    },
    // 分页
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    // 删除
    deleteItem(row) {
      this.$confirm(
        `确定删除吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          type: 'warning'
        }
      )
        .then(_ => {
          const data = { id: row.id }
          delReply(data).then(() => {
            this.getList()
          })
        })
        .catch(() => {
        })
    },
    createSubmitData(id) {
      const data = {
        id,
        is_delete: 1,
        update_user_id: this.$store.getters.userInfo.id,
        update_user: this.$store.getters.userInfo.name
      }
      return data
    },
    handleEditItem(row) {
      this.editAutoReplyDialogOption = {
        open: true,
        data: row
      }
    },
    // 批量添加
    addBatch() {
      this.addBatchDialog = {
        open: true
      }
    }
  },
  watch: {
    maxHeight(val) {
      if (!this.timer) {
        this.maxHeight = val
        this.timer = true
        setTimeout(() => {
          this.timer = false
        }, 400)
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.explan {
  font-size: 12px;
  color: #e6a23c;
  line-height: 20px;
}
</style>

