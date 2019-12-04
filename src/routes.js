import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
export default new Router({
  mode: 'hash', // 生产环境使用hash
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      component: () => import('./views/Login.vue'), // 引入组件
      name: '',
      hidden: true
    },
    {
      path: '/404',
      component: () => import('./views/404.vue'),
      name: '',
      hidden: true
    },
    {
      path: '/',
      component: () => import('./views/Home.vue'),
      iconCls: 'el-icon-odometer', // 图标样式class
      name: '主页',
      children: [
        { path: 'dashboard',
          component: () => import('./views/dashboard/Dashboard.vue'),
          name: '仪表盘',
          iconCls: 'el-icon-odometer',
          meta: { title: '仪表盘', keepAlive: false, affix: true }
        }
      ]
    },
    {
      path: '/',
      component: () => import('./views/Home.vue'),
      name: '实时概况',
      iconCls: 'el-icon-s-marketing',
      children: [
        { path: 'userOnline', component: () => import('./views/onlineChart/UserOnline.vue'), name: '实时在线', meta: { title: '实时在线', keepAlive: true } },
        { path: 'orderOnline', component: () => import('./views/onlineChart/OrderOnline.vue'), name: '实时订购', meta: { title: '实时订购', keepAlive: true } },
        { path: 'pvuvOnline', component: () => import('./views/onlineChart/PVUVOnline.vue'), name: '整体PV/UV', meta: { title: '整体PV/UV', keepAlive: true } }
      ]
    },
    {
      path: '/',
      component: () => import('./views/Home.vue'),
      name: '流量分析',
      iconCls: 'el-icon-pie-chart',
      children: [
        { path: 'flowAna', component: () => import('./views/takeRelChart/FlowAna.vue'), name: '页面流向', meta: { title: '页面流向', keepAlive: true } },
        { path: 'pageHot', component: () => import('./views/takeRelChart/PageHot.vue'), name: '推荐位分析', meta: { title: '推荐位分析', keepAlive: true } },
        { path: 'subjectAna', component: () => import('./views/takeRelChart/SubjectAna.vue'), name: '专题流量', meta: { title: '专题流量', keepAlive: true } }
      ]
    },
    {
      path: '/',
      component: () => import('./views/Home.vue'),
      name: '订购分析',
      iconCls: 'el-icon-shopping-cart-full',
      children: [
        /* { path: 'orderAna', component: () => import('./views/orderAna/OrderAna.vue'), name: '订购/退订', meta: { keepAlive: true } }, */
        { path: 'OrderDetail', component: () => import('./views/orderAna/OrderDetail.vue'), name: '订购/退订', meta: { title: '订购/退订', keepAlive: true } },
        { path: 'orderSource', component: () => import('./views/orderAna/OrderSource.vue'), name: '订购来源分析', meta: { title: '订购来源分析', keepAlive: true } },
        { path: 'OrderEnter', component: () => import('./views/orderAna/OrderEnter.vue'), name: '订购到达统计', meta: { title: '订购到达统计', keepAlive: true } },
        { path: 'OrderTrigTop', component: () => import('./views/orderAna/OrderTrigTop.vue'), name: '订购触发排行', meta: { title: '订购触发排行', keepAlive: true } }
        /* { path: 'OrderFailAna', component: () => import('./views/orderAna/OrderFailAna.vue'), name: '订购失败分析', meta: { title: '订购失败分析', keepAlive: true } } */
      ]
    },
    {
      path: '/',
      component: () => import('./views/Home.vue'),
      name: '用户分析',
      iconCls: 'el-icon-picture-outline-round',
      children: [
        { path: 'newAddUser', component: () => import('./views/userRelChart/NewAddUser.vue'), name: '用户新增留存', meta: { title: '用户新增留存', keepAlive: true } },
        { path: 'loginUser', component: () => import('./views/userRelChart/LoginUser.vue'), name: '用户登录', meta: { title: '用户登录', keepAlive: true } },
        { path: 'activeUser', component: () => import('./views/userRelChart/ActiveUser.vue'), name: '用户活跃', meta: { title: '用户活跃', keepAlive: true } },
        { path: 'useTime', component: () => import('./views/userRelChart/UseTime.vue'), name: '用户使用时长', meta: { title: '用户使用时长', keepAlive: true } },
        { path: 'playTime', component: () => import('./views/userRelChart/PlayTime.vue'), name: '用户播放时长', meta: { title: '用户播放时长', keepAlive: true } }
      ]
    },
    {
      path: '/',
      component: () => import('./views/Home.vue'),
      name: '内容分析',
      iconCls: 'el-icon-s-data',
      children: [
        { path: 'playCountAna', component: () => import('./views/contentRelChart/PlayCountAna.vue'), name: '有效播放次数统计', meta: { title: '播放次数统计', keepAlive: true } },
        { path: 'contentProvider', component: () => import('./views/contentRelChart/ContentProviderTop.vue'), name: '内容提供商排行', meta: { title: '内容提供商排行', keepAlive: true } },
        { path: 'searchKeyTop', component: () => import('./views/contentRelChart/SearchKeyTop.vue'), name: '搜索关键字排行', meta: { title: '搜索关键字排行', keepAlive: true } },
        { path: 'collectTop', component: () => import('./views/contentRelChart/CollectTop.vue'), name: '收藏排行', meta: { title: '收藏排行', keepAlive: true } }
      ]
    },
    {
      path: '/',
      component: () => import('./views/Home.vue'),
      name: '系统管理',
      iconCls: 'el-icon-s-custom', // 图标样式class
      children: [
        { path: 'userMsg', component: () => import('./views/powerManager/UserMsg.vue'), name: '用户管理', meta: { title: '用户管理', keepAlive: false } },
        { path: 'roleMsg', component: () => import('./views/powerManager/RoleMsg.vue'), name: '角色管理', meta: { title: '角色管理', keepAlive: false } },
        { path: 'authMsg', component: () => import('./views/powerManager/AuthMsg.vue'), name: '权限管理', meta: { title: '权限管理', keepAlive: false } }
      ]
    },
    {
      path: '/',
      component: () => import('./views/Home.vue'),
      name: '河北音乐报表',
      iconCls: 'el-icon-star-on', // 图标样式class
      children: [
        { path: 'hbMusicPromotionMsg', component: () => import('./views/hbMusicManager/HBMusicPromotionMsg.vue'), name: '推荐位详情', meta: { title: '推荐位详情', keepAlive: false } },
        { path: 'hbMusicDayDataMsg', component: () => import('./views/hbMusicManager/HBMusicDayDataMsg.vue'), name: '日报表数据', meta: { title: '日报表数据', keepAlive: false } },
        { path: 'hbMusiCpInfoMsg', component: () => import('./views/hbMusicManager/HBMusicCpInfoMsg.vue'), name: 'CP基础数据', meta: { title: 'CP基础数据', keepAlive: false } },
        { path: 'hbMusiCpTopMsg', component: () => import('./views/hbMusicManager/HBMusicCpTopMsg.vue'), name: 'CP播放排行', meta: { title: 'CP播放排行', keepAlive: false } }
      ]
    },
    {
      path: '*',
      hidden: true,
      redirect: { path: '/404' }
    }
  ]
})
