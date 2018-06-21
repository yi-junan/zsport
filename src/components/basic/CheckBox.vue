<template>
  <div class="cp-checkbox" :class="{ 'active': status }">
    <Icon name="tongyi" />
  </div>
</template>

<script>
import Icon from '@/components/basic/Icon.vue';

export default {
  props: {
    defaultStatus: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      status: this.defaultStatus,
    };
  },
  components: {
    Icon,
  },
  methods: {
    toggle() {
      this.status = !this.status;
    },

    chose() {
      this.status = true;
    },

    unchose() {
      this.status = false;
    },

    updateStatus(argStatus) {
      this.status = argStatus;
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-checkbox {
  color: #5a5a5a;
  cursor: pointer;

  &.active {
    color: $blue;
  }

  .iconfont {
    @include fontSizeRespond(20);
  }
}
</style>
