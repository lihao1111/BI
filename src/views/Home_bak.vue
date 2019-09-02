<template>
  <el-row class="container">
    <el-col :span="24" class="header">
      <el-col :span="10" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
        <i class="el-icon-coin"></i>{{collapsed?'':sysName}}
      </el-col>
      <el-col :span="1">
        <div class="tools" @click.prevent="collapse">
          <svg-icon v-if="collapsed" icon-class="ushink" class="shink"/>
          <svg-icon v-if="!collapsed" icon-class="shink" class="shink"/>
        </div>
      </el-col>
      <!--面包屑
      <el-col :span="9" style="text-align: left;padding-left:6px;padding-top: 19px;">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </el-col>-->
      <!--<el-col :span="9">
        <el-dropdown>
        <span class="el-dropdown-link">
          产品视图:{{tApp.name}}<i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>
        </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-check" v-for="app in apps" @click.native="changeApp(app)" :key="app.id">{{app.name}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>-->
      <el-col :span="9">
        <label style="color: #1d8ce0; font-size: 16px; font-weight:bold;">产品视图：</label>
        <el-cascader
            v-model="allApps"
            :options="appOptions"
            placeholder="请选择"
            @change="handleChange">
        </el-cascader>
      </el-col>
      <el-col :span="4" class="userinfo">
        <el-dropdown trigger="hover">
          <span class="el-dropdown-link userinfo-inner"><img :src="this.sysUserImg"/> {{sysUserName}}</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="editForm">我的资料</el-dropdown-item>
            <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-col>
    <!--我的资料弹出框-->
    <el-dialog title="我的资料" :visible.sync="myFormVisible" :close-on-click-modal="false">
      <el-form ref="myForm" :model="myForm" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="myForm.realname"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="myForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="账号" prop="username">
          <el-input v-model="myForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="myForm.password"></el-input>
        </el-form-item>
        <el-form-item label="分组">
          <el-select v-model="myForm.group_id" placeholder="请选择分组">
            <el-option label="市场销售部" :value="1"></el-option>
            <el-option label="技术研发部" :value="2"></el-option>
            <el-option label="综合管理部" :value="3"></el-option>
            <el-option label="领导层" :value="4"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="myFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="submitMyForm" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>
    <el-col :span="24" class="main">
      <aside :class="collapsed?'menu-collapsed':'menu-expanded'">
        <!--导航菜单-未折叠-->
        <el-menu :default-active="$route.path" class="el-menu-vertical-demo" @open="handleopen" @close="handleclose"
                 @select="handleselect"
                 unique-opened router v-show="!collapsed" style="background-color: #2d3a4b">
          <template v-for="(item,index) in routes">
            <el-submenu :index="index+''" :key="item.name" v-if="!item.leaf && item.children.length > 1"><!--遍历的其中一个菜单项,设置有单节点的。-->
              <template slot="title"><i :class="item.iconCls"></i>{{item.name}}</template>
              <el-menu-item v-for="child in routeChildren(item)" :index="item.path+child.path" :key="item.path+child.path">
                <i :class="child.iconCls"></i>{{child.name}}
              </el-menu-item>
            </el-submenu>
            <el-menu-item v-if="!item.leaf&&item.children.length == 1" :index="item.path+item.children[0].path" :key="item.path+item.children[0].path" >
              <i :class="item.iconCls" style="color: #fff"></i>{{item.children[0].name}}
            </el-menu-item>
          </template>
        </el-menu>
        <!--折叠-->
        <ul class="el-menu el-menu-vertical-demo collapsed" v-show="collapsed" ref="menuCollapsed" style="background-color: #2d3a4b">
          <li v-for="(item,index) in routes" :key="item.name" class="el-submenu item">
            <!--非单节点route渲染-->
            <template v-if="!item.leaf">
              <!--经过菜单显示对应ul的事件-->
              <div class="el-submenu__title" style="padding-left: 20px; color: #f0f0f0;" @mouseover="showMenu(index,true)"
                   @mouseout="showMenu(index,false)"><i :class="item.iconCls"></i>
              </div>
              <ul class="el-menu submenu" style="background-color: #2d3a4b" :class="'submenu-hook-'+index" @mouseover="showMenu(index,true)"
                  @mouseout="showMenu(index,false)">
                <li v-for="child in item.children" :key="child.path" class="el-menu-item"
                    style="padding-left: 40px; color: #fff" :class="$route.path===item.path+child.path?'is-active':''"
                    @click="$router.push(child.path)">{{child.name}}
                </li>
              </ul>
            </template>
            <template v-else>
          <li class="el-submenu" >
            <div class="el-submenu__title el-menu-item"
                 style="height: 56px;line-height: 56px;padding: 0 20px;"
                 :class="$route.path===item.path+item.children[0].path?'is-active':''"
                 @click="$router.push(item.children[0].path)"><i :class="item.iconCls"></i>
            </div>
          </li>
