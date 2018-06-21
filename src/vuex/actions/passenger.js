import model from '../../assets/js/axios';
import api from '../../assets/js/api';

export const initPassenger = async ({ commit, state }) => {
  const { passengers } = state.passenger;
  if (passengers.length > 0) {
    return Promise.resolve(passengers);
  }
  try {
    const res = await model.get(api.getAllPassengers);
    commit('INIT_PASSENGERS', res.results);
    return Promise.resolve(res.data);
  } catch (e) {
    return Promise.resolve(e);
  }
};

export const updatePassenger = ({ commit }, payload) => {
  commit('UPDATE_PASSENGERS', payload);
};

export const addPassenger = async ({ commit }, payload) => {
  const birthday = `${payload.birthday.y}-${payload.birthday.m}-${
    payload.birthday.d
  }`;
  const params = {
    name: payload.name,
    clientType: payload.passengerType,
    type: payload.credentialType,
    idNumber: payload.credentialNumber,
    sex: payload.gender,
    birthday,
  };

  let res;
  try {
    res = await model.post(api.addPassenger, params);
  } catch (e) {
    return Promise.reject(e);
  }

  commit('ADD_PASSENGER', { ...payload, id: res.data.id, birthday });
  return Promise.resolve(res.data.id);
};

export const delPassenger = ({ commit }, payload) => {
  commit('DELETE_PASSENGER', payload);
};
