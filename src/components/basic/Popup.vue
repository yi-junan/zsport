<template>
  <transition name="fade">
    <div class="cp-popup" v-if="open">
      <div class="shadow" @click="toggle"></div>
      <div class="content" :style="{ 'min-width': width }">
        <div class="head">
          {{ title }}
          <div @click="toggle">
            <Icon name="guanbi" />
          </div>
        </div>
        <slot name="mid"></slot>
      </div>
    </div>
  </transition>
</template>

<script>
import Icon from '@/components/basic/Icon.vue';

export default {
  components: {
    Icon,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
      default: 500,
    },
  },
  computed: {
    w() {
      return `${window.lib.flexible.px2rem(this.width)}rem`;
    },
  },
  data() {
    return {
      open: false,
    };
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },

    onClose() {
      this.open = false;
    },

    onOpen() {
      this.open = true;
    },
  },
};
</script>

<style scoped lang="scss" >
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-popup {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;

  .shadow {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
  }

  .content {
    background-color: transparent;
    position: relative;
    z-index: 2;
    background-color: #fff;

    .head {
      @include fontSizeRespond(20);
      line-height: 1;
      padding-top: px2rem(22);
      padding-bottom: px2rem(22);
      text-align: center;
      color: #333;

      .iconfont {
        @include fontSizeRespond(20);
        line-height: 1;
        position: absolute;
        top: px2rem(17);
        right: px2rem(17);
        padding: px2rem(5);
        cursor: pointer;
        color: $blue;

        &:hover {
          color: $lightBlue;
        }
      }
    }
  }
}
</style>
