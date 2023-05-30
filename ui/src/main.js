// This is the entry point into the UI code
import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Vue from 'vue';
// App.vue is the top level of the rendering hierarchy.
import App from './views/App.vue';
import { router, store, vuetify } from './local.js';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app');
