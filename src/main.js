import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './routes'
/* import Mock from './mock' */
import store from './vuex/store'
import Vuex from 'vuex'
import './icons'
import Moment from 'moment'
import myFilters from './filter/index.js' // 过滤器
Vue.prototype.moment = Moment
for (let key in myFilters) {
  Vue.filter(key, myFilters[key])
}
/* Mock.bootstrap() */
Vue.use(ElementUI)
Vue.use(Vuex)
/* Vue.prototype.$bus = new Vue() */
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    sessionStorage.removeItem('user')
  }
  let user = JSON.parse(sessionStorage.getItem('user'))
  if (!user && to.path !== '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})
new Vue({
  router,
  store,
  render: h => h(App) // vue1.0 components: { App } vue2.0 render: h => h(App) 渲染一个视图 然后提供提供给 el 挂载
}).$mount('#app')
