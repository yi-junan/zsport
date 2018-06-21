import model from '@/assets/js/axios';
import api from '@/assets/js/api';
import isEmpty from 'lodash/isEmpty';

// 获取港口信息
export const getPorts = async ({ commit, state }) => {
  if (state.basis.ports.length > 0) {
    return Promise.resolve(state.basis.ports);
  }
  try {
    const res = await model.get(api.getPorts);
    commit('ADD_PORTS', res.data);
    return Promise.resolve(res.data);
  } catch (e) {
    return Promise.resolve(e);
  }
};

// 获取航空公司信息
export const getAirline = async ({ commit, state }) => {
  if (state.basis.airline.length > 0) {
    return Promise.resolve(state.basis.airline);
  }
  try {
    const res = await model.get(api.getAirline);
    commit('ADD_AIRLINE', res.data);
    return Promise.resolve(res.data);
  } catch (e) {
    return Promise.resolve(e);
  }
};

// 获取有效航线信息
export const getShipLine = async ({ commit, state }) => {
  if (!isEmpty(state.basis.shipLine)) {
    return Promise.resolve(state.basis.shipLine);
  }
  try {
    const res = await model.get(api.getShipLine);
    commit('ADD_SHIP_LINE', res.data);
    return Promise.resolve(res.data);
  } catch (e) {
    return Promise.resolve(e);
  }
};
