<template>
  <div class="cp-selector">
    <div class="shadow" v-show="loading"></div>

    <!-- 星期切换tab -->
    <WeekTab :items="weekTabs" :onChose="onChoseDate" :isLast="addWeekTabRight" :isFirst="addWeekTabLeft" :max="weekTabMax" ref="weekTab" />

    <!-- 出发时间单选框 -->
    <DepartRadios :data="rasios" :onChose="onChoseRadio" :defaultId="rasios[0].id" />

    <!-- 航程数据 -->
    <Table :emptyTips="loading || routes.length > 0 ? '' : $t('tips.pageTrip[3]')" @onTable="onTable" :loading="loading">
      <tr slot="th">
        <th :style="{ 'width': `${tableSize[0]}%` }">{{ $t('chu_fa_shi_jian') }}</th>
        <th :style="{ 'width': `${tableSize[1]}%` }">{{ $t('chu_fa_gang') }}/{{ $t('dao_da_gang') }}</th>
        <th :style="{ 'width': `${tableSize[2]}%` }" v-if="type === 1">{{ $t('li_shi') }}</th>
        <th :style="{ 'width': `${tableSize[tableSize.length - 2]}%` }">¥{{ $t('piao_jia') }}</th>
        <th :style="{ 'width': `${tableSize[tableSize.length - 1]}%` }"></th>
      </tr>
      <tr v-for="r in conditionRoutes.yes" :key='r.id' slot="td">
        <td class="text-1">{{ r.departureTime }}</td>
        <td>
          <p class="text-4" v-if="type !== 1">{{ r.duration }}</p>
          <p class="text-2">{{ r.fromPort }}--{{ r.toPort }}</p>
        </td>
        <td class="text-3" v-if="type === 1">{{ r.duration }}</td>
        <td>
          <ul class="seats">
            <li v-for="seat in r.seats" :key="`${r.id}${seat.id}`">
              <Radio :data="{ id: `${r.id}@${seat.id}`, name: seat.name }" :ref="`${r.id}@${seat.id}`" :default-status="seatCache[r.id] === seat.id" />
              <div class="text-money-group">
                <p v-for="p in seat.price" :key="`${r.id}${p.id}`">
                  <span class="text-3">{{ p.key }}</span>
                  <span class="text-money">{{ p.val }}</span>
                </p>
              </div>
              <p class="text-3">{{ $t('sheng_yu_zhang_shu', { num: seat.remain }) }} </p>
            </li>
          </ul>
        </td>
        <td>
          <Button :text="btnName || $t('gou_piao')" :data-id="r.id" />
        </td>
      </tr>
      <tr slot="td" v-if="conditionRoutes.no.length > 0">
        <td :colspan="tableSize.length" class="cant-chose-tips">
          <Icon name="tixing" />
          <span>以下班次不符合接驳时间，不可预定</span>
        </td>
      </tr>
      <tr class="disabled" v-for="r in conditionRoutes.no" :key='r.id' slot="td" v-if="conditionRoutes.no.length > 0">
        <td class="text-1">{{ r.departureTime }}</td>
        <td>
          <p class="text-4" v-if="type !== 1">{{ r.duration }}</p>
          <p class="text-2">{{ r.fromPort }}--{{ r.toPort }}</p>
        </td>
        <td class="text-3" v-if="type === 1">{{ r.duration }}</td>
        <td>
          <ul class="seats">
            <li v-for="seat in r.seats" :key="`${r.id}${seat.id}`">
              <Radio :data="{ id: `${r.id}-${seat.id}`, name: seat.name }" />
              <div class="text-money-group">
                <p v-for="p in seat.price" :key="`${r.id}${p.id}`">
                  <span class="text-3">{{ p.key }}</span>
                  <span class="text-money">{{ p.val }}</span>
                </p>
              </div>
              <p class="text-3">{{ $t('sheng_yu_zhang_shu', { num: seat.remain }) }} </p>
            </li>
          </ul>
        </td>
        <td>
          <Button :text="btnName || $t('gou_piao')" />
        </td>
      </tr>
    </Table>

  </div>
</template>

