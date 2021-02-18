<template>
  <div class="login-container">
    <el-form
      class="login-form"
      auto-complete="on"
      :model="loginForm"
      :rules="loginRules"
      ref="loginForm"
      label-position="left"
    >
      <h3 class="title">
        {{ title }}
      </h3>
      <el-form-item prop="username">
        <span class="svg-container svg-container_login">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          name="username"
          type="text"
          v-model="loginForm.username"
          auto-complete="on"
          placeholder="用户名"
        />
      </el-form-item>
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          name="password"
          :type="pwdType"
          auto-complete="on"
          v-model="loginForm.password"
          @keyup.enter.native="handleLogin"
          placeholder="密码"
        />
        <span
          class="show-pwd"
          @click="showPwd"
        ><svg-icon :icon-class="eye" /></span>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          style="width:100%;"
          :loading="loading"
          @click.native.prevent="handleLogin"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    data() {
      const validateUsername = (rule, value, callback) => {
        if (value === '' || value === null) {
          callback(new Error('用户名不能为空'))
        } else {
          callback()
        }
      }
      const validatePass = (rule, value, callback) => {
        if (value === '' || value === null) {
          callback(new Error('密码不能为空'))
        } else if (value.length < 5) {
          callback(new Error('密码不能小于5位'))
        } else {
          callback()
        }
      }
      return {
        title: this.$store.getters.title,
        loginForm: {
          username: '',
          password: ''
        },
        loginRules: {
          username: [{ required: true, trigger: 'blur', validator: validateUsername }],
          password: [{ required: true, trigger: 'blur', validator: validatePass }]
        },
        loading: false,
        pwdType: 'password',
        eye: 'eye'
      }
    },
    methods: {
      showPwd() {
        if (this.pwdType === 'password') {
          this.pwdType = ''
          this.eye = 'eye-open'
        } else {
          this.pwdType = 'password'
          this.eye = 'eye'
        }
      },
      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true
            this.$store.dispatch('user/Login', this.loginForm).then(() => {
              this.loading = false
              // this.$router.push({ path: '/' })
              location.reload()
            }).catch(() => {
              this.loading = false
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      }
    },
    created() {
      localStorage.removeItem('BASE_API')
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  $bg: #2d3a4b;
  $light_gray: #eee;

  /* reset element-ui css */
  .login-container {
    .el-input {
      display: inline-block;
      height: 40px;
      width: 83%;
      input {
        background: transparent;
        border: 0;
        -webkit-appearance: none;
        border-radius: 0;
        padding: 8px 5px;
        color: $light_gray;
        height: 40px;
        /*&:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: #fff !important;
        }*/
        &:-webkit-autofill,
        &:-webkit-autofill:hover,
        &:-webkit-autofill:focus,
        &:-webkit-autofill:active {
          -webkit-transition-delay: 9999s;
          -webkit-transition: color 9999s ease-out, background-color 9999s ease-out;
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

<style rel="stylesheet/scss" lang="scss" scoped>
  $bg: #2d3a4b;
  $dark_gray: #889aa4;
  $light_gray: #eee;
  .login-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: $bg;
    .login-form {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 450px;
      margin: -180px 0 0 -225px;
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
      padding: 0 6px;
      color: $dark_gray;
      vertical-align: middle;
      width: 36px;
      display: inline-block;
      text-align: center;
      &_login {
        font-size: 20px;
      }
    }
    .title {
      font-size: 26px;
      font-weight: 500;
      color: $light_gray;
      margin: 0 auto 50px auto;
      text-align: center;
    }
    .show-pwd {
      position: absolute;
      right: 10px;
      top: 0;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
  }
</style>
