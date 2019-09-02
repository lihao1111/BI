// test
// getters 相当于 vue的 computed计算属性 getter 返回值会根据它的依赖被缓存起来
// getters用来 监听 state中的值的变化 返回计算后的结果
export const getCount = state => {
  return state.count
}

export const getVisitedView = state => {
  return state.visitedViews
}
