<template>
  <header id="header">
    <div class="title-bar limit">
      <p class="welcome">{{ $t("huan_ying_yu") }}</p>
      <ul class="handle" @click="jump">
        <li data-name="user/orders" v-if="this.user.id">
          <Icon name="weibiaoti-" />
          <span>{{ $t("wo_de_ding_dan") }}</span>
        </li>
        <li data-name="user/self_msg" v-if="this.user.id">
          <Icon name="gerenzhongxin1" />
          <span>{{ $t("ge_ren_zhong_xin") }}</span>
        </li>
        <li>
          <template v-if="this.user.id">
            <div class="sm" data-name="user/self_msg">
              {{ this.user.name || this.user.realName || this.user.phoneNo || this.user.emailUrl }}
            </div>
            <div class="sm" @click="onLogout">
              {{ $t("zhu_xiao") }}
            </div>
          </template>
          <template v-else>
            <div class="sm" data-name="login">{{ $t("deng_lu") }}</div>
            <div class="sm" data-name="register">{{ $t("zhu_ce") }}</div>
          </template>

          <Dropdown :data="langs" :defaultId="lang" :onChoseBack="onChangeLan" />
        </li>
      </ul>
    </div>
    <div class="nav-bar limit">
      <a class="logo">
        <img src="../assets/img/logo.png" alt="logo" />
      </a>
      <ul class="nav" @click="jump">
        <li>{{ $t("shou_ye") }}</li>
        <li class="active" data-name="search">{{ $t("wang_shang_gou_piao") }}</li>
        <li>{{ $t("xing_cheng_xin_xi") }}</li>
        <li>{{ $t("hang_xian_xu_zhi") }}</li>
        <li>{{ $t("lv_ke_xu_zhi") }}</li>
        <li>{{ $t("pei_tao_fu_wu") }}</li>
        <li>{{ $t("zui_xin_zi_xun") }}</li>
        <li>{{ $t("guan_yu_wo_men") }}</li>
      </ul>
    </div>
  </header>
</template>

<script>
import { mapState } from 'vuex';
import Icon from '@/components/basic/Icon.vue';
import Triangle from '@/components/basic/Triangle.vue';
import Dropdown from '@/components/basic/Dropdown.vue';
import { LoopEle } from '@/assets/js/util.js';
import { CACHE_AUTO_LOGIN_KEY } from '@/assets/js/constant';
import model from '@/assets/js/axios';
import api from '@/assets/js/api';
import storage from '@/assets/js/storage/storage';
import findIndex from 'lodash/findIndex';

export default {
  components: { Icon, Triangle, Dropdown },
  data() {
    return {
      langs: [
        { id: 'zh', name: '简体', value: 'zh' },
        { id: 'zhhkL', name: '繁体', value: 'zhhkL' },
        // { id: 'en', name: 'EN', value: 'en' },
      ],
      curLangId: '',
    };
  },
  computed: {
    curLang() {
      const hit = findIndex(
        this.langs,
        item => String(item.id) === String(this.curLangId),
      );
      if (hit === -1) {
        return {};
      }
      return this.langs[hit];
    },
    ...mapState({
      user: state => state.login.userData,
      lang: state => state.status.lang,
    }),
  },
  methods: {
    chkActive(argName) {
      const names = argName.split(',');
      let status = false;
      names.some(name => {
        if (this.$route.path.indexOf(name) !== -1) {
          status = true;
          return true;
        }
        return false;
      });
      return status;
    },

    jump(e) {
      const handle = tar => {
        const name = tar.getAttribute('data-name');
        if (name) {
          this.$router.push(`/${name}`);
        }
      };
      LoopEle(e, {
        LI: tar => handle(tar),
        DIV: tar => handle(tar),
        UL: 'end',
      });
    },

    async onLogout() {
      this.$store.dispatch('toggleGlobalLoading', { text: '注销中..' });
      await model.get(api.logout);
      this.$store.dispatch('clearLoginUser');
      this.$store.dispatch('toggleGlobalLoading');
      storage.removeItem(CACHE_AUTO_LOGIN_KEY);

      const path = this.$route.path;
      if (path.indexOf('/user') !== -1) {
        this.$router.push('/index');
      }
    },

    // 修改全局语言
    onChangeLan(argId) {
      this.curLangId = argId;
      this.$root.$i18n.locale = this.curLang.value;
      storage.setItem('lang', this.curLang.value);
      this.$store.dispatch('updateLang', this.curLang.value);
    },
  },
  created() {
    this.curLangId = this.lang;
  },
};
</script>

<style scoped lang="scss">
@import '../assets/css/color.scss';
@import '../assets/css/util.scss';

.title-bar {
  background-color: #f5f5f5;
  height: px2rem(40);
  min-height: 30px;
  position: relative;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #999;
  white-space: nowrap;

  .handle {
    height: 100%;
    margin-left: auto;
    display: flex;
    align-items: center;

    & > li {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 23px;
      height: 100%;
      cursor: pointer;
      font-size: 14px;

      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-left: 15px;
      }
      &:not(:last-child):not(:only-child):hover {
        color: $blue;
      }
      .iconfont {
        margin-right: 4px;
      }
      .sm {
        padding-left: 8px;
        padding-right: 8px;
        border-right: 1px solid #999;
        color: #999;
        &:hover {
          color: $blue;
        }
      }
      /deep/ .cp-dropdown {
        height: 100%;
        z-index: 9;

        .head {
          border: none;
          height: 100%;
          padding-left: 8px;
          padding-right: 8px;
          color: #999;
          font-size: 14px;
        }
        .content {
          border: 1px solid #eee;
          white-space: nowrap;
        }
        .cp-triangle {
          border-color: #999 transparent transparent !important;
        }
        &:hover {
          .head {
            color: $blue;
          }
          .cp-triangle {
            border-color: $blue transparent transparent !important;
          }
        }
      }
    }
  }
}

.nav-bar {
  height: px2rem(100);
  display: flex;
  align-items: center;
  white-space: nowrap;

  .nav {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: px2rem(68);
    flex: 1 1 auto;
    overflow: auto;

    li {
      margin-right: px2rem(27);
      height: 100%;
      cursor: pointer;
      position: relative;
      @include fontSizeRespond(16);
      color: #666;
      display: flex;
      align-items: center;

      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: $blue;
        display: none;
      }
      &:hover {
        color: $blue;
      }
      &:first-child {
        margin-right: px2rem(43);
      }
      &:last-child {
        margin-right: 0;
      }
      &.active {
        color: $blue;
        &:after {
          display: block;
        }
      }
    }
  }

  .logo {
    height: px2rem(46);
    display: block;
    flex: none;

    img {
      height: 100%;
    }
  }
}
</style>
