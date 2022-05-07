import axios from 'axios';
import { UserState } from '@/store/modules/user/types';

export interface LoginData {
  userName: string;
  passWord: string;
}

export interface LoginRes{
  id: number
  userName: string
  nickName: string
  roleName: string
  role: string
  token: string
}

export function login(data: LoginData) {
  return axios.post<LoginRes>('/course-auth/auth/login', data);
}

export function logout() {
  return axios.post<LoginRes>('/api/user/logout');
}

export function getUserInfo(id: number) {
  return axios.get<UserState>(`/course-auth/user/userDetail/${id}`);
}
