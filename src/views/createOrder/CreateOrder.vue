<template>
  <div class="orderdetail limit">
    <Progress active="2" />

    <div class="wrap">
      <div class="left">

        <div class="box">
          <div class="title">{{ $t('cheng_ke') }}</div>
          <div class="content">
            <ul class="customer-cache" @click="togglePassenger" v-if="passengers.length && userData.id">
              <li v-for="p in passengers" :data-id="p.id" :key="p.id" :class="{ 'active': chkPassenger(p.id) }">
                {{ p.name }}
              </li>
            </ul>

            <div class="customer-details" v-show="customerList.length" @click="onCustomer">
              <div class="item" v-for="(d, index) in customerList" :key="`customerList${d.id}`">
                <div class="head">
                  <p class="title">{{ $t('cheng_ke') }}{{ index + 1 }}</p>
                  <Button :text="$t('shan_chu')" type="no-border" :data-id="d.id" />
                </div>
                <ul class="labels">
                  <li>
                    <p class="name">{{ $t('xing_ming') }}</p>
                    <Input :placeholder="$t('zhen_jian_xing_ming')" v-model="d.name" :status.sync="d.nameStatus" :key="`${d.id}name`" />
                  </li>
                  <li :data-id="d.id" data-type="passenger">
                    <p class="name">{{ $t('cheng_ke_lei_xing') }}</p>
                    <Dropdown :data="passengerType" :default-id="d.passenger" :on-chose-back="onEditType" :key="`${d.id}passenger`" />
                  </li>
                </ul>
                <ul class="labels">
                  <li :data-id="d.id" data-type="idCradType">
                    <p class="name">{{ $t('zheng_jian_lei_xing') }}</p>
                    <Dropdown :data="credentialType" :default-id="d.idCradType" :on-chose-back="onEditType" :key="`${d.id}idCradType`" />
                  </li>
                  <li>
                    <p class="name">{{ $t('zheng_jian_hao_ma') }}</p>
                    <Input :placeholder="$t('zheng_jian_hao_ma')" :secret="true" v-model="d.idCard" :status.sync="d.idCardStatus" :key="`${d.id}idCard `" />
                  </li>
                </ul>
              </div>
            </div>

            <div class="add-btn" @click="addPassenger">
              <Button>
                <span>{{ $t('tian_jia_cheng_ke') }}</span>
                <Icon name="zengjia" />
              </Button>
            </div>
          </div>
        </div>

        <div class="box">
          <div class="title">{{ $t('lian_xi_ren') }}</div>
          <div class="content">
            <div class="concat">
              <Dropdown :data="prefixNumbers" :default-id="prefixNumbers[0].id" :on-chose-back="onChangePrefix" key="prefixNumbers" v-if="userData.phoneNo" />
              <Input :placeholder="$t('shou_ji_jie_shou_hang_ban')" v-model="concat.phone" :status.sync="concat.phoneStatus" key="contantPhone" :handle="$t('duan_xin_yan_zhen')" @handle="onVerifyPhone" v-if="userData.phoneNo" />
              <Input :placeholder="$t('you_jian_jie_shou_hang_ban')" v-model="concat.email" :status.sync="concat.emailStatus" key="contantEmail" :handle="$t('you_xiang_yan_zhen')" @handle="onVerifyEmail" type="email" v-if="!userData.id" />
            </div>
          </div>
        </div>

        <div class="warm-prompt">
          <div class="title">{{ $t('wen_xin_ti_shi') }}</div>
          <ul class="content">
            <li v-for="(m, index) in tripData.go.warmPrompt" :key="index" v-if="index > 0">
              {{ m }}
            </li>
          </ul>
        </div>

      </div>
      <div class="right">
        <SelectedTrip :title="$t('qu_cheng')" :trip-data="tripData.go" @clear="clearRoute" />

        <SelectedTrip :title="$t('fan_cheng')" :trip-data="tripData.back" @clear="clearRoute" v-if="isRoundTrip" />

        <div class="clause-total">
          <div class="clause" @click="onToggleClause">
            <CheckBox ref="clauseCheckbox" />
            <span>{{ $t('yi_yue_du_bing_tong_yi') }}</span>
            <span class="can-click" @click.stop="openMsgBeforeKnow">《{{ $t('ding_piao_xu_zhi') }}》</span>
            <span>{{ $t('tiao_kuan') }}</span>
          </div>
          <div class="total">
            <span>{{ $t('ding_dan_zong_er') }}：</span>
            <span class="money">¥{{ totalPrice }}</span>
          </div>
        </div>

        <div class="btn-group">
          <Button :text="$t('ti_jiao_zhi_fu')" :disabled="!finish.status" :needEvent="true" @handle="onSure" />
        </div>
      </div>
    </div>

    <div class="shadow" v-if="loading"> </div>

    <!-- 订票须知 -->
    <Popup :title="`《${$t('ding_piao_xu_zhi')}》`" ref="msgBeforeBook">
      <div slot="mid" class="order-notice">
        <ul class="text-group">
          <li v-for="(m, index) in tripData.go.orderNotice" :key="index">{{ m }}</li>
        </ul>
      </div>
    </Popup>

    <!-- 手机号码验证 -->
    <VerifyConcat :concat="concat.phone" :prefix="prefix.value" ref="verifyPhone" @success="verifyPhoneSuccess" />

    <!-- 邮箱验证 -->
    <VerifyConcat :concat="concat.email" :type="2" ref="verifyEmail" @success="verifyEmailSuccess" />
  </div>