</template>
</li>
</ul>
</aside>
<section class="content-container">
  <!-- 快捷导航栏 -->
  <el-col :span="24">
    <tags-view v-if="needTagsView" />
  </el-col>
  <div class="grid-content bg-purple-light">
    <el-col :span="24" class="content-wrapper">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <router-view v-if="$route.meta.keepAlive"></router-view>  <!--相当于 子路由的占位符，成功匹配就渲染子路由对应的组件  /dashboard   /:父路由 dashboard:子路由-->
        </keep-alive>
      </transition>
      <transition name="fade" mode="out-in">
        <router-view v-if="!$route.meta.keepAlive"></router-view>
      </transition>
    </el-col>
  </div>
</section>
</el-col>
</el-row>
</template>

<script>
import { editUserInfo } from '../api/api'
import TagsView from '../components/TagsView'
import { mapState } from 'vuex'
export default {
  inject: ['reload'], // 注入依赖
  components: { // 组件
    TagsView
  },
  data () {
    return {
      sysName: 'BI管理系统',
      collapsed: false,
      sysUserName: '',
      sysUserImg: '',
      apps: [],
      appOptions: [{
        value: 'GS.CMCC',
        label: '甘肃移动',
        children: [{
          value: 'all',
          label: '所有平台'
        }, {
          value: 'Children',
          label: '少儿平台'
        }]
      }, {
        value: 'HB.Telecom',
        label: '河北电信',
        children: [{
          value: 'all',
          label: '所有平台'
        }, {
          value: 'Music',
          label: '音乐平台'
        }]
      }],
      tApp: '', //  当前产品视图
      myFormVisible: false, // dialog显隐
      editLoading: false,
      myForm: {
        id: '',
        realname: '',
        gender: '',
        username: '',
        password: '',
        group_id: ''
      },
      rules: {
        realname: [
          { required: true, message: '请输入姓名', trigger: 'change' }
        ],
        username: [
          { required: true, message: '请输入账号', trigger: 'change' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    // 关于v-for v-if，data里未定义的变量遍历使用计算属性。否则使用v-for v-if配合使用
    routes: function () {
      return this.$router.options.routes.filter(function (item) {
        return !item.hidden
      })
    },
    // 利用闭包实现计算属性传参。
    routeChildren: function (route) {
      return function (route) {
        return route.children.filter(function (child) {
          return !child.hidden
        })
      }
    },
    ...mapState({ // 对象扩展符 ...用于取出参数对象中的所有可遍历属性，拷贝到当前对象中
      needTagsView: state => state.visitedViews // needTagsView 来对等 state.needTagsView数据
    })
    // needTagsView: state => state.visitedViews
  },
  methods: {
    testf () {
      console.log(111)
    },
    onSubmit () {
      console.log('submit!')
    },
    handleopen () {
      // console.log('handleopen');
    },
    handleclose () {
      // console.log('handleclose');
    },
    handleselect: function (a, b) {
    },
    //  切换App
    changeApp: function (app) {
      if (this.tApp.name === app.name) {
        return false
      }
      // 更新App 以及session中的 App
      this.tApp = app
      sessionStorage.setItem('tApp', JSON.stringify(this.tApp))
      // 切换App 不再强制刷新页面  this.$router.go(0) 而是本页面加载
      // this.$bus.$emit('changeAppss', this.tApp) 切换App 方案二 触发父组件的自定义事件
      this.reload() // 调用依赖函数
    },
    editForm: function () {
      this.myFormVisible = true
    },
    submitMyForm: function () {
      this.$refs.myForm.validate(valid => {
        if (valid) {
          this.editLoading = true
          editUserInfo(this.myForm).then(data => { // ?
            this.editLoading = false
            let { businessCode, resultSet } = data
            if (businessCode !== 'success') {
              this.$message({
                message: '编辑失败,请联系管理员！',
                type: 'error'
              })
            } else {
              // 重新赋值
              sessionStorage.setItem('user', JSON.stringify(resultSet[0]))
              this.myForm = resultSet[0]
              this.sysUserName = resultSet[0].realname
              //
              this.myFormVisible = false
              this.$message({
                message: '编辑成功！',
                type: 'success'
              })
            }
          })
        } else {
          return false
        }
      })
    },
    // 退出登录
    logout: function () {
      var _this = this
      this.$confirm('确认退出吗?', '提示', {
        // type: 'warning'
      }).then(() => {
        sessionStorage.removeItem('user')
        _this.$router.push('/login')
      }).catch(() => {

      })
    },
    // 折叠导航栏
    collapse: function () {
      this.collapsed = !this.collapsed
    },
    showMenu (i, status) {
      this.$refs.menuCollapsed.getElementsByClassName('submenu-hook-' + i)[0].style.display = status ? 'block' : 'none'
    }
  },
  mounted () {
    // 读取用户
    var user = sessionStorage.getItem('user')
    if (user) {
      user = JSON.parse(user)
      this.myForm = user
      this.sysUserName = user.realname
    }
    // 获取产品视图
    var apps = sessionStorage.getItem('apps')
    if (apps) {
      apps = JSON.parse(apps)
      this.apps = apps
    }
    var tApp = sessionStorage.getItem('tApp')
    if (tApp) {
      this.tApp = JSON.parse(tApp)
    }
    // 用户头像
    this.sysUserImg = this.myForm.gender === 1 ? require('../assets/userM2.png') : require('../assets/userW.png')
  }
}
</script>
// 修改element 样式
<style>
  .el-submenu__title{
    color: #ffffff;
  }
  .el-submenu__title i{
    color: #ffffff;
  }
  .el-submenu__title:hover{
    background-color: #5e7382;
  }
  .el-menu{
    background-color: #606266;
  }
  .el-menu-item{
    color: #ffffff;
  }
  .el-menu-item:hover{
    background-color: #5e7382;
  }
  .el-menu-item.is-active{
    background-color: #1d8ce0 ;
    color: #ffffff;
  }

</style>
<style scoped lang="scss">
  @import '../styles/vars';
  .el-dropdown-link {
    cursor: pointer;
    color: #1d8ce0;
    font-size: 16px;
    font-weight:bold;
  }
  .el-icon-arrow-down {
    font-size: 14px;
  }
  .shink{
    width: 2em;
    height: 1.8em;
    color: #606266;
  }
  .container {
    position: absolute;
    top: 0px;
    bottom: 0px;
    width: 100%;
    .header {
      height: 50px;
      line-height: 50px;
      background: $color-primary;
      color: #fff;
      box-shadow: 0 1px 4px rgba(0,21,41,.08);
      /* z-index: 10000;
       position: relative;*/
      .userinfo {
        text-align: right;
        padding-right: 35px;
        float: right;

        .userinfo-inner {
          cursor: pointer;
          //color: #000000;
          color: #606266;
          img {
            width: 40px;
            height: 40px;
            border-radius: 20px;
            margin: 5px;
            float: right;
          }
        }
      }

      .logo {
        height: 50px;
        font-size: 22px;
        padding-left: 20px;
        padding-right: 20px;
        border-color: rgba(238, 241, 146, 0.3);
        border-right-width: 1px;
        border-right-style: solid;
        background-color: #2d3a4b;
        img {
          width: 40px;
          float: left;
          margin: 10px 10px 10px 18px;
        }

        .txt {
          color: #fff;
        }
      }

      .logo-width {
        width: 230px;
      }

      .logo-collapse-width {
        width: 60px
      }
      .tools {
        padding: 0px 10px;
        width: 14px;
        height: 50px;
        line-height: 60px;
        cursor: pointer;
      }
    }

    .main {
      display: flex;
      overflow: hidden;
      position: absolute;
      top: 50px;
      bottom: 0px;
      aside {
        flex: 0 0 230px;
        width: 230px;
        background-color: #8c939d !important;
        .el-menu {
          height: 100%;
        }

        .collapsed {
          width: 60px;

          .item {
            position: relative;
          }

          .submenu {
            position: absolute;
            top: 0;
            left: 60px;
            z-index: 99999;
            height: auto;
            display: none;
          }

        }
      }

      .menu-collapsed {
        flex: 0 0 60px;
        width: 60px;
      }

      .menu-expanded {
        flex: 0 0 230px;
        width: 230px;

        .el-menu { /*打补丁的方式解决左侧菜单宽度显示不全*/
          width: 100% !important;
        }

        .el-submenu .el-menu-item {
          min-width: 0px !important;
        }
      }

      .content-container {
        flex: 1;
        margin-top: 1px;
        overflow-y: scroll;
        .content-wrapper {
          margin-top: 3px;
          padding: 10px;
          background-color: #fff;
          box-sizing: border-box;
        }
      }
    }
  }
</style>
