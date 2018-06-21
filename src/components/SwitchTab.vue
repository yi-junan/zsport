<template>
  <div class="switch-tab" :class="{ 'type1': type === 1, 'type2': type === 2, 'type3': type === 3 }">
    <ul class="heads">
      <li v-for="(tab, index) in tabs" :key="tab.index" :class="{ 'active': activeTab === index }" @click="OnSwitch(index, tab)">
        {{ tab.name }}
      </li>
    </ul>

    <div class="content" v-for="(tab, index) in tabs" :key="`${tab.index}content`" v-show="activeTab === index">
      <slot :name="tab.index"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tabs: {
      type: Array,
      default: () => [],
    },
    defaultTab: {
      type: Number,
      default: 0,
    },
    onClick: {
      type: Function,
      default: () => {},
    },
    type: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      activeTab: 0,
    };
  },
  methods: {
    OnSwitch(argIndex, argTab) {
      this.activeTab = argIndex;
      this.onClick(argIndex, argTab);
    },
  },
  created() {
    this.activeTab = this.defaultTab;
  },
};
</script>

<style scoped lang="scss">
@import '../assets/css/color.scss';
@import '../assets/css/util.scss';

.switch-tab {
  line-height: 1;

  &.type1 {
    .content {
      margin-top: px2rem(27);
    }

    .heads {
      display: flex;
      align-items: center;
      height: px2rem(30);

      li {
        color: $blue;
        position: relative;
        @include fontSizeRespond(30);
        cursor: pointer;
        margin-right: px2rem(26);

        &:last-child {
          margin-right: 0;
        }
        &:after {
          content: '';
          width: 100%;
          height: px2rem(4);
          background-color: $blue;
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: px2rem(7);
          display: none;
        }
        &.active:after {
          display: block;
        }
        &:hover {
          color: $lightBlue;
          &:after {
            background-color: $lightBlue;
          }
        }
      }
    }
  }

  &.type2 {
    .heads {
      background-color: #fff;
      display: flex;
      align-items: center;

      li {
        padding: px2rem(30) px2rem(32);
        @include fontSizeRespond(20);
        line-height: 1.55;
        white-space: nowrap;
        color: #333;
        cursor: pointer;

        &.active {
          background-color: #fff;
        }
        &:hover {
          color: $blue;
        }
      }
    }
  }

  &.type3 {
    .heads {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding-left: px2rem(28);

      li {
        @include fontSizeRespond(26);
        line-height: 1.07;
        padding: px2rem(29) 0 px2rem(19) 0;
        white-space: nowrap;
        cursor: pointer;
        color: #333;
        position: relative;
        box-sizing: border-box;
        margin-right: px2rem(112);
        position: relative;

        &:after {
          content: '';
          position: absolute;
          top: 100%;
          left: 0;
          height: px2rem(3);
          width: 100%;
          background-color: $blue;
          display: none;
        }
        &:last-child {
          margin-right: 0;
        }
        &:hover,
        &.active {
          color: $blue;
        }
        &.active:after {
          display: block;
        }
      }
    }
  }
}
</style>
