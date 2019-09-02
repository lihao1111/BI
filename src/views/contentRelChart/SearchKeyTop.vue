<template>
    <section class="chart-container">
      <!--工具条-->
      <el-col :span="24" class="toolbar1" style="height: 50px; padding-left: 10px; padding-top: 5px">
        <el-form :inline="true">
          <el-form-item label="日期范围">
            <div class="block">
              <el-date-picker
                      v-model="queryDate"
                      type="daterange"
                      value-format="yyyy-MM-dd"
                      size="small"
                      align="center"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      :picker-options="pickerOptions">
              </el-date-picker>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" icon="el-icon-search" v-on:click="getSearchDetail">查询</el-button>
          </el-form-item>
          <el-form-item style="float: right">
            <el-button type="primary" size="small"  icon="el-icon-download" @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-table :data="searchDetails.slice((curpage-1) * pageSize, curpage*pageSize)" highlight-current-row stripe style="width:100%; padding-top: 10px"
                :header-cell-style="{
                  'color': '#3a8ee6',
                }"
      >
        <el-table-column prop="keyword" label="关键字" align="center"></el-table-column>
        <el-table-column prop="sum_num" sortable label="搜索量" align="center"></el-table-column>
        <el-table-column prop="accept_num" sortable label="采纳量" align="center"></el-table-column>
        <el-table-column prop="accept_per" sortable label="采纳量占比" align="center">
          <template slot-scope="scope">
            <span style="color: #1d8ce0; font-weight: bold">{{ scope.row.accept_per == null ? '' : scope.row.accept_per+'%' }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-col :span="24"> <!--分页条-->
        <el-pagination
                background
                @current-change="handleCurrentChange"
                :page-size="pageSize"
                :total="totalSize"
                layout="prev, pager, next"
                style="float: right">
        </el-pagination>
      </el-col>
    </section>
</template>
<script>
import { loadSearchDetail } from '../../api/api'
export default {
  data () {
    return {
      queryDate: [new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000)],
      pickerOptions: { // 快捷键日期设置
        disabledDate (time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '最近一周',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      tApp: '',
      searchDetails: [],
      totalSize: 0, // 分页数据
      curpage: 1,
      pageSize: 20
    }
  },
  methods: {
    handleCurrentChange (val) { // 页面
      this.curpage = val
    },
    //  加载数据
    getSearchDetail () {
      if (!this.queryDate) {
        this.$message({
          showClose: true,
          message: '请选择查询日期范围！',
          type: 'warning'
        })
        return false
      }
      if (this.queryDate[1] < this.queryDate[0]) {
        this.$message({
          showClose: true,
          message: '结束日期必须大于开始日期！',
          type: 'error'
        })
        return false
      }
      loadSearchDetail({
        startDate: this.queryDate[0],
        endDate: this.queryDate[1],
        platFormId: this.tApp.id
      }).then(data => { // ?
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
            message: '关键字搜索数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.searchDetails = resultSet // 图表数据
          this.totalSize = this.searchDetails.length
          this.curpage = 1
        }
      })
    },
    // 导出
    handleExport () {
      if (this.searchDetails.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      require.ensure([], () => {
        const { exportExcel } = require('../../excel/Export2Excel')
        const tHeader = ['关键字', '搜索量', '采纳量', '采纳量占比']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['keyword', 'sum_num', 'accept_num', 'accept_per']
        const list = this.searchDetails // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '搜索关键字排行excel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.getSearchDetail()
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
