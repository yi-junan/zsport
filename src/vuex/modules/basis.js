// 一些不容易变更的基础信息
import findIndex from 'lodash/findIndex';

const getNumberArr = (min, max) => {
  const arr = [];
  for (let i = min; i <= max; i++) {
    arr.push({
      id: i > 9 ? `${i}` : `0${i}`,
      name: i > 9 ? `${i}` : `0${i}`,
    });
  }
  return arr;
};

const state = {
  // 港口信息
  ports: [],

  // 有效的航线
  shipLine: {},

  // 乘客类型
  passengerType: [
    { id: '1', zh: '成人票', zhhkL: '成人票', en: '成人票' },
    { id: '2', zh: '儿童票', zhhkL: '兒童票', en: '儿童票' },
    { id: '3', zh: '长者票', zhhkL: '長者票', en: '长者票' },
    { id: '4', zh: '婴儿票', zhhkL: '嬰兒票', en: '婴儿票' },
  ],

  // 证件类型
  credentialType: [
    { id: '1', zh: '身份证', zhhkL: '身份證', en: '身份证' },
    { id: '2', zh: '护照', zhhkL: '護照', en: '护照' },
    { id: '3', zh: '港澳通行证', zhhkL: '港澳通行證', en: '港澳通行证' },
    { id: '4', zh: '台湾通行证', zhhkL: '臺灣通行證', en: '台湾通行证' },
    { id: '5', zh: '回乡证', zhhkL: '回鄉證', en: '回乡证' },
    { id: '7', zh: '台胞证', zhhkL: '臺胞證', en: '台胞证' },
    {
      id: '8',
      zh: '香港居民身份证',
      zhhkL: '香港居民身份證',
      en: '香港居民身份证',
    },
    { id: '6', zh: '其他', zhhkL: '其他', en: '其他' },
  ],

  // 地区号码前缀
  prefixNumbers: [
    {
      id: '1',
      zh: '中国大陆 +86',
      zhhkL: '中國大陸 +86',
      en: '中国大陆 +86',
      value: '86',
    },
    {
      id: '2',
      zh: '中国香港 +852',
      zhhkL: '中國香港 +86',
      en: '中国香港 +86',
      value: '852',
    },
    {
      id: '3',
      zh: '中国台湾 +886',
      zhhkL: '中國臺灣 +86',
      en: '中国台湾 +86',
      value: '886',
    },
    {
      id: '4',
      zh: '中国澳门 +853',
      zhhkL: '中國澳門 +86',
      en: '中国澳门 +86',
      value: '853',
    },
  ],

  // 性别
  genders: [
    { id: '1', zh: '男', zhhkL: '男', en: 'male' },
    { id: '2', zh: '女', zhhkL: '女', en: 'female' },
  ],

  // 航空公司信息
  airline: [],

  // 小时
  hours: getNumberArr(0, 23),

  // 分钟
  minutes: getNumberArr(0, 59),
};

const mutations = {
  ADD_PORTS(state, payload) {
    state.ports = payload;
  },

  ADD_AIRLINE(state, payload) {
    state.airline = payload;
  },

  ADD_SHIP_LINE(state, payload) {
    const obj = {};
    const chk = {};
    payload.forEach(item => {
      if (!obj[item.fromPortCode]) {
        obj[item.fromPortCode] = [];
      }
      if (!chk[`${item.fromPortCode}-${item.toPortCode}`]) {
        obj[item.fromPortCode].push(item.toPortCode);
        chk[`${item.fromPortCode}-${item.toPortCode}`] = true;
      }
    });
    state.shipLine = Object.assign({}, obj);
  },
};

const getters = {
  // 根据id,获取某一个证件类型
  getCredentialType: (state, getters, rootState) => id => {
    const lang = rootState.status.lang;
    const hit = findIndex(
      state.credentialType,
      item => String(item.id) === String(id),
    );
    if (hit === -1) {
      return null;
    }
    return {
      id: state.credentialType[hit].id,
      name: state.credentialType[hit][lang],
    };
  },

  // 根据id，获取某一个乘客类型
  getPassengerType: (state, getters, rootState) => id => {
    const lang = rootState.status.lang;
    const filter = state.passengerType.filter(
      item => String(item.id) === String(id),
    );
    if (filter.length === 0) {
      return null;
    }
    return {
      id: filter[0].id,
      name: filter[0][lang],
    };
  },

  // 根据当前语言筛选对应的乘客类型
  passengerType: (state, getters, rootState) => {
    const lang = rootState.status.lang;
    const res = [];

    state.passengerType.forEach(item => {
      res.push({
        id: item.id,
        name: item[lang],
      });
    });
    return res;
  },

  // 根据当前语言筛选对应的性别
  genders: (state, getters, rootState) => {
    const lang = rootState.status.lang;
    const arr = [];

    state.genders.forEach(item => {
      arr.push({
        id: item.id,
        name: item[lang],
      });
    });
    return arr;
  },

  // 根据当前语言筛选对应的港口信息
  ports: (state, getters, rootState) => {
    const lang = rootState.status.lang;
    const res = [];
    let tmp = {};
    let backup;

    state.ports.forEach(port => {
      tmp = {
        realId: port.id,
        id: port.code,
        code: port.code,
      };
      // 搞不懂简体/繁体/英文哪个会没有，以简-繁-英优先级作兼容
      backup =
        port.cnameAlias ||
        port.cname ||
        port.tnameAlias ||
        port.tname ||
        port.enameAlias ||
        port.ename;

      if (lang === 'zh') {
        tmp.name = port.cnameAlias || port.cname;
      } else if (lang === 'zhhkL') {
        tmp.name = port.tnameAlias || port.tname;
      } else {
        tmp.name = port.enameAlias || port.ename;
      }

      if (!tmp.name) {
        tmp.name = backup;
      }
      res.push(tmp);
    });

    return res;
  },

  // 根据当前语言筛选对应的号码前缀信息
  prefixNumbers: (state, getters, rootState) => {
    const lang = rootState.status.lang;
    const res = [];

    state.prefixNumbers.forEach(prefix => {
      res.push({
        id: prefix.id,
        value: prefix.value,
        name: prefix[lang],
      });
    });

    return res;
  },

  // 根据当前语言筛选对应的证件类型
  credentialType: (state, getters, rootState) => {
    const lang = rootState.status.lang;
    const res = [];

    state.credentialType.forEach(item => {
      res.push({
        id: item.id,
        name: item[lang],
      });
    });

    return res;
  },

  // 根据当前语言筛选对应的航空公司信息
  airline: (state, getters, rootState) => {
    const lang = rootState.status.lang;
    const res = [];

    state.airline.forEach(item => {
      let tmp = {
        id: item.code,
        code: item.code,
        mct: item.mct,
      };

      if (lang === 'zh') {
        tmp.name = item.cName;
      } else if (lang === 'zhhkL') {
        tmp.name = item.tName;
      } else {
        tmp.name = item.eName;
      }

      res.push(tmp);
    });

    return res;
  },
};

export default {
  state,
  mutations,
  getters,
};
