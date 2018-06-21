<template>
  <div class="limit">
    <div class="box">
      <div class="head">
        <div class="title">{{ $t("wang_ji_mi_ma") }}</div>
        <div class="paths">
          <span>{{ $t("dang_qian_wei_zhi") }}: </span>
          <router-link to="/index">{{ $t('shou_ye') }}</router-link>
          <span>></span>
          <router-link to="/login">{{ $t('deng_lu') }}</router-link>
          <span>></span>
          <span>{{ $t('wang_ji_mi_ma') }}</span>
        </div>
      </div>
      <div class="content">
        <div>
          <div class="loading" v-show="loading">
            <Loading :width="40" :height="40" />
          </div>
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
          <div class="btn">
            <Button :text="$t('que_ren_xiu_gai')" :disabled="!canSave" type="red" :need-event="true" @handle="onSure" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Input from '@/components/basic/Input.vue';
import Loading from '@/components/basic/Loading.vue';
import Button from '@/components/basic/Button.vue';
import Icon from '@/components/basic/Icon.vue';
import { noti } from '@/assets/js/util';
import model from '@/assets/js/axios.js';
import api from '@/assets/js/api.js';

export default {
  components: { Input, Button, Icon, Loading },
  data() {
    return {
      loading: false,
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
          checkType: 2,
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

    // 确认修改
    async onSure() {
      if (!this.canSave) {
        return;
      }
      this.loading = true;
      const params = this.getRequestParams();
      try {
        await model.post(api.resetPwd, params);
      } catch (e) {
        this.loading = false;
        noti(e.error || this.$i18n.t('tips.global[2]'));
        return;
      }
      this.loading = false;
      this.accountInput.val = '';
      this.captchaInput.val = '';
      this.pwdInput.val = '';
      this.pwd1Input.val = '';
      noti('密码已重置，请使用新密码登录');
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

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
  position: relative;

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

  .loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
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
