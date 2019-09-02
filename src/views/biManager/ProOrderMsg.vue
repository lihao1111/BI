<template>
    <section class="chart-container">
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-right: 0px; padding-bottom: 0px">
        <el-form :inline="true" :model="filters">
          <el-form-item label="订购产品:">
            <el-input v-model="filters.queryVal" placeholder="请输入产品名称" size="medium"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="medium" icon="el-icon-search" v-on:click="getProOrder">查询</el-button>
          </el-form-item>
          <el-form-item style="float: right">
            <el-button type="primary" size="medium" icon="el-icon-circle-plus-outline" v-on:click="addProOrder">新增</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-table :data="tableData" class="tb-edit" style="width: 100%">
        <el-table-column label="产品ID" width="240">
          <template slot-scope="scope">
            <div v-if="!scope.row.editing">
              <span>{{ scope.row.product_id }}</span>
            </div>
            <div v-else>
              <el-input type="text" v-model="scope.row.product_id" placeholder="请填写产品ID"></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" width="240">
          <template slot-scope="scope">
            <div v-if="!scope.row.editing">
              <span>{{ scope.row.product_name }}</span>
            </div>
            <div v-else>
              <el-input type="text" v-model="scope.row.product_name" placeholder="请填写产品名称"></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary"
              size="small"
              v-if="!scope.row.editing"
              icon="el-icon-edit-outline"
              @click="handleEdit(scope.$index, scope.row)">编辑
            </el-button>
            <el-button
              type="primary"
              size="small"
              v-if="scope.row.editing"
              icon="el-icon-success"
              @click="handleSave(scope.$index, scope.row)">保存
            </el-button>
            <el-button
              size="small"
              type="warning"
              v-if="scope.row.editing"
              icon="el-icon-warning"
              @click="handleCancel(scope.$index, scope.row)">取消
            </el-button>
            <el-button
              size="small"
              type="danger"
              v-if="!scope.row.editing"
              icon="el-icon-delete"
              @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
</template>
<script>
import { loadProOrder } from '../../api/api'
export default {
  data: function () {
    return {
      tApp: '',
      filters: { // 过滤器
        queryVal: ''
      },
      tableData: [],
      loading: false
    }
  },
  methods: {
    getProOrder () {
      this.loading = true
      loadProOrder({ queryVal: this.filters.queryVal, platFormId: this.tApp.id }).then(data => { // ?
        let { businessCode, resultSet } = data
        this.loading = false
        if (businessCode !== 'success') {
          this.$message({
            message: '订购产品加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.tableData = resultSet
        }
      })
    },
    handleEdit ($index, row) {
      this.$set(this.tableData[$index], 'editing', true)
    },
    handleCancel ($index, row) {
      if (row.flag === 'newAdd') {
        this.tableData.splice($index, 1)
      } else {
        this.$set(this.tableData[$index], 'editing', false)
      }
    },
    addProOrder () {
      this.tableData = this.tableData || []
      this.tableData.unshift({
        name: '',
        editing: true,
        flag: 'newAdd' // 设置标记
      })
    },
    handleSave ($index, row) {
      // 请求后台
      this.$set(this.tableData[$index], 'editing', false)
    },
    handleDelete ($index, row) {
      //
      this.$confirm('确定删除该记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableData.splice($index, 1)
      })
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.getProOrder()
  },
  mounted: function () {
  },
  updated: function () {
  }
}
</script>

<style scoped>

    .chart-container {
        width: 100%;
        float: left;
    }

    /*.chart div {
        height: 400px;
        float: left;
    }*/

</style>
