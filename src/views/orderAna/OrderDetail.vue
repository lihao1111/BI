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
        <el-table-column prop="day" label="日期" align="center"></el-table-column>
        <el-table-column prop="product_id" label="产品ID" align="center"></el-table-column>
        <el-table-column prop="product_name" label="产品名称" align="center"></el-table-column>
        <el-table-column prop="ordered_num" label="总订购" align="center"></el-table-column>
        <el-table-column prop="newUordered_num" label="新用户订购" align="center"></el-table-column>
        <el-table-column prop="oldFirstUordered_num" label="老用户首次订购" align="center"></el-table-column>
        <el-table-column prop="oldNewReUordered_num" label="老用户再次订购" align="center"></el-table-column>
        <el-table-column prop="unSubscribed_num" label="退订发起" align="center"></el-table-column>

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
      chooseType: '' // 选择 日周月
    }
  },
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
          this.tOrderList = resultSet // 表格数据
          // 整理图表数据
          this.orderList = []
          this.allOrderNum = 0
          this.allNewOrderNum = 0
          this.allOldOrderNum = 0
          this.allUnOrderNum = 0
          this.tOrderList.forEach(tItem => {
            this.allOrderNum += parseInt(tItem.ordered_num)
            this.allNewOrderNum += parseInt(tItem.newUordered_num)
            this.allOldOrderNum += parseInt(tItem.oldNewReUordered_num)
            this.allUnOrderNum += parseInt(tItem.unSubscribed_num)

            var existsItem = null
            this.orderList.forEach(item => {
              if (tItem.day === item.day) {
                existsItem = item
                return false
              }
            })
            if (existsItem) {
              existsItem['ordered_num'] += parseInt(tItem['ordered_num'])
              existsItem['newUordered_num'] += parseInt(tItem['newUordered_num'])
              existsItem['oldNewReUordered_num'] += parseInt(tItem['oldNewReUordered_num'])
              existsItem['oldFirstUordered_num'] += parseInt(tItem['oldFirstUordered_num'])
              existsItem['unSubscribed_num'] += parseInt(tItem['unSubscribed_num'])
            } else {
              let copyItem = { ...tItem } // js 引用类型 以及 clone
              this.orderList.push(copyItem)
            }
          })
          // 绘图
          this.drawOrderChart()
        }
      })
    },
    drawOrderChart: function () {
      // 整理数据
      var dataXArrNewOrder = [] // 新用户订购
      var dataXArrOldFOrder = [] // 老用户首次订购
      var dataXArrOldROrder = [] // 老用户再次订购
      var dataXArrAllUnOrder = [] // 总退订
      var dataX = []
      for (let k in this.orderList) {
        dataX.push(this.orderList[k]['day'])
        var newOrderNum = this.orderList[k]['newUordered_num']
        dataXArrNewOrder.push(newOrderNum)
        var oldOrderFNum = this.orderList[k]['oldFirstUordered_num']
        dataXArrOldFOrder.push(oldOrderFNum)
        var oldOrderRNum = this.orderList[k]['oldNewReUordered_num']
        dataXArrOldROrder.push(oldOrderRNum)
        var allOrderUnNum = 0 - this.orderList[k]['unSubscribed_num']
        dataXArrAllUnOrder.push(allOrderUnNum)
      }
      var option = { // 核心数据 数据展示
        border: false,
        legend: {
          orient: 'vertical',
          left: 'center',
          bottom: 'bottom',
          data: ['新用户订购', '老用户首次订购', '老用户再次订购', '退订']
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          data: dataX,
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
            name: '老用户首次订购',
            type: 'bar',
            stack: '总量',
            barMaxWidth: 80,
            label: {
              normal: {
                show: true
              }
            },
            data: dataXArrOldFOrder
          },
          {
            name: '老用户再次订购',
            type: 'bar',
            stack: '总量',
            barMaxWidth: 80,
            label: {
              normal: {
                show: true
              }
            },
            data: dataXArrOldROrder
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
            data: dataXArrAllUnOrder
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
