<template>
  <button class="cp-btn" :class="customerClass">
    <slot>
      {{ text }}
    </slot>
  </button>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'normal',
    },
    text: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // 是否需要绑定click事件
    needEvent: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    customerClass() {
      const type = this.type;
      let myClass = '';

      if (type.indexOf('normal') !== -1) {
        myClass = `${myClass} normal`;
      }
      if (type.indexOf('inverse') !== -1) {
        myClass = `${myClass} inverse`;
      }
      if (type.indexOf('no-border') !== -1) {
        myClass = `${myClass} no-border`;
      }
      if (type.indexOf('red') !== -1) {
        myClass = `${myClass} red`;
      }
      if (this.disabled) {
        myClass = `${myClass} disabled`;
      }

      return myClass;
    },
  },
  methods: {
    handleClick() {
      this.$emit('handle');
    },
  },
  beforeDestroy() {
    this.$el.removeEventListener('click', this.handleClick.bind(this));
  },
  mounted() {
    this.$nextTick(() => {
      if (this.needEvent) {
        this.$el.addEventListener('click', this.handleClick.bind(this));
      }
    });
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-btn {
  border: none;
  background-color: transparent;
  min-width: px2rem(80);
  line-height: 1;
  padding: px2rem(9) px2rem(20);
  white-space: nowrap;
  @include fontSizeRespond(16);
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &.no-border {
    border: none;
    color: $blue;

    &:hover {
      color: $lightBlue;
    }
  }

  &.inverse {
    background-color: $white;
    color: $blue;
    border: 1px solid $blue;

    &:hover {
      border-color: $lightBlue;
      color: $lightBlue;
    }
  }

  &.normal {
    background-color: $blue;
    color: #fff;

    &:hover {
      background-color: $lightBlue;
    }
  }

  &.red {
    background-color: $red;
    color: #fff;

    &:hover {
      background-color: $lightred;
    }
  }

  &.disabled {
    background-color: #d2d2d2;
    color: #fff;
    cursor: not-allowed;

    &:hover {
      background-color: #d2d2d2;
    }
  }
}
</style>
