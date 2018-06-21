<template>
  <div class="p-orders">
    <SwitchTab :tabs="tabs" :defaultTab="currentSwitchTab" :onClick="onSwitchTab" :type="3" />

    <div class="table-wrap">
      <table class="table">
        <tbody>
          <tr v-for="order in curOrders" :key="order.id" v-if="order.id">
            <td>
              <p class="port-name">
                <span v-if="order.backDate">({{ $t('wang_fan') }})</span>
                {{ order.port.start }}—{{ order.port.end }}
              </p>
              <p>{{ order.goDate }}</p>
              <p v-if="order.backDate">{{ order.backDate }}</p>
            </td>
            <td>{{ $t('qu_piao_yan_zheng_ma') }}：{{ order.captcha }}</td>
            <td>{{ order.tickets }}{{ $t('zhang') }}</td>
            <td>
              <p class="orange">¥{{ order.price }}</p>
            </td>
            <td>
              <p>{{ order.status.msg }}</p>
              <router-link class="link" :to="{ path: '/order_details', query: { id: order.id } }">
                {{ $t('ding_dan_xiang_qing') }}
              </router-link>
            </td>
            <td @click="onOrder">
              <Button :text="$t('zhi_fu')" v-if="order.status.status === '2'" :data-id="order.id" data-type="pay" />
              <Button :text="$t('qu_xiao')" v-if="order.status.status === '2'" :data-id="order.id" data-type="cancel" />
              <Button :text="$t('tui_piao')" v-if="order.status.status === '3'" :data-id="order.id" data-type="refund" />
              <Button :text="$t('shan_chu')" v-if="order.status.status === '99'" :data-id="order.id" data-type="delete" />
            </td>
          </tr>
        </tbody>
      </table>
      <div class="loading" v-show="loading">
        <Loading :width="45" :height="45" />
      </div>

      <div class="empty" v-if="!loading && curOrders.length === 0">
        {{ $t('zan_wu_ding_dan') }}
      </div>
    </div>

    <Pagination :total-rows="curRows" v-if="curRows > limit" :change-page="onPage" :default-page="curTabPage.page" :page-size="limit" />

    <!-- 透明遮罩，为了不让用户进行操作 -->
    <div class="shadow" v-show="loading"></div>
  </div>
</template>

<script>
import SwitchTab from '@/components/SwitchTab.vue';
import Button from '@/components/basic/Button.vue';
import Loading from '@/components/basic/Loading.vue';
import Pagination from '@/components/basic/Pagination.vue';
import { LoopEle, noti } from '@/assets/js/util.js';
import model from '../../assets/js/axios.js';
import api from '../../assets/js/api.js';
import { mapState } from 'vuex';
import map from 'lodash/map';
import findIndex from 'lodash/findIndex';
import format from 'date-fns/format';
import dateFnsZh from 'date-fns/locale/zh_cn';
import filter from 'lodash/filter';
import size from 'lodash/size';

