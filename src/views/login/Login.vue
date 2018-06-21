<template>
  <div class="p-login"></div>
</template>

<script>
export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.dispatch('toggleLoginBox', { showLoginBox: true });
    });
  },
  beforeDestroy() {
    this.$store.dispatch('toggleLoginBox', { showLoginBox: false });
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/css/util.scss';

.p-login {
  background-image: url('./img/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 1;

  /deep/ ~ .cp-login {
    background-color: transparent;
    padding-top: px2rem(10);
    padding-bottom: px2rem(10);
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    flex: 1 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;

    .close {
      display: none;
    }
  }
}
</style>
