<template>
  <Popup ref="addPassengerPopup">
    <div slot="mid" class="cp-add-passenger">
      <div class="my-loading" v-show="loading">
        <Loading :width="40" :height="40" />
      </div>
      <ul class="form">
        <li>
          <span class="key">{{ $t('xing_ming') }}</span>
          <Input :placeholder="$t( 'zhen_jian_xing_ming')" v-model="msg.name" :status.sync="inputStatus.name" key="addPassengerInputName" />
        </li>
        <li>
          <span class="key">{{ $t('cheng_ke_lei_xing') }}</span>
          <Dropdown :data="passengerType" :default-id="msg.passengerType" :on-chose-back="changePassengerType" />
        </li>
        <li>
          <span class="key">{{ $t('zheng_jian_lei_xing') }}</span>
          <Dropdown :data="credentialType" :default-id="msg.credentialType" :on-chose-back="changeCredentialType" />
        </li>
        <li>
          <span class="key">{{ $t('zheng_jian_hao_ma') }}</span>
          <Input :placeholder="$t('shu_ru_zheng_jian_hao_ma')" :secret="true" v-model="msg.credentialNumber" :status.sync="inputStatus.credentialNumber" key="addPassengerInputCredentialNumber" />
        </li>
        <li @click="changeGender">
          <span class="key">{{ $t('xing_bie') }}</span>
          <Radio v-for="g in genders" :key="g.id" :data="g" :default-status="msg.gender===g .id" place="right" :ref="`gender-${g.id}`" />
        </li>
        <li v-if="msg.birthday">
          <span class="key">{{ $t('chu_sheng_nian_yue') }}</span>
          <Input type="number" v-model="msg.birthday.y" :status.sync="inputStatus.birthday[0]" key="addPassengerInputBirY" />
          <span class="unit">{{ $t('nian') }}</span>
          <Input type="number" v-model="msg.birthday.m" :status.sync="inputStatus.birthday[1]" key="addPassengerInputBirM" />
          <span class="unit">{{ $t('yue') }}</span>
          <Input type="number" v-model="msg.birthday.d" :status.sync="inputStatus.birthday[2]" key="addPassengerInputBirD" />
          <span class="unit">{{ $t('ri') }}</span>
        </li>
      </ul>
      <div class="save-btn" @click="onSave">
        <Button type="normal" :text="btnText || $t('bao_cun')" :disabled="!canSave" />
      </div>
    </div>
  </Popup>
</template>

<script>
import Popup from '@/components/basic/Popup.vue';
import Loading from '@/components/basic/Loading.vue';
import Input from '@/components/basic/Input.vue';
import Dropdown from '@/components/basic/Dropdown.vue';
import Radio from '@/components/basic/Radio.vue';
import Button from '@/components/basic/Button.vue';
import { mapGetters } from 'vuex';
import { getObjectsDiff, noti, LoopEle } from '@/assets/js/util.js';
import isEmpty from 'lodash/isEmpty';
import model from '@/assets/js/axios.js';
import api from '@/assets/js/api.js';

