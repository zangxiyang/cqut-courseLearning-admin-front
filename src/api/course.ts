/**
 * @作者: Seale
 * @时间: 2022/5/9
 * @版本: V1.0
 * @说明: 课程
 */
import axios from "axios";

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

// 创建班级
export function createCourse(dto: IModelUnitCreateCourse){
  return axios.post(`/course-course/course/admin/course`,dto)
}
// 获得用户详情
export function getUserDetail(id: number){
  return axios.get<UserDetailModel>(`/course-auth/user/userDetail/${id}`)
}
