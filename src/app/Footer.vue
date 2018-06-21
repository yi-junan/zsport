<template>
  <footer class="footer limit" id="footer">
    <div class="qrcode">
      <div class="img">
        <img src="./img/qr-code.png" alt="qr-code" />
      </div>
      <p class="text">
        <span>{{ $t('sao_ma_guan_zhu') }}</span>
        <span>{{ $t('wei_xin_gou_piao') }}</span>
      </p>
    </div>
    <ul class="msg">
      <li>
        <span>{{ $t('you_qing_lian_jie') }}:</span>
        <a>{{ $t('zhu_jiang_ke_yun') }}</a>
        <a>{{ $t('xiang_gang_guo_ji') }}</a>
        <a>{{ $t('xiang_gang_gang_hui') }}</a>
        <a>{{ $t('icp') }}</a>
      </li>
      <li>
        <span>{{ $t('ban_quan') }}</span>
        <span>{{ $t('kai_fa_zhe') }}</span>
      </li>
    </ul>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      hideFooterPage: ['pay'],
      isShowFooter: true,
    };
  },
  watch: {
    $route(to) {
      this.isShowFooter = this.chkPage(to.fullPath);
    },
  },
  methods: {
    chkPage(argName) {
      let status = true;
      this.hideFooterPage.some(item => {
        if (argName.indexOf(item) !== -1) {
          status = false;
          return true;
        }
        return false;
      });
      return status;
    },
  },
  created() {
    this.isShowFooter = this.chkPage(window.location.hash);
  },
};
</script>

<style scoped lang="scss">
@import '../assets/css/color.scss';
@import '../assets/css/util.scss';

.footer {
  width: 100%;
  height: px2rem(160);
  min-height: 120px;
  background-color: #fff;
  position: relative;
  color: #999;
  font-size: 14px;
  line-height: 23px;
  display: flex;
  align-items: center;
  overflow: hidden;

  &:after {
    content: '';
    display: block;
    width: 235px;
    height: 1px;
  }
}

.qrcode {
  display: flex;
  align-items: center;

  .img {
    width: 80px;
    height: 80px;
    margin-right: px2rem(15);
  }
  .text > span {
    display: block;
    white-space: nowrap;
  }
}

.msg {
  font-size: 12px;
  padding-left: 10px;
  padding-right: 10px;
  margin: auto;

  li > * {
    margin-right: 8px;
    white-space: nowrap;

    &:last-child {
      margin-right: 0;
    }
  }
  a {
    cursor: pointer;
    &:hover {
      color: $blue;
    }
  }
}
</style>
