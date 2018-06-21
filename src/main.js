import Vue from 'vue';
import App from './app/App.vue';
import router from './router';
import store from './vuex/store';
import i18n from './i18n/i18n';
import storage from '@/assets/js/storage/storage';

Vue.config.productionTip = false;

storage.getItem('lang').then(lang => {
  new Vue({
    router,
    store,
    i18n: i18n.init(lang),
    render: h => h(App),
    created() {
      this.$root.$i18n.locale = lang || 'zh';
      this.$store.dispatch('updateLang', lang || 'zh');
    },
  }).$mount('#app');
});
