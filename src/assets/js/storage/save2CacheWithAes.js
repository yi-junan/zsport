import AES from 'crypto-js/aes';
import { AES_KEY } from '../constant';
import storage from './storage';

// aes加密数据，然后保存到localstorage
const save2CacheWithAes = (key, val) => {
  const res = AES.encrypt(val, AES_KEY).toString();
  storage.setItem(key, res);
};

export default save2CacheWithAes;
