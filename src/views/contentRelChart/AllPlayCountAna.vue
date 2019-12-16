<!--suppress ALL -->
<template>
  <section class="chart-container">
    <!--工具条-->
    <el-col :span="24" class="toolbar1" style="height: 50px; padding-left: 10px; padding-top: 5px">
      <el-form :inline="true">
        <el-form-item>
          <div class="block">
            <el-date-picker
                style="width: 220px"
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
       <!-- <el-form-item label="内容类型：">
          <el-select v-model="contentType" size="small" style="width: 160px" clearable placeholder="请选择内容类型">
            <el-option v-for="type in typeMapArr" :label="type.name" :value="type.id" :key="type.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属CP：">
          <el-select v-model="contentCP" size="small" style="width: 160px" clearable placeholder="请选择CP">
            <el-option v-for="cp in cps" :key="cp.id" :value="cp.id" :label="cp.name"></el-option>
          </el-select>
        </el-form-item>-->
        <el-form-item label="内容名称：">
          <el-input v-model="contentKey" size="small" style="width: 180px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary " size="small" icon="el-icon-search" v-on:click="getPlayCount">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="24">
      <div id="allPlayCountTop" style="width:100%; height:550px;" v-loading="chartLoading"></div>
    </el-col>
    <div style="padding: 0px 10px;">
      <el-col :span="24" style=" margin-top: 10px; height: 40px; line-height: 40px; background-color: rgba(17, 146, 175, 0.18);">
        <span style="padding:10px; color: #606266;">详细数据<i class="el-icon-info"></i></span>
        <el-link type="primary" :underline="false" style="float: right; margin-right: 10px; font-weight: bold" icon="el-icon-download" @click="handleExport">
          导出数据
        </el-link>
      </el-col>
      <el-table :data="tAllPlayTimeList.slice((curpage-1) * pageSize, curpage * pageSize)" highlight-current-row style="width:100%;"
                :header-cell-style="{
                  'background-color': '#f2f2f2',
                  'color': '#3a8ee6',
                  'border-bottom': '1px #f2f2f2 solid'
                  }"
      >
        <el-table-column prop="day" sortable label="日期" align="left"></el-table-column>
        <el-table-column prop="media_id" label="内容ID" align="left"></el-table-column>
        <el-table-column prop="media_name" label="内容名称" align="left"></el-table-column>
        <el-table-column prop="media_type" label="内容类型" align="left" :formatter="formaterText"></el-table-column>
        <el-table-column prop="cp_name" label="提供方名称" align="left"></el-table-column>
        <el-table-column prop="play_count" sortable label="播放次数" align="left"></el-table-column>
        <el-table-column label="详情" align="center">
          <template slot-scope="scope">
            <el-button type="primary"
                       size="mini"
                       icon="el-icon-search"
                       @click="handleDetail(scope.$index, scope.row)">完整度
            </el-button>
          </template>
        </el-table-column>
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
    <!--弹出框-->
    <el-dialog title="影片完整度" :visible.sync="dialogPerVisible">
      <div slot="title">  <!--slot 插槽-->
        <span>影片：<b style="color: #1d8ce0">{{chooseMediaName}}</b></span>
      </div>
      <div ref="playCountPerDiv" id="playCountPer" style="height: 500px;">
      </div>
    </el-dialog>
  </section>
