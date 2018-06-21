import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';

// 获取url参数
export const getSearchParamHashPage = name => {
  var query = window.location.hash.substr(3).split('?')[1];
  if (!query) return false;
  var vars = query.split('!!');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] === name) {
      return pair[1];
    }
  }
  return false;
};

// TODO: alert提示
export const noti = msg => {
  alert(msg);
};

// 向上寻找目标tag，并触发对应事件
export const LoopEle = (e, argTags, maxTimes = 5) => {
  let loop = true;
  let tar = e.target || e.srcElement;
  let nodeName = tar.nodeName;
  let i = 0;

  while (loop) {
    // 遇到指定的tag执行响应
    if (argTags[nodeName] && argTags[nodeName] !== 'end') {
      argTags[nodeName](tar);
      loop = false;
      break;
    }

    // 防止死循环
    if (i > maxTimes || argTags[nodeName] === 'end') {
      loop = false;
      break;
    }

    tar = tar.parentNode;
    nodeName = tar.nodeName;
    i++;
  }
};

// 获取两个json的差异
export const getObjectsDiff = (obj, another) => {
  const transform = msg => {
    const res = [];
    for (let key in msg) {
      res.push({ [key]: msg[key] });
    }
    return res;
  };
  const toObject = msg => {
    let res = {};
    msg.forEach(item => {
      res = Object.assign({}, res, item);
    });
    return res;
  };
  const diff = differenceWith(transform(obj), transform(another), isEqual);

  return toObject(diff);
};

// 返回中间部分隐藏的字符串
export const getSecretStr = argVal => {
  const val = String(argVal);
  const len = val.length;
  const hit = Math.round((len - len / 2) / 2);
  if (!hit) {
    return val;
  }

  let v = '';
  for (let i = 0; i < len; i++) {
    if (i + 1 <= hit) {
      v = `${v}${val[i]}`;
    } else if (len - i <= hit) {
      v = `${v}${val[i]}`;
    } else {
      v = `${v}*`;
    }
  }

  return v;
};
