/**
 * @作者: Seale
 * @时间: 2022/3/24
 * @版本: V1.0
 * @说明: 用户管理API服务
 * @网站: https://www.imsle.com
 */
import { BaseParams, BasePageRes, BaseRes } from "@/api/base-model";
import axios, { AxiosResponse } from "axios";
import qs from "query-string";

// 角色列表
export interface RoleRecord{
  id: number;
  roleName: string;
  canDel: number;
}
// 用户列表
export interface UserRecord{
  id: number;
  userName: string;
  roleName: string;
  phone: string;
  nickName: string;
  sex: number;
  school: string;
  description: string;
  className: string;
  createDate: string;
  lastLoginDate: string;
  classId: number;
}
export interface ClassRecord{
  id:number;
  className: string;
  description: string;
}

// 新建用户数据结构
export interface NewUserRequestDto {
  userName: string,
  passWord: string,
  nickName: string,
  sex: number,
  roleId: number,
  phone: string,
  classId: number
}
// 新建班级数据结构
export interface NewClassRequestDto{
  className: string;
  description?: string
}

// 用户查询数据结构
export interface QueryUserDto{
  id: number;
  userName: string;
  roleId: number;
  phone: string;
  classId: number;
  sex: number;
}

export interface ChangeUserRequestDto{
  id: number;
  nickName: string;
  sex: number;
  phone: string;
  classId: number;
  school: string;
  description: string;
}

// 班级列表
export interface ClassRecord{
  id: number;
  className: string;
  description: string;
}
export interface RoleParams extends Partial<RoleRecord>,BaseParams{}
export interface UserParams extends Partial<UserRecord>,BaseParams{}
export interface QueryUserParams extends Partial<QueryUserDto>, BaseParams{}

export function queryAuthInfo(params: RoleParams){
  return axios.get<BasePageRes<RoleRecord[]>>(`/course-auth/auth/admin/authInfo`, {
    params,
    paramsSerializer: (obj)=>{
      return qs.stringify(obj);
    }
  })
}

export function queryUserDetail(params: UserParams){
  return axios.get<BasePageRes<UserRecord[]>>(`/course-auth/user/admin/userDetail`, {
    params
  })
}

export function  queryUserDetailByQuery(params: QueryUserParams){
  return axios.get<BasePageRes<UserRecord[]>>(`/course-auth/user/admin/userDetail/query`, {
    params
  })
}


export function queryClassList(){
  return axios.get<ClassRecord[]>(`/course-auth/class/admin/classOption`);
}
// 获取权限角色列表
export function queryRoleList(){
  return axios.get<RoleRecord[]>(`/course-auth/auth/admin/roleOption`);
}
// 添加新用户
export function addNewUser(dto: NewUserRequestDto){
  return axios.post(`/course-auth/user/admin/user`,{
    ...dto
  });
}

// 更改权限
export function changeRole(userName:string, roleId:number){
  return axios.post(`/course-auth/auth/admin/changeRole`,{
    userName,
    roleId
  })
}

export function changeUserInfo(dto: ChangeUserRequestDto){
  return axios.put(`/course-auth/user/admin/userDetail`, {
    ...dto
  });
}

// 新建角色
export function addNewRole(roleName: string){
  return axios.post(`/course-auth/auth/admin/role/${roleName}`);
}
// 删除角色
export function delRole(roleName: string){
  return axios.delete(`/course-auth/auth/admin/role/${roleName}`);
}
// 新建班级
export function addNewClass(dto: NewClassRequestDto){
  return axios.post(`/course-auth/class/admin/class`, {
    ...dto
  });
}
// 查询班级
export function queryClass(params: BaseParams){
  return axios.get<BasePageRes<ClassRecord[]>>(`/course-auth/class/admin/class`,{
    params
  })
}
// 删除班级
export function delClass(className: string){
  return axios.delete(`/course-auth/class/admin/class/${className}`)
}
