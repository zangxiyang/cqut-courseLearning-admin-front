/**
 * @作者: Seale
 * @时间: 2022/3/24
 * @版本: V1.0
 * @说明: 用户管理API服务
 * @网站: https://www.imsle.com
 */
import { BaseParams, BaseRes } from "@/api/base-model";
import axios from "axios";
import qs from "query-string";

export interface RoleRecord{
  id: number;
  roleName: string;
  canDel: number;
}
export interface RoleParams extends Partial<RoleRecord>,BaseParams{}

export function queryAuthInfo(params: RoleParams){
  return axios.get<BaseRes<RoleRecord[]>>(`/course-auth/auth/admin/authInfo`, {
    params,
    paramsSerializer: (obj)=>{
      return qs.stringify(obj);
    }
  })
}

