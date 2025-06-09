import { createRouter, createWebHistory } from 'vue-router'
import Cart from '../components/Cart.vue'
import Checkout from '../components/Checkout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/cart',
      name: 'cart',
      component: Cart,
      meta: { requiresAuth: true }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: Checkout,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const checkAuth = () => {
    if (to.meta.requiresAuth && !localStorage.getItem('token')) {
      next('/login')
    } else {
      next()
    }
  }
  checkAuth()
})

export default router 