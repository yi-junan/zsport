<template>
  <div class="limit p-order-details">
    <div class="wrap">
      <!-- 订单不存在 -->
      <div class="tips" v-if="!loading && !order.id && !unlogin">
        <span>{{ $t('ding_dan_bu_cun_zai') }} </span>
        <a @click="goBack">{{ $t('fan_hui') }}</a>
      </div>

      <!-- 还没登陆 -->
      <div class="tips" v-if="unlogin">
        <span>{{ $t('qing_xian_deng_lu') }} </span>
      </div>

      <div class="loading" v-if="loading && !unlogin">
        <Loading :width="45" :height="45" />
      </div>

      <div class="box">
        <div class="header">{{ $t('ding_dan_xin_xi') }}</div>
        <div class="order-msg" :class="{ 'no-after': !hasBtns }">
          <div class="left">
            <div class="title">{{ port }}</div>
            <ul class="msg">
              <li>
                <p class="key">{{ $t('ding_dan_zhuang_tai') }}</p>
                <p class="value">{{ orderStatus.msg }}</p>
                <div class="time-limit" v-if="hasCountDown">
                  {{ $t('jin_sheng') }}：{{ countDown }}
                </div>
              </li>
              <li v-if="hasCountDown">
                <div class="time-limit-tips">
                  <Icon name="tixing" />
                  <span>{{ $t('zhi_fu_chao_shi_ti_shi') }}</span>
                </div>
              </li>
              <li>
                <p class="key">{{ $t('ding_dan_hao') }}</p>
                <p class="value">{{ order.id }}</p>
              </li>
              <li>
                <p class="key">
                  {{ isRoundTrip ? $t('qu_cheng') : "" }}{{ $t('kai_chuan_shi_jian') }}
                </p>
                <p class="value">{{ goDate }}</p>
              </li>
              <li v-if="isRoundTrip">
                <p class="key">{{ $t('fan_cheng') }}{{ $t('kai_chuan_shi_jian') }}</p>
                <p class="value">{{ backDate }}</p>
              </li>
              <li>
                <p class="key">{{ $t('qu_piao_yan_zheng_ma') }}</p>
                <p class="value">{{ order.verificationCode }}</p>
              </li>
            </ul>
          </div>
          <div class="mid">
            <div class="info">
              <p>{{ $t('zong_jin_e') }}</p>
              <p>¥{{ order.totalPrice }}</p>
              <p>{{ $t('jin_e_ming_xi') }}</p>
              <Triangle dir="bottom" bgcol="#398ce5" :width="12" />
            </div>
            <ul class="price-details">
              <li>
                <p class="th">{{ $t('piao_jia') }}</p>
                <p class="td">¥{{ order.totalPrice }}</p>
              </li>
            </ul>
          </div>
          <div class="right" v-if="hasBtns">
            <div class="btn-group">
              <Button :text="$t('zhi_fu_ding_dan')" v-if="orderStatus.status === '2'" />
              <Button :text="$t('qu_xiao_ding_dan')" v-if="orderStatus.status === '2'" @handle="cancleOrder" :need-event="true" />
              <Button :text="$t('tui_piao')" v-if="orderStatus.status === '3'" />
              <Button :text="$t('shan_chu_ding_dan')" v-if="orderStatus.status === '99'" @handle="deleteOrder" :need-event="true" />
            </div>
          </div>
        </div>
      </div>

      <div class="box">
        <div class="header">{{ $t('cheng_ke_xin_xi') }}</div>
        <div class="passengers">
          <div class="item" v-for="(p, index) in passengers" :key="`${index}${p.id}`">
            <p class="index">{{ index + 1 }}</p>
            <ul class="keys">
              <li>{{ $t('xing_ming') }}</li>
              <li>{{ $t('zheng_jian_xin_xi') }}</li>
            </ul>
            <ul class="values">
              <li>{{ p.realName }}</li>
              <li :title="p.certNo">{{ getSecretStr(p.certNo) }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="box">
        <div class="header">{{ $t('lian_xi_ren') }}</div>
        <div class="contacts">
          <template v-if="order.phoneNo">
            <p class="key">{{ $t('shou_ji_hao_ma') }}</p>
            <p class="val" :title="order.phoneNo">{{ getSecretStr(order.phoneNo) }}</p>
          </template>
          <template v-if="order.email">
            <p class="key">{{ $t('you_xiang') }}</p>
            <p class="val" :title="order.email">{{ getSecretStr(order.email) }}</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/basic/Icon.vue';
import Loading from '@/components/basic/Loading.vue';
import Button from '@/components/basic/Button.vue';
import Triangle from '@/components/basic/Triangle.vue';
import model from '@/assets/js/axios';
import api from '@/assets/js/api';
import format from 'date-fns/format';
import dateFnsZh from 'date-fns/locale/zh_cn';
import { mapState } from 'vuex';
import uniqBy from 'lodash/uniqBy';
import { getSecretStr, noti } from '@/assets/js/util.js';
import subSeconds from 'date-fns/sub_seconds';
import isToday from 'date-fns/is_today';

export default {
  name: 'OrderDetails',
  components: { Icon, Button, Triangle, Loading },
  data() {
    return {
      loading: true,
      countDown: '',
      order: {},
    };
  },
  computed: {
    // 订单状态
    orderStatus() {
      const type = String(this.order.paymentType);
      let msg;
      if (type === '1') {
        msg = this.$i18n.t('yi_zhi_fu_chu_piao_shi_bai');
      } else if (type === '2') {
        msg = this.$i18n.t('wei_zhi_fu');
      } else if (type === '3') {
        msg = this.$i18n.t('yi_zhi_fu');
      } else if (type === '4') {
        msg = this.$i18n.t('tui_piao_zhong');
      } else if (type === '5') {
        msg = this.$i18n.t('tui_piao_shi_bai');
      } else if (type === '6') {
        msg = this.$i18n.t('tui_piao_cheng_gong_tui_kuang_shi_bai');
      } else if (type === '7') {
        msg = this.$i18n.t('tui_piao_cheng_gong');
      } else {
        msg = this.$i18n.t('yi_qu_xiao');
      }
      return { status: type, msg };
    },

    // 是否往返
    isRoundTrip() {
      if (!this.order.data) {
        return false;
      }
      return !!this.order.data[2];
    },

    // 去程出发时间
    goDate() {
      if (!this.order.data) {
        return '';
      }
      return format(this.order.data[1].sailingTime, 'YYYY-MM-DD ddd HH:mm', {
        locale: dateFnsZh,
      });
    },

    // 回程出发时间
    backDate() {
      if (!this.isRoundTrip) {
        return '';
      }
      return format(this.order.data[2].sailingTime, 'YYYY-MM-DD ddd HH:mm', {
        locale: dateFnsZh,
      });
    },

    // 港口信息
    port() {
      if (!this.order.data) {
        return '';
      }
      let port;
      if (this.lang === 'en') {
        port = this.order.data[1].lineCodeEName;
      } else {
        port = this.order.data[1].lineCodeCName;
      }
      port = port.split('——');

      return port.join('-');
    },

    // 还没登陆
    unlogin() {
      return !this.loginLoading && !this.userData.id;
    },

    // 是否存在操作按钮
    hasBtns() {
      return (
        this.orderStatus.status === '2' || this.orderStatus.status === '99'
      );
    },

    // 乘客信息，通过证件类型和号码过滤人
    passengers() {
      const { data } = this.order;
      let loopData = [];

      if (data && data[1] && data[1].data) {
        loopData = loopData.concat(data[1].data);
      }
      if (data && data[2] && data[2].data) {
        loopData = loopData.concat(data[2].data);
      }

      return uniqBy(loopData, item => [item.certType, item.certNo].join(' '));
    },

    // 是否存在倒计时
    hasCountDown() {
      return !!(this.order.timeDifference && this.orderStatus.status === '2');
    },

    ...mapState({
      lang: state => state.status.lang,
      loginLoading: state => state.login.loading,
      userData: state => state.login.userData,
    }),
  },
  watch: {
    loginLoading: {
      handler() {
        if (!this.loginLoading && this.userData.id) {
          const { id } = this.$route.query;
          if (id) {
            this.fetchOrder(id);
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    // 获取订单信息
    async fetchOrder(argId) {
      let res;
      this.loading = true;
      try {
        res = await model.get(api.getOrder, { id: argId });
      } catch (e) {
        this.loading = false;
        return;
      }
      this.loading = false;
      if (res.data && res.data[0]) {
        this.order = Object.assign({ ...res.data[0] });
        if (this.hasCountDown) {
          this.startCountDown(this.order.timeDifference);
        }
      }
    },

    // 返回上一页
    goBack() {
      this.$router.go(-1);
    },

    // 加密字符串
    getSecretStr(argStr) {
      return getSecretStr(argStr);
    },

    // 开启倒计时
    startCountDown(argDate) {
      const today = format(Date.now(), 'YYYY-MM-DD');
      this.countDown = argDate;
      this.timer = setInterval(() => {
        let countDown = subSeconds(`${today} ${this.countDown}`, 1);
        if (!isToday(countDown)) {
          this.order.paymentType = '99';
          clearInterval(this.timer);
        } else {
          this.countDown = format(countDown, 'HH:mm:ss');
        }
      }, 1000);
    },

    // 取消订单
    async cancleOrder() {
      this.$store.dispatch('toggleGlobalLoading', {
        text: this.$i18n.t('tips.order[5]'),
        loading: 1,
      });
      try {
        await model.post(api.cancelOrder, { id: this.order.id });
      } catch (e) {
        this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
        noti(e.error || this.$i18n.t('tips.order[6]'));
        return;
      }
      this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
      this.order.paymentType = '99';
      clearInterval(this.timer);
    },

    // 删除订单
    async deleteOrder() {
      this.$store.dispatch('toggleGlobalLoading', {
        text: this.$i18n.t('tips.order[8]'),
        loading: 1,
      });
      try {
        await model.post(api.deleteOrder, { id: this.order.id });
      } catch (e) {
        this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
        noti(e.error || this.$i18n.t('tips.order[7]'));
        return;
      }
      this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
      this.order = {};
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.p-order-details {
  padding-top: px2rem(46);
  padding-bottom: px2rem(90);

  .wrap {
    position: relative;
  }
}

.box {
  background-color: #fff;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
  .header {
    padding: px2rem(29) px2rem(28) px2rem(19) px2rem(28);
    color: #333;
    @include fontSizeRespond(26, 22);
    border-bottom: 1px solid #ddd;
  }
}

.order-msg {
  display: flex;
  padding: px2rem(30) px2rem(28) px2rem(30) px2rem(28);
  width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;

  &.no-after:after {
    display: none;
  }
  &:after {
    content: '';
    display: block;
    order: 2;
    min-height: 50px;
    width: 1px;
    background-color: #eee;
    margin-left: px2rem(30);
    flex: none;
  }
  .left {
    order: 0;
    flex: 1 1 auto;

    .title {
      @include fontSizeRespond(20, 18);
      color: $blue;
      margin-bottom: px2rem(24);
    }
    .msg {
      width: 100%;

      & > li {
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-bottom: px2rem(17);

        &:last-child {
          margin-bottom: 0;
        }
        .key {
          width: 129px;
          color: #999;
        }
        .value {
          color: #333;
        }
        .time-limit {
          color: $blue;
          padding-left: px2rem(30);
        }
        .time-limit-tips {
          padding-left: 11px;
          padding-right: 11px;
          margin-left: 129px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #eff7ff;
          border: solid 1px $blue;
          font-size: 12px;
          color: #333;

          /deep/ .iconfont {
            font-size: 12px;
            color: $blue;
            margin-right: 4px;
          }
        }
      }
    }
  }
  .mid {
    white-space: nowrap;
    flex: 0 1 auto;
    order: 1;

    .info {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #333;

      p:last-of-type {
        color: $blue;
        padding-left: px2rem(25);
        padding-right: px2rem(4);
      }
      p:nth-child(2) {
        @include fontSizeRespond(30, 26);
        color: $orange;
        margin-left: px2rem(8);
        margin-right: px2rem(8);
      }
    }
    .price-details {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      text-align: center;
      padding-top: 9px;

      li:last-child p:last-child {
        border-right: 1px solid #eee;
      }
      p {
        padding: 8px 25px;

        &:last-child {
          border-bottom: 1px solid #eee;
          border-left: 1px solid #eee;
        }
        &.th {
          background-color: #eeeeee;
          font-size: 14px;
          color: #333;
        }
        &.td {
          font-size: 14px;
          color: $orange;
        }
      }
    }
  }
  .right {
    order: 3;
    flex: 0 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: px2rem(270);
    padding-left: px2rem(30);
    box-sizing: border-box;

    .btn-group {
      /deep/ .cp-btn {
        display: block;
        width: 100px;
        height: 30px;
        font-size: 14px;
        border-radius: 4px;

        &:first-child {
          margin-bottom: 10px;
        }
        &:last-child {
          border: solid 1px #eeeeee;
          background-color: #fff;
          color: #999;
          &:hover {
            border-color: #999;
          }
        }
      }
    }
  }
}

.passengers {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  white-space: nowrap;

  .item {
    width: 33.3333%;
    padding: px2rem(30);
    display: flex;
    align-items: center;
    box-sizing: border-box;

    .index {
      height: 30px;
      width: 30px;
      line-height: 30px;
      text-align: center;
      background-color: #eff7ff;
      color: $blue;
      @include fontSizeRespond(20, 16);
      border-radius: 100%;
      margin-right: px2rem(22);
      flex: 0 0 auto;
    }
    ul {
      overflow: hidden;
      li {
        font-size: 14px;
        line-height: 1.1;

        &:first-child {
          margin-bottom: px2rem(14);
        }
      }
    }
    .keys {
      color: #999;
      margin-right: px2rem(21);
      flex: 0 0 auto;
      li:first-child {
        margin-bottom: px2rem(14);
      }
    }
    .values {
      color: #333;
      flex: 1 1 auto;
      li {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.contacts {
  display: flex;
  padding: px2rem(30);
  width: 100%;
  box-sizing: border-box;

  .key {
    font-size: 14px;
    margin-right: px2rem(35);
    color: #999;
  }
  .val {
    font-size: 14px;
    color: #333;
    &:nth-child(2) {
      margin-right: px2rem(256);
    }
  }
}

.tips {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  background-color: rgba(255, 255, 255, 0.9);
  @include fontSizeRespond(20, 18);
  a {
    cursor: pointer;
    color: $blue;
    margin-left: 10px;
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
}
</style>
