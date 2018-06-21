const api = {
  // 获取港口
  getPorts: 'zsws/shipping/get_ports.do',

  // 获取航空公司
  getAirline: 'zsws/shipping/get_airline.do',

  // 获取航线
  getShipLine: 'zsws/shipping/get_ship_line.do',

  // 获取线路
  getAllRoutes: 'zsws/shipping/get_all_routes.do',

  // 登陆
  login: 'zsws/login.do',

  // 手机验证码登陆
  loginByCode: 'zsws/member/login_code.do',

  // 登出
  logout: 'zsws/member/logout.do',

  // 获取登陆用户信息
  getLoginUser: 'zsws/member/get_menber.do',

  // 修改登陆用户信息
  updateLoginUser: 'zsws/member/update_menber.do',

  // 获取乘客信息
  getAllPassengers: 'zsws/member/get_passengers.do',

  // 更新乘客信息
  updatePassenger: 'zsws/member/update_passenger.do',

  // 删除乘客信息
  delPassenger: 'zsws/member/del_passenger.do',

  // 新增乘客信息
  addPassenger: 'zsws/member/add_passenger.do',

  // 获取验证码
  sendCaptcha: 'zsws/member/verification_code.do',

  // 注册
  register: 'zsws/member/register.do',

  // 校验验证码
  checkCaptcha: 'zsws/member/chk_captcha.do',

  // 创建订单
  createOrder: 'zsws/create_order.do',

  // 重设密码
  resetPwd: 'zsws/member/update_password_code.do',

  // 获取订单记录
  getAllOrders: 'zsws/get_all_orders.do',

  // 获取订单详情
  getOrder: 'zsws/get_order.do',

  // 取消订单
  cancelOrder: 'zsws/cancel_order.do',

  // 删除订单
  deleteOrder: 'zsws/delete_order.do',
};

export default api;
