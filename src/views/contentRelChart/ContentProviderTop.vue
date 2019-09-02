<template>
    <section class="chart-container">
      <!--工具条-->
      <el-col :span="24" class="toolbar1" style="height: 50px; padding-left: 10px; padding-top: 5px">
        <el-form :inline="true">
          <el-form-item label="日期范围">
            <div class="block">
              <el-date-picker
                      v-model="queryDate"
                      type="daterange"
                      style="width: 220px"
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
          <el-form-item label="内容类型：">
            <el-select v-model="contentType" size="small" style="width: 160px" clearable placeholder="请选择内容类型">
              <el-option v-for="type in typeMapArr" :label="type.name" :value="type.id" :key="type.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="内容提供商：">
            <el-select v-model="contentCP" size="small" style="width: 200px" clearable placeholder="请选择内容提供商">
              <el-option v-for="cp in cps" :key="cp.id" :value="cp.id" :label="cp.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" icon="el-icon-search" v-on:click="getContentCPs">查询</el-button>
          </el-form-item>
          <el-form-item style="float: right">
            <el-button type="primary" size="small"  icon="el-icon-download" @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-table :data="cpDetails" highlight-current-row stripe style="width:100%; padding-top: 10px"
                :header-cell-style="{
                  'color': '#3a8ee6',
                }"
      >
        <el-table-column prop="cp_name" label="CP名称" align="center"></el-table-column>
        <!--  <el-table-column prop="hour" label="播放量" align="center"></el-table-column>
        <el-table-column prop="online_num" label="播放量占比" align="center"></el-table-column>-->
        <el-table-column prop="online_num" label="有效播放量" align="center"></el-table-column>
        <el-table-column prop="online_num" label="有效播放量占比" align="center"></el-table-column>
        <el-table-column prop="online_num" label="在线内容量" align="center"></el-table-column>
        <el-table-column prop="online_num" label="在线内容量占比" align="center"></el-table-column>
        <el-table-column prop="online_num" label="活跃内容量" align="center"></el-table-column>
        <el-table-column prop="online_num" label="活跃内容量占比" align="center"></el-table-column>
      </el-table>
    </section>
</template>
<script>
import { loadContentCPs, loadCPs } from '../../api/api'
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
        }]
      },
      tApp: '',
      contentCP: '',
      contentType: '',
      cps: [],
      cpDetails: [],
      typeMap: {
        1: '纯音乐',
        2: '视频音乐',
        3: '电影',
        4: '电视剧'
      },
      typeMapArr: [{ id: 1, name: '纯音乐' }, { id: 2, name: '视频音乐' }, { id: 3, name: '电影' }, { id: 4, name: '电视剧' }]
    }
  },
  methods: {
    //  加载数据
    getContentCPs () {
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
      return false
      loadContentCPs({
        startDate: this.queryDate[0],
        endDate: this.queryDate[1],
        platFormId: this.tApp.id,
        contentCP: this.contentCP,
        contentType: this.contentType
      }).then(data => { // ?
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
            message: '内容提供商排行数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.cpDetails = resultSet // 图表数据
        }
      })
    },
    // 导出
    handleExport () {
      if (this.tUserList.length === 0) {
        this.$message({
          message: '表格无数据，导出异常！',
          type: 'warning'
        })
        return false
      }
      require.ensure([], () => {
        const { exportExcel } = require('../../excel/Export2Excel')
        const tHeader = ['日期', '小时', '实时订购']
        // 上面设置Excel的表格第一行的标题
        const filterVal = ['day', 'hour', 'online_num']
        // 上面的'day', 'hour', 'online_num'是tableData里对象的属性
        const list = this.tUserList // 把data里的tableData存到list
        const data = this.formatJson(filterVal, list)
        exportExcel(tHeader, data, '实时在线excel')
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    getAllCPS () { // 加载 cp数据
      loadCPs().then(data => { // ?
        let { businessCode, resultSet } = data
        if (businessCode !== 'success') {
          this.$message({
            message: 'CP数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.cps = resultSet // 图表数据
        }
      })
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.getAllCPS()
    // this.getContentCPs()
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
