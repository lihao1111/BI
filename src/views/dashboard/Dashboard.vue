<template>
    <section class="chart-container">
        <el-row>
            <el-col :span="8">
              <el-card shadow="hover" style="font-weight:bold; color:#000000">
                <div slot="header" style="font-size: 14px;">
                  <span>{{this.moment(new Date()).format('YYYY/MM/DD HH:mm')}}</span>
                  <span style="float: right">在线用户</span>
                </div>
                <div style="height: 80px; line-height: 80px; text-align: center">
                  <span style="color: #06c8c9; font-size: 48px;padding-right: 30px">
                    <svg-icon icon-class="peoples" />
                  </span>
                  <span style="font-size: 32px;">{{onlineUser | formaterNumber}}</span>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" style="font-weight:bold; color:#000000">
                <div slot="header" style="font-size: 14px;">
                  <span>{{this.moment(new Date()).format('YYYY/MM/DD HH:mm')}}</span>
                  <span style="float: right">实时订购</span>
                </div>
                <div style="height: 80px; line-height: 80px; text-align: center">
                  <span style="color: #f4516c; font-size: 48px;padding-right: 30px">
                    <svg-icon icon-class="shopping" />
                  </span>
                  <span style="font-size: 32px">{{onlineOrder | formaterNumber}}</span>
                </div>
              </el-card>
            </el-col>
          <el-col :span="8">
            <el-card shadow="hover" style="font-weight:bold; color:#000000">
              <div slot="header" style="font-size: 14px;">
                <span>{{this.moment(new Date()).format('YYYY/MM/DD HH:mm')}}</span>
                <span style="float: right">异常消息</span>
              </div>
              <div style="height: 80px; line-height: 80px; text-align: center">
                  <span style="color: #36a3f7; font-size: 48px;padding-right: 30px">
                    <svg-icon icon-class="message" />
                  </span>
                <span style="font-size: 32px">{{onlineErr}}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="24">
            <el-card shadow="always">
              <div id="dayPVUVChart" style="width:100%; height:400px; padding: 10px" v-loading="dayPVUVLoading"></div> <!--日 PVUV-->
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="always">
              <div id="dayUserChart" style="width:100%; height:400px; padding: 10px" v-loading="dayUserLoading"></div> <!--日 实时在线-->
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="always">
              <div id="dayOrderChart" style="width:100%; height:400px; padding: 10px" v-loading="dayOrderLoading"></div> <!--日 实时订购-->
            </el-card>
          </el-col>
          <el-col :span="10">
            <el-card shadow="always">
              <div id="dayUseTimeChart" style="width:100%; height:400px; padding: 10px" v-loading="dayUseTimeLoading"></div> <!--日 使用时长-->
            </el-card>
          </el-col>
          <el-col :span="14">
            <el-card shadow="always">
              <div id="weekNewAddChart" style="width:100%; height:400px; padding: 10px" v-loading="weekNewAddLoading"></div> <!--周 UV + 新增-->
            </el-card>
          </el-col>
        </el-row>
    </section>
</template>

