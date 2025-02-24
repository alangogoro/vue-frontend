import { createRouter, createWebHashHistory } from 'vue-router'
import Menu from '@/components/Menu.vue'
import IntervalSetting from '@/components/IntervalSetting.vue'

const routes = [
  {
    path: '/',
    name: 'Menu',
    component: Menu
  },
  {
    path: '/cheese_waiting_time',
    name: 'IntervalSetting',
    component: IntervalSetting
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router