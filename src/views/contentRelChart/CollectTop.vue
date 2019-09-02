<template>
    <section class="chart-container">
      <!--工具条-->
      <el-col :span="24" class="toolbar1" style="height: 50px; padding-left: 10px; padding-top: 5px">
        <el-form :inline="true">
          <el-form-item label="内容类型：">
            <el-select v-model="contentType" size="small" clearable placeholder="请选择内容类型">
              <el-option v-for="type in typeMapArr" :label="type.name" :value="type.id" :key="type.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属CP：">
            <el-select v-model="contentCP" size="small" clearable placeholder="请选择CP">
              <el-option v-for="cp in cps" :key="cp.id" :value="cp.id" :label="cp.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="内容名称：">
            <el-input v-model="contentKey" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" icon="el-icon-search" v-on:click="getCollectDetail">查询</el-button>
          </el-form-item>
          <el-form-item style="float: right">
            <el-button type="primary" size="small"  icon="el-icon-download" @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-table :data="collectDetails" highlight-current-row stripe v-loading="loadTable" style="width:100%; padding-top: 10px"
                :header-cell-style="{
                  'color': '#3a8ee6',
                }"
      >
        <el-table-column prop="id" label="序号" align="center"></el-table-column>
        <el-table-column prop="media_id" label="内容ID" align="center"></el-table-column>
        <el-table-column prop="media_name" label="内容名称" align="center"></el-table-column>
        <el-table-column prop="media_type" label="内容类型" align="center" :formatter="formaterText"></el-table-column>
        <el-table-column prop="cp_name" label="提供方名称" align="center"></el-table-column>
        <el-table-column prop="count" label="收藏数量" align="center" >
            <template slot-scope="scope">
                <span style="color: #1d8ce0; font-weight: bold">{{ scope.row.count }}</span>
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
    </section>
</template>
<script>
import { loadCollectDetail, loadCPs } from '../../api/api'
export default {
  data () {
    return {
      loadTable: false,
      tApp: '',
      collectDetails: [],
      cps: [],
      typeMap: {
        1: '纯音乐',
        2: '视频音乐',
        3: '电影',
        4: '电视剧'
      },
      typeMapArr: [{ id: 1, name: '纯音乐' }, { id: 2, name: '视频音乐' }, { id: 3, name: '电影' }, { id: 4, name: '电视剧' }],
      contentCP: '',
      contentType: '',
      contentKey: '',
      totalSize: 0, // 分页数据
      curpage: 1,
      pageSize: 20
    }
  },
  methods: {
    handleCurrentChange (val) { // 页面
      this.curpage = val
      this.getCollectDetail()
    },
    formaterText (row, column, cellValue) {
      return this.typeMap[cellValue]
    },
    getCollectDetail () {
      this.loadTable = true
      loadCollectDetail({ // 后端分页
        platFormId: this.tApp.id,
        contentCP: this.contentCP,
        contentType: this.contentType,
        contentKey: this.contentKey,
        currentPage: this.curpage,
        pageSize: this.pageSize
      }).then(data => { // ?
        let { businessCode, resultSet, count } = data
        this.loadTable = false
        if (businessCode === 'unauthenticated') { // 有权限认证
          this.$message({
            message: '未授权，请联系管理员！',
            type: 'error'
          })
          return false
        }
        if (businessCode !== 'success') {
          this.$message({
            message: '收藏数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.collectDetails = resultSet // 图表数据
          this.totalSize = count
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
      // 发送请求 后台导出
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
    this.getCollectDetail()
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
