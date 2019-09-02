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
            <el-button type="primary" size="small" icon="el-icon-search" v-on:click="getPVUVList">查询</el-button>
          </el-form-item>
          <el-form-item style="float: right">
            <el-button type="primary" size="small"  icon="el-icon-plus" @click="addCompare">对比日期</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <div>
        <el-col :span="8" style="padding-top: 20px; padding-right: 20px">
            <el-card shadow="always" style="background-color:#8CC554;color:#fff;font-weight:bold;">
                <div slot="header">
                    <span>日期：{{this.moment(this.queryDate).format('YYYY-MM-DD')}}</span>
                </div>
                <div style="text-align: center; font-size: 24px; height: 50px; line-height: 50px">
                    PV：{{sumPV | formaterNumber}}
                </div>
            </el-card>
        </el-col>
        <el-col :span="8" style="padding-top: 20px;padding-right: 10px; padding-left: 10px">
            <el-card shadow="always" style="background-color:#00A7BA;color:#fff;font-weight:bold;">
                <div slot="header">
                    <span>日期：{{this.moment(this.queryDate).format('YYYY-MM-DD')}}</span>
                </div>
                <div style="text-align: center; font-size: 24px; height: 50px; line-height: 50px">
                    UV：{{sumUV | formaterNumber}}
                </div>
            </el-card>
        </el-col>
        <el-col :span="8" style="padding-top: 20px; padding-left: 20px">
            <el-card shadow="always" style="background-color:#E73278;color:#fff;font-weight:bold;">
                <div slot="header">
                    <span>日期：{{this.moment(this.queryDate).format('YYYY-MM-DD')}}</span>
                </div>
                <div style="text-align: center; font-size: 24px; height: 50px; line-height: 50px">
                    PV/UV：{{sumPVUVPer.toFixed(2)}}
                </div>
            </el-card>
        </el-col>
      </div>
      <el-col :span="24">
        <div id="onlinePVUVDiv" style="width:100%; height:400px;" v-loading="chartLoading"></div>
      </el-col>
      <div style="padding: 0px 10px;">
        <el-col :span="24" style=" margin-top: 10px; height: 40px; line-height: 40px; background-color: rgba(17, 146, 175, 0.18);">
          <span style="padding:10px; color: #606266;">详细数据<i class="el-icon-info"></i></span>
          <el-link type="primary" :underline="false" style="float: right; margin-right: 10px; font-weight: bold" icon="el-icon-download" @click="handleExport">
            导出数据
          </el-link>
        </el-col>
        <el-table :data="pvuvList" highlight-current-row style="width:100%;"
                  :header-cell-style="{
                  'background-color': '#f2f2f2',
                  'color': '#3a8ee6',
                  'border-bottom': '1px #f2f2f2 solid'
                }"
        >
          <el-table-column prop="day" label="日期" align="center"></el-table-column>
          <el-table-column prop="hour" label="小时" align="center"></el-table-column>
          <el-table-column prop="pv" sortable label="PV" align="center"></el-table-column>
          <el-table-column prop="uv" sortable label="UV" align="center"></el-table-column>
          <el-table-column prop="PVUVPrec" sortable label="UV/PV占比" align="center">
            <template slot-scope="scope">
              <span style="color: #1d8ce0; font-weight: bold">{{ scope.row.PVUVPrec == null ? '' : scope.row.PVUVPrec+'%' }}</span>
            </template>
          </el-table-column>
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
import { loadPVUVList, loadPVUVSum, compareOnlinePVUV } from '../../api/api'
import echarts from 'echarts'
export default {
  data () {
    return {
      chartLoading: false,
      queryDate: new Date(),
      tApp: '',
      sumPV: 0,
      sumUV: 0,
      sumPVUVPer: 0,
      pvuvList: [], // 请求数据
      compareDate: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
      compareForm: false, // 对比日期是否显示
      compareList: [], // 对比日期
      drawChartDatas: [], // 绘图数据
      dataLegStr: [], // 绘图数据_Leg
      dataX: [], // 绘图数据_X
      dataYSer: [], // 绘图数据_series
      dataY: {} // 绘图数据_Y
    }
  },
  methods: {
    //  加载数据
    getPVUVList () {
      if (!this.queryDate) {
        this.$message({
          showClose: true,
          message: '请选择查询日期！',
          type: 'error'
        })
        return false
      }
      this.chartLoading = true
      loadPVUVList({ queryDate: this.queryDate, platFormId: this.tApp.id }).then(data => { // ?
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
            message: 'PVUV数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.pvuvList = resultSet // 图表数据
          // 加载汇总数据
          this.getPVUVSum()
          // 绘图
          this.queryPVUVChart()
        }
      })
    },
    getPVUVSum () {
      if (!this.queryDate) {
        this.$message({
          showClose: true,
          message: '请选择查询日期！',
          type: 'error'
        })
        return false
      }
      loadPVUVSum({ queryDate: this.queryDate, platFormId: this.tApp.id }).then(data => { // ?
        let { businessCode, resultSet } = data
        if (businessCode !== 'success') {
          this.$message({
            message: 'PVUV汇总数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          // 加载汇总数据
          this.sumUV = 0
          this.sumPV = 0
          this.sumPVUVPer = 0
          if (resultSet != null && resultSet.length > 0) {
            this.sumUV = resultSet[0].uv
            this.sumPV = resultSet[0].pv
            this.sumPVUVPer = this.sumPV === 0 ? 0 : (this.sumPV / this.sumUV)
          }
        }
      })
    },
    queryPVUVChart () { // 查询数据
      this.drawChartDatas = []
      this.drawChartDatas = this.pvuvList
      this.drawOnlinePVUV()
    },
    // 加入对比日期
    addCompare () {
      this.compareForm = true // dialog显示
    },
    // 提交对比
    compareSubmit () { // 数据待测试
      let compareDateStr = this.moment(this.compareDate).format('YYYY-MM-DD')
      if (this.dataLegStr.indexOf(compareDateStr) !== -1) {
        this.$message({
          message: '请选择不存在图表中的日期进行对比！',
          type: 'warning'
        })
        return false
      }
      if (this.moment(this.queryDate).format('YYYY-MM-DD') === compareDateStr) {
        this.$message({
          message: '请选择不存在图表中的日期进行对比！',
          type: 'warning'
        })
        return false
      }
      this.chartLoading = true
      compareOnlinePVUV({ compareDate: this.compareDate, platFormId: this.tApp.id }).then(data => { // ?
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
          this.compareUserChart()
        }
      })
    },
    // 对比数据绘图
    compareUserChart () {
      // 不同于之前的 对比数据可以一致累加 这里做针对本次对比数据进行对比
      this.drawChartDatas = this.pvuvList.concat(this.compareList)
      this.drawOnlinePVUV()
    },
    // 导出
    handleExport () {
      if (this.pvuvList.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      require.ensure([], () => {
        const { exportExcel } = require('../../excel/Export2Excel')
        const tHeader = ['日期', '小时', 'PV', 'UV', 'UV/PV占比']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['day', 'hour', 'pv', 'uv', 'PVUVPrec']
        // 上面的'day', 'hour', 'online_num'是tableData里对象的属性
        const list = this.pvuvList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '实时PVUVexcel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    // 绘图
    drawOnlinePVUV () {
      // 整理数据
      this.dataY = {}
      this.dataYSer = []
      this.dataLegStr = []
      this.dataX = []
      var dataStr = []
      for (let k in this.drawChartDatas) {
        var day = this.drawChartDatas[k].day
        var hour = this.drawChartDatas[k].hour
        var UV = this.drawChartDatas[k].uv
        var PV = this.drawChartDatas[k].pv
        if (dataStr.indexOf(day) === -1) {
          dataStr.push(day)
          this.dataLegStr.push(day + '_UV')
          this.dataLegStr.push(day + '_PV')
        }
        if (this.dataX.indexOf(hour) === -1) {
          this.dataX.push(hour)
        }
        if (this.dataY[day + '_UV'] == null) {
          this.dataY[day + '_UV'] = []
        }
        if (this.dataY[day + '_PV'] == null) {
          this.dataY[day + '_PV'] = []
        }
        this.dataY[day + '_UV'].push(UV)
        this.dataY[day + '_PV'].push(PV)
      }
      var idx = 0
      for (var k in this.dataY) { // 为了加入对比数据
        var map = {}
        var stackVal = this.dataLegStr[idx++]
        map['name'] = stackVal
        var dayStr = stackVal.split('_')[0]
        map['type'] = 'bar'
        map['data'] = this.dataY[k]
        map['barMaxWidth'] = 80 // 最大宽度
        map['stack'] = dayStr + 'PV/UV' // 同一柱形图 stack一致
        this.dataYSer.push(map)
      }
      this.showCharts(this.dataLegStr, this.dataX, this.dataYSer)
    },
    showCharts (_dataLegen, _dataX, _dataY) {
      var option = {
        border: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '5%',
          containLabel: true
        },
        legend: {
          orient: 'vertical',
          left: 'center',
          bottom: 'bottom',
          data: _dataLegen
        },
        xAxis: { // 横坐标
          type: 'category',
          name: '小时',
          data: _dataX
        },
        yAxis: { // 纵坐标
          type: 'value',
          name: 'PV/UV'
        },
        series: _dataY // 图形
        // 指定颜色
      }
      this.chartColumn = echarts.init(document.getElementById('onlinePVUVDiv'))
      this.chartColumn.clear() // 解决残留数据问题
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.getPVUVList()
  },
  mounted: function () {
  },
  updated: function () {
  }
}
</script>
<style>
  .el-card__header{
    padding: 5px;
  }
  .el-card__body{
    padding: 0px;
  }
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
