import axios from 'axios';

const instance = axios.create({
  withCredentials: true,
});

const model = {};

// 处理后台开发各种神乎其技的错误返回
const getErrorMsg = data => {
  const get = arg => {
    return (
      arg.errorInfo ||
      arg.errorinfo ||
      arg.errInfo ||
      arg.errinfo ||
      arg.errormsg ||
      arg.errorMsg ||
      arg.errMsg ||
      arg.errmsg
    );
  };
  let msg = get(data);

  if (!msg && data.data) {
    msg = get(data.data);
  }

  // 避免错误信息是数字的时候造成提示不当
  return Number(msg) ? '' : msg;
};

model.get = async (url, options = {}) => {
  try {
    const res = await instance.get(url, {
      params: { ...options, _time: Date.now() },
    });
    if (res.data.success) {
      return Promise.resolve(res.data);
    }
    return Promise.reject(
      Object.assign(res.data, { error: getErrorMsg(res.data) }),
    );
  } catch (e) {
    return Promise.reject(e);
  }
};

model.post = async (url, options = {}) => {
  try {
    const res = await instance.post(url, { ...options });
    if (res.data.success) {
      return Promise.resolve(res.data);
    }
    return Promise.reject(
      Object.assign(res.data, { error: getErrorMsg(res.data) }),
    );
  } catch (e) {
    return Promise.reject(e);
  }
};

model.delete = async (url, options = {}) => {
  try {
    const res = await instance.delete(url, {
      data: { ...options },
    });
    if (res.data.success) {
      return Promise.resolve(res.data);
    }
    return Promise.reject(
      Object.assign(res.data, { error: getErrorMsg(res.data) }),
    );
  } catch (e) {
    return Promise.reject(e);
  }
};

export default model;
