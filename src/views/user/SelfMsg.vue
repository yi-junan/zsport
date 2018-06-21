<template>
  <div class="p-self-msg">
    <div class="head">
      <div class="portrait">
        <Icon name="morentouxiang" />
      </div>
      <p class="number">{{ userName }}</p>
      <div class="progress-bar">
        <p>{{ $t('zi_liao_wan_zheng_du') }}</p>
        <ProgressBar :progress="integrity" />
        <p>{{ integrity }}%</p>
      </div>
    </div>
    <ul class="form">
      <li>
        <span class="key">{{ $t('ni_cheng') }}</span>
        <Input :placeholder="$t('shu_ru_ni_cheng')" key="inputNickname" v-model="selfMsg.nickName" :status.sync="inputStatus.nickName" />
      </li>
      <li>
        <span class="key">{{ $t('you_xiang') }}</span>
        <Input :placeholder="$t('shu_ru_you_xiang')" v-model="selfMsg.email" :status.sync="inputStatus.email" type="email" key="input-email" />
      </li>
      <li>
        <span class="key">{{ $t('shou_ji_hao_ma') }}</span>
        <Input :placeholder="$t('shu_ru_shou_ji_hao_ma')" v-model="selfMsg.phone" :status.sync="inputStatus.phone" type="number" key="input-number" />
      </li>
      <li>
        <span class="key">{{ $t('xing_ming') }}</span>
        <Input :placeholder="$t('shu_ru_xing_ming')" v-model="selfMsg.name" :status.sync="inputStatus.name" key="input-name" />
      </li>
      <li>
        <span class="key">{{ $t('cheng_ke_lei_xing') }}</span>
        <Dropdown :data="passengerType" :defaultId="selfMsg.passengerType" :onChoseBack="changePassengerType" />
      </li>
      <li>
        <span class="key">{{ $t('zheng_jian_lei_xing') }}</span>
        <Dropdown :data="credentialType" :defaultId="selfMsg.credentialType" :onChoseBack="changeCredentialType" />
      </li>
      <li>
        <span class="key">{{ $t('zheng_jian_hao_ma') }}</span>
        <Input :placeholder="$t('shu_ru_zheng_jian_hao_ma')" :secret="true" v-model="selfMsg.credentialNumber" :status.sync="inputStatus.credentialNumber" key="input-credentialNum" />
      </li>
      <li @click="changeGenders">
        <span class="key">{{ $t('xing_bie') }}</span>
        <Radio v-for="g in genders" :key="g.id" :data="g" :default-status="selfMsg.gender === g.id" place="right" :ref="`genders-${g.id}`" />
      </li>
      <li v-if="selfMsg.birthday">
        <span class="key">{{ $t('chu_sheng_nian_yue') }}</span>
        <Input v-model="selfMsg.birthday.y" type="number" key="inputBirYear" :status.sync="inputStatus.birthday[0]" />
        <span class="unit">{{ $t('nian') }}</span>
        <Input v-model="selfMsg.birthday.m" type="number" key="inputbirMonth" :status.sync="inputStatus.birthday[1]" />
        <span class="unit">{{ $t('yue') }}</span>
        <Input v-model="selfMsg.birthday.d" type="number" key="inputBirDay" :status.sync="inputStatus.birthday[2]" />
        <span class="unit">{{ $t('ri') }}</span>
      </li>
    </ul>
    <div class="tips">
      <p>{{ $t('yin_si_ti_shi') }}</p>
      <p>{{ $t('yin_si_ti_shi_1') }}</p>
    </div>
    <div class="btn">
      <Button type="normal" :text="btnText || $t('bao_cun')" :disabled="!canSave" :need-event="true" @handle="onUpdate" />
    </div>
    <div class="loading" v-show="loading">
      <Loading :width="50" :height="50" />
    </div>
  </div>
</template>

<script>
import Radio from '@/components/basic/Radio.vue';
import Icon from '@/components/basic/Icon.vue';
import ProgressBar from '@/components/basic/ProgressBar.vue';
import Input from '@/components/basic/Input.vue';
import Dropdown from '@/components/basic/Dropdown.vue';
import Button from '@/components/basic/Button.vue';
import Loading from '@/components/basic/Loading.vue';
import { mapState, mapGetters } from 'vuex';
import { LoopEle, noti, getObjectsDiff } from '@/assets/js/util.js';
import isEmpty from 'lodash/isEmpty';
import model from '@/assets/js/axios.js';
import api from '@/assets/js/api.js';

