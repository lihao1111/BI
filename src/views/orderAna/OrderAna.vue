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
          <el-button type="primary " size="small" icon="el-icon-search" v-on:click="getOrderDetail">查询</el-button>
        </el-form-item>
       <!-- <el-radio-group v-model="chooseType" size="small" @change="chooseTypeVal" style="float: right; margin-top: 5px; margin-right: 10px">
          <el-radio-button label="day">日</el-radio-button>
          <el-radio-button label="week">周</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
        </el-radio-group>-->
      </el-form>
    </el-col>
    <el-col :span="6" style="padding-top: 20px;padding-right: 20px">
      <el-card shadow="always" style="background-color:#8CC554;color:#fff;font-weight:bold;">
        <div slot="header">
          <span>总订购：</span>
        </div>
        <div style="text-align: center; font-size: 24px; height: 50px; line-height: 50px">
          {{allOrderNum | formaterNumber}}
        </div>
      </el-card>
    </el-col>
    <el-col :span="6" style="padding-top: 20px;padding-right: 10px;padding-left: 10px">
      <el-card shadow="always" style="background-color:#00A7BA;color:#fff;font-weight:bold;">
        <div slot="header">
          <span>新用户订购:</span>
        </div>
        <div style="text-align: center; font-size: 24px; height: 50px; line-height: 50px">
          {{allNewOrderNum | formaterNumber}}
        </div>
      </el-card>
    </el-col>
    <el-col :span="6" style="padding-top: 20px;padding-right: 10px;padding-left: 10px">
      <el-card shadow="always" style="background-color:#E73278;color:#fff;font-weight:bold;">
        <div slot="header">
          <span>老用户订购:</span>
        </div>
        <div style="text-align: center; font-size: 24px; height: 50px; line-height: 50px">
          {{allOldOrderNum | formaterNumber}}
        </div>
      </el-card>
    </el-col>
    <el-col :span="6" style="padding-top: 20px;padding-left: 20px">
      <el-card shadow="always" style="background-color:#FFA705;color:#fff;font-weight:bold;">
        <div slot="header">
          <span>退订:</span>
        </div>
        <div style="text-align: center; font-size: 24px; height: 50px; line-height: 50px">
          {{allUnOrderNum | formaterNumber}}
        </div>
      </el-card>
    </el-col>
    <el-col :span="24">
      <div id="orderAnaDiv" style="width:100%; height:400px;" v-loading="chartLoading"></div>
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
                  'border-bottom': '1px #fafafa solid'
                }"
      >
        <el-table-column prop="display_name" label="产品名称" align="center"></el-table-column>
        <template v-for="(col, index) in tableCols">
          <el-table-column :prop=col :label=col align="center" :key="index">
          </el-table-column>
        </template>
      </el-table>
    </div>
  </section>

