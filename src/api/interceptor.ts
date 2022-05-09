import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message, Modal, Notification } from "@arco-design/web-vue";
import { useUserStore } from '@/store';
import { getToken } from '@/utils/auth';

export interface HttpResponse<T = unknown> {
  message: string;
  code: number;
  data: T;
}

if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    const token = getToken();
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    // do something
    console.log(error);
    Message.error(error.message)
    return Promise.reject(error);
  }
);

// add response interceptors
/*axios.interceptors.response.use(
  (resp)=>{
    console.log(resp);
    return resp.data
  },
  ({response})=>{
    Notification.error({
      title: '出错了',
      content: `错误码: ${response.status}, 错误信息: ${response.statusText}`
    })
    console.log(response);
  })*/


axios.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {

    const res = response.data;
    console.log(res);
    // if the custom code is not 200, it is judged as an error.
    if (res.code !== 200) {
      Message.error({
        content: res.message || 'Error',
        duration: 5 * 1000,
      });
      // Token 错误码
      if (
        [300, 301, 302, 303].includes(res.code) &&
        response.config.url !== '/api/user/info'
      ) {
        Modal.error({
          title: 'Confirm logout',
          content:
            'You have been logged out, you can cancel to stay on this page, or log in again',
          okText: 'Re-Login',
          async onOk() {
            const userStore = useUserStore();

            await userStore.logout();
            window.location.reload();
          },
        });
      }
      return Promise.reject(response);
    }
    return res;
  },
  ({response}) => {
    Message.error({
      content: response.statusText,
      duration: 5 * 1000,
    });
    return Promise.reject(response.data);
  }
);
