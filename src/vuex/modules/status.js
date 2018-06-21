// 一些全局性的操作状态

const state = {
  // 语言
  lang: '',

  // 登陆窗口
  showLoginBox: false,

  // 买票过程是否允许跳过登陆
  skipLogin: false,

  // 全局loading
  loading: false,
  loadingText: '加载中，请稍后..',
};

const mutations = {
  UPDATE_SKIP_LOGIN(state, payload) {
    state.skipLogin = payload;
  },

  UPDATE_LANG(state, payload) {
    state.lang = payload;
  },

  TOGGLE_LOGIN_BOX(state, payload) {
    if (payload) {
      state.showLoginBox = !!payload.showLoginBox;
    } else {
      state.showLoginBox = !state.showLoginBox;
    }
  },

  TOGGLE_GLOBAL_LOADING(state, payload) {
    if (payload && payload.text) {
      state.loadingText = payload.text;
    }
    if (payload && payload.loading === 0) {
      state.loading = false;
    } else if (payload && payload.loading === 1) {
      state.loading = true;
    } else {
      state.loading = !state.loading;
    }
  },
};

export default {
  state,
  mutations,
};
