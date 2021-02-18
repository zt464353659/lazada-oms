<template>
  <component v-if="$route.name === 'autoReply.tools'" :is="current"></component>
  <router-view v-else></router-view>
</template>
<script>
import toolsList from './tools/list'

export default {
  components: { toolsList },
  data() {
    return {
      current: 'toolsList'
    }
  }
}
</script>