</template>

<script>
import Icon from '@/components/basic/Icon.vue';
import CheckBox from '@/components/basic/CheckBox.vue';
import Button from '@/components/basic/Button.vue';
import Input from '@/components/basic/Input.vue';
import Dropdown from '@/components/basic/Dropdown.vue';
import Popup from '@/components/basic/Popup.vue';
import Progress from '@/components/Progress.vue';
import SelectedTrip from '@/components/SelectedTrip.vue';
import { LoopEle, noti } from '@/assets/js/util.js';
import { mapGetters, mapState } from 'vuex';
import storage from '@/assets/js/storage/storage';
import { CACHE_TRIP } from '@/assets/js/constant';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import findIndex from 'lodash/findIndex';
import map from 'lodash/map';
import VerifyConcat from './VerifyConcat';
import format from 'date-fns/format';
import model from '@/assets/js/axios';
import api from '@/assets/js/api';

export default {
  name: 'CreateOrder',
  components: {
    Progress,
    Icon,
    CheckBox,
    Button,
    Input,
    Dropdown,
    Popup,
    SelectedTrip,
    VerifyConcat,
  },
  data() {
    return {
      loading: false,
      airline: {},
      // 联系人
      concat: {
        prefix: '1',
        phone: '',
        phoneStatus: '',
        email: '',
        emailStatus: '',
      },
      // 联系方式是否已经验证标记
      verifyStatus: {
        phone: true,
        email: true,
      },
      // 条款是否已阅读
      hasReadClause: false,
      // 已经选中的乘客id，登陆用户才有
      chosenPassenger: [],
      // 乘客名单
      customerList: [],
      // 航程数据
      tripData: {
        go: {},
        back: {},
      },
    };
  },
  computed: {
    // 选中的座位信息
    selectedSeat() {
      const get = argArr => {
        const res = {};
        if (argArr && argArr.selSeat && argArr.selSeat.price) {
          argArr.selSeat.price.forEach(seat => {
            res[String(seat.id)] = {
              ...seat,
              val: Number(seat.val) || 0,
            };
          });
        }
        return res;
      };
      return {
        goSeat: get(this.tripData.go),
        backSeat: get(this.tripData.back),
      };
    },
    // 总价格
    totalPrice() {
      const { goSeat, backSeat } = this.selectedSeat;
      let price = 0;
      this.customerList.forEach(item => {
        price += goSeat[String(item.passenger)]
          ? goSeat[String(item.passenger)].val
          : 0;
        price += backSeat[String(item.passenger)]
          ? backSeat[String(item.passenger)].val
          : 0;
      });
      return price;
    },
    // 联系人选中的号码前缀
    prefix() {
      const hit = findIndex(this.prefixNumbers, item => {
        return String(item.id) === String(this.concat.prefix);
      });
      return this.prefixNumbers[hit] || {};
    },
    // 是否返程订单
    isRoundTrip() {
      return !isEmpty(this.tripData.back);
    },
    // 是否可以提交订单
    finish() {
      const { concat, verifyStatus, customerList, hasReadClause } = this;
      const phoneChk = !!(
        concat.phone &&
        concat.phoneStatus !== 'wrong' &&
        verifyStatus.phone
      );
      let emailChk = !!(concat.emailStatus !== 'wrong' && verifyStatus.email);
      let customerChk = customerList.length > 0;
      if (customerChk) {
        customerList.some(item => {
          customerChk =
            item.name &&
            item.nameStatus !== 'wrong' &&
            item.idCard &&
            item.idCardStatus !== 'wrong' &&
            item.passenger &&
            item.idCradType;
          return !customerChk;
        });
      }
      if (!phoneChk && !emailChk) {
        return { status: 0, msg: '请输入正确的联系方式并进行验证' };
      } else if (!customerChk) {
        return { status: 0, msg: '乘客信息尚未填写完毕' };
      } else if (!hasReadClause) {
        return { status: 0, msg: '请勾选条款' };
      } else {
        return { status: 1 };
      }
    },
    // 乘客类型
    passengerType() {
      const { passengerType } = this.$store.getters;
      const { tripData } = this;
      if (
        tripData &&
        tripData.go &&
        tripData.go.selSeat &&
        tripData.go.selSeat.price
      ) {
        const ids = map(tripData.go.selSeat.price, item => String(item.id));
        return passengerType.filter(
          item => ids.indexOf(String(item.id)) !== -1,
        );
      }

      return passengerType;
    },
    ...mapState({
      lang: state => state.status.lang,
      passengers: state => state.passenger.passengers,
      userData: state => state.login.userData,
    }),
    ...mapGetters(['credentialType', 'prefixNumbers']),
  },
  watch: {
    userData: {
      handler(data) {
        if (data.id) {
          this.$store.dispatch('initPassenger');
          this.concat.phone = data.phoneNo;
          this.concat.email = data.emailUrl;
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    // 判断是否已经选中的历史乘客
    chkPassenger(argId) {
      return this.chosenPassenger.indexOf(argId) !== -1;
    },

    // 选中或取消某个历史乘客
    togglePassenger(e) {
      LoopEle(e, {
        LI: el => {
          const id = el.getAttribute('data-id');
          const passenger = this.$store.getters.getPassengerById(id);
          let hit = findIndex(
            this.chosenPassenger,
            item => String(item) === id,
          );
          if (hit !== -1) {
            this.chosenPassenger.splice(hit, 1);
            hit = findIndex(this.customerList, item => String(item.id) === id);
            this.customerList.splice(hit, 1);
            return;
          }
          this.chosenPassenger.push(id);
          this.customerList.push({
            id,
            name: passenger.name,
            nameStatus: '',
            passenger: passenger.passengerType,
            idCard: passenger.credentialNumber,
            idCardStatus: '',
            idCradType: passenger.credentialType,
            isNew: false,
          });
        },
        UL: 'end',
      });
    },

    // 打开订票须知
    openMsgBeforeKnow() {
      this.$refs.msgBeforeBook.toggle();
    },

    // 变更是否已读状态
    onToggleClause() {
      this.hasReadClause = !this.hasReadClause;
      this.$refs.clauseCheckbox.updateStatus(this.hasReadClause);
    },

    // 修改乘客名单，证件类型和乘客类型
    onEditType(argId, $el) {
      const parentNode = $el.parentNode;
      const parentId = parentNode.getAttribute('data-id');
      const handleType = parentNode.getAttribute('data-type');

      this.customerList.some(item => {
        if (parentId === String(item.id)) {
          if (handleType === 'passenger') {
            item.passenger = argId;
          } else if (handleType === 'idCradType') {
            item.idCradType = argId;
          }
          return true;
        }
        return false;
      });
    },

    // 切换号码前缀
    onChangePrefix(argId) {
      this.concat.prefix = argId;
    },

    // 坑逼后台不愿意提供接口，只能从缓存拿航程数据，
    // 弊端：切换语言数据没办法做变更，清理缓存后当前页面失效
    async getTrip() {
      const parseHtml = argMsg => {
        const node = new DOMParser().parseFromString(argMsg, 'text/html');
        const p = node.querySelectorAll('p');
        const arr = [];
        let tmp = [];
        [].forEach.call(p, el => {
          tmp = el.innerHTML.split(/<br\/?>/);
          tmp.forEach(item => {
            arr.push(
              item
                .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')
                .replace(/(\r\n|\n|\r)/gm, '')
                .replace(/&nbsp;?/gi, ''),
            );
          });
        });
        return arr;
      };
      const cache = await storage.getItem(CACHE_TRIP);
      const { go, back } = cache;
      if (go) {
        this.tripData.go = {
          ...go.data,
          selSeat: go.selSeat,
          warmPrompt: parseHtml(go.data.warmPrompt),
          orderNotice: parseHtml(go.data.orderNotice),
        };
      }
      if (back) {
        this.tripData.back = { ...back.data, selSeat: back.selSeat };
      }
    },

    // 重新选择航程
    clearRoute() {
      storage.removeItem(CACHE_TRIP);
      const { query } = this.$route;
      this.$router.push({ path: query.from, query: omit(query, 'from') });
    },

    // 添加新的乘客
    addPassenger(e) {
      LoopEle(e, {
        BUTTON: () => {
          const customerList = this.customerList.filter(item => item.isNew);
          const len = customerList.length;
          const last = customerList[len - 1];
          let id = 'new-1';
          if (last) {
            id = `new-${Number(last.id.split('-')[1]) + 1}`;
          }
          this.customerList.push({
            id,
            name: '',
            nameStatus: '',
            passenger: '',
            idCard: '',
            idCardStatus: '',
            idCradType: '',
            isNew: true,
          });
        },
        DIV: 'end',
      });
    },

    // 点击了乘客列表某个地方
    onCustomer(e) {
      LoopEle(e, {
        // 删除新添加的乘客
        BUTTON: tar => {
          const id = tar.getAttribute('data-id');
          const hit = findIndex(
            this.customerList,
            item => String(item.id) === id,
          );
          const hit1 = findIndex(
            this.chosenPassenger,
            item => String(item) === id,
          );
          if (hit !== -1) {
            if (!this.customerList[hit].isNew && hit1 !== -1) {
              this.chosenPassenger.splice(hit1, 1);
            }
            this.customerList.splice(hit, 1);
          }
        },
        DIV: 'end',
      });
    },

    // 打开验证手机号码窗口
    onVerifyPhone() {
      if (!this.concat.phone || this.concat.phoneStatus === 'wrong') {
        noti('请填写正确的手机号码');
        return;
      }
      this.$refs.verifyPhone.toggle();
    },

    // 打开验证邮箱窗口
    onVerifyEmail() {
      if (!this.concat.email || this.concat.emailStatus === 'wrong') {
        noti('请填写正确的邮箱号码');
        return;
      }
      this.$refs.verifyEmail.toggle();
    },

    // 验证手机号码成功后回掉
    verifyPhoneSuccess() {
      this.verifyStatus.phone = true;
    },

    // 验证邮箱成功后回调
    verifyEmailSuccess() {
      this.verifyStatus.email = true;
    },

    // 构建创建订单需要的乘客数据
    createCus() {
      const { go, back } = this.tripData;
      const { goSeat, backSeat } = this.selectedSeat;
      const res = [];
      const create = (item, trip, seat, journeyType) => {
        res.push({
          clientType: item.passenger,
          voyageRouteId: trip.id,
          sailingTime: format(
            `${trip.departureDate} ${trip.departureTime}`,
            'YYYY-MM-DD HH:mm:ss',
          ),
          start_port_code: trip.fromPortCode,
          end_port_code: trip.toPortCode,
          lineCode: trip.lineCode,
          realName: item.name,
          seatType: trip.selSeat.name,
          certType: item.idCradType,
          certNo: item.idCard,
          seatGrade: trip.selSeat.id,
          price: seat[item.passenger] ? String(seat[item.passenger].val) : '0',
          seatrankId: trip.selSeat.id,
          journeyType,
          detailId: seat[item.passenger] ? seat[item.passenger].detailId : 0,
        });
      };
      this.customerList.forEach(item => {
        create(item, go, goSeat, '1');
        if (back.id) {
          create(item, back, backSeat, '2');
        }
      });
      return res;
    },

    // 构建创建订单需要的参数
    createParams() {
      const lang = (() => {
        if (this.lang === 'zh') {
          return 'C';
        } else if (this.lang === 'zhhkL') {
          return 'T';
        }
        return 'E';
      })();
      const params = {
        email: this.concat.email || this.userData.emailUrl,
        mobile: this.concat.phone || this.userData.phoneNo,
        lang,
        isRoundtrip: this.isRoundTrip ? '1' : '0',
        isRegistration: '0',
        portType: this.tripData.go.portType,
        ticketsInfo: this.createCus(),
      };
      if (this.airline.isAirline) {
        params.air_line_code = this.airline.code;
        params.departTime = this.airline.date;
      }
      return params;
    },

    async onSure() {
      if (this.finish.status === 0) {
        noti(this.finish.msg);
        return;
      }
      if (this.loading) {
        return;
      }
      this.$store.dispatch('toggleGlobalLoading', {
        loading: 1,
        text: this.$i18n.t('tips.order[2]'),
      });
      this.loading = true;
      let res;
      try {
        res = await model.post(api.createOrder, { ...this.createParams() });
      } catch (e) {
        noti(e.error || this.$i18n.t('tips.order[1]'));
        this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
        this.loading = false;
        return;
      }

      this.$store.dispatch('toggleGlobalLoading', {
        loading: 1,
        text: this.$i18n.t('tips.order[3]'),
      });
      const number = res.data.orderNo;
      const id = res.data.id;
      setTimeout(() => {
        this.$router.push({ path: '/pay', query: { number, id } });
      }, 2000);
    },
  },

  beforeDestroy() {
    this.loading = false;
    this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
  },

  created() {
    const { query } = this.$route;
    const airline = query.airline ? JSON.parse(query.airline) : null;
    if (airline) {
      this.airline = Object.assign(
        {},
        {
          isAirline: true,
          code: airline.code,
          date: format(new Date(airline.date), 'YYYY-MM-DD HH:mm:ss'),
        },
      );
    }
    this.getTrip();
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.orderdetail {
  padding-top: px2rem(46);
  padding-bottom: px2rem(46);

  /deep/ .cp-progress {
    padding-bottom: px2rem(34);
  }

  /deep/ .cp-selected-trip {
    margin-bottom: px2rem(20);
  }

  /deep/ .cp-popup {
    .order-notice {
      width: 400px;
      height: 400px;
      padding: px2rem(11) px2rem(50) 0 px2rem(50);
      overflow: auto;
      background-color: #fff;
      -ms-scroll-chaining: none;
      overscroll-behavior: contain;

      [class*='text-group'] {
        font-size: 14px;
        line-height: 1.5;
        color: #333;
        margin-bottom: px2rem(38);

        li {
          min-width: 1px;
          min-height: 15px;
        }
      }
    }
  }
}

.wrap {
  display: flex;

  &:after {
    content: '';
    order: 1;
    width: px2rem(20);
    height: 1px;
    flex: none;
    display: block;
  }
  .left {
    flex: 1 1 auto;
    order: 0;
  }
  .right {
    flex: none;
    width: 36%;
    order: 2;
  }
}

.customer-details {
  margin-top: px2rem(17);

  .item {
    width: 100%;
    box-sizing: border-box;
    line-height: 1;
    margin-bottom: px2rem(28);
    padding-bottom: px2rem(29);
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }
    &:only-child {
      border-bottom: 1px solid #eee;
    }
    .head {
      display: flex;
      align-items: center;
      margin-bottom: px2rem(19);

      .title {
        @include fontSizeRespond(18);
        color: $blue;
      }
      /deep/ .cp-btn {
        margin-left: auto;
        padding: 0;
        color: #ccc;
        font-size: 14px;
        min-width: auto;
      }
    }

    .labels {
      width: 100%;
      display: flex;
      align-items: center;
      margin-bottom: px2rem(13);

      &:last-child {
        margin-bottom: 0;
      }
      & > li {
        display: flex;
        align-items: center;
        width: 48%;
        flex: 0 1 auto;

        &:last-child {
          margin-left: auto;
        }

        & > .name {
          font-size: 14px;
          margin-right: px2rem(21);
          width: 56px;
          white-space: nowrap;
          color: #333;
          flex: none;
        }
      }
      /deep/ .cp-input {
        flex: 1 1 auto;
        height: 34px;
        background-color: #f8f8f8;
        border-radius: 4px;

        &:not(.wrong) {
          border-color: transparent;
        }
        input {
          font-size: 12px;
          background-color: #f8f8f8;
        }
      }
      /deep/ .cp-dropdown {
        flex: 1 1 auto;
        .head {
          height: 34px;
        }
      }
    }
  }
}

// 乘客 / 联系人盒子
.box {
  width: 100%;
  background-color: #fff;
  margin-bottom: px2rem(20);

  & > .title {
    padding: px2rem(14) px2rem(31);
    border-bottom: 1px solid #eee;
    color: #333;
    @include fontSizeRespond(24);
  }
  & > .content {
    padding: px2rem(18) px2rem(31);
  }
}

// 已保存的乘客名单
.customer-cache {
  width: 100%;
  margin-top: px2rem(17);
  margin-bottom: px2rem(29);
  font-size: 0;

  li {
    display: inline-block;
    vertical-align: middle;
    margin-right: px2rem(13);
    padding: px2rem(12) px2rem(17);
    border: 1px solid #eee;
    font-size: 14px;
    cursor: pointer;
    box-sizing: border-box;
    border-radius: 4px;
    color: #333;

    &:hover,
    &.active {
      border-color: $blue;
    }
  }
}

.clause-total {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

// 订单总金额
.total {
  white-space: nowrap;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  margin-bottom: px2rem(20);

  .money {
    color: $orange;
    @include fontSizeRespond(24);
  }
}

// 订票须知
.clause {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  margin-right: auto;
  padding-right: px2rem(10);
  box-sizing: border-box;
  margin-bottom: px2rem(20);

  .can-click {
    color: $blue;
    cursor: pointer;

    &:hover {
      color: $lightBlue;
    }
  }

  /deep/ .cp-checkbox {
    margin-right: px2rem(8);
    &:not(.active) {
      color: #999;
    }
  }
}

// 立即购票/购物车
.btn-group {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  /deep/ .cp-btn {
    width: 50%;
    margin-right: px2rem(8);
    margin-left: px2rem(8);
    height: px2rem(50);
    @include fontSizeRespond(18);

    &:only-child {
      width: 100%;
    }
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }
}

// 添加乘客
.add-btn {
  /deep/ .cp-btn {
    height: px2rem(50);
    width: px2rem(150);
    display: flex;
    align-items: center;
    justify-content: center;
    @include fontSizeRespond(18);

    span {
      margin-right: px2rem(8);
    }
  }
}

// 联系人
.concat {
  display: flex;
  align-items: center;

  /deep/ .cp-dropdown {
    margin-right: 3px;

    .head {
      height: 34px;
      background-color: #fff;
    }
    .content {
      min-width: 120px;
      white-space: nowrap;
      background-color: #fff;
      border: 1px solid #eee;
    }
  }
  /deep/ .cp-input {
    height: 34px;
    flex: 1 1 auto;
    max-width: 250px;
    background-color: #f8f8f8;
    border-radius: 4px;
    margin-right: auto;

    &:not(.wrong) {
      border-color: transparent;
    }
    .handle {
      font-size: 12px;
      position: relative;
      &:after {
        content: '';
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 1px;
        width: 48px;
        height: 1px;
        background-color: $blue;
      }
    }
    input {
      background-color: #f8f8f8;
      font-size: 12px;
    }
  }
}

// 温馨提示
.warm-prompt {
  width: 100%;
  background-color: #fff;
  padding: px2rem(27) px2rem(31);
  box-sizing: border-box;
  .title {
    @include fontSizeRespond(18);
    padding-bottom: px2rem(17);
    color: #333;
  }
  .content {
    color: #999;
    line-height: 1.6;
    font-size: 14px;
    word-break: break-all;

    li {
      position: relative;
      padding-left: 10px;
      &:after {
        content: '•';
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
}

.shadow {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
}
</style>
