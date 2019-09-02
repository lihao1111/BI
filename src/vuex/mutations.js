// mutations 定义全局同步函数方法

// 定义所需的 mutations 的函数
export const addM = function (state) {
  state.count++
}
export const reductionM = function (state) {
  state.count--
}
export const ADD_VISITED_VIEW = function (state, view) { // 增加
  if (state.visitedViews.some(v => v.path === view.path)) return
  state.visitedViews.push(
    Object.assign({}, view, {
      title: view.meta.title || 'no-name'
    })
  )
}
export const DEL_VISITED_VIEW = function (state, view) { // 删除
  for (const [i, v] of state.visitedViews.entries()) {
    if (v.path === view.path) {
      state.visitedViews.splice(i, 1)
      break
    }
  }
}