export default {
  name: 'SelfMsg',
  components: {
    Icon,
    Input,
    ProgressBar,
    Dropdown,
    Button,
    Radio,
    Loading,
  },
  data() {
    return {
      // 个人资料
      selfMsg: {},
      selfMsgCopy: {},
      loading: false,
      // input输入值的正确性
      inputStatus: {
        nickName: '',
        email: '',
        phone: '',
        name: '',
        credentialNumber: '',
        birthday: ['', '', ''],
      },
      // 保存按钮文案
      btnText: '',
    };
  },
  computed: {
    userName() {
      return (
        this.userData.name ||
        this.userData.realName ||
        this.userData.phoneNo ||
        this.userData.emailUrl ||
        '--'
      );
    },
    canSave() {
      const { diff, inputStatus } = this;
      let hasVal = false;
      for (let key in diff) {
        if (diff[key] && key !== 'birthday') {
          hasVal = true;
        } else if (
          key === 'birthday' &&
          diff[key] &&
          diff[key].y &&
          diff[key].m &&
          diff[key].d
        ) {
          hasVal = true;
        }
      }
      let allCorrect = true;
      for (let key in inputStatus) {
        if (inputStatus[key] === 'wrong' && key !== 'birthday') {
          allCorrect = false;
        } else if (
          inputStatus[key][0] === 'wrong' ||
          inputStatus[key][1] === 'wrong' ||
          inputStatus[key][2] === 'wrong'
        ) {
          allCorrect = false;
        }
      }
      return hasVal && allCorrect;
    },
    // 编辑过的内容
    diff() {
      return getObjectsDiff(this.selfMsg, this.selfMsgCopy);
    },
    // 完整度
    integrity() {
      let integrity = 0;
      const { selfMsg } = this;
      for (let key in selfMsg) {
        if (key !== 'id' && key !== 'birthday' && selfMsg[key]) {
          integrity += 10;
        }
        if (
          key === 'birthday' &&
          selfMsg.birthday &&
          selfMsg.birthday.y &&
          selfMsg.birthday.m &&
          selfMsg.birthday.d
        ) {
          integrity += 30;
        }
      }
      return Math.round(integrity / 1.1);
    },
    ...mapGetters(['passengerType', 'credentialType', 'genders']),
    ...mapState({
      userData: state => state.login.userData,
    }),
  },
  watch: {
    canSave() {
      if (this.canSave) {
        this.btnText = this.$i18n.t('bao_cun');
      }
    },
    userData: {
      handler() {
        this.setSelfMsg();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 修改乘客类型
    changePassengerType(argId) {
      this.selfMsg.passengerType = argId;
    },

    // 修改证件类型
    changeCredentialType(argId) {
      this.selfMsg.credentialType = argId;
    },

    // 修改性别
    changeGenders(e) {
      LoopEle(e, {
        UL: tar => {
          if (tar.className.indexOf('cp-radio') === -1) {
            return;
          }
          const id = tar.getAttribute('data-id');
          this.selfMsg.gender = id;
          this.genders.forEach(item => {
            if (String(item.id) === id) {
              this.$refs[`genders-${item.id}`][0].onChose();
            } else {
              this.$refs[`genders-${item.id}`][0].unChose();
            }
          });
        },
      });
    },

    // 将vuex中的用户信息填充到selfMsg
    setSelfMsg() {
      const { userData } = this;
      if (!userData.id) {
        return;
      }
      const bir = userData.birthday ? userData.birthday.split('-') : [];
      const toString = arg => {
        return arg ? String(arg) : '';
      };
      const get = () => {
        return {
          id: toString(userData.id),
          nickName: toString(userData.name),
          name: toString(userData.realName),
          email: toString(userData.emailUrl),
          phone: toString(userData.phoneNo),
          passengerType: toString(userData.clientType),
          credentialType: toString(userData.certType),
          credentialNumber: toString(userData.certNo),
          birthday: {
            y: toString(bir[0]),
            m: toString(bir[1]),
            d: toString(bir[2]),
          },
          gender: toString(userData.sex),
        };
      };
      this.selfMsg = Object.assign({}, get());
      this.selfMsgCopy = Object.assign({}, get());
    },

    // 更新用户信息
    async onUpdate() {
      if (this.loading || !this.canSave) {
        return;
      }
      const { selfMsg } = this;
      const bir = selfMsg.birthday;
      const params = {
        name: selfMsg.nickName,
        emailUrl: selfMsg.email,
        phoneNo: selfMsg.phone,
        sex: selfMsg.gender,
        realName: selfMsg.name,
        clientType: selfMsg.passengerType,
        certType: selfMsg.credentialType,
        certNo: selfMsg.credentialNumber,
      };
      if (bir && bir.y && bir.m && bir.d) {
        params.birthday = `${bir.y}-${bir.m}-${bir.d}`;
      }
      for (let key in params) {
        if (!params[key]) {
          delete params[key];
        }
      }
      if (isEmpty(params)) {
        return;
      }

      this.btnText = this.$i18n.t('bao_cun_zhong');
      this.loading = true;

      try {
        // 更新某个属性却要传递所有属性，神奇的后台开发
        await model.post(api.updateLoginUser, { ...params });
      } catch (e) {
        this.loading = false;
        this.btnText = this.$i18n.t('bao_cun');
        noti(e.error || this.$i18n.t('tips.pageUserSelf[1]'));
        return;
      }

      this.loading = false;
      this.btnText = this.$i18n.t('bao_cun_cheng_gong');
      this.$store.dispatch('addLoginUser', params);
    },
  },
};
</script>


<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.p-self-msg {
  position: relative;
  height: 100%;
  width: 100%;
  background-color: #fff;
}
.form {
  padding-top: px2rem(25);
  position: relative;

  .my-loading {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -80px;
  }

  & > li {
    display: flex;
    align-items: center;
    width: px2rem(419);
    min-width: 300px;
    margin: 0 auto;
    white-space: nowrap;
    margin-bottom: px2rem(16);

    .key {
      display: block;
      line-height: 1.25;
      @include fontSizeRespond(16);
      width: px2rem(119);
      min-width: 80px;
      color: #333;
    }
    .unit {
      white-space: nowrap;
      @include fontSizeRespond(16);
      color: #333;
      margin-left: px2rem(9);
      margin-right: px2rem(14);
      &:last-child {
        margin-right: 0;
      }
    }
    &:last-child {
      margin-bottom: 0;
    }
    /deep/ .cp-input {
      flex: 1 1 auto;
      height: px2rem(40);

      &:not(.wrong) {
        border-color: #ddd;
      }
      input {
        font-size: 12px;
        &::placeholder {
          color: #ddd;
        }
      }
    }
    /deep/ .cp-dropdown {
      flex: 1 1 auto;

      .head {
        border: 1px solid #ddd;
        background-color: #fff;
        border-radius: 0;
        height: px2rem(40);
      }
      .content {
        border: 1px solid #ddd;
        border-top: none;
        background-color: #fff;
      }
    }
    /deep/ .cp-radio {
      margin-right: px2rem(30);
      .text-l {
        color: #333;
      }
      .radio {
        border-color: #ddd;
      }
      &:hover {
        .text-l,
        .radio {
          color: $blue;
          border-color: $blue;
        }
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
.head {
  text-align: center;
  padding-top: px2rem(60);

  .progress-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    color: $blue;
    padding-top: px2rem(37);
    @include fontSizeRespond(20);
    white-space: nowrap;
    width: px2rem(419);
    min-width: 300px;
    margin: 0 auto;

    /deep/ .cp-progress-bar {
      flex: 1 1 auto;
      height: 20px;
      margin-right: px2rem(11);
      margin-left: px2rem(16);
    }
  }
  .number {
    margin-top: px2rem(14);
    line-height: 1;
    @include fontSizeRespond(20);
    color: #333;
  }
  .portrait {
    margin: 0 auto;

    /deep/ .iconfont {
      color: #ededed;
      font-size: px2rem(100);
    }
  }
}
.tips {
  width: px2rem(419);
  min-width: 300px;
  margin: 0 auto;
  padding-top: px2rem(30);
  font-size: 14px;
  line-height: 1.78;
  color: #999;
  white-space: nowrap;
}
.btn {
  padding-top: px2rem(39);
  text-align: center;
  padding-bottom: px2rem(93);

  button {
    width: px2rem(150);
    height: px2rem(40);
    min-width: 110px;
    min-height: 30px;
    @include fontSizeRespond(16);
  }
}
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
}
</style>
