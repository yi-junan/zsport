<template>
  <div class="cp-login" v-if="status.showLoginBox">
    <div class="box" :class="{ 'already-login': this.user.id }">
      <div class="shadow" v-show="loading || this.user.id">
        <div v-if="this.user.id">
          <span>{{ $t("deng_lu_cheng_gong") }}，</span>
          <span @click="onBack" class="cursor">{{ $t("fan_hui") }}</span>
        </div>
      </div>

      <div class="head">
        <span class="title" v-show="!showAgreement && !showPolicy && !captchaLogin">
          {{ $t("deng_lu") }}
        </span>
        <span class="title" v-show="!showAgreement && !showPolicy && captchaLogin">
          {{ $t("yan_zheng_ma_deng_lu") }}
        </span>
        <span class="title" v-show="showAgreement">
          {{ $t("fu_wu_xie_yi") }}
        </span>
        <span class="title" v-show="showPolicy">
          {{ $t("yin_si_xie_yi") }}
        </span>
        <div class="close" @click="onClose" v-show="!showAgreement && !showPolicy">
          <Icon name="close" />
        </div>
      </div>

      <!-- 服务协议 -->
      <div class="content text-list" v-show="showAgreement" :style="{ 'height': `${minHeight}px` }">
        <div class="wrap">
          <p>...</p>
        </div>

        <div class="back-pws-login" @click="onClose">
          <Icon name="fanhui" />
          <span>{{ $t("deng_lu") }}</span>
        </div>
      </div>

      <!-- 隐私政策 -->
      <div class="content text-list" v-show="showPolicy" :style="{ 'height': `${minHeight}px` }">
        <div class="wrap">
          <p>...</p>
        </div>

        <div class="back-pws-login" @click="onClose">
          <Icon name="fanhui" />
          <span>{{ $t("deng_lu") }}</span>
        </div>
      </div>

      <!-- 常规登陆 -->
      <div class="content" v-show="!showAgreement && !showPolicy" id="login-content">
        <div v-show="captchaLogin" :class="{ 'no-allow-hanle': !account }">
          <Dropdown :data="prefixNumbers" :default-id="prefixNumbers[0].id" ref="prefix" />
          <Input :placeholder="$t('shou_ji_hao_ma')" key="phoneInput" v-model="phoneInput.val" :status.sync="phoneInput.status" type="phone" />
          <Input :placeholder="$t('yan_zhen_ma')" key="captchaInput" v-model="captchaInput.val" :status.sync="captchaInput.status" :handle="sendCaptcha || $t('fa_song_yan_zheng_ma')" @handle="onSendCaptcha" />
        </div>

        <div v-show="!captchaLogin">
          <Input :placeholder="`${$t('shou_ji_hao_ma')} / ${$t('you_xiang')}`" key="accountInput" v-model="accountInput.val" :status.sync="accountInput.status" :type="['phone', 'email']" />
          <Input :placeholder="$t('deng_lu_mi_ma')" type="password" key="pwdInput" v-model="pwdInput.val" :status.sync="pwdInput.status" :handle="$t('wang_ji_mi_ma')" @handle="goForgotPwd" />
        </div>

        <div class="err-tips" v-show="errTips">
          <Icon name="tixing" />
          <span>{{ errTips }}</span>
        </div>

        <div class="handle pd14" v-show="!captchaLogin">
          <div class="checkBox" @click="toggleSave2Cache">
            <CheckBox ref="checkBox" />
            <span>{{ $t('zi_dong_deng_lu') }}</span>
          </div>
          <div class="captcha" @click="toggleCaptchaLogin">
            {{ $t('yan_zheng_ma_deng_lu') }}
          </div>
        </div>

        <div class="btn" @click="onLogin">
          <Button :text="loading ? $t('deng_lu_zhong'): $t('deng_lu')" type="red" />
        </div>

        <p class="tips">
          {{ $t("deng_lu_tong_yi") }}
          <span @click="toggleAgreement">{{ $t("fu_wu_xie_yi") }}</span>
          {{ $t("he") }}
          <span @click="togglePolicy">{{ $t("yin_si_xie_yi") }}</span>
        </p>

        <div class="handle" v-show="!captchaLogin">
          <div class="go-register" @click="jumpPage('register')">
            {{ $t("li_ji_zhu_ce") }}
          </div>
        </div>

        <div class="skip-login" v-show="showSkipLogin" @click="onSkipLogin">{{ $t("tiao_guo_deng_lu") }}</div>

        <div class="back-pws-login" v-show="captchaLogin" @click="toggleCaptchaLogin">
          <Icon name="fanhui" />
          <span>{{ $t("zhang_hao_mi_ma_deng_lu") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/basic/Icon.vue';
import Input from '@/components/basic/Input.vue';
import CheckBox from '@/components/basic/CheckBox.vue';
import Button from '@/components/basic/Button.vue';
import Dropdown from '@/components/basic/Dropdown.vue';
import model from '@/assets/js/axios';
import api from '@/assets/js/api';
import { mapState } from 'vuex';
import { mapGetters } from 'vuex';
import findIndex from 'lodash/findIndex';
import { noti } from '@/assets/js/util';
import save2CacheWithAes from '@/assets/js/storage/save2CacheWithAes';
import { CACHE_AUTO_LOGIN_KEY } from '@/assets/js/constant';

export default {
  components: {
    Icon,
    Input,
    CheckBox,
    Dropdown,
    Button,
  },
  data() {
    return {
      errTips: '',
      minHeight: 0,
      // 用手机验证码登陆
      captchaLogin: false,
      // 是否显示服务协议
      showAgreement: false,
      // 是否显示隐私政策
      showPolicy: false,
      loading: false,
      // 是否将账号密码保存到localstorage
      save2Cache: false,
      accountInput: {
        val: '',
        status: '',
      },
      phoneInput: {
        val: '',
        status: '',
      },
      pwdInput: {
        val: '',
        status: '',
      },
      captchaInput: {
        val: '',
        status: '',
      },
      // 发送验证码按钮文案
      sendCaptcha: '',
    };
  },
  computed: {
    // 能否发送验证码
    canSendCaptcha() {
      return (
        this.sendCaptcha === this.$i18n.t('fa_song_yan_zheng_ma') ||
        !this.sendCaptcha
      );
    },

    // 单程和往返页面出现跳过登陆选项
    showSkipLogin() {
      const { path } = this.$route;
      return (
        path.indexOf('one_way') !== -1 || path.indexOf('round_trip') !== -1
      );
    },
    // 登陆账号
    account() {
      const input = this.captchaLogin ? this.phoneInput : this.accountInput;
      if (input.val && input.status !== 'wrong') {
        return input.val;
      }
      return '';
    },
    // 登陆密码
    password() {
      const { pwdInput } = this;
      if (pwdInput.val && pwdInput.status !== 'wrong') {
        return pwdInput.val;
      }
      return '';
    },
    // 短信验证码
    captcha() {
      const { captchaInput } = this;
      if (captchaInput.val && captchaInput.status !== 'wrong') {
        return captchaInput.val;
      }
      return '';
    },
    // 号码前缀
    prefix() {
      const hit = findIndex(
        this.prefixNumbers,
        item => String(item.id) === String(this.$refs.prefix.activeId),
      );
      if (hit !== -1) {
        return this.prefixNumbers[hit];
      }

      return this.prefixNumbers[0];
    },
    ...mapGetters(['prefixNumbers']),
    ...mapState({
      status: 'status',
      user: state => state.login.userData,
    }),
  },
  watch: {
    'status.showLoginBox'(argStatus) {
      if (argStatus) {
        this.reset();
        this.$nextTick(() => {
          this.minHeight = this.$el.querySelector(
            '#login-content',
          ).offsetHeight;
        });
      }
    },
  },
  methods: {
    reset() {
      this.captchaLogin = false;
      this.accountInput = { val: '', status: '' };
      this.phoneInput = { val: '', status: '' };
      this.pwdInput = { val: '', status: '' };
      this.captchaInput = { val: '', status: '' };
    },

    // 关闭服务协议||隐私协议||窗口
    onClose() {
      if (this.showAgreement || this.showPolicy) {
        this.showAgreement = false;
        this.showPolicy = false;
      } else {
        this.$store.dispatch('toggleLoginBox');
      }
    },

    toggleAgreement() {
      this.showAgreement = !this.showAgreement;
    },

    togglePolicy() {
      this.showPolicy = !this.showPolicy;
    },

    // 将账号密码保存到localstorage
    onSave2Cache() {
      if (this.save2Cache && !this.captchaLogin) {
        save2CacheWithAes(
          CACHE_AUTO_LOGIN_KEY,
          `${this.account}-${this.password}`,
        );
      }
    },

    // 切换30天内自动登陆按钮
    toggleSave2Cache() {
      this.save2Cache = !this.save2Cache;
      this.$refs.checkBox.toggle();
    },

    // 切换验证码登陆||密码登陆
    toggleCaptchaLogin() {
      this.errTips = '';
      this.captchaLogin = !this.captchaLogin;
    },

    // 发送登陆请求
    async onLogin() {
      if (this.captchaLogin && (!this.account || !this.captcha)) {
        this.errTips = this.$i18n.t('tips.pageLogin[1]');
        return;
      }
      if (!this.captchaLogin && (!this.account || !this.password)) {
        this.errTips = this.$i18n.t('tips.pageLogin[2]');
        return;
      }

      const params = {
        val: this.account,
      };
      let theApi = api.loginByCode;
      if (this.captchaLogin) {
        params.verificationCode = this.captcha;
        params.nationCode = this.prefix.value;
        params.type = 1;
      } else {
        params.password = this.password;
        params.type = params.val.indexOf('@') !== -1 ? 2 : 1;
        theApi = api.login;
      }
      let res;
      this.errTips = '';
      this.loading = true;
      try {
        res = await model.post(theApi, params);
      } catch (e) {
        this.loading = false;
        this.errTips = e.error || this.$i18n.t('tips.global[2]');
        return;
      }
      if (!res.success) {
        this.loading = false;
        this.errTips = this.captchaLogin
          ? this.$i18n.t('tips.pageLogin[1]')
          : this.$i18n.t('tips.pageLogin[2]');
        return;
      }
      this.onSave2Cache();
      // login页面不关闭窗口
      if (this.$route.path.indexOf('login') === -1) {
        this.$store.dispatch('toggleLoginBox');
      }
      await this.$store.dispatch('fetchLoginUser', { noGlobalLoading: true });
      this.loading = false;
    },

    // 发送验证码
    async onSendCaptcha() {
      if (!this.account || !this.canSendCaptcha) {
        return;
      }
      this.sendCaptcha = this.$i18n.t('fa_song_zhong');
      try {
        await model.get(api.sendCaptcha, {
          nationCode: this.prefix.value,
          val: this.account,
          checkType: 3,
          type: 1,
        });
      } catch (e) {
        this.sendCaptcha = this.$i18n.t('fa_song_yan_zheng_ma');
        noti(e.error || this.$i18n.t('tips.global[1]'));
        return;
      }
      clearInterval(this.timer);
      this.sendCaptcha = '80s';
      this.timer = setInterval(() => {
        if (this.sendCaptcha === '0s') {
          clearInterval(this.timer);
          this.timer = null;
          this.sendCaptcha = this.$i18n.t('fa_song_yan_zheng_ma');
          return;
        }
        const count = this.sendCaptcha.split('s')[0];
        this.sendCaptcha = `${Number(count) - 1}s`;
      }, 1000);
    },

    // 前往注册页面
    jumpPage(argName) {
      this.$router.push(`/${argName}`);
    },

    goForgotPwd() {
      this.jumpPage('forgot_pwd');
    },

    onSkipLogin() {
      this.$store.dispatch('updateSkipLogin', true);
      this.$store.dispatch('toggleLoginBox');
    },

    // 根据路由参数，跳转回前一个页面
    onBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped lang="scss">
@import '../assets/css/color.scss';
@import '../assets/css/util.scss';

.cp-login {
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 100;
  padding-top: px2rem(100);
  box-sizing: border-box;
}

.box {
  background-color: #fff;
  min-width: 400px;
  position: relative;

  &.already-login .content {
    opacity: 0.1;
  }
}

.shadow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $blue;
  @include fontSizeRespond(24);

  .cursor {
    cursor: pointer;
  }
}

.head {
  height: px2rem(62);
  text-align: center;
  background-color: $blue;
  color: #fff;
  position: relative;

  .title {
    @include fontSizeRespond(24);
    white-space: nowrap;
    line-height: px2rem(62);
  }
  .close {
    cursor: pointer;
    position: absolute;
    right: px2rem(19);
    top: 0;
    bottom: 0;
    margin: auto;
    height: 20px;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    .iconfont {
      @include fontSizeRespond(30);
    }
  }
}

.content {
  padding: px2rem(28) px2rem(64);
  width: 100%;
  box-sizing: border-box;

  &.text-list {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 0;
    padding-bottom: px2rem(70);

    .wrap {
      flex: 1 0 auto;
      overflow: auto;
      word-break: break-all;
      line-height: 1.4;
      color: #333;
      padding: px2rem(28) px2rem(64);
      box-sizing: border-box;
      -ms-scroll-chaining: none;
      overscroll-behavior: contain;
      @include fontSizeRespond(16);
    }
    .back-pws-login {
      flex: none;
      position: absolute;
      bottom: px2rem(15);
      left: px2rem(30);
      margin-left: 0;
    }
  }

  .no-allow-hanle /deep/ .handle {
    color: #999;
    cursor: not-allowed;
  }

  /deep/ .cp-dropdown {
    margin-bottom: px2rem(19);

    .head {
      border: 1px solid #c2c2c2;
      height: px2rem(43);
      background-color: #fff;
      border-radius: 0;
    }

    .content {
      background-color: #fff;
      border: 1px solid #c2c2c2;
      border-top: none;
    }
  }

  /deep/ .cp-input {
    margin-bottom: px2rem(19);
    height: px2rem(43);

    &:not(.wrong) {
      border-color: #c2c2c2;
    }
    &:last-of-type {
      margin-bottom: px2rem(11);
    }
  }

  .pd14 {
    padding-top: px2rem(14);
  }

  .handle {
    display: flex;
    align-items: center;

    .captcha {
      display: inline-block;
      color: #5a5a5a;
      cursor: pointer;
      @include fontSizeRespond(16);
      margin-left: auto;

      &:hover {
        color: $blue;
      }
    }
    .checkBox {
      display: flex;
      align-items: center;
      @include fontSizeRespond(16);
      color: #5a5a5a;
      cursor: pointer;

      .iconfont {
        @include fontSizeRespond(16);
      }
      span {
        margin-left: px2rem(10);
      }
    }
    .go-register {
      line-height: px2rem(32);
      @include fontSizeRespond(16);
      color: $blue;
      margin-top: px2rem(47);
      cursor: pointer;
      margin-left: auto;

      &:hover {
        color: $lightBlue;
      }
    }
  }

  .btn {
    width: 100%;
    @include decreaseHeight(37);
    @include fontSizeRespond(18);
    margin-top: px2rem(60);

    button {
      width: 100%;
      height: 100%;
    }
  }

  .skip-login {
    line-height: 1.5;
    @include fontSizeRespond(16);
    color: $blue;
    margin-top: px2rem(54);
    cursor: pointer;

    &:hover {
      color: $lightBlue;
    }
  }

  .tips {
    margin-top: px2rem(10);
    @include fontSizeRespond(16);
    color: #a1a1a1;
    text-align: center;

    span {
      text-decoration: underline;
      cursor: pointer;
    }
  }

  .err-tips {
    @include fontSizeRespond(16);
    line-height: 1.5;
    margin-bottom: px2rem(11);
    color: $red;

    span {
      margin-left: px2rem(8);
    }
  }

  .back-pws-login {
    display: flex;
    align-items: center;
    margin-top: px2rem(42);
    line-height: 1.5;
    @include fontSizeRespond(16);
    color: $blue;
    margin-left: px2rem(-32);
    cursor: pointer;

    &:hover {
      color: $lightBlue;
    }
    .icon {
      @include fontSizeRespond(16);
    }
    span {
      margin-left: px2rem(6);
    }
  }
}
</style>
