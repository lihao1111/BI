<!--suppress ALL -->
<template>
  <section class="chart-container">
    <!--工具条-->
    <el-col :span="24" class="toolbar1" style="height: 50px; padding-left: 10px; padding-top: 5px">
      <el-form :inline="true">
        <el-form-item>
          <div class="block">
            <el-date-picker
                v-model="queryDate"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择日期">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary " size="small" icon="el-icon-search" v-on:click="getCpTop">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <div style="padding: 0px;">
      <el-col :span="24" style=" margin-top: 10px; height: 40px; line-height: 40px; background-color: rgba(17, 146, 175, 0.18);">
        <span style="padding:10px; color: #606266;">详细数据<i class="el-icon-info"></i></span>
        <el-link type="primary" :underline="false" style="float: right; margin-right: 10px; font-weight: bold" icon="el-icon-download" @click="handleExport">
          导出数据
        </el-link>
      </el-col>
      <el-table :data="cpTopList" highlight-current-row style="width:100%;"
                v-loading="tableLoading"
                :header-cell-style="{
                  'background-color': '#f2f2f2',
                  'color': '#3a8ee6',
                  'border-bottom': '1px #f2f2f2 solid'
                }"
      >
        <el-table-column prop="day"  label="日期" align="center"></el-table-column>
        <el-table-column prop="name"  label="CP名称" align="center"></el-table-column>
        <el-table-column prop="mediaName"  label="音频名称" align="center"></el-table-column>
        <el-table-column prop="play_count"  label="点播次数" align="center"></el-table-column>
        <el-table-column prop="play_num"  label="点播人数" align="center"></el-table-column>
      </el-table>
    </div>
  </section>
</template>
<script>
import { loadCpTop, exportCpInfo } from '../../api/api'
export default {
  data () {
    return {
      queryDate: '',
      tApp: '',
      tableLoading: false,
      cpTopList: [] // 请求数据
    }
  },
  methods: {
    getCpTop: function () {
      if (!this.queryDate) {
        this.$message({
          showClose: true,
          message: '请选择查询日期范围！',
          type: 'error'
        })
        return false
      }
      this.tableLoading = true
      loadCpTop({
        startDate: this.queryDate,
      }).then(data => { // ?
        this.tableLoading = false
        let { businessCode, resultSet } = data
        if (businessCode === 'unauthenticated') { // 有权限认证
          this.$message({
            message: '未授权，请联系管理员！',
            type: 'error'
          })
          return false
        }
        if (businessCode !== 'success') {
          this.$message({
            message: 'CP排行数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.cpTopList = resultSet
        }
      })
    },
    // 导出excecl
    handleExport: function () {
      if (this.cpTopList.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      require.ensure([], () => {
        const { exportExcel } = require('../../excel/Export2Excel')
        const tHeader = ['日期', 'CP名称', '音频名称', '点播次数', '点播人数']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['day', 'name', 'mediaName', 'play_count', 'play_num']
        // 上面的'day', 'hour', 'online_num'是tableData里对象的属性
        const list = this.cpTopList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, 'HBCpTopExcel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
  },
  created: function () {
    // 展示数据
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
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
