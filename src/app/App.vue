<template>
  <div id="app" class="app">
    <Header />
    <main class="content">
      <router-view />
      <LoginBox />
      <LoadingGlobal :text="status.loadingText" />
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from './Header.vue';
import Footer from './Footer.vue';
import LoginBox from '@/components/LoginBox.vue';
import LoadingGlobal from '@/components/LoadingGlobal.vue';
import { mapState } from 'vuex';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    LoginBox,
    LoadingGlobal,
  },
  computed: {
    ...mapState({
      status: 'status',
    }),
  },
  beforeCreate() {
    this.$store.dispatch('fetchLoginUser');
  },
};
</script>

<style lang="scss">
@import './../assets/css/reset.scss';
@import './../assets/css/transition.scss';
@import './../assets/css/global.scss';
</style>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
}

header,
footer {
  flex: none;
}

main {
  flex: 1 0 auto;
  position: relative;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;

  & > div {
    flex: 1 0 auto;
  }
}
</style>
