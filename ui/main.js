import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import Configs from './components/Configs.vue'
import Home from './components/Home.vue'

let sessionVars = {
    configs: localStorage.getItem('vui_configs') || ['test','test']
}

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