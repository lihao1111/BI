<template>
  <section class="chart-container">
    <!--工具条-->
    <el-col :span="24" class="toolbar1" style="height: 50px; padding-left: 10px; padding-top: 5px">
      <el-form :inline="true" :model="filters">
        <el-form-item label="角色:">
          <el-input v-model="filters.queryVal" placeholder="请输入角色名称" size="small"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" icon="el-icon-search" v-on:click="getRoles">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" size="small" icon="el-icon-circle-plus-outline" v-on:click="addRole">新增角色</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-table :data="tableData" style="width: 100%; padding-top: 10px" highlight-current-row stripe v-loading="loadTable"
              :header-cell-style="{
                  'color': '#3a8ee6',
                }"
    >
      <el-table-column prop="id" label="序号" >
      </el-table-column>
      <el-table-column prop="name" label="角色名称">
      </el-table-column>
      <el-table-column prop="description" label="描述">
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit-outline"
            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--编辑角色-->
    <el-dialog title="编辑角色" :visible.sync="editFormVisible" :close-on-click-modal="false" width="550px">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description"></el-input>
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
                  :data="treeList"
                  :props="defaultProps"
                  node-key="id"
                  show-checkbox
                  ref="authEditTree"
                  :default-checked-keys=editForm.checkedList
                  :default-expanded-keys=editForm.checkedList
                  highlight-current>
          </el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">确定</el-button>
      </div>
    </el-dialog>
    <!--新增角色-->
    <el-dialog title="新增角色" :visible.sync="addFormVisible" :close-on-click-modal="false" width="550px">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="addForm.description"></el-input>
        </el-form-item>
        <el-form-item label="权限列表">
          <el-scrollbar style="height: 200px;">
            <el-tree
                    :data="treeList"
                    show-checkbox
                    node-key="id"
                    ref="authAddTree"
                    :props="defaultProps"
                    highlight-current>
            </el-tree>
          </el-scrollbar>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">确定</el-button>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import { loadRoles, loadAnthTree, addRoleSubmit, loadEditRole, editRoleSubmit, deleteRow } from '../../api/api'
export default {
  data: function () {
    return {
      tApp: '',
      filters: { // 过滤器
        queryVal: ''
      },
      tableData: [],
      addForm: {
        name: '',
        description: ''
      },
      treeList: [], // 权限数
      defaultProps: { // 默认属性
        children: 'children',
        label: 'name'
      },
      addFormRules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      editForm: {
        id: '',
        name: '',
        description: '',
        checkedList: []
      },
      editFormRules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      loadTable: false,
      addLoading: false,
      editLoading: false,
      editFormVisible: false,
      addFormVisible: false
    }
  },
  methods: {
    getRoles () {
      this.loadTable = true
      loadRoles({ queryVal: this.filters.queryVal }).then(data => { // ?
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
            message: '角色数据加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.tableData = resultSet
        }
      })
    },
    addRole () {
      this.addFormVisible = true
      if (this.treeList.length === 0) { // 加载权限树
        loadAnthTree().then(data => { // ?
          let { businessCode, resultSet } = data
          if (businessCode !== 'success') {
            this.$message({
              message: '权限树加载失败，请联系管理员！',
              type: 'error'
            })
          } else {
            this.treeList = resultSet
          }
        })
      }
    },
    addSubmit () {
      var chooseKeys = ''
      this.$refs.authAddTree.getCheckedKeys().forEach(item => {
        if (item) {
          chooseKeys += item + ','
        }
      })
      chooseKeys = chooseKeys.substr(0, chooseKeys.length - 1)
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.addLoading = true
          addRoleSubmit({ roleName: this.addForm.name, roleDescription: this.addForm.description, chooseKeys: chooseKeys }).then(data => { // ?
            this.addLoading = false
            let { businessCode } = data
            if (businessCode !== 'success') {
              this.$message({
                message: '编辑失败,请联系管理员！',
                type: 'error'
              })
            } else {
              this.addFormVisible = false
              this.getRoles()
              this.$message({
                message: '新增角色成功！',
                type: 'success'
              })
            }
          })
        } else {
          return false
        }
      })
    },
    handleEdit (index, row) {
      loadEditRole({ roleId: row.id }).then(data => { // ?
        let { businessCode, resultSet } = data
        if (businessCode !== 'success') {
          this.$message({
            message: '角色加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.editForm.id = resultSet[0].id
          this.editForm.name = resultSet[0].name
          this.editForm.description = resultSet[0].description
          this.editForm.checkedList = resultSet[0].roleAuths // 该角色已有权限
          this.editFormVisible = true
        }
      })
    },
    editSubmit () {
      var chooseKeys = ''
      this.$refs.authEditTree.getCheckedKeys().forEach(item => {
        if (item) {
          chooseKeys += item + ','
        }
      })
      chooseKeys = chooseKeys.substr(0, chooseKeys.length - 1)
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.editLoading = true
          editRoleSubmit({
            roleId: this.editForm.id,
            roleName: this.editForm.name,
            roleDescription: this.editForm.description,
            chooseKeys: chooseKeys
          }).then(data => { // ?
            this.editLoading = false
            let { businessCode } = data
            if (businessCode !== 'success') {
              this.$message({
                message: '编辑失败,请联系管理员！',
                type: 'error'
              })
            } else {
              this.editFormVisible = false
              this.getRoles()
              this.$message({
                message: '更新角色成功！',
                type: 'success'
              })
            }
          })
        } else {
          return false
        }
      })
    },
    handleDelete (index, row) {
      if (!row.id) {
        this.$message({
          message: '请选择角色进行删除！',
          type: 'error'
        })
        return false
      }
      deleteRow({ roleId: row.id }).then(data => { // ?
        let { businessCode } = data
        if (businessCode !== 'success') {
          this.$message({
            message: '角色加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.getRoles()
          this.$message({
            message: '角色删除成功！',
            type: 'success'
          })
        }
      })
    }
  },
  created: function () {
    this.getRoles()
    if (this.treeList.length === 0) { // 加载权限树
      loadAnthTree().then(data => { // ?
        let { businessCode, resultSet } = data
        if (businessCode !== 'success') {
          this.$message({
            message: '权限树加载失败，请联系管理员！',
            type: 'error'
          })
        } else {
          this.treeList = resultSet
        }
      })
    }
  },
  mounted: function () {
  },
  updated: function () {
  }
}
</script>

<style>
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
