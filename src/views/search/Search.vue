<template>
  <div class="p-index" :style="{ 'min-height': `${minHeight}px` }">
    <div class="limit">
      <div class="box">
        <div class="head" @click="onRasios">
          <Radio :data="d" v-for="d in radios" :key="d.id" :ref="d.id" />
        </div>

        <div class="content">

          <div class="wrap">
            <div class="dropbox-inline" data-type="goStart">
              <p class="title">{{ $t('chu_fa_gang') }}</p>
              <Dropdown key="goStartDD" ref="goStartDD" :data="ports" :placeholder="$t('gang_kou_ming_cheng')" :on-chose-back="onChose" :loading="loadingPort" />
            </div>
            <div class="icon-box">
              <Icon name="riqi" />
            </div>
            <div class="dropbox-inline" data-type="goEnd">
              <p class="title">{{ $t('dao_da_gang') }}</p>
              <Dropdown key="goEndDD" ref="goEndDD" :data="condPorts" :placeholder="$t('gang_kou_ming_cheng')" :on-chose-back="onChose" :loading="loadingPort" />
            </div>
            <div class="dropbox" data-type="go">
              <p class="title">{{ $t('chu_fa_ri_qi') }}</p>
              <Datepicker key="goPicker" ref="goPicker" :on-select="onSelectDate" />
            </div>
          </div>

          <div class="wrap" v-show="showAirline">
            <div class="dropbox-inline" data-type="airline">
              <p class="title">{{ $t('hang_kong_gong_si') }}</p>
              <Dropdown key="airlineDD" :data="airline" :placeholder="$t('xuan_ze_hang_kong')" :on-chose-back="onChoesAirline" :loading="loadingAirline" />
            </div>
            <div class="icon-box">
              <Icon name="riqi" />
            </div>
            <div class="dropbox-inline" data-type="airlineDate">
              <p class="title">{{ $t('qi_fei_ri_qi') }}</p>
              <Datepicker key="airlinePicker" ref="airlinePicker" :placeholder="$t('xuan_ze_ri_qi')" :on-select="onChoesAirline" />
            </div>
            <div class="dropbox">
              <p class="title">{{ $t('qi_fet_shi_jian') }}</p>
              <ul class="hour-minute">
                <li class="item" data-type="airlineHour">
                  <Dropdown key="airlineHourDD" :data="hours" placeholder="00" :on-chose-back="onChoesAirline" />
                  <p>时</p>
                </li>
                <li class="item" data-type="airlineMinute">
                  <Dropdown key="airlineMinuteDD" :data="minutes" placeholder="00" :on-chose-back="onChoesAirline" />
                  <p>分</p>
                </li>
              </ul>
            </div>
          </div>

          <div class="wrap" v-show="showRoundTrip">
            <div class="dropbox-inline" data-type="backStart">
              <p class="title">{{ $t('fan_cheng_chu_fa_gang') }}</p>
              <Dropdown key="backStartDD" ref="backStartDD" :data="condPorts" :placeholder="$t('gang_kou_ming_cheng')" :on-chose-back="onChose" :loading="loadingPort" />
            </div>
            <div class="icon-box">
              <Icon name="riqi" />
            </div>
            <div class="dropbox-inline" data-type="backEnd">
              <p class="title">{{ $t('fan_cheng_dao_da_gang') }}</p>
              <Dropdown key="backEndDD" ref="backEndDD" :data="ports" :placeholder="$t('gang_kou_ming_cheng')" :on-chose-back="onChose" :loading="loadingPort" />
            </div>
            <div class="dropbox" data-type="back">
              <p class="title">{{ $t('fan_cheng_chu_fa_ri_qi') }}</p>
              <Datepicker key="backPicker" ref="backPicker" :on-select="onSelectDate" />
            </div>
          </div>

          <div class="btn">
            <Button :text="$t('cha_xun')" type="normalnormal" :need-event="true" @handle="onSearch" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Radio from '@/components/basic/Radio.vue';
import Dropdown from '@/components/basic/Dropdown.vue';
import Icon from '@/components/basic/Icon.vue';
import Button from '@/components/basic/Button.vue';
import Loading from '@/components/basic/Loading.vue';
import Datepicker from '@/components/Datepicker.vue';
import { LoopEle, noti } from '@/assets/js/util.js';
import { mapGetters, mapState } from 'vuex';
import compareAsc from 'date-fns/compare_asc';
import format from 'date-fns/format';
import findIndex from 'lodash/findIndex';
import getTime from 'date-fns/get_time';

