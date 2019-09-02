// action 定义全局异步方法

// 注册actions 类似于vue的 methods
export const add = ({ commit }) => {
  commit('addM') // 提交 mutations addM方法
}
export const reduction = ({ commit }) => {
  commit('reductionM')
}

export const addVisitedView = ({ commit }, view) => {
  commit('ADD_VISITED_VIEW', view)
}

export const delVisitedView = ({ commit, state }, view) => {
  return new Promise(resolve => {
    commit('DEL_VISITED_VIEW', view)
    resolve({
      visitedViews: [...state.visitedViews]
    }) // 返回 对象
  })
}
