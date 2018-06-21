// 乘客信息
import findIndex from 'lodash/findIndex';

const state = {
  passengers: [],
};

const mutations = {
  INIT_PASSENGERS(state, payload) {
    const passengers = [];
    payload.forEach(item => {
      passengers.push({
        id: item.id,
        name: item.name,
        passengerType: item.clientType,
        credentialType: item.type,
        credentialNumber: item.idNumber,
        gender: item.sex,
        birthday: item.birthday,
        isDefault: item.isDefault,
      });
    });
    state.passengers = passengers;
  },

  UPDATE_PASSENGERS(state, payload) {
    const hit = findIndex(
      state.passengers,
      item => String(item.id) === String(payload.id),
    );
    if (hit === -1) {
      return;
    }
    for (let key in payload) {
      state.passengers[hit][key] = payload[key];
    }
  },

  ADD_PASSENGER(state, payload) {
    state.passengers.push(payload);
  },

  DELETE_PASSENGER(state, payload) {
    const hit = findIndex(
      state.passengers,
      item => String(item.id) === String(payload),
    );
    state.passengers.splice(hit, 1);
  },
};

const getters = {
  // 根据id获取对应的乘客信息
  getPassengerById: state => id => {
    const hit = findIndex(
      state.passengers,
      item => String(item.id) === String(id),
    );
    if (hit !== -1) {
      return state.passengers[hit];
    }
    return null;
  },
};

export default {
  state,
  mutations,
  getters,
};
