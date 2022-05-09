export default {
  path: 'course',
  name: 'course',
  component: () => import('@/views/course/index.vue'),
  meta: {
    title: '课程管理',
    icon: 'icon-book',
    requiresAuth: true,
    order: 1,
  },
  children:[
    {
      path: 'manager',
      name: 'courseManager',
      component: () => import('@/views/course/course-manager/index.vue'),
      meta: {
        locale: 'menu.courseManager',
        requiresAuth: true,
        roles: ['admin','teacher'],
      },
    },
    {
      path: 'knowledge',
      name: 'knowledgeManager',
      component: () => import('@/views/course/knowledge-manager/index.vue'),
      meta: {
        locale: 'menu.knowledgeManager',
        requiresAuth: true,
        roles: ['admin','teacher'],
      },
    },
    {
      path: 'file',
      name: 'courseFile',
      component: () => import('@/views/course/course-file/index.vue'),
      meta: {
        locale: 'menu.courseFile',
        requiresAuth: true,
        roles: ['admin','teacher'],
      },
    },
    {
      path: 'create',
      name: 'courseCreate',
      component: () => import('@/views/course/create-course/index.vue'),
      meta: {
        hideInMenu: true,
        locale: 'menu.createCourse',
        requiresAuth: true,
        roles: ['admin','teacher'],
      },
    },
  ]
}