</template>
<script>
import { loadOrderDetail } from '../../api/api'
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
      allOrderNum: 0,
      allNewOrderNum: 0,
      allOldOrderNum: 0,
      allUnOrderNum: 0,
      tApp: '',
      orderList: [], // 请求数据
      tOrderList: [], // 表格数据
      tableCols: [], // 表头数据
      chooseType: '' // 选择 日周月
    }
  },
  /* watch: {
    'queryDate': { // 监听选择日期范围的变化 表格数据随之改变
      handler: function (newValue, oldValue) {
        var interval = (new Date(newValue[1]).getTime() - new Date(newValue[0]).getTime()) / (24 * 3600 * 1000)
        this.tableCols = []

        for (var i = 0; i <= interval; i++) {
          let dayStr = this.moment(new Date(new Date(newValue[0]).getTime() + i * 24 * 60 * 60 * 1000)).format('YYYY-MM-DD')
          this.tableCols.push(dayStr)
        }
      },
      deep: true
    }
  }, */
  methods: {
    handleExport () {
      if (this.tOrderList.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      require.ensure([], () => {
        const { exportExcel } = require('../../excel/Export2Excel')
        const tHeader = ['产品名称'].concat(this.tableCols)
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['display_name'].concat(this.tableCols)
        // 上面的'day', 'hour', 'online_num'是tableData里对象的属性
        const list = this.tOrderList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '订购/退订excel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    chooseTypeVal (val) { // 日周月
      this.chooseType = val
      this.getOrderDetail()
    },
    getOrderDetail: function () {
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
      loadOrderDetail({
        startDate: this.queryDate[0],
        endDate: this.queryDate[1],
        platFormId: this.tApp.id,
        chooseType: this.chooseType
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
            message: '订购/退订数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          // 表格数据
          this.tOrderList = []
          this.tOrderList = resultSet // 表格数据
          // 填充表头数据
          this.tableCols = Object.keys(this.tOrderList[0])
          this.tableCols.splice(this.tableCols.indexOf('display_name'), 1)
          this.tableCols.sort()
          // 整理图表数据
          this.orderList = []
          this.tableCols.forEach(item => {
            var map = {}
            map['day'] = item
            this.orderList.push(map)
          })
          this.orderList.forEach(item => {
            var dayStr = item.day
            this.tOrderList.forEach(tItem => {
              if (tItem.display_name === '新用户总订购') { // 汇总数据_新用户总订购
                item['newOrderNum'] = tItem[dayStr]
                this.allNewOrderNum += parseInt(tItem[dayStr])
              }
              if (tItem.display_name === '老用户总订购') { // 汇总数据_老用户总订购
                item['oldOrderNum'] = tItem[dayStr]
                this.allOldOrderNum += parseInt(tItem[dayStr])
              }
              if (tItem.display_name === '新用户总订购') { // 目前使用新用户总订购代替退订数据
                item['unOrderNum'] = tItem[dayStr]
                this.allUnOrderNum += parseInt(tItem[dayStr])
              }
              if (tItem.display_name === '总订购') { // 目前使用新用户总订购代替退订数据
                this.allOrderNum += parseInt(tItem[dayStr])
              }
            })
          })
          // 绘图
          this.drawOrderChart()
        }
      })
    },
    drawOrderChart: function () {
      // 整理数据
      var dataXArrNewOrder = [] // 新用户订购
      var dataXArrOldOrder = [] // 老用户订购
      var dataXArrAllOrder = [] // 总退订 目前使用新用户订购数据
      for (let k in this.orderList) {
        var newOrderNum = this.orderList[k].newOrderNum
        dataXArrNewOrder.push(newOrderNum)
        var oldOrderNum = this.orderList[k].oldOrderNum
        dataXArrOldOrder.push(oldOrderNum)
        var allOrderNum = 0 - this.orderList[k].unOrderNum
        dataXArrAllOrder.push(allOrderNum)
      }
      var option = { // 核心数据 数据展示
        border: false,
        legend: {
          orient: 'vertical',
          left: 'center',
          bottom: 'bottom',
          data: ['新用户订购', '老用户订购', '退订']
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          data: this.tableCols,
          name: '日期',
          silent: false,
          axisLine: { onZero: true },
          splitLine: { show: false },
          splitArea: { show: false }
        },
        yAxis: { // 纵坐标
          splitArea: { show: false }
        },
        series: [
          {
            name: '新用户订购',
            type: 'bar',
            stack: '总量',
            barMaxWidth: 60,
            label: {
              normal: {
                show: true
              }
            },
            data: dataXArrNewOrder
          },
          {
            name: '老用户订购',
            type: 'bar',
            stack: '总量',
            barMaxWidth: 80,
            label: {
              normal: {
                show: true
              }
            },
            data: dataXArrOldOrder
          },
          {
            name: '退订',
            type: 'bar',
            stack: '总量',
            barMaxWidth: 80,
            label: {
              normal: {
                show: true
              }
            },
            data: dataXArrAllOrder
          }
        ], // 图
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        }
      }
      this.chartColumn = echarts.init(document.getElementById('orderAnaDiv'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    }
  },
  created: function () {
    // 展示数据
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.chooseType = 'day' // 默认为日
    this.getOrderDetail()
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
