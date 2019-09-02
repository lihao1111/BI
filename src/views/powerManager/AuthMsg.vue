<template>
    <section class="chart-container">
        <!--工具条-->
        <el-col :span="24" class="toolbar1" style="height: 50px; padding-left: 10px; padding-top: 5px">
            <el-form :inline="true" :model="filters">
                <el-form-item label="权限:">
                    <el-input v-model="filters.queryVal" placeholder="请输入权限名称" size="small"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="small" icon="el-icon-search" v-on:click="getAuthList">查询</el-button>
                </el-form-item>
                <el-form-item style="float: right">
                    <el-button type="primary" size="small" icon="el-icon-connection" v-on:click="buildAuth">更新权限</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <el-table :data="tableData" style="width: 100%; padding-top: 10px" highlight-current-row stripe v-loading="loadTable"
                  :header-cell-style="{
                  'color': '#3a8ee6',
                }"
        >
            <el-table-column prop="id" label="序号" width="80px"></el-table-column>
            <el-table-column prop="name" label="Action名称" width="380px"></el-table-column>
            <el-table-column prop="friendly_name" label="描述"></el-table-column>
            <el-table-column prop="servlet_name" label="分组名称"></el-table-column>
        </el-table>
    </section>
</template>
<script>
import { loadAuthList, BuildAuthentication } from '../../api/api'
import { showLoading, hideLoading } from '../../util/loading'
export default {
  data: function () {
    return {
      tApp: '',
      filters: { // 过滤器
        queryVal: ''
      },
      loadTable: false,
      tableData: []
    }
  },
  methods: {
    getAuthList () {
      this.loadTable = true
      loadAuthList({ queryVal: this.filters.queryVal }).then(data => { // ?
        let { businessCode, resultSet } = data
        this.loadTable = false
        if (businessCode === 'unauthenticated') { // 有权限认证
          this.$message({
            message: '未授权，请联系管理员！',
            type: 'error'
          })
          return false
        }
        if (businessCode !== 'success') {
          this.$message({
            message: '系统权限数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.tableData = resultSet
        }
      })
    },
    buildAuth () {
      this.$confirm('确定更新权限吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        showLoading()
        BuildAuthentication().then(data => { // ?
          hideLoading()
          let { businessCode } = data
          if (businessCode !== 'success') {
            this.$message({
              message: '权限更新失败，请联系管理员！',
              type: 'error'
            })
          } else {
            this.$message({
              message: '权限更新成功！',
              type: 'success'
            })
          }
        })
      })
    }
  },
  created: function () {
    this.getAuthList()
  },
  mounted: function () {
  },
  updated: function () {
  }
}
</script>
<style>
    .el-table__header tr,
    .el-table__header th {
        padding: 0;
        height: 40px;
    }
    .el-table__body tr,
    .el-table__body td {
        padding: 0;
        height: 40px;
    }
</style>
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
