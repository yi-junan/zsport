<template>
  <div class="cp-message-box">
    <div class="head">{{ title }}</div>
    <div class="content">
      <slot name="content"></slot>
    </div>
    <div class="foot" v-if="hasFoot">
      <slot name="foot"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    hasFoot: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
  },
};
</script>


<style scoped lang="scss">
@import '../assets/css/util.scss';

.cp-message-box {
  width: 100%;
  box-sizing: border-box;
  background-color: #fff;
  color: #999;

  .head {
    @include fontSizeRespond(26);
    height: px2rem(48);
    text-align: center;
    line-height: px2rem(48);
    border-bottom: 1px dotted #eee;
    box-sizing: border-box;
  }

  .content {
    position: relative;
    width: 100%;
    box-sizing: border-box;
  }

  .foot {
    height: px2rem(77);
    border-top: 1px dotted #eee;
    box-sizing: border-box;
  }
}
</style>
