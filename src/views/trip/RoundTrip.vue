<template>
  <div class="roundTrip limit">
    <!-- 操作进度 -->
    <Progress active="1" />

    <div class="wrap">
      <div class="left">
        <!-- 去程，返程切换 -->
        <keep-alive>
          <Selector :params="params.go" :tableSize="[13, 26, 50, 0]" :weekTabMax="5" :type="2" :btn-name="$t('she_wei_qu_cheng')" key="go" v-if="status === 1" @onSelected="onSelectedGo" />
          <Selector :params="params.back" :tableSize="[13, 26, 50, 0]" :weekTabMax="5" :type="2" :btn-name="$t('she_wei_fan_cheng')" key="back" v-if="status === 2" @onSelected="onSelectedBack" />
        </keep-alive>
      </div>
      <div class="right">
        <SelectedTrip :title="$t('qu_cheng')" :trip-data="selGo" @clear="clearGoRoute" key="selGo" />
        <SelectedTrip :title="$t('fan_cheng')" :trip-data="selBack" @clear="clearBackRoute" key="selBack" />

        <div class="sure-btn">
          <Button :text="$t('que_ren_xuan_ze')" :disabled="!finish" :need-event="true" @handle="goOrderDetail" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Button from '@/components/basic/Button.vue';
import Progress from '@/components/Progress.vue';
import SelectedTrip from '@/components/SelectedTrip.vue';
import Selector from './Selector.vue';
import findIndex from 'lodash/findIndex';
import isEmpty from 'lodash/isEmpty';
import compareAsc from 'date-fns/compare_asc';
import { noti } from '@/assets/js/util';
import storage from '@/assets/js/storage/storage';
import { CACHE_TRIP } from '@/assets/js/constant';
import { mapState } from 'vuex';

export default {
  name: 'RoundTrip',
  components: {
    Button,
    Progress,
    SelectedTrip,
    Selector,
  },
  data() {
    return {
      params: {
        go: {
          star: 0,
          end: 0,
          date: 0,
        },
        back: {
          start: 0,
          end: 0,
          date: 0,
        },
      },
      selGo: {},
      selBack: {},
      queryForNext: {},
    };
  },
  computed: {
    // 1: 选择去程 2: 选择回程
    status() {
      if (isEmpty(this.selGo)) {
        return 1;
      }
      return 2;
    },

    // 是否选择完毕
    finish() {
      return !isEmpty(this.selGo) && !isEmpty(this.selBack);
    },

    ...mapState({
      user: state => state.login.userData,
      showLoginBox: state => state.status.showLoginBox,
      skipLogin: state => state.status.skipLogin,
    }),
  },
  watch: {
    // 登陆窗口关闭并且存在跳过登陆标志自动前往订单详情
    showLoginBox(val) {
      if (!val && this.skipLogin) {
        this.$router.push({
          path: '/create_order',
          query: { ...this.queryForNext },
        });
      }
    },
    // 登陆过后自动前往订单详情
    'user.id'(id) {
      if (id) {
        this.$router.push({
          path: '/create_order',
          query: { ...this.queryForNext },
        });
      }
    },
  },
  methods: {
    // 选择去程
    onSelectedGo(argMsg, argSeatId) {
      const seats = argMsg.seats;
      const hit = findIndex(seats, seat => seat.id === argSeatId);
      this.selGo = Object.assign({}, { selSeat: seats[hit] }, { ...argMsg });
      storage.updateChild(CACHE_TRIP, 'go', {
        data: argMsg,
        selSeat: seats[hit],
      });
    },

    // 选择回程
    onSelectedBack(argMsg, argSeatId) {
      if (compareAsc(argMsg.departureDate, this.selGo.departureDate) === -1) {
        noti(this.$i18n.t('tips.pageTrip[4]'));
        return;
      }
      const seats = argMsg.seats;
      const hit = findIndex(seats, seat => seat.id === argSeatId);
      this.selBack = Object.assign({}, { selSeat: seats[hit] }, { ...argMsg });
      storage.updateChild(CACHE_TRIP, 'back', {
        data: argMsg,
        selSeat: seats[hit],
      });
    },

    // 清空已选线路
    clearGoRoute() {
      this.selGo = {};
      this.selBack = {};
    },
    clearBackRoute() {
      this.selBack = {};
    },

    // 确认选择，前往订单详情页面
    goOrderDetail() {
      if (!this.finish) {
        return;
      }
      const { query } = this.$route;
      const params = {
        from: 'round_trip',
        start: query.start,
        end: query.end,
        date: new Date(this.selGo.departureDate).getTime(),
        back_date: new Date(this.selBack.departureDate).getTime(),
      };
      if (this.user.id) {
        this.$router.push({ path: '/create_order', query: { ...params } });
      } else {
        this.queryForNext = params;
        this.$store.dispatch('toggleLoginBox');
      }
    },
  },
  created() {
    const { query } = this.$route;
    this.params.go = {
      start: query.start,
      end: query.end,
      date: query.date,
    };
    this.params.back = {
      start: query.end,
      end: query.start,
      date: query.back_date,
    };
  },
  beforeDestroy() {
    this.$store.dispatch('updateSkipLogin', false);
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.roundTrip {
  padding-bottom: px2rem(46);
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;

  /deep/ .cp-progress {
    padding-top: px2rem(46);
    padding-bottom: px2rem(34);
    flex: none;
  }

  /deep/ .cp-message-box {
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

  /deep/ .cp-selector {
    height: 100%;
  }

  .sure-btn {
    button {
      width: 100%;
      @include fontSizeRespond(24);
      height: px2rem(50);
    }
  }
}

.wrap {
  display: flex;
  width: 100%;
  flex: 1 0 auto;

  .left {
    flex: 1 1 auto;
  }

  .right {
    min-width: 300px;
    width: px2rem(400);
    padding-left: px2rem(20);
    box-sizing: border-box;
    flex: 0 1 auto;

    & > * {
      margin-top: px2rem(20);

      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
