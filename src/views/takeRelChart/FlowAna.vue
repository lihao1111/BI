<template>
    <section class="chart-container">
      <!--工具条-->
      <el-col :span="24" class="toolbar1" style="height: 50px; padding-left: 10px; padding-top: 5px">
        <el-form :inline="true">
          <el-form-item>
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
            <el-button type="primary" size="small" icon="el-icon-search" v-on:click="getFlowAna">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="24">
        <div id="flowAnaDiv" style="width:100%; height:550px; margin-top: 10px" v-loading="chartLoading"></div>
      </el-col>
    </section>
</template>
<script>
import { loadFlowAna } from '../../api/api'
import echarts from 'echarts'
require('echarts/theme/shine')
export default {
  data: function () {
    return {
      queryDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      chartLoading: false,
      tApp: '',
      flowAnaList: [], // 请求返回数据
      dataNodes: [], // 节点数据
      dataLinks: [] // 连接点数据
    }
  },
  methods: {
    getFlowAna: function () {
      if (!this.queryDate) {
        this.$message({
          showClose: true,
          message: '请选择查询日期！',
          type: 'error'
        })
        return false
      }
      this.chartLoading = true
      loadFlowAna({ queryDate: this.queryDate, platFormId: this.tApp.id }).then(data => { // ?
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
            message: '页面流向数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.flowAnaList = resultSet // 图表数据
          if (this.flowAnaList != null && this.flowAnaList.length > 0) {
            this.drawFlowAnaChart()
          } else {
            this.$message({
              message: '未加载到页面流向数据！',
              type: 'warning'
            })
          }
        }
      })
    },
    drawFlowAnaChart: function () {
      this.dataNodes = []
      this.dataLinks = []
      // 整理数据
      var dataNodes = []
      this.flowAnaList.forEach(item => {
        var uiLeaveName = item.leaveNodeDesc
        var uiEnterName = item.enterNodeDesc
        if (dataNodes.indexOf(uiLeaveName) === -1) {
          dataNodes.push(uiLeaveName)
          this.dataNodes.push({ 'name': uiLeaveName })
        }
        if (dataNodes.indexOf(uiEnterName) === -1) {
          dataNodes.push(uiEnterName)
          this.dataNodes.push({ 'name': uiEnterName })
        }
        this.dataLinks.push({
          source: item.leaveNodeDesc,
          target: item.enterNodeDesc,
          value: parseInt(item.link_num)
        })
      })
      var option = {
        border: false,
        title: {
          text: '页面流量层级走向图',
          x: 'center', // 水平安放位置，默认为'left'，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
          y: 'top', // 垂直安放位置，默认为top，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
          borderColor: '#ccc', // 标题边框颜色,默认'#ccc'
          borderWidth: 0, // 标题边框线宽，单位px，默认为0（无边框）
          textStyle: {
            fontSize: 16,
            fontStyle: 'normal',
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '12%',
          containLabel: true
        },
        series: [ // 图形
          {
            type: 'sankey',
            data: this.dataNodes,
            links: this.dataLinks,
            focusNodeAdjacency: 'allEdges', // 鼠标悬停到节点或边上，相邻接的节点和边高亮显示
            itemStyle: {
              normal: {
                borderWidth: 1,
                borderColor: '#aaa'
              }
            },
            lineStyle: {
              normal: {
                color: 'rgb(108, 165, 211)'
              }
            }
          }
        ]
      }
      this.chartColumn = echarts.init(document.getElementById('flowAnaDiv'), 'shine')
      this.chartColumn.clear()
      this.chartColumn.setOption(option)
      window.onresize = this.chartColumn.resize // 适应图表
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.getFlowAna()
  },
  mounted: function () {
  },
  updated: function () {
  }
}
</script>

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
