<template>
  <div class="cp-selected-trip">
    <MessageBox :title="title">
      <div slot="content" v-show="tripData.fromPort">
        <ul class="text-group">
          <li>{{ tripData.fromPort }}-{{ tripData.toPort }}</li>
          <li>{{ $t('chu_fa_shi_jian') }}：{{ tripData.departureDate }} {{ getDay(tripData.departureDate) }} {{ tripData.departureTime }}</li>
          <li class="inline-block">
            <span>{{ tripData.selSeat ? tripData.selSeat.name : '' }}</span>
            <span v-for="p in tripData.selSeat ? tripData.selSeat.price : []" :key="p.id">
              {{ p.key }}¥{{ p.val }}
            </span>
          </li>
        </ul>
        <button class="chose" @click="onClear">
          {{ $t('chong_xin_xuan_ze_hang_ban') }}
        </button>
      </div>
    </MessageBox>
  </div>

</template>

<script>
// 展示选中的去程或返程
import MessageBox from '@/components/MessageBox.vue';
import getDay from 'date-fns/get_day';

export default {
  components: { MessageBox },
  props: {
    tripData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    title: {
      type: String,
      default: '',
    },
  },
  methods: {
    onClear() {
      this.$emit('clear');
    },

    // 获取星期几
    getDay(argDate) {
      const week = {
        1: this.$i18n.t('zhou_yi'),
        2: this.$i18n.t('zhou_er'),
        3: this.$i18n.t('zhou_san'),
        4: this.$i18n.t('zhou_si'),
        5: this.$i18n.t('zhou_wu'),
        6: this.$i18n.t('zhou_liu'),
        0: this.$i18n.t('zhou_ri'),
      };
      return week[getDay(argDate)];
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/css/color.scss';
@import '../assets/css/util.scss';

.cp-selected-trip /deep/ .cp-message-box {
  background-color: #fff;

  .content {
    padding: px2rem(19) px2rem(17) px2rem(83) px2rem(26);
  }

  .text-group {
    color: #999;
    line-height: 1.875;
    @include fontSizeRespond(16);

    .inline-block {
      font-size: 0;
      span {
        @include fontSizeRespond(16);
        display: inline-block;
        vertical-align: middle;
        margin-right: px2rem(5);

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  .chose {
    font-size: 14px;
    color: $blue;
    background: transparent;
    outline: none;
    border: none;
    display: inline-block;
    cursor: pointer;
    padding: 0;
    position: absolute;
    bottom: px2rem(19);
    right: px2rem(17);
    line-height: 1;

    &:hover {
      color: $lightBlue;
    }
  }
}
</style>
