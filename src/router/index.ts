import { createRouter, createWebHistory } from 'vue-router';

import useAuth from '@/composables/AuthService';
import useLoggingService from '@/composables/LoggingService';

import HomeView from '../views/HomeView.vue';

const { isAuthenticated } = useAuth();
const log = useLoggingService();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/client',
      name: 'client',
      component: () => import('../views/ClientView.vue'),
      children: [
        {
          path: '',
          name: 'client-home',
          component: () => import('../views/client/ClientHomeView.vue'),
        },
        {
          path: 'auth/login',
          name: 'client-auth',
          component: () => import('../views/client/auth/ClientAuthView.vue'),
          meta: { requiresAuth: false },
        },
        {
          path: 'auth/twitch',
          name: 'twitch-auth',
          component: () => import('../views/client/auth/TwitchAuthView.vue'),
          meta: { requiresAuth: false },
        },
      ],
    },
    {
      path: '/interface',
      name: 'interface',
      component: () => import('../views/InterfaceView.vue'),
    },
  ],
});

router.beforeEach(to => {
  const requiresAuth = to.meta.requiresAuth ?? true;
  if (requiresAuth && !isAuthenticated()) {
    log.info("User isn't authenticated, redirecting to login");
    return { name: 'client-auth' };
  }
});

export default router;
