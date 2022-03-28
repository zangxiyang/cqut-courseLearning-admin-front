export default {
  path: 'userManager',
  name: 'userManager',
  component: () => import('@/views/user-manager/index.vue'),
  meta: {
    title: '用户管理',
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
        title: '用户管理',
        requiresAuth: true,
        roles: ['admin']
      },
    },
    {
      path: 'auth',
      name: 'auth',
      component: () => import('@/views/user-manager/auth-manager/index.vue'),
      meta: {
        title: '权限管理',
        requiresAuth: true,
        roles: ['admin']
      },
    },
    {
      path: 'class',
      name: 'class',
      component: ()=> import('@/views/user-manager/class-manager/index.vue'),
      meta: {
        title: '班级管理',
        requiresAuth: true,
        roles: ['admin']
      }
    }
  ],
};
