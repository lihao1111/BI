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
          <el-button type="primary " size="small" icon="el-icon-search" v-on:click="getOrderEnter">查询</el-button>
        </el-form-item>
        <el-radio-group v-model="chooseType" size="small" @change="chooseTypeVal" style="float: right; margin-top: 5px; margin-right: 10px">
          <el-radio-button label="day">日</el-radio-button>
          <el-radio-button label="week">周</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
        </el-radio-group>
      </el-form>
    </el-col>
    <el-col :span="24">
      <div id="orderEnterDiv" style="width:100%; height:380px; text-align: center" v-loading="chartLoading"></div>
    </el-col>
    <div style="padding: 0px 10px;">
      <el-col :span="24" style=" margin-top: 10px; height: 40px; line-height: 40px; background-color: rgba(17, 146, 175, 0.18);">
        <span style="padding:10px; color: #606266;">详细数据<i class="el-icon-info"></i></span>
        <el-link type="primary" :underline="false" style="float: right; margin-right: 10px; font-weight: bold" icon="el-icon-download" @click="handleExport">
          导出数据
        </el-link>
      </el-col>
      <el-table :data="orderEnterList" highlight-current-row style="width:100%;"
                :header-cell-style="{
                  'background-color': '#f2f2f2',
                  'color': '#3a8ee6',
                  'border-bottom': '1px #f2f2f2 solid'
                }"
      >
        <el-table-column prop="day" label="日期" align="center" :formatter="formaterText"></el-table-column>
        <el-table-column prop="uv" sortable label="订购页到达数" align="center"></el-table-column>
        <el-table-column prop="pv" sortable label="订购页到达次数" align="center"></el-table-column>
      </el-table>
    </div>
  </section>
</template>loadOrderEnter
<script>
import { loadOrderEnter } from '../../api/api'
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
      orderEnterList: [], // 请求数据
      drawDatas: [],
      chooseType: ''
    }
  },
  methods: {
    chooseTypeVal: function (val) {
      this.chooseType = val
      this.getOrderEnter()
    },
    formaterText (row, column, cellValue) {
      var retVal = ''
      if (cellValue === null || cellValue === 'null') {
        retVal = '暂无'
      } else {
        retVal = cellValue.toString()
      }
      return retVal
    },
    handleExport () {
      if (this.orderEnterList.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      require.ensure([], () => {
        const { exportExcel } = require('../../excel/Export2Excel')
        const tHeader = ['日期', '订购页到达数(UV)', '订购页到达次数(PV)']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['day', 'uv', 'pv']
        // 上面的'day', 'hour', 'online_num'是tableData里对象的属性
        const list = this.orderEnterList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '订购到达excel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    getOrderEnter: function () {
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
      this.chartLoading = true
      loadOrderEnter({
        startDate: this.queryDate[0],
        endDate: this.queryDate[1],
        platFormId: this.tApp.id,
        type: this.chooseType
      }).then(data => { // ?
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
            message: '订购页到达统计失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.orderEnterList = resultSet
          this.drawDatas = [...this.orderEnterList].reverse()
          this.drawOrderChart()
        }
      })
    },
    drawOrderChart: function () {
      var dataX = []
      var dataV = []
      this.drawDatas.forEach(item => {
        dataX.push(item.day)
        dataV.push(item.uv)
      })
      var option = { // 核心数据 数据展示
        border: false,
        toolbox: {
          show: true,
          feature: {
            saveAsImage: { show: true }
          }
        },
        legend: {
          data: ['订购触发']
        },
        label: {
          show: true, // 开启显示
          position: 'top', // 在上方显示
          textStyle: { // 数值样式
            color: 'black',
            fontSize: 16,
            fontWeight: 600
          }
        },
        xAxis: {
          type: 'category',
          data: dataX,
          axisLabel: {
            interval: 0, // 横轴信息全部显示
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '订购页到达数',
          barWidth: 60,
          data: dataV,
          type: 'bar'
        }],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        color: ['#3F77FE']
      }
      this.chartColumn = echarts.init(document.getElementById('orderEnterDiv'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    }
  },
  created: function () {
    // 展示数据
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.chooseType = 'day' // 默认设置 天
    this.getOrderEnter()
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
