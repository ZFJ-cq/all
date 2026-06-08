import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/cases',
    name: 'CaseSelect',
    component: () => import('@/views/CaseSelect.vue')
  },
  {
    path: '/game/:caseId',
    name: 'GamePlay',
    component: () => import('@/views/GamePlay.vue'),
    props: true
  },
  {
    path: '/judgment/:caseId',
    name: 'Judgment',
    component: () => import('@/views/Judgment.vue'),
    props: true
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: () => import('@/views/Achievements.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router