<template>
  <i class="iconfont" :class="`icon-${name}`"></i>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../../static/font/iconfont.css';
@import '../../assets/css/util.scss';

.iconfont {
  @include fontSizeRespond(14);
}
</style>
