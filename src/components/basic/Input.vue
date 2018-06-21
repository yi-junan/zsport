<template>
  <div class="cp-input" :class="status">
    <input :placeholder="placeholder" :value="(!isInputing && secret) ? secretVal : val" @input="onInput" @blur="onBlur" @focus="onFocus" :type="isPwd ? 'password' : 'text'" />
    <div class="handle" v-if="handle" @click="$emit('handle')">{{ handle }}</div>
  </div>
</template>

<script>
import { getSecretStr } from '@/assets/js/util.js';
import flatten from 'lodash/flatten';

export default {
  model: {
    prop: 'val',
    event: 'input',
  },
  props: {
    // 说明
    placeholder: {
      type: String,
      default: '',
    },
    // 是否隐蔽显示，只有中间一部分使用**隐蔽，需要全隐蔽使用type，传password
    secret: {
      type: Boolean,
      default: false,
    },
    // email number password phone，也可传递数组组合，表示是否满足其中一项
    type: {
      type: [String, Array],
      default: '',
    },
    // 输入框内的值，借助$emit变更
    val: {
      type: [String, Number],
      default: '',
      required: true,
    },
    // 输入框的状态，借助$emit变更
    status: {
      type: String,
      default: '',
      required: true,
    },
    // 最大长度
    max: {
      type: Number,
      default: 50,
    },
    // 最小长度
    min: {
      type: Number,
      default: 0,
    },
    // 输入框右边显示的操作按钮
    handle: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      secretVal: getSecretStr(this.val),
      isInputing: false,
    };
  },
  computed: {
    isPwd() {
      return this.type === 'password';
    },
  },
  methods: {
    // 监听输入
    onInput(e) {
      // IE10 input存在placeholder时，onInput事件会自动触发，需要保证正在输入的时候才触发事件
      if (!this.isInputing) {
        return;
      }
      const val = e.target.value;
      this.chkInputVal(val);
      this.secretVal = getSecretStr(val);
      this.$emit('input', val);
    },

    // 检查是否邮箱
    validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    },

    // 检查是否数字
    validateNumber(val) {
      const re = /^\d+$/;
      return re.test(val);
    },

    // 检查是否手机号码, xxx-xxxxx 或者 xxxxxxxx
    validatePhone(val) {
      const re = /^(\d{2,4}-)?\d+$/;
      return re.test(val);
    },

    // 检查是否数字/汉字/字母
    validateVal(val) {
      const re = /^[\u4E00-\u9FA5A-Za-z0-9]+$/;
      return re.test(val);
    },

    // 检查输入值是否满足要求
    chkInputVal(argV) {
      const val = String(argV);
      const isNormal = this.validateVal(val);
      const isEmail = this.validateEmail(val);
      const isNumber = this.validateNumber(val);
      const isPhone = this.validatePhone(val);
      const types = this.type ? flatten([this.type]) : [];
      const set = argWrong => {
        this.$emit('update:status', argWrong ? 'wrong' : '');
      };
      if (!this.val) {
        set(false);
      } else if (val.length > this.max || val.length < this.min) {
        set(true);
      } else if (types.length === 0) {
        set(!isNormal);
      } else if (types.indexOf('password') !== -1) {
        set(false);
      } else if (types.length > 0) {
        let status = false;
        types.some(type => {
          if (type === 'email') {
            status = isEmail;
          } else if (type === 'number') {
            status = isNumber;
          } else if (type === 'phone') {
            status = isPhone;
          }
          return status;
        });
        set(!status);
      }
    },

    onBlur() {
      this.isInputing = false;
    },

    onFocus() {
      this.isInputing = true;
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-input {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  box-sizing: border-box;
  overflow: hidden;

  &.wrong {
    border-color: $red;
  }
}

.handle {
  @include fontSizeRespond(16);
  padding-right: px2rem(11);
  color: #333;
  color: $blue;
  cursor: pointer;
  box-sizing: border-box;
  flex: none;
  white-space: nowrap;
}

input {
  @include fontSizeRespond(16);
  padding-left: px2rem(15);
  padding-right: px2rem(15);
  box-sizing: border-box;
  border: none;
  color: #333;
  height: 100%;
  flex: 1 1 auto;

  &:focus {
    outline: none;
  }
  &::placeholder {
    color: #999;
  }
}
</style>
