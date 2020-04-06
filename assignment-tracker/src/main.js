import Vue from 'vue';
import App from './App.vue';
//import ListComponent from './components/ListContacts.vue';
import SearchComponent from './components/SearchContact.vue';
import CreateComponent from './components/CreateContact.vue';
import EditComponent from './components/EditContact.vue';
import ListComponent from './components/ListAssignments.vue';
import Signup from './components/Signup.vue';
import Login from './components/Login.vue';
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
      name: 'signup',
      path: '/',
      component: Signup
  },
  {
      name: 'create',
      path: '/create',
      component: CreateComponent
  },
  {
      name: 'list',
      path: '/list',
      component: ListComponent
  },
  {
    name: 'public_calendar',
    path: '/public_calendar',
    component: PublicCalendar
  },
  {
      name: 'edit',
      path: '/edit/:id',
      component: EditComponent
  },
  {
      name: 'search',
      path: '/search',
      component: SearchComponent
  },
  {
      name: 'login',
      path: '/login',
      component: Login
  }
];

const router = new VueRouter({ mode: 'history', routes: routes});

new Vue({
  router,
  render: h => h(App)

}).$mount('#app');