<template>
    <section class="chart-container">
        <!--工具条-->
        <el-col :span="24" class="toolbar1" style="height: 50px; padding-left: 10px; padding-top: 5px">
            <el-form :inline="true" :model="filters">
                <el-form-item label="账号:">
                    <el-input v-model="filters.usename" placeholder="请输入账号" size="small"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="small" icon="el-icon-search" v-on:click="getUserMsg">查询</el-button>
                </el-form-item>
                <el-form-item style="float: right">
                    <el-button type="primary" size="small" icon="el-icon-circle-plus-outline" v-on:click="addNewUser">新增用户</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <el-table :data="tableData" style="width: 100%; padding-top: 10px" highlight-current-row stripe v-loading="loadTable"
                  :header-cell-style="{
                  'color': '#3a8ee6',
                }"
        >
            <el-table-column label="账号">
                <template slot-scope="scope">
                    <div v-if="!scope.row.editing">
                        <span>{{ scope.row.username }}</span>
                    </div>
                    <div v-else>
                        <el-input type="text" v-model="scope.row.username" size="small" placeholder="请填写账号">
                        </el-input>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="密码">
                <template slot-scope="scope">
                    <div v-if="!scope.row.editing" style="color: #50bfff;">
                        <span>{{scope.row.password}}</span>
                    </div>
                    <div v-else>
                        <el-input type="text" v-model="scope.row.password" size="small" placeholder="请填写密码">
                        </el-input>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="真实姓名">
                <template slot-scope="scope">
                    <div v-if="!scope.row.editing">
                        <span>{{ scope.row.realname }}</span>
                    </div>
                    <div v-else>
                        <el-input type="text" v-model="scope.row.realname" size="small" placeholder="请填写真实姓名">
                        </el-input>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="性别">
                <template slot-scope="scope">
                    <div v-if="!scope.row.editing">
                        <span>{{ scope.row.gender == 1 ? '男' : '女' }}</span>
                    </div>
                    <div v-else>
                        <el-select v-model="scope.row.gender" size="small" placeholder="请选择性别">
                            <el-option label="男" :value="1"></el-option>
                            <el-option label="女" :value="0"></el-option>
                        </el-select>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="所属部门">
                <template slot-scope="scope">
                    <div v-if="!scope.row.editing">
                        <span>{{ groupMap[scope.row.group_id]}}</span>
                    </div>
                    <div v-else>
                        <el-select v-model="scope.row.group_id" size="small" placeholder="请选择分组"> <!--这里使用v-for循环有问题-->
                            <el-option label="市场销售部" :value="1"></el-option>
                            <el-option label="技术研发部" :value="2"></el-option>
                            <el-option label="综合管理部" :value="3"></el-option>
                            <el-option label="领导层" :value="4"></el-option>
                        </el-select>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="权限级别" align="center">
                <template slot-scope="scope">
                    <div v-if="!scope.row.editing">
                        <span>{{ scope.row.type }}</span>
                    </div>
                    <div v-else>
                        <el-input type="number" v-model="scope.row.type" size="small" :max="10" placeholder="请填写权限级别">
                        </el-input>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="280px">
                <template slot-scope="scope">
                    <el-button type="primary"
                               size="mini"
                               icon="el-icon-set-up"
                               @click="handleAuth(scope.$index, scope.row)">授权
                    </el-button>
                    <el-button type="primary"
                               size="mini"
                               v-if="!scope.row.editing"
                               icon="el-icon-edit-outline"
                               @click="handleEdit(scope.$index, scope.row)">编辑
                    </el-button>
                    <el-button
                            type="primary"
                            size="mini"
                            v-if="scope.row.editing"
                            icon="el-icon-success"
                            @click="handleSave(scope.$index, scope.row)">保存
                    </el-button>
                    <el-button
                            size="mini"
                            type="warning"
                            v-if="scope.row.editing"
                            icon="el-icon-warning"
                            @click="handleCancel(scope.$index, scope.row)">取消
                    </el-button>
                    <el-button
                            size="mini"
                            type="danger"
                            v-if="!scope.row.editing"
                            icon="el-icon-delete"
                            @click="handleDelete(scope.$index, scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog title="授权" :visible.sync="authFormVisible" :close-on-click-modal="false" width="450px">
            <div slot="title">  <!--slot 插槽-->
                <span>授权对象：<b style="color: #1d8ce0">{{authUserName}}</b></span>
            </div>
            <el-form>
                <el-input type="hidden" v-model="chooseUserId"></el-input>
                <el-form-item label="权限列表">
                    <el-scrollbar style="height: 280px;">
                        <el-tree
                                :data="treeList"
                                show-checkbox
                                node-key="id"
                                ref="authTree"
                                :props="defaultProps"
                                highlight-current
                                :default-expanded-keys="expendAuthData"
                                :default-checked-keys="expendAuthData">
                        </el-tree>
                    </el-scrollbar>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="authFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="authSubmit" :loading="authLoading">确定</el-button>
            </div>
        </el-dialog>
    </section>
