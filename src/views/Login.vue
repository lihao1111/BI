<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="off" label-position="left">
      <div class="title-container">
        <h3 class="title"><img :src="this.imgSrc" style="margin-right: 25px"/>Magic View</h3>
      </div>
      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
                ref="username"
                v-model="loginForm.username"
                placeholder="账号"
                name="username"
                type="text"
                tabindex="1"
                autocomplete="off"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="密码"
                name="password"
                tabindex="2"
                autocomplete="off"
                @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">Login</el-button>
    </el-form>
  </div>
</template>

<script>
import { adminLogin, loadPlatform } from '../api/api'
export default {
  name: 'Login',
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      loading: false,
      passwordType: 'password',
      imgSrc: ''
    }
  },
  methods: {
    showPwd () {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          adminLogin(this.loginForm).then(data => { // ?
            this.loading = false
            let { businessCode, resultSet } = data
            if (businessCode === 500) {
              this.$message({
                message: '通信失败，请联系管理员！',
                type: 'error'
              })
              return false
            }
            if (businessCode !== 'success') {
              this.$message({
                message: '登录失败，请校验账号密码！',
                type: 'error'
              })
            } else {
              sessionStorage.setItem('user', JSON.stringify(resultSet[0]))
              // 加载产品视图
              this.handlerLoadApp(resultSet[0].id)
            }
          })
        } else {
          this.$message({
            message: '校验异常！',
            type: 'warning'
          })
          return false
        }
      })
    },
    handlerLoadApp: function (adminId) {
      let param = { adminId: adminId }
      loadPlatform(param).then(data => {
        let { businessCode, resultSet } = data // response
        if (businessCode !== 'success') {
          this.$message({
            message: '未加载到产品视图！',
            type: 'error'
          })
        } else {
          // 产品视图存放在session
          let apps = resultSet.filter(item => item.id === 5 || item.id === 14 || item.id === 11) // GS.CMCC  || HB.CTCC ||SC.CMCC
          sessionStorage.setItem('apps', JSON.stringify(apps))
          sessionStorage.setItem('tApp', JSON.stringify(apps[1])) // 默认设置第一个产品视图
          // 跳转dashboard
          this.$router.push({ path: '/dashboard' })
        }
      })
    }
  },
  mounted: function () {
    this.imgSrc = require('../assets/sysIcon1.png')
  }
}
</script>

<style lang="scss">
  /* 修复input 背景不协调 和光标变色 */
  /* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

  $bg:#283443;
  $light_gray:#fff;
  $cursor: #fff;

  @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
    .login-container .el-input input {
      color: $cursor;
    }
  }

  /* reset element-ui css */
  .login-container {
    .el-input {
      display: inline-block;
      height: 47px;
      width: 85%;
      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;

        &:-webkit-autofill {
          background: transparent;
          box-shadow: 0 0 0px 1000px rgb(3,10,48) inset !important;
          -webkit-text-fill-color: $cursor !important;
        }
      }
    }

    .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
    }
  }
</style>

<style lang="scss" scoped>
  $bg:#2d3a4b;
  $dark_gray:#fff;
  $light_gray:#eee;

  .login-container {
    min-height: 100%;
    width: 100%;
    overflow: hidden;
    background: url('../assets/login5.jpg') no-repeat;
    .login-form {
      /*position: relative;
      width: 520px;
      max-width: 100%;
      padding: 160px 35px 0;
      margin: 0 auto;*/
      position: absolute;
      left: 50%;
      top:50%;
      margin-left: -260px;
      margin-top: -173px;
      width: 520px;
      max-width: 100%;
      overflow: hidden;
    }

    .tips {
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;

      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }

    .svg-container {
      padding: 6px 5px 6px 15px;
      color: $dark_gray;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
    }
    .title-container {
      position: relative;

      .title {
        font-size: 32px;
        color: $light_gray;
        margin: 0px auto 40px auto;
        text-align: center;
        font-weight: bold;
      }
    }

    .show-pwd {
      position: absolute;
      right: 10px;
      top: 7px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
  }
</style>
