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
          <el-button type="primary " size="small" icon="el-icon-search" v-on:click="getLoginUser()">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="24" style="position: relative;">
      <div style="position: absolute; z-index: 1001; top:10px; right: 10px;">
        <el-radio-group v-model="seledVal" size="small" @change="chooseValChart">
          <el-radio-button label="login_uv">登录用户</el-radio-button>
          <el-radio-button label="login_num">登录次数</el-radio-button>
        </el-radio-group>
      </div>
      <div id="loginUserDiv" style="width:100%; height:500px; margin-top: 10px; z-index: 1000" v-loading="chartLoading"></div>
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
        <el-table-column prop="login_uv" sortable label="登录用户" align="center"></el-table-column>
        <el-table-column prop="login_new" sortable label="新用户登录" align="center"></el-table-column>
        <el-table-column prop="login_old" sortable label="老用户登录" align="center"></el-table-column>
        <el-table-column prop="login_num" sortable label="登录次数" align="center"></el-table-column>
        <el-table-column prop="loginNewPrec" label="新用户占比" align="center">
          <template slot-scope="scope">
            <span style="color: #1d8ce0; font-weight: bold">{{ scope.row.loginNewPrec == null ? '' : scope.row.loginNewPrec+'%' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="loginOldPrec" label="老用户占比" align="center">
          <template slot-scope="scope">
            <span style="color: #1d8ce0; font-weight: bold">{{ scope.row.loginOldPrec == null ? '' : scope.row.loginOldPrec+'%' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>
<script>
import { loadLoginUser } from '../../api/api'
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
      chartLoading: false,
      tApp: '',
      tActiveUserList: [], // 表格数据
      seledVal: '', // 选择项
      activeUserList: [], // 请求数据
      dataLegStr: [], // 绘图数据_Leg
      dataX: [], // 绘图数据_X
      dataY: [] // 绘图数据_Y
    }
  },
  methods: {
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
        const tHeader = ['日期', '登录用户', '新用户登录', '老用户登录', '登录次数', '新用户占比', '老用户占比']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['day', 'login_uv', 'login_new', 'login_old', 'login_num', 'loginNewPrec', 'loginOldPrec']
        const list = this.tActiveUserList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '用户登录excel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    getLoginUser: function () {
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
      loadLoginUser({ startDate: this.queryDate[0], endDate: this.queryDate[1], platFormId: this.tApp.id }).then(data => { // ?
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
            message: '登录用户数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.tActiveUserList = resultSet // 表格数据
          /*  this.activeUserList = resultSet // 图表数据 */
          this.activeUserList = [...this.tActiveUserList].reverse() // 该方法会改变原来的数组，而不会创建新的数组
          this.seledVal = 'login_uv' // 设置默认值
          this.CoreChart(this.seledVal)
        }
      })
    },
    // 切换 条件 图表
    chooseValChart: function (val) {
      this.seledVal = val
      this.CoreChart()
    },
    // 整理数据
    CoreChart: function () {
      // 整理数据
      this.dataY = []
      this.dataLegStr = []
      this.dataX = []
      if (this.seledVal === 'login_uv') {
        this.dataLegStr = ['新用户登录', '老用户登录']
        var newLoginArr = []
        var oldLoginArr = []
        for (let k in this.activeUserList) {
          this.dataX.push(this.activeUserList[k].day)
          newLoginArr.push(this.activeUserList[k].login_new)
          oldLoginArr.push(this.activeUserList[k].login_old)
        }
        var map = {}
        map['name'] = '新用户登录'
        map['barWidth'] = 60
        map['type'] = 'bar'
        map['stack'] = '总量'
        map['label'] = { 'normal': {
          'show': true
        } }
        map['data'] = newLoginArr
        this.dataY.push(map)
        map = {}
        map['name'] = '老用户登录'
        map['barWidth'] = 60
        map['type'] = 'bar'
        map['stack'] = '总量'
        map['label'] = { 'normal': {
          'show': true
        } }
        map['data'] = oldLoginArr
        this.dataY.push(map)
      } else if (this.seledVal === 'login_num') {
        this.dataLegStr = ['登录次数']
        var loginCountArr = []
        for (let k in this.activeUserList) {
          this.dataX.push(this.activeUserList[k].day)
          loginCountArr.push(this.activeUserList[k].login_num)
        }
        map = {}
        map['name'] = '登录次数'
        map['barWidth'] = 60
        map['type'] = 'bar'
        map['stack'] = '总量'
        map['label'] = { 'normal': {
          'show': true
        } }
        map['data'] = loginCountArr
        this.dataY.push(map)
      }
      this.showCharts(this.dataLegStr, this.dataX, this.dataY)
    },
    showCharts: function (_dataLeg, _dataX, _dataY) {
      var that = this // 转一下
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
        series: _dataY, // 图
        tooltip: {
          trigger: 'axis',
          formatter: function (datas) {
            var len = datas.length
            var ress = ''
            var sumNum = 0
            var sumStr = ''
            for (var k = 0; k < len; k++) {
              var res = datas[k].name + '<br/>' + datas[k].seriesName + ':' + datas[k].data
              ress += res + '<br/>'
              sumNum += datas[k].data
              sumStr = datas[k].name
            }
            if (that.seledVal === 'login_uv') {
              ress += sumStr + '<br/>' + '总量:' + sumNum
            }
            return ress
          },
          axisPointer: {
            type: 'shadow'
          }
        }
      }
      this.chartColumn = echarts.init(document.getElementById('loginUserDiv'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.getLoginUser()
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
