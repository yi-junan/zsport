<template>
  <div class="one-way limit">
    <!-- 操作进度 -->
    <Progress active="1" />

    <Selector :tableSize="[10, 30, 13, 34, 13]" :params="params" @onSelected="onSelected" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Selector from './Selector.vue';
import Progress from '@/components/Progress.vue';
import getDay from 'date-fns/get_day';
import findIndex from 'lodash/findIndex';
import storage from '@/assets/js/storage/storage';
import { CACHE_TRIP } from '@/assets/js/constant';

export default {
  name: 'OneWay',
  components: {
    Selector,
    Progress,
  },
  data() {
    return {
      times: 0,
      params: {
        start: 0,
        end: 0,
        date: 0,
      },
      queryForNext: {},
    };
  },
  computed: {
    ...mapState({
      user: state => state.login.userData,
      showLoginBox: state => state.status.showLoginBox,
      skipLogin: state => state.status.skipLogin,
    }),
  },
  watch: {
    // 登陆窗口关闭并且存在跳过登陆标志
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
    async onSelected(argMsg, argSeatId) {
      const seats = argMsg.seats;
      const hit = findIndex(seats, seat => seat.id === argSeatId);
      const { query } = this.$route;
      const params = {
        ...query,
        from: 'one_way',
        date: new Date(argMsg.departureDate).getTime(),
      };
      await storage.setItem(CACHE_TRIP, {
        go: { data: argMsg, selSeat: seats[hit] },
      });
      if (this.user.id) {
        this.$router.push({ path: '/create_order', query: { ...params } });
      } else {
        this.queryForNext = params;
        this.$store.dispatch('toggleLoginBox');
      }
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
  created() {
    let { query } = this.$route;
    const airline = query.airline ? JSON.parse(query.airline) : null;
    this.params = {
      start: query.start,
      end: query.end,
      date: query.date,
    };
    if (airline) {
      this.params = Object.assign({}, this.params, { airline, isAirline: 1 });
    }
  },
  beforeDestroy() {
    this.$store.dispatch('updateSkipLogin', false);
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.one-way {
  position: relative;
  padding-top: px2rem(46);
  padding-bottom: px2rem(46);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  /deep/ .cp-progress {
    margin-bottom: px2rem(34);
    flex: none;
  }
  /deep/ .cp-selector {
    flex: 1 0 auto;
  }
}
</style>
