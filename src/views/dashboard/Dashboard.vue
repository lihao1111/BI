<template>
    <section class="chart-container">
        <el-row>
            <el-col :span="8">
              <el-card shadow="hover" style="font-weight:bold; color: rgba(0,0,0,.45)">
                <div slot="header" style="font-size: 14px;">
                  <span>{{this.moment(new Date()).format('YYYY/MM/DD HH:mm')}}</span>
                  <span style="float: right">在线用户</span>
                </div>
                <div style="height: 80px; line-height: 80px; text-align: center">
                  <span style="color: #40c9c6; font-size: 48px;padding-right: 30px">
                    <svg-icon icon-class="peoples" />
                  </span>
                  <span style="font-size: 32px">{{onlineUser | formaterNumber}}</span>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" style="font-weight:bold; color: rgba(0,0,0,.45)">
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
            <el-card shadow="hover" style="font-weight:bold; color: rgba(0,0,0,.45)">
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
                <div id="weekUserChart" style="width:100%; height:400px; padding: 10px 20px" v-loading="weekUserLoading"></div> <!--最近一周的用户分析-->
              </el-card>
            </el-col>
            <el-col :span="10">
              <el-card shadow="hover">
                <el-table :data="dayOrderDatas" style="width: 100%;" v-loading="dayOrderLoading">
                  <el-table-column prop="day" label="日期" ></el-table-column>
                  <el-table-column prop="hour" label="小时"></el-table-column>
                  <el-table-column prop="online_num" label="订购数据"></el-table-column>
                </el-table>
              </el-card>
            </el-col>
          <el-col :span="14">
            <el-card shadow="hover">
              <el-table :data="dayLogDatas" style="width: 100%;" v-loading="dayLogLoading"> <!--当天日志消息-->
                <el-table-column prop="job_uniname" label="Job名称" ></el-table-column>
                <el-table-column prop="job_execute_time" label="Job执行日期"></el-table-column>
                <el-table-column prop="status" label="状态">
                  <template slot-scope="scope">
                    <div v-if="scope.row.status == 1" style="cursor: pointer">
                      <!--<el-popover trigger="hover" placement="top">
                        <div slot="reference" class="name-wrapper">
                          <el-tag size="danger" @click="showDetailErr">异常</el-tag>
                        </div>
                      </el-popover>-->
                      <el-tag size="danger" @click="showDetailErr(scope.row.err_out)">异常</el-tag>
                    </div>
                    <div v-else>
                      <el-tag size="success">成功</el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="create_time" label="执行时间" :formatter="formaterText" :width="160">
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      <el-dialog
          title="异常信息"
          :visible.sync="showErrVisiable"
          width="50%"
          >
        <el-scrollbar style="height: 300px;">
          {{showErr}}
        </el-scrollbar>
      </el-dialog>
    </section>
</template>

<script>
import echarts from 'echarts'
import { loadCurUser, loadCurOrder, loadOnlineErr, loadWeekUser, loadDayOrder, loadDayLog } from '../../api/api'
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
      weekUserDatas: [],
      weekUserLoading: false,
      dayOrderDatas: [],
      dayOrderLoading: false,
      dayLogDatas: [],
      dayLogLoading: false,
      showErr: '',
      showErrVisiable: false
    }
  },
  methods: {
    showDetailErr (outErr) {
      this.showErr = outErr
      this.showErrVisiable = true
    },
    formaterText (row, column, cellValue) {
      return this.moment(cellValue).format('YYYY-MM-DD HH:mm:ss')
    },
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
          }
        }
      })
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
          }
        }
      })
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
    getWeekUser () {
      this.weekUserLoading = true
      loadWeekUser({
        nowDate: new Date(),
        platFormId: this.tApp.id
      }).then(data => { // ?
        this.weekUserLoading = false
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
      var dataLegStr = ['UV', '新增用户']
      var dataX = []
      var uvDatas = []
      var newAddDatas = []
      for (let k in this.weekUserDatas) {
        dataX.push(this.weekUserDatas[k].day)
        uvDatas.push(this.weekUserDatas[k].uv == null ? 0 : parseInt(this.weekUserDatas[k].uv))
        newAddDatas.push(this.weekUserDatas[k].newAddNum == null ? 0 : parseInt(this.weekUserDatas[k].newAddNum))
      }
      var option = { // 核心数据 数据展示
        border: false,
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          data: dataLegStr
        },
        grid: {
          left: '1%',
          right: '7%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          name: '日期',
          data: dataX,
          axisLine: {
            lineStyle: {
              color: '#54B1F9',
              width: 1// 这里是为了突出显示加上的
            }
          }
        },
        yAxis: { // 纵坐标
          type: 'value',
          name: '人数',
          axisLine: {
            lineStyle: {
              color: '#54B1F9',
              width: 1// 这里是为了突出显示加上的
            }
          }
        },
        series: [
          {
            name: 'UV',
            type: 'line',
            smooth: true,
            data: uvDatas
          },
          {
            name: '新增用户',
            type: 'line',
            smooth: true,
            data: newAddDatas
          }
        ],
        tooltip: {
          trigger: 'axis'
        }
      }
      this.chartColumn = echarts.init(document.getElementById('weekUserChart'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    },
    getDayOrder () {
      this.dayOrderLoading = true
      loadDayOrder({
        nowDate: new Date(),
        platFormId: this.tApp.id
      }).then(data => { // ?
        this.dayOrderLoading = false
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
            message: '当日订购数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.dayOrderDatas = resultSet
        }
      })
    },
    getDayLog () {
      this.dayLogLoading = true
      loadDayLog({
        nowDate: new Date(),
        platFormId: this.tApp.id
      }).then(data => { // ?
        this.dayLogLoading = false
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
            message: '日志数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.dayLogDatas = resultSet
        }
      })
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    // 设置 循环执行函数
    this.getWeekUser()
    this.getDayOrder()
    this.getDayLog()

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