export default {
  components: {
    Popup,
    Input,
    Dropdown,
    Radio,
    Button,
    Loading,
  },
  props: {
    closeAfterSave: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isUpdate: false,
      // 保存按钮文案
      btnText: '',
      old: {},
      msg: {},
      loading: false,
      inputStatus: {
        name: '',
        credentialNumber: '',
        birthday: ['', '', ''],
      },
    };
  },
  computed: {
    canSave() {
      const { diff, inputStatus } = this;
      if (isEmpty(diff)) {
        return;
      }
      let hasVal = true;
      for (let key in diff) {
        if (!diff[key]) {
          hasVal = false;
        }
        if (
          key === 'birthday' &&
          (!diff[key].y || !diff[key].m || !diff[key].d)
        ) {
          hasVal = false;
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
    diff() {
      return getObjectsDiff(this.msg, this.old);
    },
    ...mapGetters(['passengerType', 'credentialType', 'genders']),
  },
  watch: {
    canSave() {
      if (this.canSave) {
        this.btnText = this.$i18n.t('bao_cun');
      }
    },
  },
  methods: {
    // 切换乘客类型
    changePassengerType(argId) {
      this.msg.passengerType = argId;
    },

    // 切换证件类型
    changeCredentialType(argId) {
      this.msg.credentialType = argId;
    },

    // 切换性别
    changeGender(e) {
      LoopEle(e, {
        UL: tar => {
          if (tar.className.indexOf('cp-radio') === -1) {
            return;
          }
          const id = tar.getAttribute('data-id');
          this.msg.gender = id;
          this.genders.forEach(item => {
            if (String(item.id) === id) {
              this.$refs[`gender-${item.id}`][0].onChose();
            } else {
              this.$refs[`gender-${item.id}`][0].unChose();
            }
          });
        },
      });
    },

    // 增加乘客
    async onSave() {
      if (this.loading || !this.canSave) {
        return;
      }
      if (this.isUpdate) {
        await this.updatePassenger();
      } else {
        this.loading = true;
        this.btnText = this.$i18n.t('bao_cun_zhong');
        let id;
        try {
          id = await this.$store.dispatch('addPassenger', this.msg);
        } catch (e) {
          this.loading = false;
          this.btnText = this.$i18n.t('bao_cun');
          noti(e.error || this.$i18n.t('tips.pageUserPassenger[1]'));
          return;
        }
        this.msg = { ...this.msg, id };
        // 保证object不共用
        this.old = { ...this.msg, id, birthday: { ...this.msg.birthday } };
        this.isUpdate = true;
        this.loading = false;
        this.btnText = this.$i18n.t('bao_cun_cheng_gong');
      }

      if (this.closeAfterSave) {
        this.$refs.addPassengerPopup.onClose();
      }
    },

    // 更新乘客信息
    async updatePassenger() {
      const { msg } = this;
      const bir = msg.birthday;
      const params = {
        id: msg.id,
        name: msg.name,
        email: msg.email,
        phone: msg.phone,
        sex: msg.gender,
        clientType: msg.passengerType,
        type: msg.credentialType,
        idNumber: msg.credentialNumber,
      };
      if (bir && bir.y && bir.m && bir.d) {
        params.birthday = `${bir.y}-${bir.m}-${bir.d}`;
      }
      this.btnText = this.$i18n.t('bao_cun_zhong');
      this.loading = true;
      try {
        await model.post(api.updatePassenger, { ...params });
      } catch (e) {
        this.loading = false;
        noti(e.error || this.$i18n.t('tips.pageUserPassenger[2]'));
        return;
      }

      this.loading = false;
      this.btnText = this.$i18n.t('bao_cun_cheng_gong');
      this.$store.dispatch('updatePassenger', { id: msg.id, ...this.diff });
      // 保证object不共用
      this.old = { ...this.msg, birthday: { ...this.msg.birthday } };
    },

    onToggle(argData) {
      this.btnText = this.$i18n.t('bao_cun');
      this.$refs.addPassengerPopup.toggle();
      if (argData) {
        const get = () => {
          const bir = argData.birthday
            ? argData.birthday.split('-')
            : ['', '', ''];
          return {
            id: argData.id,
            name: argData.name,
            passengerType: argData.passengerType,
            credentialType: argData.credentialType,
            credentialNumber: argData.credentialNumber,
            gender: argData.gender,
            birthday: { y: bir[0], m: bir[1], d: bir[2] },
          };
        };
        this.msg = get();
        this.old = get();
        this.isUpdate = true;
      } else {
        this.msg = Object.assign(
          {},
          {
            id: '',
            name: '',
            passengerType: '',
            credentialType: '',
            credentialNumber: '',
            gender: '',
            birthday: { y: '', m: '', d: '' },
          },
        );
        this.old = Object.assign({}, { id: '' });
        this.isUpdate = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-add-passenger {
  position: relative;
}
.my-loading {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.form {
  width: 100%;
  padding: px2rem(20) px2rem(56) px2rem(68) px2rem(56);
  box-sizing: border-box;

  & > li {
    display: flex;
    align-items: center;
    margin-bottom: px2rem(25);
    width: px2rem(387);
    min-width: 300px;

    &:last-child {
      margin-bottom: 0;

      /deep/ .cp-input input {
        padding: 0;
        text-align: center;
      }
    }
    .key {
      @include fontSizeRespond(20);
      width: px2rem(80);
      min-width: 56px;
      margin-right: px2rem(25);
      white-space: nowrap;
      color: #404040;
      line-height: 1.25;
      flex: none;
      display: block;
    }
    /deep/ .cp-radio {
      margin-right: px2rem(31);

      &:last-child {
        margin-right: 0;
      }
      .text-l {
        margin-right: px2rem(8);
        color: #333;
        @include fontSizeRespond(20);
      }
      .radio {
        border-color: #eee;
      }
    }
    /deep/ .cp-dropdown {
      flex: 1 1 auto;
      .head {
        height: px2rem(34);
        min-height: 30px;
        background-color: #fff;
        border: 1px solid #eee;
        border-radius: 0;
      }
      .content {
        border: 1px solid #eee;
        border-top: none;
        background-color: #fff;
      }
    }
    /deep/ .cp-input {
      flex: 1 1 auto;
      height: px2rem(34);
      min-height: 30px;

      &:not(.wrong) {
        border: 1px solid #eee;
      }
      input {
        width: 100%;
        &::placeholder {
          color: #ccc;
        }
      }
    }
    .unit {
      @include fontSizeRespond(20);
      color: #333;
      margin-left: px2rem(9);
      margin-right: px2rem(18);

      &:last-child {
        margin-right: 0;
      }
    }
  }
}
.save-btn {
  text-align: center;
  padding-bottom: px2rem(31);

  button {
    @include fontSizeRespond(20);
    width: px2rem(150);
    height: px2rem(40);
    min-height: 30px;
    min-width: 100px;
  }
}
</style>
