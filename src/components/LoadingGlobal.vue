<template>
  <transition name="fade">
    <div class="cp-loading-global" v-if="status.loading">
      <div class="box">
        <Loading :width="38" :height="38" />
        <p>{{ text }}</p>
      </div>
    </div>
  </transition>
</template>

<script>
import Loading from '@/components/basic/Loading.vue';
import { mapState } from 'vuex';

export default {
  props: {
    text: {
      type: String,
      default: '操作中，请稍后',
    },
  },
  components: {
    Loading,
  },
  computed: {
    ...mapState({
      status: 'status',
    }),
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/css/util.scss';

.cp-loading-global {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  /deep/ .cp-loading {
    margin: 0 auto;
  }

  .box {
    min-width: 150px;
    box-sizing: border-box;
    padding: px2rem(35);
    border: 1px solid #eee;
    background-color: #fff;
    color: #333;
    text-align: center;
    border-radius: 5px;
    @include fontSizeRespond(20);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);

    p {
      padding-top: px2rem(25);
    }
  }
}
</style>
