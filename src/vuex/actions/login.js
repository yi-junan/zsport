import router from '../../router';
import model from '@/assets/js/axios';
import api from '@/assets/js/api';
import getCacheWithAes from '@/assets/js/storage/getCacheWithAes';
import { CACHE_AUTO_LOGIN_KEY } from '@/assets/js/constant';

export const addLoginUser = ({ commit }, msg) => {
  commit('ADD_LOGIN_USER', msg);
};

export const toggleLoginLoading = ({ commit }, payload) => {
  commit('TOGGLE_LOGIN_LOADING', payload);
};

export const clearLoginUser = ({ commit }) => {
  commit('CLEAR_LOGIN_USER');
};

export const fetchLoginUser = async ({ dispatch }, payload) => {
  const loadingEnd = () => {
    dispatch('toggleGlobalLoading', { loading: 0 });
    dispatch('toggleLoginLoading', { loading: 0 });
  };
  const getUserMsg = async () => {
    let res;
    try {
      res = await model.get(api.getLoginUser);
    } catch (e) {
      return false;
    }

    if (res.success) {
      dispatch('addLoginUser', res.data);
      return true;
    }

    return false;
  };

  dispatch('toggleLoginLoading', { loading: 1 });
  if (!payload || (payload && !payload.noGlobalLoading)) {
    dispatch('toggleGlobalLoading', {
      text: router.app.$t('tips.pageLogin[4]'),
      loading: 1,
    });
  }

  // 判断是否已登陆
  if (await getUserMsg()) {
    loadingEnd();
    return;
  }

  // 判断是否存在自动登陆标识，有则尝试登陆
  let res = await getCacheWithAes(CACHE_AUTO_LOGIN_KEY);
  if (!res) {
    loadingEnd();
    return;
  }

  dispatch('toggleGlobalLoading', {
    text: router.app.$t('tips.pageLogin[3]'),
    loading: 1,
  });
  res = res.split('-');
  try {
    res = await model.post(api.login, {
      val: res[0],
      password: res[1],
      type: res[0].indexOf('@') === -1 ? 1 : 2,
    });
  } catch (e) {
    loadingEnd();
    return;
  }

  await getUserMsg();
  loadingEnd();
};
