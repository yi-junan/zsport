import Vue from 'vue';
import Router from 'vue-router';

const OneWay = () => import('./views/trip/OneWay.vue');
const RoundTrip = () => import('./views/trip/RoundTrip.vue');
const CreateOrder = () => import('./views/createOrder/CreateOrder.vue');
const Pay = () => import('./views/pay/Pay.vue');
const Search = () => import('./views/search/Search.vue');
const User = () => import('./views/user/User.vue');
const SelfMsg = () => import('./views/user/SelfMsg.vue');
const Passengers = () => import('./views/user/Passengers.vue');
const Orders = () => import('./views/user/Orders.vue');
const Register = () => import('./views/register/Register.vue');
const ForgotPwd = () => import('./views/forgotPwd/ForgotPwd.vue');
const Login = () => import('./views/login/Login.vue');
const OrderDetails = () => import('./views/orderDetails/OrderDetails.vue');

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/one_way',
      name: 'OneWay',
      component: OneWay,
    },
    {
      path: '/round_trip',
      name: 'RoundTrip',
      component: RoundTrip,
    },
    {
      path: '/create_order',
      name: 'CreateOrder',
      component: CreateOrder,
    },
    {
      path: '/order_details',
      name: 'OrderDetails',
      component: OrderDetails,
    },
    {
      path: '/user',
      name: 'User',
      component: User,
      children: [
        {
          path: 'self_msg',
          name: 'SelfMsg',
          component: SelfMsg,
        },
        {
          path: 'passengers',
          name: 'Passengers',
          component: Passengers,
        },
        {
          path: 'orders',
          name: 'Orders',
          component: Orders,
        },
      ],
    },
    {
      path: '/pay',
      name: 'Pay',
      component: Pay,
    },
    {
      path: '/search',
      name: 'Search',
      component: Search,
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/forgot_pwd',
      name: 'ForgotPwd',
      component: ForgotPwd,
    },
    {
      path: '*',
      redirect: '/search',
    },
  ],
});

export default router;
