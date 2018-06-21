import localforage from 'localforage';

localforage.config({
  name: 'cks_zhongshan',
});

const customer = {
  getItem: async argKey => {
    try {
      const res = await localforage.getItem(argKey);
      return Promise.resolve(res);
    } catch (e) {
      // 这里不能reject，不然一出错整个应用都死掉了
      return Promise.resolve(null);
    }
  },
  setItem: async (argKey, argValue) => {
    try {
      await localforage.setItem(argKey, argValue);
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  },
  removeItem: async argKey => {
    try {
      await localforage.removeItem(argKey);
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  },
  updateChild: async (argKey, argChild, argChildVal) => {
    try {
      const old = await localforage.getItem(argKey);
      if (old) {
        old[argChild] = argChildVal;
        await localforage.setItem(argKey, old);
      } else {
        await localforage.setItem(argKey, { [argChild]: argChildVal });
      }
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  },
};

export default { ...customer };
