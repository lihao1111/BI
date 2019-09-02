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
                    <el-button type="primary " size="small" icon="el-icon-search" v-on:click="getSubjectList">查询</el-button>
                </el-form-item>
                <el-radio-group v-model="chooseType" size="small" @change="chooseTypeVal" style="float: right; margin-top: 5px; margin-right: 10px">
                    <el-radio-button label="day">日</el-radio-button>
                <!--    <el-radio-button label="week">周</el-radio-button>
                    <el-radio-button label="month">月</el-radio-button>-->
                </el-radio-group>
            </el-form>
        </el-col>
        <el-col :span="24" style="position: relative;">
            <div style="position: absolute; z-index: 1001; top:10px; right: 10px;">
                <el-radio-group v-model="seledVal" size="small" @change.native="chooseValChart">
                    <el-radio-button label="pv">PV</el-radio-button>
                    <el-radio-button label="uv">UV</el-radio-button>
                </el-radio-group>
            </div>
            <div id="subjectListDiv" style="width:100%; height:400px; margin-top: 10px; z-index: 1000" v-loading="chartLoading"></div>
        </el-col>
        <div style="padding: 0px 10px;">
            <el-col :span="24" style=" margin-top: 10px; height: 40px; line-height: 40px; background-color: rgba(17, 146, 175, 0.18);">
                <span style="padding:10px; color: #606266;">详细数据<i class="el-icon-info"></i></span>
                <el-link type="primary" :underline="false" style="float: right; margin-right: 10px; font-weight: bold" icon="el-icon-download" @click="handleExport">
                    导出数据
                </el-link>
            </el-col>
            <el-table :data="subjectList.slice((curpage-1) * pageSize, curpage*pageSize)" highlight-current-row style="width:100%; height: 640px"
                      :header-cell-style="{
                  'background-color': '#f2f2f2',
                  'color': '#3a8ee6',
                  'border-bottom': '1px #f2f2f2 solid'
                }"
            >
                <el-table-column prop="day" label="日期" align="center"></el-table-column>
                <el-table-column prop="name" label="专题名称" align="center"></el-table-column>
                <el-table-column prop="pv" sortable label="PV" align="center"></el-table-column>
                <el-table-column prop="uv" sortable label="UV" align="center"></el-table-column>
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
        </div>
    </section>

