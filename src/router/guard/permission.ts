import type { Router, LocationQueryRaw } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

import usePermission from '@/hooks/permission';
import { useUserStore } from '@/store';
import { clearToken, getUserId, isLogin } from "@/utils/auth";
import appRoutes from '../routes';

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start();
    const userStore = useUserStore();
    async function crossroads() {
      const Permission = usePermission();
      if (Permission.accessRouter(to)) next();
      else {
        const destination = Permission.findFirstPermissionRoute(
          appRoutes,
          userStore.role
        ) || {
          name: 'notFound',
        };
        next(destination);
      }
      NProgress.done();
    }
    if (isLogin()) {
      if (userStore.role) {
        crossroads();
      } else {
        try {
          await userStore.info(getUserId());
          crossroads();
        } catch (error) {
          clearToken(); // 清除登录信息 重新登录
          next({
            name: 'login',
            query: {
              redirect: to.name,
              ...to.query,
            } as LocationQueryRaw,
          });
          NProgress.done();
        }
      }
    } else {
      if (to.name === 'login') {
        next();
        NProgress.done();
        return;
      }
      next({
        name: 'login',
        query: {
          redirect: to.name,
          ...to.query,
        } as LocationQueryRaw,
      });
      NProgress.done();
    }
  });
}
