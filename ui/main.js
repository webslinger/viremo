import BabelPolyfill from 'babel-polyfill';
import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './app.vue';
import Configs from './components/pages/configs.page.vue';
import Home from './components/pages/home.page.vue';

Vue.use(VueRouter);

const routes = [
    { path: '/', component: Home },
    { path: '/configs', component: Configs }
]

const router = new VueRouter({
    routes
})

new Vue({
  el: '#viremo',
  router,
  render: h => h(App),
});