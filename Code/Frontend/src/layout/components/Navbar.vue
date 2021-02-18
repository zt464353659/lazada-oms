<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb
      id="breadcrumb-container"
      class="breadcrumb-container"
    />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <error-log class="errLog-container right-menu-item hover-effect"/>
        <el-tooltip
          effect="dark"
          content="通知"
          placement="bottom"
        >
          <el-badge
            :is-dot="isNotice"
            class="top-notice right-menu-item hover-effect"
            :class="{ 'active' : isNotice }"
            @click.native="toChat"
          >
            <svg-icon icon-class="message1"/>
          </el-badge>
        </el-tooltip>
        <el-tooltip
          effect="dark"
          content="全屏"
          placement="bottom"
        >
          <screen-full
            id="screenfull"
            class="right-menu-item hover-effect"
          />
        </el-tooltip>
      </template>
      <el-dropdown
        class="avatar-container"
        trigger="click"
      >
        <!--<div class="avatar-wrapper">-->
        <!--<img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">-->
        <!--<i class="el-icon-caret-bottom"/>-->
        <!--</div>-->
        <span
          class="el-dropdown-link"
          style="cursor: pointer;"
        >
          <svg-icon icon-class="people"/>
          您好，{{ name }}
          <i class="el-icon-arrow-down el-icon--right"/>
        </span>
        <el-dropdown-menu
          slot="dropdown"
          class="user-dropdown"
        >
          <router-link to="/">
            <el-dropdown-item>首页</el-dropdown-item>
          </router-link>
          <!--<a target="_blank" href="https://github.com/PanJiaChen/vue-admin-template/">-->
          <!--<el-dropdown-item>Github</el-dropdown-item>-->
          <!--</a>-->
          <!--<a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">-->
          <!--<el-dropdown-item>Docs</el-dropdown-item>-->
          <!--</a>-->
          <el-dropdown-item
            divided
            @click.native="logout"
          >
            <span style="display:block;">Log Out</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Breadcrumb from '@/components/Breadcrumb'
  import Hamburger from '@/components/Hamburger'
  import ErrorLog from '@/components/ErrorLog'
  import ScreenFull from '@/components/Screenfull'
  import { fetchAccountList } from '@/api/chat'

  export default {
    components: {
      Breadcrumb,
      Hamburger,
      ErrorLog,
      ScreenFull
    },
    data() {
      return {
        isNotice: false,
        intervalRead: null
      }
    },
    computed: {
      ...mapGetters([
        'sidebar',
        'avatar',
        'device',
        'name',
        'userInfo',
        'isNoticeShow'
      ])
    },
    mounted() {
      this.intervalGetNotice()
    },
    methods: {
      toggleSideBar() {
        this.$store.dispatch('app/toggleSideBar')
      },
      async logout() {
        await this.$store.dispatch('user/LogOut')
        this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      },
      toChat() {
        if (this.$route.name !== 'chat.list') {
          this.$router.push('/chat/list')
        }
      },
      intervalGetNotice() {
        this.getIsNotice(this.$route)
        if (this.intervalRead) {
          clearInterval(this.intervalRead)
        }
        this.intervalRead = setInterval(() => {
          this.getIsNotice()
        }, 90000)
      },
      getIsNotice() {
        const params = {
          user_id: this.$store.getters.userInfo.id
        }
        fetchAccountList(params).then((res) => {
          this.isNotice = res.data.some(item => item.unread_count > 0)
          this.$store.dispatch('chat/setNoticeAccount', res.data || [])
        }).catch(() => {
          this.isNotice = false
        })
      }
    },
    watch: {
      isNoticeShow() {
        this.isNotice = this.isNoticeShow
      }
    }
  }
</script>

<style lang="scss" scoped>
  .navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

    .hamburger-container {
      line-height: 46px;
      height: 100%;
      float: left;
      cursor: pointer;
      transition: background .3s;
      -webkit-tap-highlight-color: transparent;

      &:hover {
        background: rgba(0, 0, 0, .025)
      }
    }

    .breadcrumb-container {
      float: left;
    }

    .errLog-container {
      display: inline-block;
      vertical-align: top;
    }

    .right-menu {
      float: right;
      height: 100%;
      line-height: 50px;

      &:focus {
        outline: none;
      }

      .right-menu-item {
        display: inline-block;
        padding: 0 12px;
        height: 100%;
        font-size: 18px;
        color: #5a5e66;
        vertical-align: middle;

        &.hover-effect {
          cursor: pointer;
          transition: background .3s;

          &:hover {
            background: rgba(0, 0, 0, .025)
          }
        }
      }

      .avatar-container {
        margin-right: 20px;

        .avatar-wrapper {
          margin-top: 5px;
          position: relative;

          .user-avatar {
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }

          .el-icon-caret-bottom {
            cursor: pointer;
            position: absolute;
            right: -20px;
            top: 25px;
            font-size: 14px;
          }
        }
      }
    }
  }
</style>
