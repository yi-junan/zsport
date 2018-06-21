<template>
  <div class="user limit">
    <ul class="bar" @click="switchTabs">
      <li class="title">{{ $t('ge_ren_zhong_xin') }}</li>
      <li class="item" data-path="self_msg" :class="{ 'active': isCurPage('self_msg') }">{{ $t('ge_ren_zi_liao') }}</li>
      <li class="item" data-path="passengers" :class="{ 'active': isCurPage('passengers') }">{{ $t('cheng_ke_ming_dan') }}</li>
      <li class="item" data-path="orders" :class="{ 'active':isCurPage('orders') }">{{ $t('wo_de_ding_dan') }}</li>
    </ul>

    <div class="content">
      <keep-alive>
        <router-view v-if="userData.id" />
      </keep-alive>
      <div class="login-tips" v-if="!loading && !userData.id">{{ $t('qing_xian_deng_lu') }}</div>
    </div>
  </div>
</template>

<script>
import { LoopEle } from '@/assets/js/util.js';
import { mapState } from 'vuex';

export default {
  name: 'User',
  computed: {
    ...mapState({
      loading: state => state.login.loading,
      userData: state => state.login.userData,
    }),
  },
  methods: {
    // 切换导航
    switchTabs(e) {
      LoopEle(e, {
        LI: tar => {
          const path = tar.getAttribute('data-path');
          if (!path) {
            return;
          }
          this.$router.push({ path: `/user/${path}` });
        },
        UL: 'end',
      });
    },

    // 判断是否当前页面
    isCurPage(argName) {
      const { path } = this.$route;
      return path.indexOf(`/user/${argName}`) !== -1;
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.user {
  display: flex;
  padding-top: px2rem(46);
  padding-bottom: px2rem(46);
  width: 100%;
  box-sizing: border-box;

  &:after {
    content: '';
    width: px2rem(20);
    height: 1px;
    background-color: transparent;
    order: 1;
    display: block;
    flex: 0 0 auto;
  }
}

.bar {
  flex: 0 1 auto;
  min-width: 200px;
  width: px2rem(280);
  white-space: nowrap;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  order: 0;
  align-self: flex-start;

  li {
    box-sizing: border-box;
  }
  li.title {
    padding: px2rem(24);
    box-sizing: border-box;
    line-height: 1;
    @include fontSizeRespond(30);
    background-color: $blue;
    color: #fff;
  }
  li.item {
    @include fontSizeRespond(18);
    padding: px2rem(21) px2rem(37);
    cursor: pointer;
    color: #666;
    position: relative;
    z-index: 1;
    border-bottom: 1px solid #ddd;

    &:last-child {
      border-bottom: none;
    }
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      top: 0;
      left: px2rem(25);
      margin: auto;
      width: 3px;
      height: px2rem(20);
      background-color: $blue;
      display: none;
    }
    &:hover {
      color: $blue;
    }
    &.active:after {
      display: block;
    }
  }
}
.content {
  order: 2;
  flex: 1 1 auto;

  .login-tips {
    @include fontSizeRespond(26);
    color: #999;
    padding: px2rem(60) 0;
    text-align: center;
    height: 100%;
    background-color: #fff;
    box-sizing: border-box;
  }
}
</style>
