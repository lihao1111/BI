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
          <el-button type="primary" size="small" icon="el-icon-search" v-on:click="getOnlineOrder">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" size="small"  icon="el-icon-plus" @click="addCompare">对比日期</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="24">
      <div id="onlineOrderDiv" style="width:100%; height:400px;" v-loading="chartLoading"></div>
    </el-col>
    <div style="padding: 0px 10px;">
      <el-col :span="24" style=" margin-top: 10px; height: 40px; line-height: 40px; background-color: rgba(17, 146, 175, 0.18);">
        <span style="padding:10px; color: #606266;">详细数据<i class="el-icon-info"></i></span>
        <el-link type="primary" :underline="false" style="float: right; margin-right: 10px; font-weight: bold" icon="el-icon-download" @click="handleExport">
          导出数据
        </el-link>
      </el-col>
      <el-table :data="tOrderList" highlight-current-row style="width:100%;"
                :header-cell-style="{
                  'background-color': '#f2f2f2',
                  'color': '#3a8ee6',
                  'border-bottom': '1px #f2f2f2 solid'
                }"
      >
        <el-table-column prop="day" label="日期" align="center"></el-table-column>
        <el-table-column prop="hour" label="小时" align="center"></el-table-column>
        <el-table-column prop="online_num" sortable label="在线订购" align="center"></el-table-column>
      </el-table>
    </div>
    <!--弹出框-->
    <el-dialog title="选择" :visible.sync="compareForm" :close-on-click-modal="false" width="30%">
      <div style="padding-left: 60px">
        <span style="font-size: 16px;font-weight: bold; margin-right: 10px;">对比日期</span>
        <el-date-picker
                v-model="compareDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择日期"
        >
        </el-date-picker>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="compareForm = false">取消</el-button>
        <el-button type="primary" @click.native="compareSubmit()">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import { loadOnlineOrder, compareOnlineOrder } from '../../api/api'
import echarts from 'echarts'
require('echarts/theme/shine')
export default {
  data () {
    return {
      chartLoading: false,
      queryDate: new Date(),
      tApp: '',
      orderList: [], // 请求数据
      tOrderList: [], // 本日数据
      compareDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      compareForm: false, // 对比日期是否显示
      compareList: [], // 对比日期
      drawChartDatas: [], // 绘图数据
      dataLegStr: [], // 绘图数据_Leg
      dataX: [], // 绘图数据_X
      dataYSer: [], // 绘图数据_series
      dataY: {}, // 绘图数据_Y
      chart: '' // 绘图
    }
  },
  methods: {
    //  加载数据
    getOnlineOrder () {
      if (!this.queryDate) {
        this.$message({
          showClose: true,
          message: '请选择查询日期！',
          type: 'error'
        })
        return false
      }
      this.chartLoading = true
      loadOnlineOrder({ queryDate: this.queryDate, platFormId: this.tApp.id }).then(data => { // ?
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
            message: '在线订购数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.orderList = resultSet // 图表数据
          this.tOrderList = [] // 表格数据
          this.orderList.forEach(item => {
            let day = this.moment(this.queryDate).format('YYYY-MM-DD')
            if (item.day === day) {
              this.tOrderList.push(item)
            }
          })
          this.tOrderList.reverse()
          this.queryOrderChart()
        }
      })
    },
    queryOrderChart () { // 查询数据
      this.drawChartDatas = []
      this.drawChartDatas = this.orderList
      this.drawOnlineOrder()
    },
    // 加入对比日期
    addCompare () {
      this.compareForm = true // dialog显示
    },
    // 提交对比
    compareSubmit () {
      let compareDateStr = this.moment(this.compareDate).format('YYYY-MM-DD')
      if (this.dataLegStr.indexOf(compareDateStr) !== -1) {
        this.$message({
          showClose: true,
          message: '请选择不存在图表中的日期进行对比！',
          type: 'warning'
        })
        return false
      }
      this.chartLoading = true
      compareOnlineOrder({ compareDate: this.compareDate, platFormId: this.tApp.id }).then(data => { // ?
        let { businessCode, resultSet } = data
        this.chartLoading = false
        this.compareForm = false
        if (businessCode !== 'success') {
          this.$message({
            message: '加载对比数据失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.compareList = resultSet
          this.compareOrderChart()
        }
      })
    },
    compareOrderChart: function () {
      this.drawChartDatas = this.drawChartDatas.concat(this.compareList)
      this.drawOnlineOrder()
    },
    // 导出
    handleExport () {
      if (this.tOrderList.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      //
      require.ensure([], () => {
        const { exportExcel } = require('../../excel/Export2Excel')
        const tHeader = ['日期', '小时', '实时订购']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['day', 'hour', 'online_num']
        // 上面的'day', 'hour', 'online_num'是tableData里对象的属性
        const list = this.tOrderList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '实时订购excel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    drawOnlineOrder () {
      // 整理数据
      this.dataY = {}
      this.dataYSer = []
      this.dataLegStr = []
      this.dataX = []
      for (let k in this.drawChartDatas) {
        var day = this.drawChartDatas[k].day
        var hour = this.drawChartDatas[k].hour
        var onlineNum = this.drawChartDatas[k].online_num
        if (this.dataLegStr.indexOf(day) === -1) {
          this.dataLegStr.push(day)
        }
        if (this.dataX.indexOf(hour) === -1) {
          this.dataX.push(hour)
        }
        if (this.dataY[day] == null) {
          this.dataY[day] = []
        }
        this.dataY[day].push(onlineNum)
      }
      var idx = 0
      for (var k in this.dataY) {
        var map = {}
        map['name'] = this.dataLegStr[idx++]
        map['type'] = 'line'
        map['data'] = this.dataY[k]
        map['smooth'] = true
        this.dataYSer.push(map)
      }
      this.showCharts(this.dataLegStr, this.dataX, this.dataYSer)
    },
    showCharts (_dataLegen, _dataX, _dataY) {
      var option = {
        border: false,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let relVal = ''
            for (let i = 0; i < params.length; i++) {
              relVal += params[i].marker + params[i].seriesName + '/' + params[i].name + '：' + params[i].value + '<br/>'
            }
            return relVal
          }
        },
        legend: {
          orient: 'vertical',
          left: 'center',
          bottom: 'bottom',
          data: _dataLegen
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: { // 横坐标
          type: 'category',
          name: '小时',
          data: _dataX,
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: { // 纵坐标
          type: 'value',
          name: '在线订购数'
        },
        series: _dataY // 图形
        // 指定颜色
      }
      this.chart = echarts.init(document.getElementById('onlineOrderDiv'), 'shine')
      this.chart.clear()
      this.chart.setOption(option)
      window.onresize = this.chart.resize // 适应图表
    }
  },
  watch: { // 监听事件
    chart () { // 添加参数 修改点击legend事件
      var that = this
      this.chart.on('legendselectchanged', function (obj) {
        // 删除 对应的 option中的
        var chooseName = obj.name
        if (that.dataLegStr.indexOf(chooseName) <= 2 && that.dataLegStr.indexOf(chooseName) >= 0) {
          return false
        }
        // 重置dataList
        that.drawChartDatas = that.drawChartDatas.filter(function (item) {
          return item['day'] !== chooseName
        })
        // 重置 option
        that.dataLegStr.splice(that.dataLegStr.indexOf(chooseName, 1))
        that.dataYSer = that.dataYSer.filter(function (item) {
          return item['name'] !== chooseName
        })
        that.showCharts(that.dataLegStr, that.dataX, that.dataYSer)
      })
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.getOnlineOrder()
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
