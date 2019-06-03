import BabelPolyfill from 'babel-polyfill';
import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './app.vue';
import Home from './pages/page.home.vue';

Vue.use(VueRouter);

const router = new VueRouter({ 
  routes: [
    {
      path: '/',
      component: Home
    }, 
    {
      path: '/configuration/:file?',
      component: () => import("./pages/page.configuration.vue")
    },
    {
      path: '/analysis/:file?',
      component: () => import("./pages/page.analysis.vue")
    },
    {
      path: '/analysis/:file/results',
      component: () => import("./pages/page.results.vue")
    },
    {
      path: '/analysis/:file/results/fullpage/:path/:viewport',
      name: 'fullpage',
      component: () => import("./pages/page.fullpage.vue"),
      params: true
    }
  ]
})

new Vue({ 
  el: '#viremo',
  router,
  render: h => h(App),
});