<template>
  <div class="limit">
    <div class="box">
      <div class="head">
        <div class="title">{{ $t("zhu_ce_zhang_hao") }}</div>
        <div class="paths">
          <span>{{ $t("dang_qian_wei_zhi") }}: </span>
          <router-link to="/index">{{ $t('shou_ye') }}</router-link>
          <span>></span>
          <span>{{ $t('zhu_ce') }}</span>
        </div>
      </div>

      <div class="content">
        <div>
          <div class="input-box">
            <p class="key">{{ $t('zhang_hao') }}</p>
            <Input :placeholder="`${$t('shou_ji_hao_ma')} / ${$t('you_xiang')}`" key="accountInput" v-model="accountInput.val" :status.sync="accountInput.status" :type="['phone', 'email']" />
            <p class="tips">{{ $t("shou_ji_ti_shi") }}</p>
          </div>
          <div class="input-box" :class="{ 'no-allow-hanle': !accountInput.val || accountInput.status === 'wrong'  }">
            <p class="key">{{ $t('yan_zhen_ma') }}</p>
            <Input :placeholder="$t('tian_xie_yan_zhen_ma')" key="captchaInput" v-model="captchaInput.val" :status.sync="captchaInput.status" :handle="sendCaptchaBtn || $t('fa_song_yan_zheng_ma')" @handle="onSendCaptcha" />
          </div>
          <div class="input-box">
            <p class="key">{{ $t('deng_lu_mi_ma') }}</p>
            <Input :placeholder="$t('mi_ma_ge_shi')" key="pwdInput" v-model="pwdInput.val" :status.sync="pwdInput.status" type="password" :min="8" :max="20" />
          </div>
          <div class="input-box">
            <p class="key">{{ $t('que_ren_deng_lu_mi_ma') }}</p>
            <Input :placeholder="$t('shu_ru_mi_ma')" key="pwd1Input" v-model="pwd1Input.val" :status.sync="pwd1Input.status" type="password" :min="8" :max="20" />
            <div class="err-tips" v-show="!isPwdEqual">
              <Icon name="tixing" />
              <span>{{ $t('mi_ma_ti_shi') }}</span>
            </div>
          </div>
          <p class="need-know">
            {{ $t('tong_yi_wo_men') }}
            <span @click="openServiceAgreement">《{{ $t('fu_wu_xie_yi') }}》</span>
            {{ $t('he') }}
            <span @click="openPrivacyPolicy">《{{ $t('yin_si_xie_yi') }}》</span>
          </p>
          <div class="btn">
            <Button :text="$t('tong_yi_zhu_ce')" :disabled="!canSave" type="red" :need-event="true" @handle="onRegister" />
          </div>
        </div>
      </div>
    </div>

    <Popup :title="`《${$t('fu_wu_xie_yi')}》`" ref="serviceAgreement">
      <div slot="mid" class="popup-content" />
    </Popup>

    <Popup :title="`《${$t('yin_si_xie_yi')}》`" ref="privacyPolicy">
      <div slot="mid" class="popup-content" />
    </Popup>
  </div>
</template>

<script>
import Input from '@/components/basic/Input.vue';
import Button from '@/components/basic/Button.vue';
import Popup from '@/components/basic/Popup.vue';
import Icon from '@/components/basic/Icon.vue';
import { noti } from '@/assets/js/util';
import model from '@/assets/js/axios.js';
import api from '@/assets/js/api.js';

