<template>
  <div class="cp-dropdown" @click="onToggle" :class="{ 'active': open }">
    <div class="head">
      <span class="title" :class="{ 'placeholder': !current.name }">
        {{ current.name ? current.name : placeholder }}
      </span>
      <Triangle dir="bottom" />
    </div>
    <ul class="content" v-show="open" @click.stop="onChose">
      <li class="loading" v-if="loading">
        <Loading />
      </li>
      <li v-for="d in data" :data-id="d.id" :class="{ 'active': isActive(d.id) }" :key="d.id">{{ d.name }}</li>
    </ul>
  </div>
</template>

<script>
import Triangle from '@/components/basic/Triangle.vue';
import { LoopEle } from '@/assets/js/util.js';
import Loading from '@/components/basic/Loading.vue';

export default {
  components: {
    Triangle,
    Loading,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    // 没有选中时显示的内容
    placeholder: {
      type: String,
      default: '',
    },
    // 循环体
    data: {
      type: Array,
      default: () => [],
    },
    // 默认选中项
    defaultId: {
      type: [String, Number],
      default: '',
    },
    // 选中回掉
    onChoseBack: {
      type: Function,
      default: () => {},
    },
    // 选中后是否收起
    closeAfterChose: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    current() {
      let cur = {};
      this.data.some(item => {
        if (String(item.id) === String(this.activeId)) {
          cur = item;
          return true;
        }
        return false;
      });
      return cur;
    },
  },
  data() {
    return {
      open: false,
      activeId: String(this.defaultId),
    };
  },
  methods: {
    onToggle() {
      this.open = !this.open;
    },

    isActive(argId) {
      return String(this.activeId) === String(argId);
    },

    changeActive(argId) {
      this.activeId = argId;
    },

    onChose(e) {
      LoopEle(e, {
        LI: tar => {
          const id = tar.getAttribute('data-id');
          this.changeActive(id);
          this.onChoseBack(id, this.$el);

          if (this.closeAfterChose) {
            this.open = false;
          }
        },
        UL: 'end',
      });
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-dropdown {
  position: relative;

  .head {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    font-size: 12px;
    background-color: #f8f8f8;
    cursor: pointer;
    border-radius: 4px;
    padding-left: px2rem(10);
    padding-right: px2rem(10);
    width: 100%;

    .title {
      flex: 1 0 auto;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: block;
      padding-right: px2rem(10);
      box-sizing: border-box;
      margin-left: auto;

      &.placeholder {
        color: #ccc;
      }
    }
    /deep/ .cp-triangle {
      margin-left: auto;
      flex: none;
    }
  }

  .content {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 2;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border-top: 1px solid #eee;
    background-color: #f8f8f8;
    max-height: 200px;
    -ms-scroll-chaining: none;
    overscroll-behavior: contain;
    overflow-y: auto;

    li {
      line-height: 1.5;
      width: 100%;
      cursor: pointer;
      font-size: 14px;
      padding: 5px 0;
      color: #888;

      &:last-child {
        border-bottom: none;
      }
      &:hover,
      &.active {
        color: $blue;
      }
    }
  }

  /deep/ .cp-loading {
    margin: 0 auto;
  }
}
</style>
