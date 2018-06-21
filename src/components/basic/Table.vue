<template>
  <div class="cp-table">
    <table :class="customer" @click="$emit('onTable', $event)">
      <thead>
        <slot name="th"></slot>
      </thead>
      <tbody>
        <slot name="td"></slot>
      </tbody>
    </table>
    <p class="emptyTips" v-if="emptyTips">{{ emptyTips }}</p>
    <div class="loading" v-if="loading">
      <Loading :width="40" :height="40" />
    </div>
  </div>
</template>

<script>
import Loading from '@/components/basic/Loading.vue';

export default {
  components: {
    Loading,
  },
  props: {
    customer: {
      type: String,
      default: '',
    },
    emptyTips: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-table {
  width: 100%;
  display: flex;
  flex-direction: column;
}

table {
  width: 100%;
  text-align: center;
  border-collapse: inherit;
  flex: none;
  background-color: #fff;

  thead,
  tbody,
  tr {
    width: 100%;
  }

  thead {
    background-color: #f8f8f8;

    th {
      @include fontSizeRespond(16);
      height: px2rem(36);
      min-height: 30px;
      color: $blue;
      vertical-align: middle;
      white-space: nowrap;
      overflow: hidden;
    }
  }

  tbody {
    tr:last-child td {
      border: none;
    }

    td {
      border-bottom: 1px solid #eee;
      vertical-align: middle;
    }
  }
}

.emptyTips {
  @include fontSizeRespond(20);
  color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  flex: 1 0 auto;
}

.loading {
  background-color: #fff;
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