<script>
import Icon from '@/components/basic/Icon.vue';
import Radio from '@/components/basic/Radio.vue';
import Table from '@/components/basic/Table.vue';
import Button from '@/components/basic/Button.vue';
import { mapState } from 'vuex';
import model from '@/assets/js/axios';
import api from '@/assets/js/api';
import { noti, LoopEle } from '@/assets/js/util';
import format from 'date-fns/format';
import addDays from 'date-fns/add_days';
import getDay from 'date-fns/get_day';
import subDays from 'date-fns/sub_days';
import isToday from 'date-fns/is_today';
import getTime from 'date-fns/get_time';
import addMinutes from 'date-fns/add_minutes';
import compareAsc from 'date-fns/compare_asc';
import last from 'lodash/last';
import findIndex from 'lodash/findIndex';
import WeekTab from './WeekTab.vue';
import DepartRadios from './DepartRadios.vue';

export default {
  components: {
    WeekTab,
    DepartRadios,
    Table,
    Button,
    Radio,
    Icon,
  },
  props: {
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // 表格每一项的大小
    tableSize: {
      type: Array,
      default: () => [],
    },
    // weekTab要显示的个数
    weekTabMax: {
      type: Number,
      default: 8,
    },
    // 1: 表格有历时 2: 表格无历时，历时在出发港上面
    type: {
      type: Number,
      default: 1,
    },
    // 按钮的名字
    btnName: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // 日期选择tab
      weekTabs: [],
      weekTabsActiveItem: 0,
      // 当前选中的出发时间
      activeRasioId: 'all',
      // 线路信息
      routes: [],
      // 缓存线路信息
      cacheRoutes: {},
      // 已经选择的座位
      seatCache: {},
      loading: true,
    };
  },
  computed: {
    // 出发时间选择tab
    rasios() {
      return [
        { id: 'all', name: this.$i18n.t('quan_bu') },
        { id: '06:00-12:00', name: '06:00-12:00' },
        { id: '12:00-18:00', name: '12:00-18:00' },
        { id: '18:00-24:00', name: '18:00-24:00' },
      ];
    },
    curWeekTab() {
      if (this.weekTabs.length === 0) {
        return {};
      }
      return this.weekTabs[this.weekTabsActiveItem];
    },
    // 按照条件拆分线路
    conditionRoutes() {
      if (!this.params.isAirline) {
        return { yes: this.routes, no: [] };
      }
      const yes = [];
      const no = [];
      const { mct, date } = this.params.airline;
      const curDay = format(this.params.date, 'YYYY-MM-DD');
      // 乘坐机场线的旅客只能搭乘船班日期当天至下一天凌晨02:00点之间的飞机
      const max = addDays(getTime(`${curDay} 02:00`), 1);
      let min;

      this.routes.forEach(item => {
        // 飞机起飞时间大于等于船班的开航时间+MCT时间）
        min = addMinutes(
          getTime(`${item.departureDate} ${item.departureTime}`),
          Number(mct),
        );

        if (compareAsc(min, date) !== 1 && compareAsc(date, max) !== 1) {
          yes.push(item);
        } else {
          no.push(item);
        }
      });
      return { yes, no };
    },
    ...mapState({
      lang: state => state.status.lang,
    }),
  },
  watch: {
    '$root.$i18n.locale'() {
      this.cacheRoutes = {};
      this.routes = [];
      this.reload();
    },
  },
  methods: {
    // 往前延长weektab
    addWeekTabRight() {
      const tab = last(this.weekTabs);
      const curDate = new Date(Number(tab.id));
      this.addWeekTab(addDays(curDate, 1));
      this.$refs.weekTab.onNextOrPrev('next');
    },

    // 往后延长weektab，直到今天
    addWeekTabLeft() {
      const tab = this.weekTabs[0];
      const curDate = new Date(Number(tab.id));
      if (isToday(curDate)) {
        noti(this.$i18n.t('tips.pageTrip[2]'));
        return;
      }
      this.addWeekTab(subDays(curDate, 1), true);
      this.onChoseDate(0);
    },

    // 切换日期
    onChoseDate(argIndex) {
      this.weekTabsActiveItem = argIndex;
      this.routes = [];
      this.reload();
    },

    // 切换出发时间radios
    onChoseRadio(argId) {
      this.activeRasioId = argId;
      this.routes = [];
      this.reload();
    },

    // 切换了日期|时间，重新加载数据
    reload() {
      const params = {
        start_port_code: this.params.start,
        end_port_code: this.params.end,
        departure_date: format(this.curWeekTab.id, 'YYYY-MM-DD'),
      };
      if (this.activeRasioId !== this.rasios[0].id) {
        params['departure_time'] = this.activeRasioId;
      }
      this.fetchRoutes(params);
    },

    // 设置weektabs
    setWeekTabs(argDate) {
      const curDate = getTime(Number(argDate));
      const hit = findIndex(
        this.weekTabs,
        item => String(item.id) === String(curDate),
      );
      if (hit !== -1) {
        return;
      }
      this.addWeekTab(curDate);
      // 填充后7天
      for (let i = 0; i < 7; i++) {
        this.addWeekTab(addDays(curDate, i + 1));
      }
    },

    // 增加一个weektab
    addWeekTab(argDate, isFront) {
      const week = {
        1: this.$i18n.t('zhou_yi'),
        2: this.$i18n.t('zhou_er'),
        3: this.$i18n.t('zhou_san'),
        4: this.$i18n.t('zhou_si'),
        5: this.$i18n.t('zhou_wu'),
        6: this.$i18n.t('zhou_liu'),
        0: this.$i18n.t('zhou_ri'),
      };
      const tar = {
        id: argDate,
        date: format(argDate, 'MM-DD'),
        week: week[getDay(argDate)],
      };
      if (isFront) {
        this.weekTabs.unshift(tar);
      } else {
        this.weekTabs.push(tar);
      }
    },

    // 根据条件获取线路
    async fetchRoutes(params) {
      if (this.hasCacheRoutes(params)) {
        return;
      }
      let res;
      let lang = 'T';
      if (this.lang === 'zh') {
        lang = 'C';
      } else if (this.lang === 'en') {
        lang = 'E';
      }
      try {
        this.loading = true;
        res = await model.post(api.getAllRoutes, {
          lang,
          is_Roundtrip: 0,
          ...params,
        });
        this.loading = false;
      } catch (e) {
        this.loading = false;
        return;
      }
      const { voyageData } = res;
      const data = this.handleFuckData(voyageData.voyageData);

      // 缓存线路信息
      this.saveRoutesToCache({
        departureDate: getTime(Number(params.departure_date)),
        totalCount: voyageData.voyage_count,
        details: data,
      });

      // 当前要显示的线路数据
      this.routes = data;
    },

    // 判断有没有缓存数据
    hasCacheRoutes() {
      const { cacheRoutes, curWeekTab, activeRasioId } = this;

      if (!cacheRoutes[curWeekTab.id]) {
        return false;
      }

      const data = cacheRoutes[curWeekTab.id][activeRasioId];

      if (!data) {
        return false;
      }

      this.routes = data;
      return true;
    },

    // 将获取到的线路信息保存在本地
    saveRoutesToCache(argData) {
      const data = argData;
      const { cacheRoutes, activeRasioId, curWeekTab } = this;
      if (!cacheRoutes[curWeekTab.id]) {
        cacheRoutes[curWeekTab.id] = {
          departureDate: curWeekTab.id,
        };
      }
      if (!cacheRoutes[curWeekTab.id][activeRasioId]) {
        cacheRoutes[curWeekTab.id][activeRasioId] = {
          totalCount: data.totalCount,
        };
      }
      cacheRoutes[curWeekTab.id][activeRasioId] = data.details;
    },

    // 点中table
    onTable(e) {
      LoopEle(
        e,
        {
          BUTTON: tar => {
            const routeId = tar.getAttribute('data-id');
            const hit = findIndex(
              this.routes,
              item => String(item.id) === routeId,
            );
            if (hit === -1) {
              return;
            }
            const seatId = this.seatCache[this.routes[hit].id];
            if (!seatId) {
              noti('您还未选择座位');
              return;
            }
            this.$emit('onSelected', this.routes[hit], seatId);
          },
          UL: tar => {
            if (tar.className !== 'cp-radio') {
              return;
            }
            const id = tar.getAttribute('data-id');
            const arr = id.split('@');
            const tripId = arr[0];
            const seatId = arr[1];

            for (let ref in this.$refs) {
              if (ref.indexOf(tripId) !== -1) {
                this.$refs[ref][0].unChose();
                continue;
              }
            }

            if (this.$refs[id]) {
              this.$refs[id][0].onChose();
              this.$set(this.seatCache, tripId, seatId);
            }
          },
          TABLE: 'end',
        },
        10,
      );
    },

    // 处理后台换回的线路数据，fuck
    handleFuckData(argData) {
      const res = [];
      let seats = [];
      let tickMsg = {};
      // 过滤类似120(50)110(10)的数据，获取余票
      const getTicks = argStr => {
        let key = '';
        let val = '';
        let isVal = false;
        const res = {};
        for (let i = 0, len = argStr.length; i < len; i++) {
          if (argStr[i] === '(') {
            isVal = true;
          } else if (argStr[i] === ')') {
            res[key] = val;
            key = '';
            val = '';
            isVal = false;
          } else if (isVal) {
            val += argStr[i];
          } else {
            key += argStr[i];
          }
        }
        return res;
      };
      const getPrice = argSeat => {
        const price = [];
        const push = (id, key, val, detailId) => {
          if (val > 0) {
            price.push({ id, key, val, detailId });
          }
        };
        push(1, this.$i18n.t('cheng_ren'), argSeat.price1, argSeat.detail1);
        push(2, this.$i18n.t('xiao_tong'), argSeat.price2, argSeat.detail2);
        push(3, this.$i18n.t('zhang_zhe'), argSeat.price3, argSeat.detail3);
        push(4, this.$i18n.t('ying_er'), argSeat.price4, argSeat.detail4);
        return price;
      };
      const minute2hour = argNum => {
        const hour = Math.floor(argNum / 60);
        const minute = argNum - hour * 60;
        let res = '';
        if (hour > 0) {
          res += `${hour}${this.$i18n.t('xiao_shi')}`;
        }
        if (minute > 0) {
          res += `${minute}${this.$i18n.t('fen_zhong')}`;
        }
        return res;
      };
      argData.forEach(item => {
        tickMsg = getTicks(item.ticketNum);
        seats = [];
        item.DTSEATRANKPRICE.forEach(seat => {
          seats.push({
            id: seat.seatRankId,
            name: seat.seatRank,
            price: getPrice(seat),
            remain: tickMsg[seat.seatRankId],
          });
        });
        res.push({
          id: item.voyageRoute_Id,
          toPort: item.toPort,
          toPortCode: item.tPortCode,
          fromPort: item.fromPort,
          fromPortCode: item.fPortCode,
          duration: minute2hour(item.duration),
          departureTime: item.setoffTime,
          departureDate: item.setoffDate,
          seats: seats,
          warmPrompt: item.ticketTips,
          orderNotice: item.orderNotice,
          portType: item.portType,
          isAirLine: item.isAirLine,
          lineCode: item.lineCode,
        });
      });
      return res;
    },
  },

  created() {
    this.setWeekTabs(this.params.date);
    this.fetchRoutes({
      start_port_code: this.params.start,
      end_port_code: this.params.end,
      departure_date: format(Number(this.params.date), 'YYYY-MM-DD'),
    });
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-selector {
  position: relative;
  display: flex;
  flex-direction: column;

  /deep/ .cp-selector,
  /deep/ .cp-depart-radios {
    flex: none;
  }
  /deep/ .cp-table {
    flex: 1 0 auto;
    line-height: 1.2;

    th {
      padding: 0 px2rem(5);
      box-sizing: border-box;
    }

    table {
      background-color: #fff;

      tbody td {
        padding: px2rem(30) px2rem(5);
        box-sizing: border-box;
      }

      .seats {
        display: inline-block;
        white-space: nowrap;

        & > li {
          display: flex;
          margin-bottom: px2rem(15);
          align-items: center;

          & > * {
            margin-right: px2rem(19);

            &:last-child {
              margin-right: 0;
            }
          }
          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .text-1 {
        @include fontSizeRespond(26);
        color: #333;
      }
      .text-2 {
        @include fontSizeRespond(20);
        color: #999;
      }
      .text-3 {
        font-size: 14px;
        color: #999;
      }
      .text-4 {
        @extend .text-3;
        padding-bottom: px2rem(10);
      }
      .text-money {
        @include fontSizeRespond(20);
        color: $orange;
      }
      .text-money-group {
        display: flex;
        align-items: center;
        p {
          line-height: 1;
          margin-right: px2rem(5);
          &:last-child {
            margin-right: 0;
          }
          & > * {
            margin-right: 2px;
            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
    }

    .cant-chose-tips {
      padding: 0;
      height: 30px;
      font-size: 14px;
      color: #ccc;
      background-color: #f8f8f8;
      text-align: left;

      .icon-tixing {
        @include fontSizeRespond(20);
        margin-right: 7px;
        margin-left: 13px;
      }
    }

    .disabled {
      [class*='text'] {
        color: #ddd;
      }
      .cp-btn {
        background-color: #ddd;
        cursor: not-allowed;
      }
      .cp-radio {
        cursor: not-allowed;
        .radio {
          border-color: #ddd;
        }
        &:hover .radio {
          border-color: #ddd;
        }
      }
    }
  }
}

.shadow {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: transparent;
  z-index: 3;
}
</style>