export default {
  name: 'Orders',
  components: {
    Button,
    SwitchTab,
    Pagination,
    Loading,
  },
  data() {
    return {
      loading: false,
      currentSwitchTab: 0,
      // 我的订单
      rawData: [],
      orders: [],
      // 缓存历史记录
      rawDataCache: { all: {}, paid: {}, nonPayment: {} },
      // 当前页
      pages: {
        all: {
          page: 1,
        },
        paid: {
          page: 1,
        },
        nonPayment: {
          page: 1,
        },
      },
      // 每页显示条数
      limit: 3,
    };
  },
  computed: {
    tabs() {
      return [
        { index: 'all', name: this.$i18n.t('quan_bu_ding_dan') },
        { index: 'paid', name: this.$i18n.t('yi_zhi_fu') },
        { index: 'nonPayment', name: this.$i18n.t('wei_zhi_fu') },
      ];
    },
    // 当前tab分页记录总数
    curRows() {
      const key = this.curTab.index;
      const cache = this.rawDataCache[key];

      return cache.total || 0;
    },
    // 当前模块
    curTab() {
      return this.tabs[this.currentSwitchTab];
    },
    // 当前模块对应的分页数据
    curTabPage() {
      const key = this.curTab.index;
      const page = this.pages[key];

      return page;
    },
    // 当前订单
    curOrders() {
      const getPort = arg => {
        const data = this.lang === 'en' ? arg.lineCodeEName : arg.lineCodeCName;
        const names = data.split('——');
        return { start: names[0], end: names[1] };
      };
      const getStatus = arg => {
        let msg;
        if (arg === '99') {
          msg = this.$i18n.t('yi_qu_xiao');
        } else if (arg === '-1') {
          msg = this.$i18n.t('yi_shan_chu');
        } else if (arg === '1') {
          msg = this.$i18n.t('yi_zhi_fu_chu_piao_shi_bai');
        } else if (arg === '2') {
          msg = this.$i18n.t('wei_zhi_fu');
        } else if (arg === '3') {
          msg = this.$i18n.t('yi_zhi_fu');
        } else if (arg === '4') {
          msg = this.$i18n.t('tui_piao_zhong');
        } else if (arg === '5') {
          msg = this.$i18n.t('tui_piao_shi_bai');
        } else if (arg === '6') {
          msg = this.$i18n.t('tui_piao_cheng_gong_tui_kuang_shi_bai');
        } else if (arg === '7') {
          msg = this.$i18n.t('tui_piao_cheng_gong');
        }
        return { status: arg, msg };
      };
      const getDate = arg => {
        if (arg && arg.sailingTime) {
          return format(arg.sailingTime, 'YYYY-MM-DD ddd HH:mm', {
            locale: dateFnsZh,
          });
        }
        return null;
      };
      return map(this.rawData, item => {
        return {
          id: item.id,
          port: getPort(item.data[1]),
          captcha: item.verificationCode,
          tickets: item.totalNum,
          price: item.totalPrice,
          status: getStatus(item.paymentType),
          goDate: getDate(item.data[1]),
          backDate: getDate(item.data[2]),
        };
      });
    },
    // 发送查询请求时，从第几条开始获取新的数据
    start() {
      const key = this.curTab.index;
      const cache = this.rawDataCache[key];
      return {
        // 所有记录数
        all: (this.curTabPage.page - 1) * this.limit,
        // 排除标记为删除的记录数
        withoutDel: size(filter(cache.data, item => item.paymentType !== '-1')),
        // 所有未支付的记录数
        nonPayment: size(filter(cache.data, item => item.paymentType === '2')),
        // 所有已支付的记录数
        paid: size(filter(cache.data, item => item.paymentType === '3')),
      };
    },
    // 对应查询全部订单/已支付/未支付接口的start
    curStart() {
      let num = 0;
      if (this.currentSwitchTab === 1) {
        num = this.start.paid;
      } else if (this.currentSwitchTab === 2) {
        num = this.start.nonPayment;
      } else {
        num = this.start.withoutDel;
      }
      return num;
    },
    ...mapState({
      lang: state => state.status.lang,
    }),
  },
  methods: {
    // 切换导航
    onSwitchTab(argIndex) {
      this.currentSwitchTab = argIndex;
      this.rawData = [];
      this.getAllOrders(argIndex);
    },

    // 查找对应的订单记录
    findOrder(argId) {
      const hit = findIndex(
        this.orders,
        item => String(item.id) === String(argId),
      );
      return this.orders[hit];
    },

    // 退票
    refundTicket() {},

    // 去支付
    goPay() {},

    // 删除订单
    async delOrder(argId) {
      this.$store.dispatch('toggleGlobalLoading', {
        text: this.$i18n.t('tips.order[8]'),
        loading: 1,
      });
      try {
        await model.post(api.deleteOrder, { id: argId });
      } catch (e) {
        this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
        noti(e.error || this.$i18n.t('tips.order[7]'));
        return;
      }
      this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
      this.updateOrderById(argId, '-1');
    },

    // 取消订单
    async cancleOrder(argId) {
      this.$store.dispatch('toggleGlobalLoading', {
        text: this.$i18n.t('tips.order[5]'),
        loading: 1,
      });
      try {
        await model.post(api.cancelOrder, { id: argId });
      } catch (e) {
        this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
        noti(e.error || this.$i18n.t('tips.order[6]'));
        return;
      }
      this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
      this.updateOrderById(argId, '99');
    },

    // 点击订单列表某个地方
    onOrder(e) {
      LoopEle(e, {
        BUTTON: tar => {
          const type = tar.getAttribute('data-type');
          const id = tar.getAttribute('data-id');

          if (type === 'pay') {
            this.goPay(id);
          } else if (type === 'cancel') {
            this.cancleOrder(id);
          } else if (type === 'refund') {
            this.refundTicket(id);
          } else if (type === 'delete') {
            this.delOrder(id);
          }
        },
        TD: 'end',
      });
    },

    // 获取订单记录
    async getAllOrders(argType) {
      if (this.useCache() || this.loading) {
        return;
      }
      let res;
      const params = {
        start: this.curStart,
        limit: this.limit,
      };
      if (argType > 0) {
        params.type = argType;
      }
      this.loading = true;
      try {
        res = await model.get(api.getAllOrders, params);
      } catch (e) {
        this.loading = false;
        noti(e.error || this.$i18n.t('tips.order[4]'));
        return;
      }

      this.loading = false;
      const { data, count } = res;
      this.save2cache(data, count);
      this.rawData = data;
    },

    // 缓存已获取的订单记录
    save2cache(argData, total = 0) {
      const key = this.curTab.index;
      if (!this.rawDataCache[key].data) {
        this.rawDataCache[key] = { data: [], total: total };
      }
      this.rawDataCache[key].data = this.rawDataCache[key].data.concat(argData);
    },

    // 使用缓存的订单记录，如果存在
    useCache() {
      const key = this.curTab.index;
      const cache = this.rawDataCache[key];
      this.rawData = cache.data
        ? cache.data.slice(this.start.all, this.limit + this.start.all)
        : [];
      return this.rawData.length > 0;
    },

    // 切换页面
    onPage(argPage) {
      const key = this.curTab.index;
      this.pages[key].page = argPage;
      let type;

      if (key === 'paid') {
        type = 1;
      } else if (key === 'nonPayment') {
        type = 2;
      }

      this.rawData = [];
      this.getAllOrders(type);
    },

    // 根据id修改某个脏数据订单记录的状态
    updateOrderById(argId, argStatus) {
      const updateStatus = arg => {
        if (arg && arg.some) {
          arg.some(item => {
            if (String(item.id) === String(argId)) {
              item.paymentType = argStatus;
              return true;
            }
            return false;
          });
        }
      };
      const updateCache = cache => {
        if (cache.data) {
          updateStatus(cache.data);
        }
      };
      updateCache(this.rawDataCache.all);
      updateCache(this.rawDataCache.nonPayment);
      updateCache(this.rawDataCache.paid);
      updateStatus(this.rawData);
    },
  },
  created() {
    this.getAllOrders();
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.p-orders {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;

  /deep/ .switch-tab,
  /deep/ .cp-pagination {
    flex: none;
    background-color: #fff;
  }
  /deep/ .cp-pagination {
    border-top: 1px solid #eee;
  }
}

.shadow {
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.table-wrap {
  padding-left: px2rem(20);
  padding-right: px2rem(20);
  box-sizing: border-box;
  width: 100%;
  position: relative;
  background-color: #fff;

  .loading {
    width: 100%;
    height: px2rem(150);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.2);
  }
  .empty {
    @include fontSizeRespond(20);
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    height: px2rem(150);
  }
}

.table {
  width: 100%;

  tr {
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }
  }
  td {
    padding: px2rem(28) px2rem(10);
    vertical-align: middle;
    white-space: nowrap;
    font-size: 14px;
    color: #999;
    text-align: center;

    &:first-child {
      width: 28%;
      white-space: normal;
      word-break: break-all;
      line-height: 1.3;
      text-align: left;
      @include fontSizeRespond(16);
    }
    &:nth-child(2) {
      width: 20%;
    }
    &:nth-child(3) {
      width: 10%;
    }
    &:nth-child(4) {
      width: 10%;
    }
    &:nth-child(5) {
      width: 15%;
    }
    &:last-child {
      width: 17%;
      white-space: normal;
      word-break: break-all;
      text-align: right;
    }
    .port-name {
      color: #333;
      margin-bottom: 2px;
    }
    .orange {
      color: $orange;
    }
    .link {
      color: $blue;
      margin-top: px2rem(10);
      cursor: pointer;
      display: block;
      text-decoration: none;
      &:hover {
        color: $lightBlue;
      }
    }
    /deep/ .cp-btn {
      text-align: center;
      display: inline-block;
      vertical-align: middle;
      padding: 0 12px;
      height: 24px;
      min-width: 0;
      font-size: 12px;
      border-radius: 4px;
      margin: px2rem(5);

      &:last-child {
        background-color: #fff;
        border: 1px solid #eee;
        color: #999;

        &:hover {
          border-color: #999;
        }
      }
    }
  }
}
</style>
