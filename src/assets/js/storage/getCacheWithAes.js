import AES from 'crypto-js/aes';
import { AES_KEY } from '../constant';
import storage from './storage';
import utf8 from 'crypto-js/enc-utf8';

// 获取某个localstorage，并aes解密
const getCacheWithAes = async argKey => {
  const cache = await storage.getItem(argKey);
  let res = '';
  if (cache) {
    res = AES.decrypt(cache.toString(), AES_KEY);
    res = res.toString(utf8);
  }
  return res;
};

export default getCacheWithAes;
