<template>
  <Popup :title="$t('duan_xin_yan_zhen')" ref="verifyConcat">
    <div slot="mid" class="cp-verify-concat">
      <div class="checked-tips" v-if="isChecked()">
        {{ $t('yan_zheng_cheng_gong') }}
      </div>
      <div class="head">
        <p class="val">{{ concat }}</p>
        <Button :text="sendText || $t('fa_song_yan_zheng_ma')" :need-event="true" @handle="sendVerifyCode" />
      </div>
      <Input :placeholder="$t('tian_xie_yan_zhen_ma')" v-model="code" :status.sync="status" :handle="chkText || $t('yan_zheng')" @handle="checkVerifyCode" />
    </div>
  </Popup>
</template>

<script>
import Popup from '@/components/basic/Popup.vue';
import Button from '@/components/basic/Button.vue';
import Input from '@/components/basic/Input.vue';
import { noti } from '@/assets/js/util.js';
import model from '@/assets/js/axios';
import api from '@/assets/js/api';

export default {
  components: { Popup, Button, Input },
  props: {
    concat: {
      type: [String, Number],
      default: '',
    },
    type: {
      type: Number,
      default: 1, // 1:手机 2:邮件
    },
    // 手机号码地区号
    prefix: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // 验证按钮文案
      chkText: '',
      // 发送验证码按钮文案
      sendText: '',
      code: '',
      status: '',
      history: [],
    };
  },
  computed: {
    // 能不能再次发送验证码
    canSend() {
      return (
        this.sendText === this.$i18n.t('fa_song_yan_zheng_ma') || !this.sendText
      );
    },

    // 能不能检查验证码
    canCheck() {
      return this.code && this.status !== 'wrong';
    },
  },
  methods: {
    toggle() {
      return this.$refs.verifyConcat.toggle();
    },

    // 发送验证码
    async sendVerifyCode() {
      if (!this.canSend) {
        return;
      }
      this.sendText = this.$i18n.t('fa_song_zhong');
      const params = {
        val: this.concat,
        checkType: 4,
        type: this.type,
      };
      if (this.prefix) {
        params.nationCode = this.prefix;
      }
      try {
        await model.get(api.sendCaptcha, params);
      } catch (e) {
        this.sendText = this.$i18n.t('fa_song_yan_zheng_ma');
        noti(e.error || this.$i18n.t('tips.global[1]'));
        return;
      }
      this.sendText = '80s';
      this.timer = setInterval(() => {
        if (this.sendText === '0s') {
          clearInterval(this.timer);
          this.timer = null;
          this.sendText = this.$i18n.t('fa_song_yan_zheng_ma');
          return;
        }
        const count = this.sendText.split('s')[0];
        this.sendText = `${Number(count) - 1}s`;
      }, 1000);
    },

    // 检验验证码
    async checkVerifyCode() {
      if (!this.canCheck) {
        return;
      }
      this.chkText = this.$i18n.t('yan_zheng_zhong');
      try {
        await model.post(api.checkCaptcha, {
          nationCode: this.prefix,
          val: this.concat,
          verificationCode: this.code,
          type: this.type,
        });
      } catch (e) {
        this.chkText = this.$i18n.t('yan_zheng');
        noti(e.error || this.$i18n.t('tips.global[1]'));
        return;
      }
      this.code = '';
      this.chkText = this.$i18n.t('yan_zheng');
      this.history.push(this.concat);
      this.$emit('success');
    },

    // 判断是否已校验
    isChecked() {
      return this.history.indexOf(this.concat) !== -1;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/css/color.scss';

.cp-verify-concat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 30px 30px 30px;
  position: relative;

  /deep/ .cp-input {
    margin-top: 40px;
    border-top: none;
    border-left: none;
    border-right: none;
    width: 250px;
    height: 34px;
    input {
      text-align: center;
    }
  }
}

.head {
  display: flex;
  align-items: center;
  padding-top: 20px;

  .val {
    font-size: 14px;
    color: #666;
    margin-right: 15px;
  }
  /deep/ .cp-btn {
    border: 1px solid #ddd;
    background-color: #fff;
    color: #666;
    border-radius: 4px;

    &:hover {
      background-color: #fff;
      color: $blue;
    }
  }
}

.checked-tips {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $blue;
  font-size: 16px;
}
</style>