</template>
<script>
import { loadUserList, saveUser, deleteUser, loadUserAuth, authUserSubmit } from '../../api/api'
export default {
  data: function () {
    return {
      tApp: '',
      filters: { // 过滤器
        usename: ''
      },
      groupMap: {
        '1': '市场销售部',
        '2': '技术研发部',
        '3': '综合管理部',
        '4': '领导层'
      },
      loginUser: '', // 登录用户
      tableData: [],
      loadTable: false,
      authLoading: false,
      authFormVisible: false,
      authUserName: '',
      chooseUserId: '',
      chooseUserType: '',
      expendAuthData: '',
      treeList: '',
      defaultProps: { // 默认属性
        children: 'children',
        label: 'name'
      }
    }
  },
  methods: {
    getUserMsg () {
      this.loadTable = true
      loadUserList({ usename: this.filters.usename }).then(data => { // ?
        let { businessCode, resultSet } = data
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
            message: '用户数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.tableData = resultSet
        }
      })
    },
    handleAuth ($index, row) { // 授权
      if (row.editing) {
        this.$message({
          message: '正在编辑中，禁止授权',
          type: 'error'
        })
        return false
      }
      loadUserAuth({ id: row.id }).then(data => { // ?
        let { businessCode, resultSet } = data
        if (businessCode !== 'success') {
          this.$message({
            message: row.realname + '权限数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.authUserName = row.realname
          this.chooseUserId = row.id
          this.chooseUserType = row.type
          this.treeList = resultSet
          this.expendAuthData = []
          this.treeList.forEach(item => {
            if (item.children) {
              item.children.forEach(childrenItem => {
                if (childrenItem.auth_code === '1') { // 已授权数据
                  this.expendAuthData.push(parseInt(childrenItem.id))
                }
              })
            }
          })
          this.authFormVisible = true
        }
      })
    },
    authSubmit () { // 授权提交
      if (parseInt(this.loginUser.type) <= parseInt(this.chooseUserType)) {
        this.$message({
          message: '授权失败，授权人权限不足！',
          type: 'error'
        })
        return false
      }
      var chooseKeys = ''
      this.$refs.authTree.getCheckedKeys().forEach(item => {
        if (item) {
          chooseKeys += item + ','
        }
      })
      chooseKeys = chooseKeys.substr(0, chooseKeys.length - 1)
      this.authLoading = true
      authUserSubmit({ chooseUserId: this.chooseUserId, chooseKeys: chooseKeys }).then(data => { // ?
        let { businessCode } = data
        this.authLoading = false
        if (businessCode !== 'success') {
          this.$message({
            message: '授权失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.authFormVisible = false
          this.getUserMsg()
          this.$message({
            message: '授权成功！',
            type: 'success'
          })
        }
      })
    },
    handleEdit ($index, row) {
      this.$set(this.tableData[$index], 'editing', true)
    },
    handleCancel ($index, row) {
      if (row.flag === 'newAdd') {
        this.tableData.splice($index, 1)
      } else {
        this.getUserMsg() // 还原数据 重新加载下
        this.$set(this.tableData[$index], 'editing', false)
      }
    },
    addNewUser () {
      this.tableData = this.tableData || []
      this.tableData.unshift({
        editing: true,
        flag: 'newAdd' // 设置标记
      })
    },
    handleSave ($index, row) {
      // 数据校验
      if (row.username === '') {
        this.$message({
          message: '账号不可以为空！',
          type: 'warning'
        })
        return false
      }
      if (row.password === '') {
        this.$message({
          message: '账号不可以为空！',
          type: 'warning'
        })
        return false
      }
      if (row.realname === '') {
        this.$message({
          message: '真实名称不可以为空！',
          type: 'warning'
        })
        return false
      }
      // 请求后台
      saveUser(row).then(data => { // ?
        let { businessCode } = data
        if (businessCode !== 'success') {
          this.$message({
            message: '用户保存失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.$set(this.tableData[$index], 'editing', false)
          this.getUserMsg()
          this.$message({
            message: '用户保存成功！',
            type: 'success'
          })
        }
      })
    },
    handleDelete ($index, row) {
      this.$confirm('确定删除该记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (!row.id) {
          this.$message({
            message: '请选择记录，进行删除！',
            type: 'error'
          })
        }
        deleteUser({ id: row.id }).then(data => { // ?
          let { businessCode } = data
          if (businessCode !== 'success') {
            this.$message({
              message: '用户保存失败，请联系管理员！',
              type: 'error'
            })
          } else {
            this.tableData.splice($index, 1)
            this.getUserMsg()
            this.$message({
              message: '用户删除成功！',
              type: 'success'
            })
          }
        })
      })
    }
  },
  created: function () {
    this.tApp = JSON.parse(sessionStorage.getItem('tApp'))
    this.loginUser = JSON.parse(sessionStorage.getItem('user'))
    this.getUserMsg()
  },
  mounted: function () {
  },
  updated: function () {
  }
}
</script>
<style>
    .el-dialog__body{
        padding: 0px 20px;
    }
    input[type='number'].el-input__inner{
        padding: 0;
        padding-left: 15px;
    }
    .el-scrollbar__wrap{
        overflow-y: scroll;
        overflow-x: hidden;
    }
    .el-scrollbar{
        position: inherit;
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
