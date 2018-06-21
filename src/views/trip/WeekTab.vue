<template>
  <div class="cp-week-tab">
    <div class="prev" @click="onNextOrPrev('prev')"></div>
    <ul class="items" @click="onChoseOne">
      <li :class="{ 'active': activeItem === index }" v-for="(item, index) in items" :key="`${item.id}-cp-week-tab`" :data-index="index" :style="{ 'width': `${liWidth}%` }">
        <div>
          <p>{{ item.date }}</p>
          <p>{{ item.week }}</p>
        </div>
      </li>
      <li v-for="n in emptyItemsLen" data-index="-" :style="{ 'width': `${liWidth}%` }" :key="`cp-week-tab-empty-${n}`"></li>
    </ul>
    <div class="next" @click="onNextOrPrev('next')"></div>
  </div>
</template>

<script>
import { LoopEle } from '@/assets/js/util';

export default {
  props: {
    max: {
      type: Number,
      default: 8,
    },
    items: {
      type: Array,
      default: () => [],
    },
    onChose: {
      type: Function,
      default: () => {},
    },
    defaultActive: {
      type: Number,
      default: 0,
    },
    isLast: {
      type: Function,
      default: () => {},
    },
    isFirst: {
      type: Function,
      default: () => {},
    },
  },
  computed: {
    emptyItemsLen() {
      if (this.max > this.items.length) {
        return this.max - this.items.length;
      }
      return 0;
    },
  },
  data() {
    return {
      liWidth: 0,
      activeItem: 0,
    };
  },
  methods: {
    onChoseOne(e) {
      LoopEle(e, {
        LI: tar => {
          const index = tar.getAttribute('data-index');
          if (index && index !== '-' && Number(index) !== this.activeItem) {
            this.activeItem = Number(index);
            this.onChose(Number(index));
          }
        },
        UL: 'end',
      });
    },

    onNextOrPrev(type) {
      const index = this.activeItem;
      const newIndex = type === 'next' ? index + 1 : index - 1;

      if (!this.items[newIndex]) {
        if (type === 'next') {
          this.isLast();
        } else {
          this.isFirst();
        }
        return;
      }

      this.activeItem = newIndex;
      this.moveTo();
      this.onChose(newIndex);
    },

    // 将看不见的移动到可视区域
    moveTo() {
      this.$nextTick(() => {
        const items = this.$el.querySelector('.items');
        const activeItem = items.querySelector('.active');

        const totalScrollLeft = items.scrollLeft;
        const totalWidth = items.offsetWidth;
        const singleWidth = activeItem.offsetWidth;
        const singleOffsetLeft = activeItem.offsetLeft;

        if (singleOffsetLeft + singleWidth > totalScrollLeft + totalWidth) {
          items.scrollLeft = singleOffsetLeft + singleWidth - totalWidth;
        } else if (totalScrollLeft > singleOffsetLeft) {
          items.scrollLeft = totalScrollLeft - singleWidth;
        }
      });
    },
  },
  created() {
    this.activeItem = this.defaultActive;
    this.liWidth = (100 / this.max).toFixed(1);
  },
};
</script>


<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-week-tab {
  height: px2rem(70);
  display: flex;
  background-color: #fff;
  overflow: hidden;

  .prev,
  .next {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: px2rem(39);
    height: 100%;
    border-bottom: 1px solid $blue;
    box-sizing: border-box;
    position: relative;
    cursor: pointer;

    &:before {
      content: '';
      position: absolute;
      height: 100%;
      width: 1px;
      background-color: #eee;
      top: 0;
    }
    &:after {
      content: '';
      display: block;
      width: 0;
      height: 0;
      border-style: solid;
    }
  }
  .prev {
    &:after {
      border-width: px2rem(15) px2rem(15) px2rem(15) 0;
      border-color: transparent $blue transparent transparent;
    }
    &:before {
      right: -1px;
    }
    &:hover:after {
      border-color: transparent $lightBlue transparent transparent;
    }
  }
  .next {
    &:after {
      border-width: px2rem(15) 0 px2rem(15) px2rem(15);
      border-color: transparent transparent transparent $blue;
    }
    &:before {
      left: -1px;
    }
    &:hover:after {
      border-color: transparent transparent transparent $lightBlue;
    }
  }

  .items {
    cursor: pointer;
    height: 100%;
    display: flex;
    box-sizing: border-box;
    position: relative;
    z-index: 2;
    overflow: hidden;
    flex: 1 0 auto;

    li {
      width: 12.5%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      border-bottom: 1px solid $blue;
      border-top: 1px solid transparent;
      color: #999;
      box-sizing: border-box;
      flex-shrink: 0;

      &.active {
        background-color: #fff;
        border: 1px solid $blue;
        border-bottom-color: #fff;
        color: $blue;
      }

      &:not(.active):hover {
        color: $blue;
      }

      p {
        font-size: 14px;
        line-height: 1;

        &:first-child {
          margin-bottom: px2rem(8);
        }
      }
    }
  }
}
</style>
