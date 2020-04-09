import Vue from 'vue';
import App from './App.vue';
//import ListComponent from './components/ListContacts.vue';
//import SearchComponent from './components/SearchContact.vue';
import HomeComponent from './components/Home.vue';
import ListComponent from './components/ListAssignments.vue';
//import Signup from './components/Signup.vue';
import Account from './components/Account.vue';
import PublicCalendar from './components/PublicCalendar.vue';

import './quasar';
//import 'bootstrap/dist/css/bootstrap.min.css';

import VueAxios from 'vue-axios';
import axios from 'axios';
Vue.use(VueAxios, axios);

import Plugin from '@quasar/quasar-ui-qcalendar';
import '@quasar/quasar-ui-qcalendar/dist/index.css';
Vue.use(Plugin);

import VueRouter from 'vue-router';
Vue.use(VueRouter);

Vue.config.productionTip = false;

const routes = [
  {
      name: 'home',
      path: '/',
      component: HomeComponent
  },
  {
      name: 'list',
      path: '/list',
      component: ListComponent
  },
  {
    name: 'calendar',
    path: '/calendar',
    component: PublicCalendar
  },
  {
      name: 'account',
      path: '/account',
      component: Account
  },
  { path: '*', redirect: '/' }
];

const router = new VueRouter({ mode: 'history', routes: routes});

new Vue({
  router,
  render: h => h(App)

}).$mount('#app');

// router.beforeEach((to, from, next) => {
//   // redirect to login page if not logged in and trying to access a restricted page
//   const publicPages = ['/login'];
//   const authRequired = !publicPages.includes(to.path);
//   const loggedIn = sessionStorage.getItem('token');

//   if (authRequired && !loggedIn) {
//     return next('/login');
//   }

//   next();
// });