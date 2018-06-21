<template>
  <div class="pay limit">
    <Progress active="3" />

    <div class="box">
      <div>
        <p>去程</p>
        <p class="value">
          <span>中山港——香港中港城</span>
          <span>开船时间：2018-03-23 08:00 </span>
        </p>
      </div>
      <div>
        <p>去程</p>
        <p class="value">
          <span>中山港——香港中港城</span>
          <span>开船时间：2018-03-23 08:00 </span>
        </p>
      </div>
      <div>
        <p>刘雨婷</p>
        <p class="value">
          <span>成人票×1/普通位</span>
          <span>身份证360***********2626</span>
        </p>
      </div>
      <div>
        <p>刘雨婷</p>
        <p class="value">
          <span>成人票×1/普通位</span>
          <span>身份证360***********2626</span>
        </p>
      </div>
      <p class="tips">
        您的订单提交成功！请在
        <span>10分钟</span>内完成支付，以免订单失效！
      </p>
      <p class="money">
        应付金额
        <span>¥400</span>
      </p>
    </div>

    <SwitchTab :tabs="tabs" :type="2" :defaultTab="currentSwitchTab" :onClick="onSwitchTab">
      <div slot="bankCard">
        <div class="input-box">
          <span>储蓄卡号码</span>
          <Input placeholder="储蓄卡号码" />
        </div>
      </div>
      <div slot="creditCard">
        <div class="input-box">
          <span>信用卡号码</span>
          <Input placeholder="信用卡号码" />
        </div>
      </div>
      <div slot="weChat"></div>
      <div slot="aliPay"></div>
    </SwitchTab>

    <div class="pay-btn">
      <Button text="支付订单" type="normal" />
    </div>

  </div>
</template>

<script>
import Progress from '@/components/Progress.vue';
import SwitchTab from '@/components/SwitchTab.vue';
import Input from '@/components/basic/Input.vue';
import Button from '@/components/basic/Button.vue';

export default {
  name: 'Pay',
  components: {
    Progress,
    SwitchTab,
    Input,
    Button,
  },
  data() {
    return {
      tabs: [
        { index: 'bankCard', name: '储蓄卡' },
        { index: 'creditCard', name: '信用卡' },
        { index: 'weChat', name: '微信支付' },
        { index: 'aliPay', name: '支付宝支付' },
      ],
      currentSwitchTab: 0,
    };
  },
  methods: {
    onSwitchTab(argIndex) {
      this.currentSwitchTab = argIndex;
    },
  },
};
</script>


<style lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.pay {
  text-align: center;

  .box {
    text-align: left;
    background-color: $lightestBlue;
    margin-top: px2rem(22);
    padding: px2rem(30);
    position: relative;

    & > div {
      display: flex;
      align-items: center;
      line-height: 1.55;
      @include fontSizeRespond(20);
      color: $black;

      .value {
        font-size: 0;

        span {
          display: inline-block;
          vertical-align: middle;
          @include fontSizeRespond(21);
          margin-right: px2rem(20);

          &:last-child {
            margin-right: 0;
          }
        }
      }

      p {
        margin-right: px2rem(20);
        white-space: nowrap;
        flex-shrink: 0;

        &:last-child {
          margin-right: 0;
        }
      }
    }

    .tips {
      line-height: 1.25;
      @include fontSizeRespond(20);
      margin-top: px2rem(45);
      color: $lightestFont;

      span {
        color: $blue;
      }
    }

    .money {
      position: absolute;
      right: px2rem(30);
      bottom: px2rem(30);
      @include fontSizeRespond(20);

      span {
        color: $orange;
        margin-left: 10px;
        @include fontSizeRespond(30);
      }
    }
  }

  .switch-tab {
    margin-top: px2rem(30);
    border: 1px solid $lightenBorder;
    width: 100%;
    box-sizing: border-box;
    text-align: left;

    .content {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: px2rem(73) 0;

      & > div {
        display: inline-block;
      }

      .input-box {
        @include fontSizeRespond(20);
        display: flex;
        align-items: center;

        span {
          margin-right: px2rem(15);
          white-space: nowrap;
        }
        input {
          width: px2rem(350);
        }
      }
    }
  }

  .pay-btn {
    display: inline-block;
    width: auto;

    button {
      height: px2rem(60);
      width: px2rem(200);
      margin-top: px2rem(34);
    }
  }
}
</style>