export default {
  name: 'Search',

  components: {
    Radio,
    Dropdown,
    Icon,
    Datepicker,
    Button,
    Loading,
  },

  data() {
    return {
      loadingAirline: false,
      showRoundTrip: true,
      minHeight: 0,
      loadingPort: true,
      selAirline: {
        code: '',
        hour: '',
        minute: '',
        date: '',
      },
      chosed: {
        go: {
          start: '',
          end: '',
          date: '',
        },
        back: {
          start: '',
          end: '',
          date: '',
        },
      },
    };
  },

  computed: {
    // 单程 / 往返 切换按钮
    radios() {
      return [
        { id: 'onWayRadio', name: this.$i18n.t('dan_cheng') },
        { id: 'roundTripRadio', name: this.$i18n.t('wang_fan') },
      ];
    },

    // 选中的航空公司详情
    airlineCO() {
      const hit = findIndex(
        this.airline,
        item => item.code === this.selAirline.code,
      );
      if (hit === -1) {
        return {};
      }
      return this.airline[hit];
    },

    // 是否显示航空公司
    showAirline() {
      return this.chosed.go.end === 'HKA' && !this.showRoundTrip;
    },

    // 用户选择的起飞时间
    airlineDate() {
      const { selAirline } = this;
      if (!selAirline.date || !selAirline.hour || !selAirline.minute) {
        return 0;
      }
      const date = format(selAirline.date, 'YYYY-MM-DD');
      return getTime(`${date} ${selAirline.hour}:${selAirline.minute}`);
    },

    // 单程到达港 / 往返出发港
    condPorts() {
      const code = this.chosed.go.start;
      if (!code) {
        return [];
      }
      const portCode = this.shipLine[code];
      return this.ports.filter(item => portCode.indexOf(item.code) !== -1);
    },

    ...mapState({
      hours: state => state.basis.hours,
      minutes: state => state.basis.minutes,
      shipLine: state => state.basis.shipLine,
    }),

    ...mapGetters(['ports', 'airline']),
  },

  watch: {
    async showAirline(val) {
      if (val && this.airline.length === 0) {
        this.loadingAirline = true;
        await this.$store.dispatch('getAirline');
        this.loadingAirline = false;
      }
    },
  },

  methods: {
    // 切换单程，往返
    onRasios(e) {
      LoopEle(e, {
        UL: tar => {
          const className = tar.className;
          const id = tar.getAttribute('data-id');
          let ref;

          if (className.indexOf('cp-radio') === -1) {
            return;
          }

          this.radios.forEach(item => {
            ref = this.$refs[item.id];
            if (String(item.id) === String(id)) {
              ref[0].onChose();
              this.showRoundTrip = !!(item.id === this.radios[1].id);
            } else {
              ref[0].unChose();
            }
          });
        },

        DIV: 'end',
      });
    },

    // 选择港口
    onChose(argId, $el) {
      const parentNode = $el.parentNode;
      const type = parentNode.getAttribute('data-type');

      if (type === 'goStart') {
        this.chosed.go.start = argId;
      } else if (type === 'goEnd') {
        this.chosed.go.end = argId;
      } else if (type === 'backStart') {
        this.chosed.back.start = argId;
      } else if (type === 'backEnd') {
        this.chosed.back.end = argId;
      }

      this.portResponse(type);
      this.chkOtherPorts(type);
    },

    // 选择航空公司
    onChoesAirline(argId, $el) {
      const parentNode = $el.parentNode;
      const type = parentNode.getAttribute('data-type');

      if (type === 'airline') {
        this.selAirline.code = argId;
      } else if (type === 'airlineHour') {
        this.selAirline.hour = argId;
      } else if (type === 'airlineMinute') {
        this.selAirline.minute = argId;
      } else if (type === 'airlineDate') {
        this.selAirline.date = argId;
        return;
      }
    },

    // 去程/返程港口联动
    portResponse(argType) {
      const changeAcitve = (ref, val) => {
        this.$refs[ref].changeActive(val);
      };

      const { go, back } = this.chosed;

      if (argType === 'goStart') {
        back.end = go.start;
        changeAcitve('backEndDD', go.start);
      } else if (argType === 'goEnd') {
        back.start = go.end;
        changeAcitve('backStartDD', go.end);
      } else if (argType === 'backStart') {
        go.end = back.start;
        changeAcitve('goEndDD', back.start);
      } else if (argType === 'backEnd') {
        go.start = back.end;
        changeAcitve('goStartDD', back.end);
      }
    },

    // 当去程出发港或者返程目的港时，检查其余港口是否满足航线要求
    chkOtherPorts(argType) {
      if (argType !== 'goStart' && argType !== 'backEnd') {
        return;
      }
      const { go, back } = this.chosed;
      const hit = findIndex(
        this.condPorts,
        item => item.id === (go.end || back.Start),
      );
      if (hit === -1) {
        go.end = '';
        back.start = '';
      }
    },

    // 去程/返程/起飞时间日期联动
    dateResponse() {
      const { go, back } = this.chosed;
      const { selAirline } = this;
      const backPicker = this.$refs.backPicker;
      const airlinePicker = this.$refs.airlinePicker;

      if (!go.date) {
        return;
      }

      if (airlinePicker) {
        if (
          selAirline.date &&
          compareAsc(new Date(go.date), new Date(selAirline.date)) === 1
        ) {
          selAirline.date = '';
          airlinePicker.picker.setDate(null);
        }

        airlinePicker.picker.gotoDate(new Date(go.date));
        airlinePicker.picker.setMinDate(new Date(go.date));
      }

      if (backPicker) {
        if (
          back.date &&
          compareAsc(new Date(go.date), new Date(back.date)) === 1
        ) {
          back.date = '';
          backPicker.picker.setDate(null);
        }

        backPicker.picker.gotoDate(new Date(go.date));
        backPicker.picker.setMinDate(new Date(go.date));
      }
    },

    // 查询
    onSearch() {
      if (
        !this.chosed.go.start ||
        !this.chosed.go.end ||
        !this.chosed.go.date ||
        ((!this.chosed.back.start ||
          !this.chosed.back.end ||
          !this.chosed.back.date) &&
          this.showRoundTrip) ||
        (this.showAirline &&
          (!this.selAirline.code ||
            !this.selAirline.hour ||
            !this.selAirline.minute ||
            !this.selAirline.date))
      ) {
        noti(this.$i18n.t('tips.pageSearch[2]'));
        return;
      }

      if (
        (this.chosed.go.start &&
          this.chosed.go.end &&
          this.chosed.go.start === this.chosed.go.end) ||
        (this.chosed.back.start &&
          this.chosed.back.end &&
          this.chosed.back.start === this.chosed.back.end)
      ) {
        noti(this.$i18n.t('tips.pageSearch[1]'));
        return;
      }

      let path = 'one_way';
      const query = { ...this.chosed.go };
      if (this.showRoundTrip) {
        path = 'round_trip';
        query['back_date'] = this.chosed.back.date;
      }
      if (this.showAirline) {
        query['airline'] = JSON.stringify({
          mct: this.airlineCO.mct,
          code: this.selAirline.code,
          date: this.airlineDate,
        });
      }
      this.$router.push({ path, query: { ...query } });
    },

    // 选择日期
    onSelectDate(argDate, $el) {
      const parentNode = $el.parentNode;
      const type = parentNode.getAttribute('data-type');

      if (type === 'go') {
        this.chosed.go.date = argDate;
      } else {
        this.chosed.back.date = argDate;
      }
      this.dateResponse();
    },
  },

  async created() {
    this.loadingPort = true;
    await Promise.all([
      this.$store.dispatch('getShipLine'),
      this.$store.dispatch('getPorts'),
    ]);
    this.loadingPort = false;
  },

  mounted() {
    this.$nextTick(() => {
      // 设置最小高度，避免背景图片有变化
      this.minHeight = this.$el.offsetHeight;

      // 选中单程
      this.showRoundTrip = false;
      const refName = this.radios[0].id;
      this.$refs[refName][0].onChose();
    });
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.p-index {
  background-image: url('./img/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-top: px2rem(60);
  padding-bottom: px2rem(60);
  width: 100%;
  background-color: #fff;
  box-sizing: border-box;
}

.box {
  display: inline-block;
  background-color: #fff;
  position: relative;
}

.loading {
  position: absolute;
  z-index: 99;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .bg {
    background-color: #000;
    opacity: 0.1;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
  .cp-loading {
    z-index: 2;
  }
}

.head {
  height: px2rem(69);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;

  /deep/ .cp-radio {
    margin-right: px2rem(67);

    .radio {
      border-color: #ccc;
      width: 20px;
      height: 20px;

      &.active:after {
        width: 12px;
        height: 12px;
      }
    }
    .text-r {
      font-size: 14px;
      color: #333;
      margin-left: px2rem(10);
    }
    &:last-child {
      margin-right: 0;
    }
  }
}

.content {
  padding: 36px;
  width: 100%;
  box-sizing: border-box;

  .wrap {
    margin-bottom: 36px;

    .icon-box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 20px;
      margin-right: 20px;
      height: 34px;

      /deep/ .icon-riqi {
        color: $blue;
        font-size: 28px;
      }
    }
    .dropbox-inline {
      display: inline-block;
      vertical-align: bottom;
    }
    [class*='dropbox'] {
      width: 180px;
      position: relative;

      /deep/ .cp-dropdown {
        width: 180px;

        .head {
          height: 34px;
        }
      }

      /deep/ .cp-datepicker {
        height: 34px;
        width: 180px;
      }

      & > .title {
        font-size: 14px;
        color: #333;
        padding-bottom: 10px;
      }
    }
    & > div {
      padding-bottom: px2rem(25);
      &:last-child {
        padding-bottom: 0;
      }
    }
    .hour-minute {
      display: flex;
      align-items: center;

      .item {
        display: flex;
        align-items: center;
        margin-right: 20px;
      }

      /deep/ .cp-dropdown {
        width: 65px;
      }
      p {
        margin-left: 5px;
        font-size: 14px;
        color: #333;
      }
    }
  }

  .btn {
    display: block;
    text-align: center;

    /deep/ .cp-btn {
      width: 100px;
      height: 40px;
      border-radius: 4px;
      font-size: 20px;
    }
  }
}
</style>