</template>
<script>
import { loadAllPlayCount, loadMediaPer, exportAllPlayCountDtl } from '../../api/api'
import echarts from 'echarts'
export default {
  data () {
    return {
      contentKey: '',
      queryDate: [new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000)],
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
      tAllPlayTimeList: [], // 表格数据
      typeMap: {
        1: '纯音乐',
        2: '视频音乐',
        3: '电影',
        4: '电视剧'
      },
      totalSize: 0, // 分页数据
      curpage: 1,
      pageSize: 15,
      playTimeTop: [], // 内容TOP数据
      dialogPerVisible: false,
      chooseMediaName: '', // 完整度 MediaName
      chooseMediaPer: {},
      mediaPerArr: ['per_20', 'per_20_50', 'per_50_80', 'per_80']
    }
  },
  methods: {
    perDialgOpen () { // 初始 per div 对象
      this.$nextTick(() => {
        this.myChartPer = document.getElementById('playCountPer')
      })
    },
    handleDetail ($index, row) {
      this.chooseMediaName = row.media_name
      // 请求后台
      loadMediaPer({
        platFormId: this.tApp.id,
        mediaId: row.media_id,
        day: row.day
      }).then(data => { // ?
        let { businessCode, resultSet } = data
        if (businessCode !== 'success') {
          this.$message({
            message: '数据完整度加载失败，请联系管理员！',
            type: 'error'
          })
          return false
        } else {
          if (resultSet.length === 0) {
            this.$message({
              message: '未加载到完整度数据！',
              type: 'warning'
            })
            return false
          } else {
            this.chooseMediaPer = resultSet[0]
            // 绘图
            this.dialogPerVisible = true
            this.drawPerMedia()
          }
        }
      })
    },
    drawPerMedia: function () { // 完整度绘图
      var dataSer = []
      var perKey = [] // 完整度 20 50 80
      for (var key in this.chooseMediaPer) {
        var keyStr = ''
        if (this.mediaPerArr.indexOf(key) !== -1) {
          switch (key) {
            case 'per_20':
              keyStr = '完整度20%'
              break
            case 'per_20_50':
              keyStr = '完整度20%_50%'
              break
            case 'per_50_80':
              keyStr = '完整度50%_80%'
              break
            case 'per_80':
              keyStr = '完整度80%'
              break
          }
          perKey.push(keyStr)
          dataSer.push({ 'name': keyStr, 'value': parseInt(this.chooseMediaPer[key]) })
        }
      }
      var option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          x: 'left',
          top: 5,
          left: 10,
          data: perKey // ['20%以下','20%-50%','50%-80%','80%以上']
        },
        series: [
          {
            name: '观看完整度',
            type: 'pie',
            radius: ['50%', '70%'],
            label: {
              normal: {
                show: false,
                position: 'center'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '30',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: dataSer
          }
        ]
      }
      this.$nextTick(() => { // 解决 dialog内部元素加载不到的问题
        var myChart = echarts.init(this.$refs.playCountPerDiv)
        myChart.clear()
        myChart.setOption(option)
        window.onresize = myChart.resize // 适应图表
      })
    },
    handleCurrentChange (val) { // 页面
      this.curpage = val
    },
    formaterText (row, column, cellValue) {
      return this.typeMap[cellValue]
    },
    getPlayCount: function () {
      if (!this.queryDate) {
        this.$message({
          showClose: true,
          message: '请选择查询日期范围！',
          type: 'warning'
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
      loadAllPlayCount({
        startDate: this.queryDate[0],
        endDate: this.queryDate[1],
        platFormId: this.tApp.id,
        contentKey: this.contentKey
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
            message: '有效播放次数加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.tAllPlayTimeList = resultSet // 图表数据
          if (this.tAllPlayTimeList.length === 0) {
            this.$notify.info({
              title: '警告',
              message: '未加载到影片完整播放数据！',
              type: 'warning'
            })
          }
          this.totalSize = this.tAllPlayTimeList.length
          this.curpage = 1
          this.drawTOPChart()  //Top20
        }
      })
    },
    drawTOPChart: function () {
      var tPlayTimeTop = [...this.tAllPlayTimeList].sort(this.Compare('play_count'))
      this.playTimeTop = tPlayTimeTop.length > 20 ? tPlayTimeTop.slice(0, 20) : []
      // 再次格式数据TOP20
      var dataX = []
      var dataSer = []
      this.playTimeTop.forEach(item => {
        if (item.media_name === 'null') {
          dataX.push('其他')
        } else {
          dataX.push(item.media_name)
        }
        dataSer.push(item.play_count)
      })
      var option = {
        color: ['#3398DB'],
        toolbox: {
          show: true,
          feature: {
            saveAsImage: { show: true }
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: dataX,
            axisLabel: {
              interval: 0, // 横轴信息全部显示
              rotate: -15// -15度角倾斜显示
            }
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '有效播放次数',
            type: 'bar',
            barWidth: '60%',
            data: dataSer,
            itemStyle: {
              normal: {
                label: {
                  show: true, // 开启显示
                  position: 'top', // 在上方显示
                  textStyle: { // 数值样式
                    color: 'black',
                    fontSize: 16
                  }
                }
              }
            }
          }
        ]
      }
      var myChart = echarts.init(document.getElementById('allPlayCountTop'))
      myChart.clear()
      myChart.setOption(option)
      window.onresize = myChart.resize // 适应图表
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
    // 导出excecl
    handleExport: function () {
      if (this.tAllPlayTimeList.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      exportAllPlayCountDtl({
        startDate: this.queryDate[0],
        endDate: this.queryDate[1],
        platFormId: this.tApp.id,
        contentKey: this.contentKey
      }).then(data => { // ?
        let blob = new Blob([data], { type: 'application/vnd.ms-excel;charset=utf-8' });
        let downloadElement = document.createElement('a');
        let href = window.URL.createObjectURL(blob); //创建下载的链接
        downloadElement.href = href;
        downloadElement.download = `playCount${this.moment(new Date()).format('YYYY/MM/DD')}.xlsx`; //下载后文件名
        document.body.appendChild(downloadElement);
        downloadElement.click(); //点击下载
        document.body.removeChild(downloadElement); //下载完成移除元素
        window.URL.revokeObjectURL(href); //释放掉blob对象
        loading.close()
      })
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.getPlayCount()
  },
  mounted: function () {

  },
  updated: function () {
  }
}
</script>
<style>
  .el-dialog__body{
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
  .likeCard{
    width: 100%;
    height: 320px;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    border-radius: 4px;
  }
  .chart-container {
    width: 100%;
    float: left;
  }
  /*.chart div {
      height: 400px;
      float: left;
  }*/

</style>
