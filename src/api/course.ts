/**
 * @作者: Seale
 * @时间: 2022/5/9
 * @版本: V1.0
 * @说明: 课程
 */
import axios from "axios";
import { BasePageRes, BaseParams } from "@/api/base-model";

export interface IModelChapterInfo {
  chapterName?: string;
  description?: string;
  nodes?: IModelChapterNode[];
}

export interface IModelChapterNode{
  nodeName?: string;
  videoUrl?: string;
}
export interface IModelCourseBaseInfo {
  name?: string;            // 课程名
  subName?: string;         // 课程子标题
  description?: string;     // 课程描述
  authorTeacherId?: number;  // 课程所属老师
  classId?: number;         // 课程所属班级
  thumb?: string;           // 课程头图链接
  content?: string;         // 课程详情
}
export type IModelUnitCreateCourse = IModelCourseBaseInfo & IModelChapterInfo

export interface UserDetailModel{
  id: number
  userName: string
  roleName: string
  phone: string
  nickName: string
  sex: number
  school: string
  description: string
  className: string
  createDate: string
  lastLoginDate: string
}

export interface Course{
  id: number,
  name: string,
  subName: string,
  description: string,
  authorTeacherId: number,
  teacherName: string,
  classId: number,
  className: string,
  thumb: string,
  status: number,
  detailId: number,
  publishDate: string
}
export interface Knowledge{
  id?: number
  name?: string
  description?: string
  createDate?: string
  fileName?: string
  url?: string
}

export interface Teacher{
  id: number
  nickName: string
}


// 创建班级
export function createCourse(dto: IModelUnitCreateCourse){
  return axios.post(`/course-course/course/admin/course`,dto)
}
// 获得用户详情
export function getUserDetail(id: number){
  return axios.get<UserDetailModel>(`/course-auth/user/userDetail/${id}`)
}

// 查询课程列表
export function queryCourse(params: BaseParams){
  return axios.get<BasePageRes<Course[]>>(`/course-course/course/course`, {params});
}

// 修改课程信息
export function updateCourseBaseInfo(params: Partial<Course>){
  return axios.put(`/course-course/course/admin/course`,params)
}
// 删除课程
export function delCourse(id: number){
  return axios.delete(`/course-course/course/admin/course/${id}`);
}

// 查询老师列表
export function queryTeacher(){
  return axios.get<Teacher[]>(`/course-auth/user/teacher`)
}


// 查询知识点列表
export function queryKnowledge(params: BaseParams){
  return axios.get<BasePageRes<Knowledge[]>>(`/course-course/know/admin/know`, {params})
}

// 新建知识点
export function addKnowledge(dto: Knowledge){
  return axios.post(`/course-course/know/admin/know`, dto);
}