export default {
  components: { Input, Button, Popup, Icon },
  data() {
    return {
      accountInput: { val: '', status: '' },
      captchaInput: { val: '', status: '' },
      pwdInput: { val: '', status: '' },
      pwd1Input: { val: '', status: '' },
      // 发送验证码按钮文案
      sendCaptchaBtn: '',
    };
  },
  computed: {
    canSave() {
      return (
        !!this.accountInput.val &&
        !!this.captchaInput.val &&
        !!this.pwdInput.val &&
        !!this.pwd1Input.val &&
        this.accountInput.status !== 'wrong' &&
        this.captchaInput.status !== 'wrong' &&
        this.pwdInput.status !== 'wrong' &&
        this.pwd1Input.status !== 'wrong'
      );
    },
    isPwdEqual() {
      if (!this.pwdInput.val || !this.pwd1Input.val) {
        return true;
      }
      return this.pwdInput.val === this.pwd1Input.val;
    },
  },
  methods: {
    openServiceAgreement() {
      this.$refs.serviceAgreement.onOpen();
    },

    openPrivacyPolicy() {
      this.$refs.privacyPolicy.onOpen();
    },

    // 获取发送请求的参数
    getRequestParams() {
      const params = {
        password: this.pwdInput.val,
        verificationCode: this.captchaInput.val,
      };
      if (this.accountInput.val.indexOf('@') !== -1) {
        params.type = 2;
        params.val = this.accountInput.val; // 邮箱
      } else {
        const { val } = this.accountInput;
        const valArr = val.split('-');
        const len = valArr.length;
        params.nationCode = len > 1 ? valArr[0] : 86;
        params.val = len > 1 ? valArr[1] : val; // 手机
        params.type = 1;
      }
      return params;
    },

    // 发送验证码
    async onSendCaptcha() {
      const { val, status } = this.accountInput;
      if (!val || status === 'wrong') {
        return;
      }
      const params = this.getRequestParams();
      this.sendCaptchaBtn = this.$i18n.t('fa_song_zhong');
      try {
        await model.get(api.sendCaptcha, {
          nationCode: params.nationCode,
          val: params.val,
          type: params.type,
          checkType: 1,
        });
      } catch (e) {
        this.sendCaptchaBtn = this.$i18n.t('fa_song_yan_zheng_ma');
        noti(e.error || this.$i18n.t('tips.global[1]'));
        return;
      }
      clearInterval(this.timer);
      this.sendCaptchaBtn = '80s';
      this.timer = setInterval(() => {
        if (this.sendCaptchaBtn === '0s') {
          clearInterval(this.timer);
          this.timer = null;
          this.sendCaptchaBtn = this.$i18n.t('fa_song_yan_zheng_ma');
          return;
        }
        const count = this.sendCaptchaBtn.split('s')[0];
        this.sendCaptchaBtn = `${Number(count) - 1}s`;
      }, 1000);
    },

    // 注册
    async onRegister() {
      if (!this.canSave) {
        return;
      }
      this.$store.dispatch('toggleGlobalLoading', {
        text: this.$i18n.t('tips.pageRegister[1]'),
        loading: 1,
      });
      const params = this.getRequestParams();
      try {
        await model.get(api.register, params);
      } catch (e) {
        noti(e.error || this.$i18n.t('tips.pageRegister[2]'));
        this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
        return;
      }
      this.$store.dispatch('toggleGlobalLoading', {
        text: this.$i18n.t('tips.pageRegister[3]'),
        loading: 1,
      });
      try {
        await model.post(api.login, {
          val: params.val,
          password: params.password,
          type: params.type,
        });
      } catch (e) {
        this.$store.dispatch('toggleGlobalLoading', {
          text: this.$i18n.t('tips.pageRegister[4]'),
          loading: 1,
        });
        setTimeout(() => this.$router.push('/login'), 2000);
        return;
      }
      await this.$store.dispatch('fetchLoginUser', { noGlobalLoading: true });

      this.$store.dispatch('toggleGlobalLoading', {
        text: this.$i18n.t('tips.pageRegister[5]'),
        loading: 1,
      });
      setTimeout(() => this.$router.push('/index'), 2000);
    },
  },
  beforeDestroy() {
    this.$store.dispatch('toggleGlobalLoading', { loading: 0 });
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.popup-content {
  min-width: 350px;
  height: 350px;
}

.box {
  width: 100%;
  background-color: #fff;
  margin-top: px2rem(30);
  min-height: 100px;
  padding-left: px2rem(29);
  padding-right: px2rem(29);
  box-sizing: border-box;
  padding-bottom: px2rem(104);
}

.head {
  height: px2rem(71);
  border-bottom: 1px solid #ddd;
  position: relative;

  .title {
    color: #333;
    @include fontSizeRespond(24);
    position: absolute;
    bottom: px2rem(18);
    left: 0;
  }
  .paths {
    color: #333;
    position: absolute;
    bottom: px2rem(18);
    right: 0;
    font-size: 14px;
    display: flex;
    align-items: center;

    a {
      color: #333;
      text-decoration: none;
      &:hover {
        color: $blue;
      }
    }
    & > * {
      margin-right: 5px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: px2rem(27);

  .input-box {
    margin-bottom: px2rem(28);

    &.no-allow-hanle {
      /deep/ .handle {
        color: #999;
        cursor: not-allowed;
      }
    }

    .key {
      @include fontSizeRespond(18);
      color: #333;
      width: 137px;
      display: inline-flex;
      height: px2rem(43);
      line-height: px2rem(43);
      text-align: left;
      vertical-align: top;
    }
    /deep/ .cp-input {
      display: inline-flex;
      height: px2rem(43);
      width: px2rem(362);
    }
    [class*='tips'] {
      color: #ccc;
      white-space: nowrap;
      padding-top: px2rem(16);
      font-size: 14px;
      padding-left: 137px;
    }
    .err-tips {
      color: $red;
      span {
        margin-left: 5px;
      }
      /deep/ .iconfont {
        font-size: 14px;
      }
    }
  }
  .need-know {
    display: flex;
    color: #a1a1a1;
    @include fontSizeRespond(16);
    span {
      cursor: pointer;
      color: $blue;
    }
  }
  .btn {
    padding-top: px2rem(29);
    margin-left: 137px;
    padding-left: px2rem(52);

    /deep/ .cp-btn {
      @include decreaseHeight(40);
      @include decreaseWidth(120);
      @include fontSizeRespond(18);
    }
  }
}
</style>
