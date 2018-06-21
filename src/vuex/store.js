import Vue from 'vue';
import Vuex from 'vuex';

import basis from './modules/basis';
import login from './modules/login';
import status from './modules/status';
import passenger from './modules/passenger';

import * as basisAc from './actions/basis';
import * as loginAc from './actions/login';
import * as statusAc from './actions/status';
import * as passengerAc from './actions/passenger';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    basis,
    login,
    status,
    passenger,
  },
  actions: {
    ...basisAc,
    ...loginAc,
    ...statusAc,
    ...passengerAc,
  },
});
