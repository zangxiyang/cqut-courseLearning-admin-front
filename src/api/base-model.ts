import { RoleRecord } from "@/api/user-manager";

/**
 * @作者: Seale
 * @时间: 2022/3/24
 * @版本: V1.0
 * @说明: 基本数据结构
 * @网站: https://www.imsle.com
 */

// 基本返回
export interface BaseRes <T>{
  total: number;
  pageNumber: number;
  pageSize: number;
  size: number;
  pages: number;
  prePage: number;
  nextPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  list: T;
}
export interface BaseParams{
  page: number;
  size: number;
}
