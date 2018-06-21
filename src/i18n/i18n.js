import Vue from 'vue';
import VueI18n from 'vue-i18n';
import zh from './zh';
import zhhkL from './zhhkL';
import en from './en';

Vue.use(VueI18n);

export default {
  init(lang) {
    return new VueI18n({
      locale: lang,
      messages: {
        zh: { ...zh },
        zhhkL: { ...zhhkL },
        en: { ...en },
      },
    });
  },
};
