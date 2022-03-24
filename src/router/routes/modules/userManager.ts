export default {
  path: 'userManager',
  name: 'userManager',
  component: () => import('@/views/user-manager/index.vue'),
  meta: {
    locale: '用户管理',
    icon: 'icon-user-group',
    requiresAuth: true,
    order: 2,
  },
  children: [
    {
      path: 'auth',
      name: 'auth',
      component: () => import('@/views/user-manager/auth-manager/index.vue'),
      meta: {
        locale: '权限管理',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: 'user',
      name: 'user',
      component: () => import('@/views/user-manager/user-manager/index.vue'),
      meta: {
        locale: '用户管理',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
  ],
};
