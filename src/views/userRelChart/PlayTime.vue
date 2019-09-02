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
            <el-button type="primary " size="small" icon="el-icon-search" v-on:click="getPlayTime">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="24">
        <div id="playTimeDiv" style="width:100%; height:550px;" v-loading="chartLoading"></div>
      </el-col>
      <div style="padding: 0px 10px;">
        <el-col :span="24" style=" margin-top: 10px; height: 40px; line-height: 40px; background-color: rgba(17, 146, 175, 0.18);">
          <span style="padding:10px; color: #606266;">详细数据<i class="el-icon-info"></i></span>
          <el-link type="primary" :underline="false" style="float: right; margin-right: 10px; font-weight: bold" icon="el-icon-download" @click="handleExport">
            导出数据
          </el-link>
        </el-col>
        <el-table :data="playTimeList" highlight-current-row style="width:100%;"
                  :header-cell-style="{
                  'background-color': '#f2f2f2',
                  'color': '#3a8ee6',
                  'border-bottom': '1px #f2f2f2 solid'
                  }"
        >
          <el-table-column prop="day" sortable label="日期" align="left"></el-table-column>
          <el-table-column prop="avgtime" sortable label="平均时长" align="left">
            <template slot-scope="scope">
              <span style="color: #1d8ce0; font-weight: bold">{{ scope.row.avgtime == null ? '' : scope.row.avgtime+'分钟' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="tim0_1" label="1分钟以下" align="left"></el-table-column>
          <el-table-column prop="tim1_3" label="1-3分钟" align="left"></el-table-column>
          <el-table-column prop="tim3_10" label="4-10分钟" align="left"></el-table-column>
          <el-table-column prop="tim10_30" label="11-30分钟" align="left"></el-table-column>
          <el-table-column prop="tim30_60" label="31-60分钟" align="left"></el-table-column>
          <el-table-column prop="tim60_120" label="60-120分钟" align="left"></el-table-column>
          <el-table-column prop="tim120" label="120分钟以上" align="left"></el-table-column>
        </el-table>
      </div>
    </section>
</template>
<script>
import { loadPlayTime } from '../../api/api'
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
      playTimeList: [], // 请求数据this
      dataX: [], // x轴数据
      dataLegStr: [] // 绘图数据_Leg
    }
  },
  methods: {
    valFormatter: function (row, column, cellValue) {
      return cellValue + '分钟'
    },
    getPlayTime: function () {
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
      var interval = (new Date(this.queryDate[1]).getTime() - new Date(this.queryDate[0]).getTime()) / (24 * 60 * 60 * 1000)
      if (interval > 31) {
        this.$message({
          showClose: true,
          message: '日期范围过大，不建议操作',
          type: 'warning'
        })
        return false
      }
      this.chartLoading = true
      loadPlayTime({ startDate: this.queryDate[0], endDate: this.queryDate[1], platFormId: this.tApp.id }).then(data => { // ?
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
            message: '有效播放数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.playTimeList = resultSet // 图表数据
          if (this.playTimeList == null || this.playTimeList.length === 0) {
            this.$notify.info({
              title: '警告',
              message: '未加载到用户播放数据！',
              type: 'warning'
            })
            return false
          }
          this.drawPlayTimeChart()
        }
      })
    },
    drawPlayTimeChart: function () {
      // 整理数据
      this.dataLegStr = ['1分钟以下', '1-3分钟', '3-10分钟', '11-30分钟', '31-60分钟', '61-120分钟', '121分钟以上']
      var itemArr = ['itemInterval']
      var timOneArr = ['1分钟以下']
      var timeOneArr1 = ['1-3分钟]']
      var timTwoArr = ['3-10分钟']
      var timThreeArr = ['11-30分钟']
      var timFourArr = ['31-60分钟']
      var timFiveArr = ['61-120分钟']
      var timSixArr = ['121分钟以上']
      var firstDay = ''
      for (let k in this.playTimeList) {
        var day = this.playTimeList[k].day
        if (firstDay === '') {
          firstDay = day
        }
        if (itemArr.indexOf(day) === -1) {
          itemArr.push(day)
        }
        timOneArr.push(this.playTimeList[k].tim0_1)
        timeOneArr1.push(this.playTimeList[k].tim1_3)
        timTwoArr.push(this.playTimeList[k].tim3_10)
        timThreeArr.push(this.playTimeList[k].tim10_30)
        timFourArr.push(this.playTimeList[k].tim30_60)
        timFiveArr.push(this.playTimeList[k].tim60_120)
        timSixArr.push(this.playTimeList[k].tim120)
      }
      this.dataX = itemArr
      var option = {
        border: false,
        legend: {
          orient: 'vertical',
          x: 'right',
          y: 'top',
          padding: 10,
          data: this.dataLegStr
        },
        tooltip: {
          trigger: 'axis',
          showContent: false
        },
        dataset: {
          source: [
            itemArr,
            timOneArr,
            timeOneArr1,
            timTwoArr,
            timThreeArr,
            timFourArr,
            timFiveArr,
            timSixArr
          ]
        },
        grid: {
          top: '55%',
          left: '3%',
          right: '5%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: { type: 'category' },
        yAxis: { gridIndex: 0 },
        series: [
          { type: 'line', smooth: true, seriesLayoutBy: 'row' },
          { type: 'line', smooth: true, seriesLayoutBy: 'row' },
          { type: 'line', smooth: true, seriesLayoutBy: 'row' },
          { type: 'line', smooth: true, seriesLayoutBy: 'row' },
          { type: 'line', smooth: true, seriesLayoutBy: 'row' },
          { type: 'line', smooth: true, seriesLayoutBy: 'row' },
          { type: 'line', smooth: true, seriesLayoutBy: 'row' },
          {
            type: 'pie',
            id: 'pie',
            radius: '40%',
            center: ['50%', '25%'],
            label: {
              formatter: '{b}: {@' + firstDay + '} ({d}%)'
            },
            encode: {
              itemName: 'itemInterval',
              value: firstDay,
              tooltip: firstDay
            }
          }
        ]
      }
      var myChart = echarts.init(document.getElementById('playTimeDiv'))
      setTimeout(function () { // 检测数据 联动
        myChart.on('updateAxisPointer', function (event) {
          var xAxisInfo = event.axesInfo[0]
          if (xAxisInfo) {
            var dimension = xAxisInfo.value + 1
            myChart.setOption({
              series: {
                id: 'pie',
                label: {
                  formatter: '{b}: {@[' + dimension + ']} ({d}%)'
                },
                encode: {
                  value: dimension,
                  tooltip: dimension
                }
              }
            })
          }
        })
      }, 10)
      myChart.setOption(option)
      window.onresize = myChart.resize // 适应图表
    },
    // 导出excecl
    handleExport: function () {
      if (this.playTimeList.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      require.ensure([], () => {
        const { exportExcel } = require('../../excel/Export2Excel')
        const tHeader = ['日期', '平均时长', '1分钟以下（人数）', '1-3分钟（人数）', '4-10分钟（人数）', '11-30分钟（人数）', '31-60分钟（人数）', '61-120分钟（人数）', '121分钟以上（人数）']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['day', 'avgtime', 'tim0_1', 'tim1_3', 'tim3_10', 'tim10_30', 'tim30_60', 'tim60_120', 'tim120']
        // 上面的'day', 'hour', 'online_num'是tableData里对象的属性
        const list = this.playTimeList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '列表excel')
      })
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.getPlayTime()
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
