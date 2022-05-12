export default {
  path: 'result',
  name: 'result',
  component: () => import('@/views/result/index.vue'),
  meta: {
    locale: 'menu.result',
    icon: 'icon-check-circle',
    requiresAuth: true,
    order: 5,
  },
  children: [
    {
      path: 'success',
      name: 'success',
      component: () => import('@/views/result/success/index.vue'),
      meta: {
        locale: 'menu.result.success',
        requiresAuth: true,
        roles: ['user'],
      },
    },
    {
      path: 'error',
      name: 'error',
      component: () => import('@/views/result/error/index.vue'),
      meta: {
        locale: 'menu.result.error',
        requiresAuth: true,
        roles: ['user'],
      },
    },
  ],
};