</template>
<script>
import { loadSubjectList } from '../../api/api'
import echarts from 'echarts'
export default {
  data () {
    return {
      totalSize: 0,
      curpage: 1,
      pageSize: 15,
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
        }, {
          text: '最近三个月',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      chartLoading: false,
      tApp: '',
      subjectList: [], // 请求数据
      subjectListDraw: [], // 画图数据 Top10
      seledVal: '', // 选择项
      chooseType: '', // 日周月
      dataLegStr: [], // 绘图数据_Leg
      dataX: [], // 绘图数据_X
      dataYSer: [] // 绘图数据_Y
    }
  },
  methods: {
    handleCurrentChange (val) {
      this.curpage = val
    },
    getSubjectList: function () {
      if (!this.queryDate) {
        this.$message({
          message: '请选择查询日期范围！',
          type: 'error'
        })
        return false
      }
      if (this.queryDate[1] < this.queryDate[0]) {
        this.$message({
          message: '结束日期必须大于开始日期！',
          type: 'error'
        })
        return false
      }
      this.chartLoading = true
      loadSubjectList({ startDate: this.queryDate[0], endDate: this.queryDate[1], chooseType: this.chooseType, platFormId: this.tApp.id }).then(data => { // ?
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
            message: '专题数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.subjectList = resultSet // 图表数据
          this.totalSize = this.subjectList.length // 分页数据
          this.curpage = 1
          this.seledVal = 'pv' // 设置默认值
          // Top 绘图数据 []
          var subjectListTop = []
          this.subjectList.forEach(item => {
            var subjectCode = item.code
            var itemMap = null
            subjectListTop.forEach(itemTop => {
              var subjectTopCode = itemTop.code
              if(subjectTopCode === subjectCode){
                itemMap = itemTop
                return false
              }
            })
            if(itemMap == null){
              itemMap = {}
              itemMap['code'] = item.code
              itemMap['pv'] = item.pv
              itemMap['uv'] = item.uv
              subjectListTop.push(itemMap)
            }else{
              itemMap['pv'] += parseInt(item.pv)
              itemMap['uv'] += parseInt(item.uv)
            }
          })
          subjectListTop.sort(this.Compare('pv'))
          subjectListTop = subjectListTop.length > 5 ? subjectListTop.slice(0, 5) : subjectListTop
          //Top数据  32
          this.subjectListDraw = this.subjectList
          for(var i = this.subjectListDraw.length-1; i>=0; i--){
            var item = this.subjectListDraw[i]
            var code = item.code
            var existsFlag = false
            subjectListTop.forEach(itemTop => {
              var codeTop = itemTop.code
              if(codeTop == code){
                existsFlag = true
                return false
              }
            })
            if(!existsFlag){
              this.subjectListDraw.splice(i,1);
            }
          }
          this.CoreChart(this.seledVal)
        }
      })
    },
    Compare: function (pro) { // 排序函数
      return function (obj1, obj2) {
        var val1 = obj1[pro]
        var val2 = obj2[pro]
        if (val1 < val2) { // 正序
          return 1
        } else if (val1 > val2) {
          return -1
        } else {
          return 0
        }
      }
    },
    // 切换 日 周 月
    chooseTypeVal: function (val) {
      this.chooseType = val
      this.getSubjectList()
    },
    // 切换 条件 图表
    chooseValChart: function () {
      this.CoreChart(this.seledVal)
    },
    // 整理数据
    CoreChart: function (keyStr) {
      // 整理数据
      var dataY = {}
      this.dataLegStr = []
      this.dataX = []
      this.dataYSer = []
      for (let k in this.subjectListDraw) {
        var day = this.subjectListDraw[k].day
        var subjectName = this.subjectListDraw[k].name
        if (this.dataX.indexOf(day) === -1) {
          this.dataX.push(day)
        }
        if (this.dataLegStr.indexOf(subjectName) === -1) {
          this.dataLegStr.push(subjectName)
        }
      }
      this.dataLegStr.forEach(subjectName => { // 填充数据
        dataY[subjectName] = new Array(this.dataX.length).fill(0) // [0,0,0]
        this.subjectListDraw.forEach(subjectItem => {
          if (subjectItem.name === subjectName) {
            var idx = this.dataX.indexOf(subjectItem.day)
            dataY[subjectName].splice(idx, 0, subjectItem[keyStr])
          }
        })
        dataY[subjectName] = dataY[subjectName].slice(0, this.dataX.length)
      })
      // 整理 dataY map
      var idx = 0
      for (var k in dataY) {
        var map = {}
        map['name'] = this.dataLegStr[idx++]
        map['type'] = 'line'
        map['stack'] = '总量'
        map['areaStyle'] = {}
        map['smooth'] = true
        map['data'] = dataY[k]
        this.dataYSer.push(map)
      }
      this.showCharts(this.dataLegStr, this.dataX, this.dataYSer)
    },
    showCharts: function (_dataLeg, _dataX, _dataY) {
      var option = {
        border: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          orient: 'vertical',
          left: 'center',
          bottom: 'bottom',
          data: _dataLeg
        },
        toolbox: {
          show: false,
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: [{ // 横坐标
          type: 'category',
          boundaryGap: false,
          data: _dataX
        }],
        yAxis: [{ // 纵坐标
          type: 'value'
        }],
        series: _dataY // 图形
        // 指定颜色
      }
      this.chartColumn = echarts.init(document.getElementById('subjectListDiv'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    },
    // 导出
    handleExport () {
      if (this.subjectList.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      require.ensure([], () => {
        const { exportExcel } = require('../../excel/Export2Excel')
        const tHeader = ['日期', '专题名称', 'PV', 'UV']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['day', 'name', 'pv', 'uv']
        const list = this.subjectList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '专题流量excel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.chooseType = 'day'
    this.getSubjectList()
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
