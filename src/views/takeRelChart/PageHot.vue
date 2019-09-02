<template>
    <section class="chart-container">
      <!--工具条-->
      <el-col :span="24" class="toolbar1" style="height: 50px; padding-left: 10px; padding-top: 5px;">
        <el-form :inline="true">
          <el-form-item label="页面：">
            <el-select v-model="choosePageId" size="small" clearable placeholder="请选择页面" value-key="page_id" @change="choosePage">
              <el-option v-for="page in pages" :key="page.page_id" :value="page.page_id" :label="page.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日期：">
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
            <el-button type="primary" size="small" icon="el-icon-search" v-on:click="getPromotionList">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <div style="z-index: -1; ">
        <el-col :span="14" style="margin-top: 10px;">
          <el-image style="width: 100%; height:400px;" :src="pageUrl">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline">页面图片</i>
            </div>
          </el-image>
        </el-col>
        <el-col :span="10" style="position: relative;margin-top: 10px;">
          <div style="position: absolute; z-index: 1001; right: 10px;">
            <el-radio-group v-model="seledVal" size="small" @change="chooseValChart">
              <el-radio-button label="page_pv">点击量</el-radio-button>
              <el-radio-button label="page_uv">独立访问</el-radio-button>
            </el-radio-group>
          </div>
          <div id="promotionPerDiv" style="width:100%; height:400px; z-index: 1000;" v-loading="chartLoading">
            <i v-if="this.promotionList.length == 0" class="el-icon-picture-outline">图表</i>
          </div>
        </el-col>
      </div>
      <div style="padding: 0px 10px;">
        <el-col :span="24" style=" margin-top: 10px; height: 40px; line-height: 40px; background-color: rgba(17, 146, 175, 0.18);">
          <span style="padding:10px; color: #606266;">详细数据<i class="el-icon-info"></i></span>
          <el-link type="primary" :underline="false" style="float: right; margin-right: 10px; font-weight: bold" icon="el-icon-download" @click="handleExport">
            导出数据
          </el-link>
        </el-col>
        <el-table :data="promotionList" highlight-current-row style="width:100%;"
                  :header-cell-style="{
                  'background-color': '#f2f2f2',
                  'color': '#3a8ee6',
                  'border-bottom': '1px #f2f2f2 solid'
                }"
        >
          <el-table-column prop="day" label="日期" align="center"></el-table-column>
          <el-table-column prop="description" label="推荐位描述" align="center"></el-table-column>
          <el-table-column prop="title" label="推荐位名称" align="center"></el-table-column>
          <el-table-column prop="name" label="所属页面" align="center"></el-table-column>
          <el-table-column prop="pv" label="点击量" align="center"></el-table-column>
          <el-table-column prop="uv" label="独立访问量" align="center"></el-table-column>
        </el-table>
      </div>
    </section>
</template>
<script>
import { loadPages, loadPromotionList } from '../../api/api'
import echarts from 'echarts'
export default {
  data: function () {
    return {
      queryDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      chartLoading: false,
      tApp: '',
      pages: [], // 页面集合
      choosePageId: '', // 当前页面
      seledVal: '', // 选择值
      pageUrl: '',
      promotionList: [],
      dataLegStr: [], // 绘图数据_Leg
      dataSer: [] // 绘图数据_series
    }
  },
  methods: {
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
        const tHeader = ['日期', '推荐位描述', '推荐位名称', '所属页面', '点击量', '独立访问量']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['day', 'description', 'title', 'name', 'pv', 'uv']
        const list = this.subjectList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '页面热点excel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    chooseValChart (val) {
      this.seledVal = val
      this.drawPromotionChart()
    },
    choosePage (pageId) {
      let chooseItem = ''
      this.pages.forEach(item => {
        if (pageId === item.page_id) {
          chooseItem = item
          return false
        }
      })
      // 加载数据
      if (this.choosePageId) {
        this.pageUrl = 'http://img.wanyx.com/softImg/soft/1650_s.jpg' // 页面图片赋值
        this.getPromotionList()
      }
    },
    getPages: function () {
      loadPages({ platFormId: this.tApp.id }).then(data => { // ?
        let { businessCode, resultSet } = data
        if (businessCode !== 'success') {
          this.$message({
            message: '页面数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.pages = resultSet // 图表数据
        }
      })
    },
    getPromotionList: function () {
      if (!this.queryDate) {
        this.$message({
          showClose: true,
          message: '请选择查询日期！',
          type: 'error'
        })
        return false
      }
      if (!this.choosePageId) {
        this.$message({
          showClose: true,
          message: '请选择页面查询！',
          type: 'error'
        })
        return false
      }
      this.chartLoading = true
      loadPromotionList({ queryDate: this.queryDate, pageId: this.choosePageId, platFormId: this.tApp.id }).then(data => { // ?
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
            message: '页面热点数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.promotionList = resultSet // 图表数据
          this.seledVal = 'page_pv' // 默认为PV
          this.drawPromotionChart()
        }
      })
    },
    drawPromotionChart: function () {
      // 整理数据
      this.dataLegStr = []
      this.dataSer = []
      var serName = ''
      var map = {}
      this.promotionList.forEach(item => {
        this.dataLegStr.push(item.title)
        if (this.seledVal === 'page_pv') {
          serName = '点击量'
          map = {}
          map['name'] = item.title
          map['value'] = item.pv
          this.dataSer.push(map)
        } else if (this.seledVal === 'page_uv') {
          serName = '独立访问'
          map = {}
          map['name'] = item.title
          map['value'] = item.uv
          this.dataSer.push(map)
        }
      })
      var option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          x: 'left',
          data: this.dataLegStr
        },
        series: [
          {
            name: serName,
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['60%', '60%'],
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
            data: this.dataSer
          }
        ]
      }
      this.chartColumn = echarts.init(document.getElementById('promotionPerDiv'))
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.getPages()
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
