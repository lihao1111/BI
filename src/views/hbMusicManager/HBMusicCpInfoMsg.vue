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
          <el-button type="primary " size="small" icon="el-icon-search" v-on:click="getCpInfoDtl">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <div style="padding: 0px;">
      <el-col :span="24" style=" margin-top: 10px; height: 40px; line-height: 40px; background-color: rgba(17, 146, 175, 0.18);">
        <span style="padding:10px; color: #606266;">详细数据<i class="el-icon-info"></i></span>
        <el-link type="primary" :underline="false" style="float: right; margin-right: 10px; font-weight: bold" icon="el-icon-download" @click="exportDatas">
          导出数据
        </el-link>
      </el-col>
      <el-table :data="cpInfoDataList" highlight-current-row style="width:100%;"
                :header-cell-style="{
                  'background-color': '#f2f2f2',
                  'color': '#3a8ee6',
                  'border-bottom': '1px #f2f2f2 solid'
                }"
      >
        <el-table-column prop="cp_name" fixed label="CP名称" width="120" align="center"></el-table-column>
        <el-table-column prop="day" fixed label="日期" width="120" align="center"></el-table-column>
        <el-table-column prop="play_count"  label="点播次数" align="center"></el-table-column>
        <el-table-column prop="play_num"  label="点播用户" align="center"></el-table-column>
        <el-table-column prop="play_time"  label="点播时长(时)" align="center"></el-table-column>
        <el-table-column prop="order_num"  label="订购数" align="center"></el-table-column>
        <el-table-column prop="order_cf_count"  label="订购触发数" align="center"></el-table-column>
        <el-table-column prop="order_cf_num"  label="订购触发人数" align="center"></el-table-column>
      </el-table>
    </div>
  </section>
</template>
<script>
import { loadCpInfoDtl, exportCpInfo } from '../../api/api'
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
      tApp: '',
      cpInfoDataList: [] // 请求数据
    }
  },
  methods: {
    getCpInfoDtl: function () {
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
      loadCpInfoDtl({
        startDate: this.queryDate[0],
        endDate: this.queryDate[1]
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
            message: 'CP基础数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.cpInfoDataList = resultSet
        }
      })
    },
    exportDatas: function () {
      if (this.cpInfoDataList.length === 0) {
        this.$message({
          message: '推荐位数据为空，无法导出！',
          type: 'error'
        })
        return false
      }
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      exportCpInfo({
        startDate: this.queryDate[0],
        endDate: this.queryDate[1]
      }).then(data => { // ?
        let blob = new Blob([data], { type: 'application/vnd.ms-excel;charset=utf-8' });
        let downloadElement = document.createElement('a');
        let href = window.URL.createObjectURL(blob); //创建下载的链接
        downloadElement.href = href;
        downloadElement.download = `HBCpInfo${this.moment(new Date()).format('YYYY/MM/DD')}.xlsx`; //下载后文件名
        document.body.appendChild(downloadElement);
        downloadElement.click(); //点击下载
        document.body.removeChild(downloadElement); //下载完成移除元素
        window.URL.revokeObjectURL(href); //释放掉blob对象
        loading.close()
      })
    }
  },
  created: function () {
    // 展示数据
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
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
