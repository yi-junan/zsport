<template>
  <ul class="cp-progress">
    <li :class="active === '1' ? 'active' : ''">
      <div class="line"></div>
      <div class="number">1</div>
      <div class="text">{{ $t('xuan_zhe_che_chi') }}</div>
    </li>
    <li :class="active === '2' ? 'active' : ''">
      <div class="line"></div>
      <div class="number">2</div>
      <div class="text">{{ $t('tian_xie_ding_dan') }}</div>
    </li>
    <li :class="active === '3' ? 'active' : ''">
      <div class="line"></div>
      <div class="number">3</div>
      <div class="text">{{ $t('ding_dan_zhi_fu') }}</div>
    </li>
    <li :class="active === '4' ? 'active' : ''">
      <div class="line"></div>
      <div class="number">4</div>
      <div class="text">{{ $t('zhi_fu_cheng_gong') }}</div>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    active: {
      type: String,
      default: '1',
    },
  },
};
</script>

<style scoped lang="scss">
@import '../assets/css/color.scss';
@import '../assets/css/util.scss';

.cp-progress {
  width: 100%;
  display: flex;
  align-items: center;

  li {
    display: flex;
    align-items: center;
    width: 25%;
    padding-right: px2rem(14);
    box-sizing: border-box;
    @include fontSizeRespond(18);

    &.active {
      .line,
      .number {
        background-color: $blue;
      }
      .text {
        color: $blue;
      }
    }

    &:last-child {
      padding-right: 0;
    }

    .line {
      width: 100%;
      height: px2rem(10);
      background-color: #eee;
      flex-shrink: 1;
    }
    .number {
      width: px2rem(30);
      height: px2rem(30);
      text-align: center;
      line-height: px2rem(30);
      border-radius: 100%;
      margin-left: -1px;
      flex-shrink: 0;
      color: #fff;
      background-color: #eee;
    }
    .text {
      padding-left: px2rem(7);
      color: #ddd;
      flex-shrink: 0;
    }
  }
}
</style>
