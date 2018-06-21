const state = {
  userData: {
    id: '',
    realName: '', // 真实姓名
    name: '', // 昵称
    emailUrl: '', // e猫
    phoneNo: '', // 手机
    clientType: '', // 乘客类型
    certType: '', // 证件类型 1：身份证; 2：护照; 3：港澳通行证; 4：台湾通行证; 5：回乡证; 6：其他; 7：台胞证; 8：香港居民身份证
    certNo: '', // 证件号码
    sex: '', // 性别 1: 男 2: 女
    birthday: '', // 生日
    headPicUrl: '', // 头像
  },

  loading: true,
};

const mutations = {
  ADD_LOGIN_USER(state, payload) {
    for (let key in payload) {
      if (payload[key]) {
        state.userData[key] = payload[key];
      }
    }
  },

  TOGGLE_LOGIN_LOADING(state, payload) {
    if (payload.loading === 0) {
      state.loading = false;
    } else if (payload.loading === 1) {
      state.loading = true;
    } else {
      state.loading = !state.loading;
    }
  },

  CLEAR_LOGIN_USER(state) {
    state.userData = {
      id: '',
      realName: '',
      name: '',
      emailUrl: '',
      phoneNo: '',
      clientType: '',
      certType: '',
      certNo: '',
      sex: '',
      birthday: '',
      headPicUrl: '',
    };
  },
};

export default {
  state,
  mutations,
};
