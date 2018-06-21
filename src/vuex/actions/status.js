export const toggleLoginBox = ({ commit }, payload) => {
  commit('TOGGLE_LOGIN_BOX', payload);
};

export const toggleGlobalLoading = ({ commit }, payload) => {
  commit('TOGGLE_GLOBAL_LOADING', payload);
};

export const updateLang = ({ commit }, payload) => {
  commit('UPDATE_LANG', payload);
};

export const updateSkipLogin = ({ commit }, payload) => {
  commit('UPDATE_SKIP_LOGIN', payload);
};
