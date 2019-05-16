const home = { template: '<div>Home</div>'}
const results = { template: '<div>Results</div>'}
const test = { template: '<div>Unit Tests</div>'}

const routes = [
    { path: '/', component: home },
    { path: '/results', component: results },
    { path: '/test', component: test }
]

const router = new VueRouter({
    routes
})

const app = new Vue({
    router
}).$mount('#viremo');