<script>
import echarts from 'echarts'
import { loadCurUser, loadCurOrder, loadOnlineErr, loadDayPVUV, loadDayUseTime, loadWeekUser } from '../../api/api'
export default {
  data () {
    return {
      tApp: '',
      onlineUser: 0,
      onlineUserTimer: '', // 实时在线定时器
      onlineOrder: 0,
      onlineOrderTimer: '', // 实时在线定时器
      onlineErr: 0,
      onlineErrTimer: '', // 实时异常信息定时器
      dayPVUVDatas: [],
      dayPVUVLoading: false,
      dayUserDatas: [], // 日 用户数据
      dayUserLoading: false,
      dayOrderDatas: [], // 日 订购数据
      dayOrderLoading: false,
      dayUseTimeDatas: [], // 日 使用时长
      dayUseTimeLoading: false,
      weekNewAddDatas: [], // 周 用户分析
      weekNewAddLoading: false
    }
  },
  methods: {
    getOnlineUser () {
      loadCurUser({ nowData: this.moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), platFormId: this.tApp.id }).then(data => { // ?
        let { businessCode, resultSet } = data
        if (businessCode === 'unauthenticated') { // 有权限认证
          this.$message({
            message: '未授权，请联系管理员！',
            type: 'error'
          })
          return false
        }
        if (businessCode !== 'success') {
          this.$message({
            message: '实时用户数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          if (resultSet != null && resultSet.length > 0) {
            this.onlineUser = parseInt(resultSet[0].online_num)
            this.dayUserLoading = true
            this.dayUserDatas = resultSet
            this.dayUserDraw()
          }
        }
      })
    },
    dayUserDraw () { // 日 在线用户图
      this.dayUserLoading = false
      var dataX = []
      var uvDatas = []
      for (let k in this.dayUserDatas.reverse()) {
        dataX.push(this.dayUserDatas[k].hour)
        uvDatas.push(this.dayUserDatas[k].online_num == null ? 0 : parseInt(this.dayUserDatas[k].online_num))
      }
      var option = { // 核心数据 数据展示
        title: {
          text: '实时在线',
          x: 'left'
        },
        border: false,
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: ['在线人数']
        },
        grid: {
          left: '1%',
          right: '12%',
          bottom: '5%',
          top: '12%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          name: '小时',
          data: dataX,
          axisLine: {
            lineStyle: {
              width: 1// 这里是为了突出显示加上的
            }
          }
        },
        yAxis: { // 纵坐标
          type: 'value',
          axisLine: {
            lineStyle: {
              width: 1// 这里是为了突出显示加上的
            }
          }
        },
        series: [
          {
            name: '在线人数',
            type: 'bar',
            data: uvDatas,
            barMaxWidth: 15, // 柱图宽度
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            },
            markLine: {
              data: [
                { type: 'average', name: '平均值' }
              ]
            }
          }
        ],
        color: ['#5E68D4', '#61a0a8', '#2f4554', '#bda29a', '#d48265', '#91c7ae']
      }
      this.chartColumn = echarts.init(document.getElementById('dayUserChart'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    },
    getOnlineOrder () {
      loadCurOrder({ nowData: this.moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), platFormId: this.tApp.id }).then(data => { // ?
        let { businessCode, resultSet } = data
        if (businessCode === 'unauthenticated') { // 有权限认证
          this.$message({
            message: '未授权，请联系管理员！',
            type: 'error'
          })
          return false
        }
        if (businessCode !== 'success') {
          this.$message({
            message: '实时订购数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          if (resultSet != null && resultSet.length > 0) {
            this.onlineOrder = parseInt(resultSet[0].online_num)
            this.dayOrderLoading = true
            this.dayOrderDatas = resultSet
            this.dayOrderDraw()
          }
        }
      })
    },
    dayOrderDraw () { // 日 订购数据图
      this.dayOrderLoading = false
      var dataX = []
      var uvDatas = []
      for (let k in this.dayOrderDatas.reverse()) {
        dataX.push(this.dayOrderDatas[k].hour)
        uvDatas.push(this.dayOrderDatas[k].online_num == null ? 0 : parseInt(this.dayOrderDatas[k].online_num))
      }
      var option = { // 核心数据 数据展示
        title: {
          text: '实时订购',
          x: 'left'
        },
        border: false,
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: ['订购数']
        },
        grid: {
          left: '1%',
          right: '12%',
          bottom: '5%',
          top: '12%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          name: '小时',
          data: dataX,
          axisLine: {
            lineStyle: {
              width: 1// 这里是为了突出显示加上的
            }
          }
        },
        yAxis: { // 纵坐标
          type: 'value',
          axisLine: {
            lineStyle: {
              width: 1// 这里是为了突出显示加上的
            }
          }
        },
        series: [
          {
            name: '订购数',
            type: 'line',
            data: uvDatas,
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            },
            markLine: {
              data: [
                { type: 'average', name: '平均值' }
              ]
            }
          }
        ],
        color: ['#52BD4B']
      }
      this.chartColumn = echarts.init(document.getElementById('dayOrderChart'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    },
    getOnlineErr () {
      loadOnlineErr({ nowDate: new Date(), platFormId: this.tApp.id }).then(data => { // ?
        let { businessCode, resultSet } = data
        if (businessCode === 'unauthenticated') { // 有权限认证
          this.$message({
            message: '未授权，请联系管理员！',
            type: 'error'
          })
          return false
        }
        if (businessCode !== 'success') {
          this.$message({
            message: '异常数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          if (resultSet != null && resultSet.length > 0) {
            this.onlineErr = resultSet.length
          }
        }
      })
    },
    getDayPVUV () { // 日 pvuv
      this.dayPVUVLoading = true
      loadDayPVUV({
        nowDate: new Date(),
        platFormId: this.tApp.id
      }).then(data => { // ?
        this.dayPVUVLoading = false
        let { businessCode, resultSet } = data
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
          this.dayPVUVDatas = resultSet
          // 绘图
          this.dayPVUVDraw()
        }
      })
    },
    dayPVUVDraw: function () {
      var dataLegStr = ['PV', 'UV']
      var dataX = []
      var pvDatas = []
      var uvDatas = []
      let dayStr = ''
      for (let k in this.dayPVUVDatas) {
        dayStr = this.dayPVUVDatas[k].day
        dataX.push(this.dayPVUVDatas[k].hour)
        pvDatas.push(this.dayPVUVDatas[k].pv == null ? 0 : parseInt(this.dayPVUVDatas[k].pv))
        uvDatas.push(this.dayPVUVDatas[k].uv == null ? 0 : parseInt(this.dayPVUVDatas[k].uv))
      }
      var option = { // 核心数据 数据展示
        title: {
          text: `${dayStr}_PVUV`,
          x: 'left'
        },
        border: false,
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: dataLegStr
        },
        grid: {
          left: '1%',
          right: '5%',
          bottom: '5%',
          top: '12%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          name: '小时',
          data: dataX,
          axisLine: {
            lineStyle: {
              width: 1// 这里是为了突出显示加上的
            }
          }
        },
        yAxis: { // 纵坐标
          type: 'value',
          axisLine: {
            lineStyle: {
              width: 1// 这里是为了突出显示加上的
            }
          }
        },
        series: [
          {
            name: 'PV',
            type: 'line',
            smooth: true,
            data: pvDatas,
            markArea: {
              data: [ [{
                name: '早高峰',
                xAxis: '07'
              }, {
                xAxis: '09'
              }], [{
                name: '晚高峰',
                xAxis: '18'
              }, {
                xAxis: '21'
              }] ]
            }
          },
          {
            name: 'UV',
            type: 'line',
            smooth: true,
            data: uvDatas
          }
        ],
        tooltip: {
          trigger: 'axis'
        },
        color: ['#07C7B1', '#C7193B']
      }
      this.chartColumn = echarts.init(document.getElementById('dayPVUVChart'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    },
    dayUseTime () {
      this.dayUseTimeLoading = true
      loadDayUseTime({
        nowDate: new Date(),
        platFormId: this.tApp.id
      }).then(data => { // ?
        this.dayUseTimeLoading = false
        let { businessCode, resultSet } = data
        if (businessCode === 'unauthenticated') { // 有权限认证
          this.$message({
            message: '未授权，请联系管理员！',
            type: 'error'
          })
          return false
        }
        if (businessCode !== 'success') {
          this.$message({
            message: '日使用时长加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.dayUseTimeDatas = resultSet
          this.dayUseTimeDraw()
        }
      })
    },
    dayUseTimeDraw () { // 日 使用时长图
      var datas = []
      var legStr = ['1分钟以下', '1-3分钟', '4-10分钟', '11-30分钟', '31-60分钟', '61-120分钟', '121分钟以上']
      let idx = 0
      let dayStr = ''
      this.dayUseTimeDatas.forEach(item => {
        dayStr = item.day
        datas.push({ 'name': legStr[idx++], 'value': item.tim0_1 })
        datas.push({ 'name': legStr[idx++], 'value': item.tim1_3 })
        datas.push({ 'name': legStr[idx++], 'value': item.tim3_10 })
        datas.push({ 'name': legStr[idx++], 'value': item.tim10_30 })
        datas.push({ 'name': legStr[idx++], 'value': item.tim30_60 })
        datas.push({ 'name': legStr[idx++], 'value': item.tim60_120 })
        datas.push({ 'name': legStr[idx++], 'value': item.tim120 })
      })
      var option = { // 核心数据 数据展示
        title: {
          text: `${dayStr}使用时长`,
          x: 'left'
        },
        border: false,
        legend: {
          orient: 'vertical',
          right: 10,
          top: 10,
          bottom: 20,
          data: legStr
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [
          {
            name: '使用时长',
            type: 'pie',
            radius: [40, 100],
            center: ['40%', '55%'],
            roseType: 'area',
            data: datas
          }
        ]
      }
      this.chartColumn = echarts.init(document.getElementById('dayUseTimeChart'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    },
    getWeekUser () {
      this.weekNewAddLoading = true
      loadWeekUser({
        nowDate: new Date(),
        platFormId: this.tApp.id
      }).then(data => { // ?
        this.weekNewAddLoading = false
        let { businessCode, resultSet } = data
        if (businessCode === 'unauthenticated') { // 有权限认证
          this.$message({
            message: '未授权，请联系管理员！',
            type: 'error'
          })
          return false
        }
        if (businessCode !== 'success') {
          this.$message({
            message: '最近一周用户数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.weekUserDatas = resultSet
          // 绘图
          this.weekUserDraw()
        }
      })
    },
    weekUserDraw: function () {
      var dataLegStr = ['本日访问', '新增用户', '一日留存']
      var dataX = []
      var uvDatas = []
      var newAddDatas = []
      var retain1Datas = []
      for (let k in this.weekUserDatas) {
        dataX.push(this.weekUserDatas[k].day)
        uvDatas.push(this.weekUserDatas[k].uv == null ? 0 : parseInt(this.weekUserDatas[k].uv))
        newAddDatas.push(this.weekUserDatas[k].newAddNum == null ? 0 : parseInt(this.weekUserDatas[k].newAddNum))
        retain1Datas.push(this.weekUserDatas[k].retained1Num == null ? 0 : parseInt(this.weekUserDatas[k].retained1Num))
      }
      let dayStrs = dataX[0].substring(5) + '~' + dataX[dataX.length - 1].substr(5)
      var option = { // 核心数据 数据展示
        border: false,
        title: {
          text: `${dayStrs}使用时长`,
          x: 'left'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 10,
          data: dataLegStr
        },
        grid: {
          left: '1%',
          right: '10%',
          bottom: '5%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          name: '日期',
          data: dataX,
          axisLine: {
            lineStyle: {
              width: 1// 这里是为了突出显示加上的
            }
          }
        },
        yAxis: { // 纵坐标
          type: 'value',
          name: '人数',
          axisLine: {
            lineStyle: {
              width: 1// 这里是为了突出显示加上的
            }
          }
        },
        series: [
          {
            name: '本日访问',
            type: 'bar',
            stack: '用户数据',
            data: uvDatas,
            barMaxWidth: 50, // 柱图宽度
            markLine: {
              lineStyle: {
                normal: {
                  type: 'dashed'
                }
              },
              data: [
                [{ type: 'min' }, { type: 'max' }]
              ]
            }
          },
          {
            name: '新增用户',
            type: 'bar',
            stack: '用户数据',
            data: newAddDatas,
            barMaxWidth: 50 // 柱图宽度
          },
          {
            name: '一日留存',
            type: 'bar',
            stack: '用户数据',
            data: retain1Datas,
            barMaxWidth: 50 // 柱图宽度
          }
        ],
        tooltip: {
          trigger: 'axis'
        },
        color: ['#37A2DA', '#9FE6B8', '#fb7293']
      }
      this.chartColumn = echarts.init(document.getElementById('weekNewAddChart'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    // 设置 循环执行函数
    this.getDayPVUV() // 日 pvuv
    this.dayUseTime() // 日 使用时长
    this.getWeekUser() // 周 用户

    this.getOnlineUser()
    this.onlineUserTimer = setInterval(this.getOnlineUser, 1000 * 60 * 10) // 每二十分钟调用一次

    this.getOnlineOrder()
    this.onlineOrderTimer = setInterval(this.getOnlineOrder, 1000 * 60 * 10) // 每二十分钟调用一次

    this.getOnlineErr()
    this.onlineErrTimer = setInterval(this.getOnlineErr, 1000 * 60 * 10) // 每二十分钟调用一次
  },
  mounted: function () {
  },
  updated: function () {
    // this.drawCharts()
  },
  destroyed: function () {
    // 跳转到其他页面的时候 清除定时器
    clearInterval(this.onlineUserTimer)
    clearInterval(this.onlineOrderTimer)
    clearInterval(this.onlineErrTimer)
  }
}
</script>
<style>
  .el-card__header{
    padding: 10px;
  }
  .el-card__body{
    padding: 0px;
  }
</style>
<style scoped>
    .chart-container {
        width: 100%;
        float: left;
    }
    .el-col {
        padding: 10px 20px;
    }
</style>
