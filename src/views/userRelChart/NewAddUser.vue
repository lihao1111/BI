<template>
    <section class="chart-container">
      <!--工具条-->
      <el-col :span="24" class="toolbar1" style="height: 50px; padding-left: 10px; padding-top: 5px">
        <el-form :inline="true">
          <el-form-item>
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
            <el-button type="primary " size="small" icon="el-icon-search" v-on:click="getNewAddUser">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="24">
        <div id="newAddUserDiv" style="width:100%; height:380px;" v-loading="chartLoading"></div>
      </el-col>
      <div style="padding: 0px 10px;">
        <el-col :span="24" style=" margin-top: 10px; height: 40px; line-height: 40px; background-color: rgba(17, 146, 175, 0.18);">
          <span style="padding:10px; color: #606266;">详细数据<i class="el-icon-info"></i></span>
          <el-link type="primary" :underline="false" style="float: right; margin-right: 10px; font-weight: bold" icon="el-icon-download" @click="handleExport">
            导出数据
          </el-link>
        </el-col>
        <el-table :data="tNewAddUserList" highlight-current-row style="width:100%;"
                  :header-cell-style="{
                  'background-color': '#f2f2f2',
                  'color': '#3a8ee6',
                  'border-bottom': '1px #f2f2f2 solid'
                  }"
        >
          <el-table-column prop="day" sortable label="日期" align="center"></el-table-column>
          <el-table-column prop="newAddNum" sortable label="新增用户数" align="center"></el-table-column>
          <el-table-column prop="retained1Num" sortable label="一日留存" align="center"></el-table-column>
          <el-table-column prop="retained1Prec" sortable label="一日留存率" align="center">
            <template slot-scope="scope">
              <span style="color: #1d8ce0; font-weight: bold">{{ scope.row.retained1Prec == null ? '' : scope.row.retained1Prec+'%' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="retained3Num" sortable label="三日留存" align="center"></el-table-column>
          <el-table-column prop="retained7Num" sortable label="七日留存" align="center"></el-table-column>
          <el-table-column prop="retained30Num" sortable label="三十日留存" align="center"></el-table-column>
        </el-table>
      </div>
    </section>
</template>
<script>
import { loadNewAddUser } from '../../api/api'
import echarts from 'echarts'
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
      chartLoading: false,
      tApp: '',
      tNewAddUserList: [], // 表格数据
      dataLegStr: [], // 绘图数据_Leg
      dataX: [], // 绘图数据_X
      dataSer: [] // series数据
    }
  },
  methods: {
    // 导出
    handleExport () {
      if (this.tNewAddUserList.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      require.ensure([], () => {
        const { exportExcel } = require('../../excel/Export2Excel')
        const tHeader = ['日期', '新增用户数', '一日留存', '一日留存率', '三日留存', '七日留存', '三十日留存']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['day', 'newAddNum', 'retained1Num', 'retained1Prec', 'retained3Num', 'retained7Num', 'retained30Num']
        const list = this.tNewAddUserList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '用户新增留存excel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    getNewAddUser: function () {
      if (!this.queryDate) {
        this.$message({
          showClose: true,
          message: '请选择查询日期范围！',
          type: 'error'
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
      var interval = (this.queryDate[1].getTime() - this.queryDate[0].getTime()) / (24 * 60 * 60 * 1000)
      if (interval > 31) {
        this.$message({
          showClose: true,
          message: '日期范围过大，不建议操作',
          type: 'warning'
        })
        return false
      }
      this.chartLoading = true
      loadNewAddUser({ startDate: this.queryDate[0], endDate: this.queryDate[1], platFormId: this.tApp.id }).then(data => { // ?
        let { businessCode, resultSet } = data
        this.chartLoading = false
        if (businessCode === 'unauthenticated') { // 有权限认证
          this.$message({
            message: '未授权，请联系管理员！',
            type: 'error'
          })
          return false
        }
        if (businessCode !== 'success') {
          this.$message({
            message: '新增用户数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.tNewAddUserList = resultSet // 表格数据
          // 绘图
          this.drawChartDatas()
        }
      })
    },
    // 整理数据
    drawChartDatas: function () {
      this.dataLegStr = ['新增用户', '一日留存', '三日留存', '七日留存']
      this.dataX = []
      this.dataSer = []
      var newAddArr = []
      var retain1Arr = []
      var retain3Arr = []
      var retain7Arr = []
      for (let k in this.tNewAddUserList) {
        this.dataX.push(this.tNewAddUserList[k].day)
        newAddArr.push(this.tNewAddUserList[k].newAddNum == null ? 0 : parseInt(this.tNewAddUserList[k].newAddNum))
        retain1Arr.push(this.tNewAddUserList[k].retained1Num == null ? 0 : parseInt(this.tNewAddUserList[k].retained1Num))
        retain3Arr.push(this.tNewAddUserList[k].retained3Num == null ? 0 : parseInt(this.tNewAddUserList[k].retained3Num))
        retain7Arr.push(this.tNewAddUserList[k].retained7Num == null ? 0 : parseInt(this.tNewAddUserList[k].retained7Num) )
      }
      var option = { // 核心数据 数据展示
        border: false,
        legend: {
          orient: 'vertical',
          left: 'center',
          bottom: 'bottom',
          data: this.dataLegStr
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.dataX
        },
        yAxis: { // 纵坐标
          type: 'value',
          name: '人数'
        },
        series: [
          {
            name: '新增用户',
            type: 'line',
            smooth: true,
            data: newAddArr
          },
          {
            name: '一日留存',
            type: 'line',
            smooth: true,
            data: retain1Arr
          },
          {
            name: '三日留存',
            type: 'line',
            smooth: true,
            data: retain3Arr
          },
          {
            name: '七日留存',
            type: 'line',
            smooth: true,
            data: retain7Arr
          }
        ], // 图
        tooltip: {
          trigger: 'axis'
        }
      }
      this.chartColumn = echarts.init(document.getElementById('newAddUserDiv'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.getNewAddUser()
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
