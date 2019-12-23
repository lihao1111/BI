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
          <el-button type="primary " size="small" icon="el-icon-search" v-on:click="getActiveUser()">查询</el-button>
        </el-form-item>
        <el-radio-group v-model="chooseType" size="small" @change="chooseTypeVal" style="float: right; margin-top: 5px; margin-right: 10px">
          <el-radio-button label="day">日</el-radio-button>
          <el-radio-button label="week">周</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
        </el-radio-group>
      </el-form>
    </el-col>
    <el-col :span="24" style="position: relative;">
      <div id="activeUserDiv" style="width:100%; height:500px; margin-top: 10px; z-index: 1000" v-loading="chartLoading"></div>
    </el-col>
    <div style="padding: 0px 10px;">
      <el-col :span="24" style=" margin-top: 10px; height: 40px; line-height: 40px; background-color: rgba(17, 146, 175, 0.18);">
        <span style="padding:10px; color: #606266;">详细数据<i class="el-icon-info"></i></span>
        <el-link type="primary" :underline="false" style="float: right; margin-right: 10px; font-weight: bold" icon="el-icon-download" @click="handleExport">
          导出数据
        </el-link>
      </el-col>
      <el-table :data="tActiveUserList" highlight-current-row style="width:100%;"
                :header-cell-style="{
                  'background-color': '#f2f2f2',
                  'color': '#3a8ee6',
                  'border-bottom': '1px #f2f2f2 solid'
                  }"
      >
        <el-table-column prop="day" sortable label="日期" align="center"></el-table-column>
        <el-table-column prop="uv" sortable label="UV" align="center"></el-table-column>
        <el-table-column prop="pv" sortable label="PV" align="center"></el-table-column>
      </el-table>
    </div>
  </section>
</template>
<script>
import { loadActiveUser } from '../../api/api'
import echarts from 'echarts'
export default {
  data () {
    return {
      queryDate: [new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000), new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000)],
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
      tActiveUserList: [], // 表格数据
      chooseType: '',
      chartLoading: false,
      activeUserList: [], // 请求数据
      dataLegStr: [], // 绘图数据_Leg
      dataX: [], // 绘图数据_X
      dataY: [] // 绘图数据_Y
    }
  },
  methods: {
    chooseTypeVal: function (val) {
      this.chooseType = val
      this.getActiveUser()
    },
    // 导出
    handleExport () {
      if (this.tActiveUserList.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      require.ensure([], () => {
        const { exportExcel } = require('../../excel/Export2Excel')
        const tHeader = ['日期', 'uv', 'pv']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['day', 'uv', 'pv']
        const list = this.tActiveUserList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '用户活跃excel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    getActiveUser: function () {
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
      loadActiveUser({ startDate: this.queryDate[0], endDate: this.queryDate[1], platFormId: this.tApp.id, type: this.chooseType }).then(data => { // ?
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
            message: '活跃用户数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.tActiveUserList = [...resultSet] // 表格数据
          let sumMap = {} // 合计项
          sumMap.day = '合计'
          sumMap.pv = 0
          this.tActiveUserList.reduce((pre, cur) => {
            sumMap.pv = pre.pv + cur.pv
            return sumMap
          }, sumMap)
          this.tActiveUserList.push(sumMap)
          this.activeUserList = [...resultSet].reverse() // 该方法会改变原来的数组，而不会创建新的数组
          if (this.chooseType === 'week') {
            this.activeUserList.forEach(item => {
              item.day = this.moment(item.day).day(-6).format('YYYY-MM-DD') + '至' + item.day
            })
          } else if (this.chooseType === 'month') {
            this.activeUserList.forEach(item => {
              item.day = this.moment(item.day).format('YYYY-MM') + '月'
            })
          }
          this.CoreChart(this.chooseType)
        }
      })
    },
    CoreChart: function () {
      // 整理数据
      this.dataY = []
      this.dataLegStr = ['UV', 'PV']
      this.dataX = []
      var uvCountArr = []
      var pvCountArr = []
      for (let k in this.activeUserList) {
        this.dataX.push(this.activeUserList[k].day)
        uvCountArr.push(this.activeUserList[k].uv)
        pvCountArr.push(this.activeUserList[k].pv)
      }
      let map = {}
      map['name'] = 'UV'
      map['barWidth'] = 60
      map['type'] = 'bar'
      map['stack'] = '总量'
      map['label'] = { 'normal': {
        'show': true
      } }
      map['data'] = uvCountArr
      this.dataY.push(map)
      map = {}
      map['name'] = 'PV'
      map['barWidth'] = 60
      map['type'] = 'bar'
      map['stack'] = '总量'
      map['label'] = { 'normal': {
        'show': true
      } }
      map['data'] = pvCountArr
      this.dataY.push(map)

      this.showCharts(this.dataLegStr, this.dataX, this.dataY)
    },
    showCharts: function (_dataLeg, _dataX, _dataY) {
      var option = { // 核心数据 数据展示
        border: false,
        legend: {
          orient: 'vertical',
          left: 'center',
          bottom: 'bottom',
          data: _dataLeg
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          data: _dataX,
          name: '日期',
          axisLine: { onZero: true },
          splitLine: { show: false },
          splitArea: { show: false }
        },
        yAxis: { // 纵坐标
          splitArea: { show: false }
        },
        series: _dataY // 图
      }
      this.chartColumn = echarts.init(document.getElementById('activeUserDiv'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.chooseType = 'day' // 默认设置 天
    this.getActiveUser()
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
