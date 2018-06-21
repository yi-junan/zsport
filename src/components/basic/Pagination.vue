<template>
  <div class="cp-pagination">
    <button type="button" class="btn-page" :disabled="currentPage == 1" @click.prevent="onChangePage('prev')">上一页</button>

    <button type="button" class="btn-page" :class="{'is-active': currentPage == 1}" v-show="showPrev" @click.prevent="onChangePage('spec', 1)">1</button>

    <span class="btn-page disabled omit" v-show="showPrev">...</span>

    <button type="button" class="btn-page" :class="[
              index + diff == currentPage ? 'is-active' : '',
              index + diff != currentPage ? 'hidden-xs-down' : ''
            ]" v-for="(item, index) in pageLinks" :key="index" @click.prevent="onChangePage('spec', index + diff)">{{ index + diff }}</button>

    <span class="btn-page disabled omit" v-show="showNext">...</span>

    <button type="button" class="btn-page" :class="{'is-active': numberOfPages == currentPage}" v-show="showNext" @click.prevent="onChangePage('spec', numberOfPages)">{{ numberOfPages }}</button>

    <button type="button" class="btn-page" :disabled="currentPage == numberOfPages" @click.prevent="onChangePage('next')">下一页</button>
  </div>
</template>

<script>
export default {
  props: {
    // 最多显示多少条
    limit: {
      type: Number,
      default: 8,
    },
    // 每页多少条
    pageSize: {
      type: Number,
      default: 10,
    },
    // 总共数量
    totalRows: {
      type: Number,
      default: 10,
    },
    // 点击回掉
    changePage: {
      type: Function,
      default: () => {},
    },
    defaultPage: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      diff: 1,
      showPrev: false,
      showNext: false,
      pageLinks: 1,
      currentPage: this.defaultPage,
    };
  },
  watch: {
    defaultPage(argPage) {
      this.currentPage = argPage;
      this.pageLinks = this.setPageLinks();
    },
    totalRows() {
      this.pageLinks = this.setPageLinks();
    },
  },
  computed: {
    numberOfPages() {
      const result = Math.ceil(this.totalRows / this.pageSize);
      return result < 1 ? 1 : result;
    },
  },
  methods: {
    onChangePage(argType, argPage) {
      switch (argType) {
        // 上一页
        case 'prev': {
          if (this.currentPage === 1) {
            return;
          }
          this.currentPage -= 1;
          break;
        }
        // 下一页
        case 'next': {
          if (this.currentPage === this.numberOfPages) {
            return;
          }
          this.currentPage += 1;
          break;
        }
        // 某一页
        default: {
          this.currentPage = argPage;
        }
      }
      this.pageLinks = this.setPageLinks();
      this.changePage(this.currentPage);
    },

    setPageLinks() {
      let result = this.limit;
      if (this.currentPage > this.numberOfPages) {
        this.currentPage = 1;
      }
      this.diff = 1;
      this.showPrev = false;
      this.showNext = false;
      if (this.numberOfPages <= this.limit) {
        return this.numberOfPages;
      }
      if (this.currentPage <= this.limit - 2) {
        this.diff = 1;
        this.showNext = true;
        result = this.limit - 2;
      }
      if (this.currentPage > this.numberOfPages - this.limit + 2) {
        this.diff = this.numberOfPages - this.limit + 3;
        this.showPrev = true;
        result = this.limit - 2;
      }
      if (
        this.currentPage >= this.limit - 2 &&
        this.currentPage <= this.numberOfPages - this.limit + 3
      ) {
        this.diff = this.currentPage - 1;
        this.showPrev = true;
        this.showNext = true;
        result = this.limit - 4;
      }

      return result;
    },
  },
  created() {
    this.pageLinks = this.setPageLinks();
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-pagination {
  text-align: center;
  padding: px2rem(20) 0;
}

.btn-page {
  color: #999;
  font-size: 14px;
  background-color: transparent;
  min-width: 30px;
  line-height: 20px;
  border: none;
  outline: none;
  cursor: pointer;

  &.is-active {
    color: $blue;
    font-weight: bold;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.2;
  }
}
</style>
