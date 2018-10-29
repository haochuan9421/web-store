import Vue from 'vue'
import Router from 'vue-router'
import Cookies from '@/components/Cookies'
import IndexedDB from '@/components/IndexedDB'
import LocalStorage from '@/components/LocalStorage'
import SessionStorage from '@/components/SessionStorage'
import WebSQL from '@/components/WebSQL'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/Cookies'
    },
    {
      path: '/Cookies',
      component: Cookies
    },
    {
      path: '/IndexedDB',
      component: IndexedDB
    },
    {
      path: '/LocalStorage',
      component: LocalStorage
    },
    {
      path: '/SessionStorage',
      component: SessionStorage
    },
    {
      path: '/WebSQL',
      component: WebSQL
    }
  ]
})
