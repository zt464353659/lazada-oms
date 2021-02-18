<template>
  <ul class="sticker-box is-set-scroll">
    <li
      v-for="(item, index) in emojiArr"
      @click="sendSticker(item)"
      :key="index"
    >
      <img
        :src="item.address"
        :alt="item.name"
      >
    </li>
  </ul>
</template>

<script>
  import { emojiPackage } from '@/utils/emoji'
  export default {
    name: 'Sticker',

    data() {
      return {
        emojiArr: emojiPackage()
      }
    },
    methods: {
      sendSticker(item) {
        this.$emit('send-sticker', item, 'sticker')
      }
    }
  }
</script>

<style lang="scss" scoped>
  .sticker-box {
    margin: 0;
    padding: 5px 20px;
    overflow: hidden;
    height: 180px;
    overflow-y: auto;
    li {
      list-style: none;
      float: left;
      height: 70px;
      width: 70px;
      background: #fff;
      transition: all .3s ease;
      text-align: center;
      padding-top: 10px;
      cursor: pointer;
      img {
        height: 70px;
      }
      &:hover {
        background: #ccc;
      }
    }
  }
</style>
