import axios from 'axios'
import qs from 'qs'
let base = '' // 生产环境配置  开发环境 使用代理转发 配置围 /api
axios.defaults.timeout = 50000 // 响应时间
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8' // 请求头
//  登录
export const adminLogin = params => {
  return axios.post(`${base}/adminLogin`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
//  加载产品视图
export const loadPlatform = params => {
  return axios.post(`${base}/loadPlatform`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const editUserInfo = params => {
  return axios.post(`${base}/editUserInfo`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载 dashboard 最近用户数据
export const loadCurUser = params => {
  return axios.post(`${base}/loadCurUser`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载 dashboard 最近订购数据
export const loadCurOrder = params => {
  return axios.post(`${base}/loadCurOrder`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const loadOnlineErr = params => {
  return axios.post(`${base}/loadOnlineErr`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载 当日 pvuv
export const loadDayPVUV = params => {
  return axios.post(`${base}/loadDayPVUV`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载 日 使用时长
export const loadDayUseTime = params => {
  return axios.post(`${base}/loadDayUseTime`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载 dashboard 最近一周用户数据
export const loadWeekUser = params => {
  return axios.post(`${base}/loadWeekUser`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载 dashboard 当天订购数据
export const loadDayOrder = params => {
  return axios.post(`${base}/loadDayOrder`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载 dashboard 当天日志数据
export const loadDayLog = params => {
  return axios.post(`${base}/loadDayLog`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载实时在线
export const loadOnlineUser = params => {
  return axios.post(`${base}/loadOnlineUser`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const compareOnlineUser = params => {
  return axios.post(`${base}/compareOnlineUser`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载实时订购
export const loadOnlineOrder = params => {
  return axios.post(`${base}/loadOnlineOrder`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载当前PV
export const loadCurPV = params => {
  return axios.post(`${base}/loadCurPV`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

// 加载订购失败分析
export const loadOrderFailAna = params => {
  return axios.post(`${base}/loadOrderFailAna`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

export const compareOnlineOrder = params => {
  return axios.post(`${base}/compareOnlineOrder`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载PVUV数据
export const loadPVUVList = params => {
  return axios.post(`${base}/loadPVUVList`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } }) // 通信问题 返回500
}
export const loadPVUVSum = params => {
  return axios.post(`${base}/loadPVUVSum`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } }) // 通信问题 返回500
}
export const compareOnlinePVUV = params => {
  return axios.post(`${base}/compareOnlinePVUV`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 页面流向
export const loadFlowAna = params => {
  return axios.post(`${base}/loadFlowAna`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 页面热点
export const loadPages = params => {
  return axios.post(`${base}/loadPages`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const loadPromotionList = params => {
  return axios.post(`${base}/loadPromotionList`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

// 专题流量
export const loadSubjectList = params => {
  return axios.post(`${base}/loadSubjectList`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 订购/退订
export const loadOrderDetail = params => {
  return axios.post(`${base}/loadOrderDetail`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

// 订购来源
export const loadOrderSource = params => {
  return axios.post(`${base}/loadOrderSource`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

// 订购页到达数统计
export const loadOrderEnter = params => {
  return axios.post(`${base}/loadOrderEnter`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

export const loadOrderTrig = params => {
  return axios.post(`${base}/loadOrderTrig`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 用户新增留存
export const loadNewAddUser = params => {
  return axios.post(`${base}/loadNewAddUser`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 用户登录
export const loadLoginUser = params => {
  return axios.post(`${base}/loadLoginUser`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 用户活跃
export const loadActiveUser = params => {
  return axios.post(`${base}/loadActiveUser`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

// 用户使用时长
export const loadUseTime = params => {
  return axios.post(`${base}/loadUseTime`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 用户播放时长
export const loadPlayTime = params => {
  return axios.post(`${base}/loadPlayTime`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 内容有效播放次数
export const loadPlayCount = params => {
  return axios.post(`${base}/loadPlayCount`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 内容所有播放次数
export const loadAllPlayCount = params => {
  return axios.post(`${base}/loadAllPlayCount`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

// 内容完整播放次数导出数据
export const exportAllPlayCountDtl = params => {
  return axios.post(`${base}/exportAllPlayCount`, qs.stringify(params), { responseType: 'blob' })
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

// 加载CP数据
export const loadCPs = params => {
  return axios.post(`${base}/loadCPs`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载medai完整度
export const loadMediaPer = params => {
  return axios.post(`${base}/loadMediaPer`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 内容提供商排行
export const loadContentCPs = params => {
  return axios.post(`${base}/loadContentCPs`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 搜索关键字排行
export const loadSearchDetail = params => {
  return axios.post(`${base}/loadSearchDetail`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 加载收藏数据
export const loadCollectDetail = params => {
  return axios.post(`${base}/loadCollectDetail`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 用户管理
export const loadUserList = params => {
  return axios.post(`${base}/loadUserList`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const saveUser = params => {
  return axios.post(`${base}/saveUser`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const deleteUser = params => {
  return axios.post(`${base}/deleteUser`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const loadUserAuth = params => {
  return axios.post(`${base}/loadUserAuth`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const authUserSubmit = params => {
  return axios.post(`${base}/authUserSubmit`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 角色管理
export const loadRoles = params => {
  return axios.post(`${base}/loadRoles`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const loadAnthTree = params => {
  return axios.post(`${base}/loadAnthTree`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const addRoleSubmit = params => {
  return axios.post(`${base}/addRoleSubmit`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const loadEditRole = params => {
  return axios.post(`${base}/loadEditRole`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const editRoleSubmit = params => {
  return axios.post(`${base}/editRoleSubmit`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const deleteRow = params => {
  return axios.post(`${base}/deleteRow`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 权限管理
export const loadAuthList = params => {
  return axios.post(`${base}/loadAuthList`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const BuildAuthentication = params => {
  return axios.post(`${base}/BuildAuthentication`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
// 河北数据支撑
export const loadPromotionItemDtl = params => {
  return axios.post(`${base}/loadPromotionItemDtl`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const exportPromotionItemDtl = params => {
  return axios.post(`${base}/exportPromotionItemDtl`, qs.stringify(params), { responseType: 'blob' }) // { responseType: 'blob' } 真的很正要
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
export const loadDayDataDtl = params => {
  return axios.post(`${base}/loadDayDataDtl`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

export const exportDayDataDtl = params => {
  return axios.post(`${base}/exportDayDataDtl`, qs.stringify(params), { responseType: 'blob' })
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

export const loadCpInfoDtl = params => {
  return axios.post(`${base}/loadCpInfoDtl`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

export const exportCpInfo = params => {
  return axios.post(`${base}/exportCpInfo`, qs.stringify(params), { responseType: 'blob' })
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}

export const loadCpTop = params => {
  return axios.post(`${base}/loadCpTop`, qs.stringify(params))
    .then(res => res.data)
    .catch(function () { return { 'businessCode': 500 } })
}
