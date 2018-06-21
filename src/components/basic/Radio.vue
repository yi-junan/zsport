<template>
  <!-- 该组件可能会被v-for循环，所以不要单独绑定click事件 -->
  <ul class="cp-radio" :data-id="data.id">
    <li class="text-l" v-if="place === 'right'">{{ data.name }}</li>
    <li class="radio" :class="{ 'active': active }"></li>
    <li class="text-r" v-if="place === 'left'">{{ data.name }}</li>
  </ul>
</template>

<script>
export default {
  props: {
    place: {
      type: String,
      default: 'left',
    },
    data: {
      type: Object,
      default: () => {
        return { id: '', name: '' };
      },
    },
    defaultStatus: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    defaultStatus(argStatus) {
      this.active = argStatus;
    },
  },
  data() {
    return {
      active: this.defaultStatus,
    };
  },
  methods: {
    onToggle() {
      this.active = !this.active;
    },

    onChose() {
      this.active = true;
    },

    unChose() {
      this.active = false;
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';

.cp-radio {
  font-size: 0;
  cursor: pointer;

  & > * {
    display: inline-block;
    vertical-align: middle;
  }

  &:hover {
    .radio {
      border-color: $blue;
    }
    [class*='text-'] {
      color: $blue;
    }
  }

  [class*='text-'] {
    color: #999;
    font-size: 14px;
  }
  .text-l {
    margin-right: 8px;
  }
  .text-r {
    margin-left: 8px;
  }

  .radio {
    border-radius: 100%;
    border: 1px solid #bbb;
    position: relative;
    box-sizing: border-box;
    width: 20px;
    height: 20px;

    &.active:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      background-color: $blue;
      border-radius: 100%;
      width: 12px;
      height: 12px;
    }
  }
}
</style>
