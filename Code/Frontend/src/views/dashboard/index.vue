<template>
  <div>
    <div class="dashboard-text">
      <img
        src="@/assets/logo-hei.png"
        alt="logo"
      >
      <span>欢迎登录Lazada运营管理系统</span>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'Dashboard',
    computed: {
      ...mapGetters([
        'name'
      ])
    }
  }
</script>

<style lang="scss" scoped>
.dashboard {
  &-text {
    margin-top: 160px;
    font-size: 22px;
    line-height: 46px;
    text-align: center;
    & > img {

    }
    & > span {
      display: block;
    }
  }
}
</style>
