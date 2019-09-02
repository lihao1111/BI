import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import * as mutations from './mutations'

// store ：定义全局变量 相当于 vue中的data 定义数据
// store 中 相当于 vuex的数据源 this.$store.state 获取到定义的数据

// 使用vuex
Vue.use(Vuex)

// 应用初始状态
const state = {
  count: 10,
  visitedViews: []
}

// 创建 store 实例
export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations
})
