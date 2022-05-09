export default {
  path: 'userManager',
  name: 'userManager',
  component: () => import('@/views/user-manager/index.vue'),
  meta: {
    locale: 'menu.userManager',
    icon: 'icon-user-group',
    requiresAuth: true,
    order: 2,
  },
  children: [
    {
      path: 'user',
      name: 'user',
      component: () => import('@/views/user-manager/user-manager/index.vue'),
      meta: {
        locale: 'userManager.user',
        requiresAuth: true,
        roles: ['admin']
      },
    },
    {
      path: 'auth',
      name: 'auth',
      component: () => import('@/views/user-manager/auth-manager/index.vue'),
      meta: {
        locale: 'userManager.auth',
        requiresAuth: true,
        roles: ['admin']
      },
    },
    {
      path: 'class',
      name: 'class',
      component: ()=> import('@/views/user-manager/class-manager/index.vue'),
      meta: {
        locale: 'userManager.class',
        requiresAuth: true,
        roles: ['admin']
      }
    }
  ],
};
